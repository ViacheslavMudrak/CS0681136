using Intralox.Platform.Models;
using Microsoft.Extensions.DependencyInjection;
using Sitecore.Data;
using Sitecore.Data.Fields;
using Sitecore.Data.Items;
using Sitecore.Data.Managers;
using Sitecore.DependencyInjection;
using Sitecore.Diagnostics;
using Sitecore.Globalization;
using Sitecore.JavaScriptServices.Configuration;
using Sitecore.LayoutService.Helpers;
using Sitecore.LayoutService.ItemRendering.Pipelines.GetLayoutServiceContext;
using Sitecore.Links;
using Sitecore.Links.UrlBuilders;
using Sitecore.XA.Foundation.Multisite;
using System.Collections.Generic;
using System.IdentityModel.Protocols.WSTrust;
using System.Linq;

namespace Intralox.Platform.Pipelines
{
    public class ContextExtension : Sitecore.JavaScriptServices.ViewEngine.LayoutService.Pipelines.
        GetLayoutServiceContext.JssGetLayoutServiceContextProcessor
    {
        public ContextExtension(IConfigurationResolver configurationResolver) : base(configurationResolver)
        {
        }

        protected override void DoProcess(GetLayoutServiceContextArgs args, AppConfiguration application)
        {
            Assert.ArgumentNotNull(args, "args");

            var langVersions = new List<ItemLanguageVersion>();
            Item contextItem = Sitecore.Context.Item;
            var multisiteContext = ServiceLocator.ServiceProvider.GetService<IMultisiteContext>();
            SiteSetting siteSetting = new SiteSetting();
            Item settingsItem = multisiteContext.GetSettingsItem(contextItem);

            if (settingsItem != null)
            {
                MultilistField multiselectField = settingsItem.Fields[Constants.SiteSettings.AllowedLanguages];
                ReferenceField referenceField = settingsItem.Fields[Constants.SiteSettings.SiteTheme];

                if (multiselectField != null)
                {
                    siteSetting.ItemLanguages = multiselectField.GetItems().ToList();
                }

                if (referenceField != null && referenceField.TargetItem != null)
                {
                    siteSetting.SiteTheme = referenceField.TargetItem.Fields[Constants.SiteSettings.SiteThemeValueField]?.Value;
                }
            }

            foreach (Item languageItem in siteSetting.ItemLanguages)
            {
                ReferenceField referenceField = languageItem.Fields[Constants.SiteSettings.LanguageSource];
                if (referenceField != null && referenceField.TargetItem != null)
                {
                    Language language = Language.Parse(referenceField.TargetItem);
                    Item languageVersion = contextItem.Versions.GetLatestVersion(language);

                    if (languageVersion != null)
                    {
                        ItemLanguageVersion itemLanguageVersion = new ItemLanguageVersion
                        {
                            Lang = languageVersion.Language.Name,
                            Path = GetTranslatedPath(languageVersion).Replace("https://cm", "")
                        };

                        langVersions.Add(itemLanguageVersion);
                    }
                }

            }

            args.ContextData.Add("languageVersions", langVersions);

            if (!string.IsNullOrWhiteSpace(siteSetting.SiteTheme))
            {
                args.ContextData.Add("siteTheme", siteSetting.SiteTheme);
            }

            PageItem parentPage = null;
            var parentItem = contextItem.Parent;
            if (parentItem != null && parentItem.Visualization?.GetLayout(Sitecore.Context.Device) != null)
            {
                parentPage = new PageItem()
                {
                    Title = parentItem.Fields["Title"]?.Value,
                    Url = LinkManager.GetItemUrl(parentItem, ItemUrlHelper.GetLayoutServiceUrlOptions())
                };
            }

            args.ContextData.Add("previousPage", parentPage);
        }

        private string GetTranslatedPath(Item item)
        {
            return LinkManager.GetItemUrl(item, new ItemUrlBuilderOptions
            {
                LanguageEmbedding = LanguageEmbedding.Never,
                UseDisplayName = false,
                LowercaseUrls = true,
                EncodeNames = true,
                AlwaysIncludeServerUrl = false,
            });
        }
    }
}