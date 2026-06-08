using DocumentFormat.OpenXml.Spreadsheet;
using Intralox.Platform.Models;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using PdfSharp.Charting;
using Sitecore.Data.DataSources;
using Sitecore.Data.Fields;
using Sitecore.Data.Items;
using Sitecore.DependencyInjection;
using Sitecore.Diagnostics;
using Sitecore.LayoutService.Configuration;
using Sitecore.LayoutService.Helpers;
using Sitecore.LayoutService.ItemRendering.ContentsResolvers;
using Sitecore.Links;
using Sitecore.Links.UrlBuilders;
using Sitecore.Mvc.Presentation;
using Sitecore.Resources.Media;
using Sitecore.Shell.Framework.Commands;
using Sitecore.XA.Foundation.Abstractions;
using Sitecore.XA.Foundation.Multisite;
using System;
using System.Collections.Generic;
using System.IdentityModel.Protocols.WSTrust;
using System.IO;
using System.Linq;
using static Intralox.Platform.Constants;
using Field = Sitecore.Data.Fields.Field;
using Item = Sitecore.Data.Items.Item;

namespace Intralox.Platform.CustomContentResolver
{
    public class BeltFinderContentResolver : RenderingContentsResolver
    {
        protected IContext Context { get; } = ServiceLocator.ServiceProvider.GetService<IContext>();

        /// <summary>
        /// used to get the belt tools, belt components and downloads for a belt page and return as a JObject to be used in the front end.
        /// </summary>
        /// <param name="rendering"></param>
        /// <param name="renderingConfig"></param>
        /// <returns></returns>
        public override object ResolveContents(Rendering rendering, IRenderingConfiguration renderingConfig)
        {
            Assert.ArgumentNotNull(rendering, nameof(rendering));
            Assert.ArgumentNotNull(renderingConfig, nameof(renderingConfig));

            string showDownloads = rendering.Parameters["ShowDownloads"];
            string showSprockets = rendering.Parameters["ShowSprockets"];
            string showTools = rendering.Parameters["ShowTools"];

            Log.Info($"BeltFinderContentResolver: ShowDownloads={showDownloads}, ShowSprockets={showSprockets}, ShowTools={showTools}", this);

            JObject jObj = new JObject();
            Item contextItem = GetContextItem(rendering, renderingConfig);

            Log.Info($"BeltFinderContentResolver: Context item template Id {contextItem.TemplateID.ToString()} is {contextItem?.Paths.FullPath ?? "null"}", this);

            if (contextItem.TemplateID.ToString() == Constants.PageTypes.BeltSeries)
            {
                jObj = GetJObjectForPageLinks(contextItem);
            }
            else if (contextItem.TemplateID.ToString() == Constants.PageTypes.AccessoriesPage)
            {
                jObj = GetJObjectForPageLinks(contextItem.Parent);               
            }
            else if (contextItem.TemplateID.ToString() == Constants.PageTypes.SprocketsPage)
            {
                jObj = GetJObjectForPageLinks(contextItem.Parent);
            }
            else if (contextItem.TemplateID.ToString() == Constants.PageTypes.ToolsPage)
            {
                jObj = GetJObjectForPageLinks(contextItem.Parent);
            }
            else
            {
                List<Item> beltComponentItems = new List<Item>();
                List<Item> beltToolItems = new List<Item>();
                List<Item> downloadsItems = new List<Item>();

                var parentItem = contextItem.Parent;
                Item filesDataFolder = Sitecore.Context.Database.GetItem(Constants.BeltFileData.BeltFileDataFolder);

                if (parentItem != null && parentItem.TemplateID.ToString() == Constants.PageTypes.BeltSeries && parentItem.Visualization?.GetLayout(Sitecore.Context.Device) != null)
                {
                    if (showSprockets == "1")
                    {
                        beltComponentItems = parentItem.GetChildren().Where(x =>
                            x.TemplateID.ToString() == Constants.PageTypes.BeltComponent
                            && x.ID.ToString() != contextItem.ID.ToString()
                            && x.Visualization.GetLayout(Context.Device) != null).ToList();
                    }

                    if (showTools == "1")
                    {
                        beltToolItems = parentItem.GetChildren().Where(x =>
                            x.TemplateID.ToString() == Constants.PageTypes.BeltTool
                            && x.ID.ToString() != contextItem.ID.ToString()
                            && x.Visualization.GetLayout(Context.Device) != null).ToList();
                    }                    
                }

                List<BeltToolModel> beltToolList = new List<BeltToolModel>();
                List<BeltComponentModel> beltComponentList = new List<BeltComponentModel>();
                List<BeltDownloadsModel> downloads = new List<BeltDownloadsModel>();

                Log.Info($"BeltFinderContentResolver: Found {beltComponentItems.Count} belt component items, {beltToolItems.Count} belt tool items and {downloadsItems.Count} download items for context item {contextItem.Paths.FullPath}", this);

                try
                {
                    if (beltComponentItems?.Count > 0)
                    {
                        foreach (var component in beltComponentItems)
                        {
                            string componentValue = string.Empty;
                            string imageUrl = string.Empty;
                            MultilistField imagesMultilistField = component.Fields[Constants.BeltComponent.Fields.Images];
                            Log.Info($"BeltFinderContentResolver: Processing belt component item {component.Paths.FullPath} with {imagesMultilistField?.GetItems().Count() ?? 0} images", this);
                            if (imagesMultilistField != null && imagesMultilistField.GetItems().Count() > 0)
                            {
                                var imageItem = imagesMultilistField.GetItems().ToList().FirstOrDefault();
                                Log.Info($"BeltFinderContentResolver: Found image item {imageItem?.Paths.FullPath} for belt component item {component.Paths.FullPath}", this);
                                Field imageField = imageItem?.Fields[Constants.BeltImage.Fields.Image];

                                imageUrl = CommonFunctions.GetImageUrl(imageField);

                            }

                            ReferenceField componentField = component.Fields[Constants.BeltComponent.Fields.Component];
                            if (componentField != null && componentField.TargetItem != null)
                            {
                                componentValue = componentField.TargetItem.Fields[Constants.TagItem.Fields.Value]?.Value;
                            }

                            Log.Info($"BeltFinderContentResolver: Adding belt component model for item {component.Paths.FullPath} with title '{component?.Fields[Constants.BeltComponent.Fields.Title].Value}', series '{(parentItem?.TemplateID?.ToString() == Constants.PageTypes.BeltSeries ? parentItem.Fields[Constants.BeltSeries.Fields.SeriesNumber].Value : string.Empty)}', imageUrl '{imageUrl}', componentValue '{componentValue}'", this);
                            beltComponentList.Add(new BeltComponentModel()
                            {
                                Title = component?.Fields[Constants.BeltComponent.Fields.Title].Value,
                                Series = parentItem?.TemplateID?.ToString() == Constants.PageTypes.BeltSeries ?
                                parentItem.Fields[Constants.BeltSeries.Fields.SeriesNumber].Value : string.Empty,
                                ImageUrl = imageUrl,
                                Component = componentValue,
                                Link = LinkManager.GetItemUrl(component, ItemUrlHelper.GetLayoutServiceUrlOptions())
                            });
                        }
                    }

                    if (beltToolItems?.Count > 0)
                    {
                        foreach (var component in beltToolItems)
                        {
                            string imageUrl = string.Empty;
                            MultilistField imagesMultilistField = component.Fields[Constants.BeltTool.Fields.Images];
                            if (imagesMultilistField != null && imagesMultilistField.GetItems().Count() > 0)
                            {
                                var imageItem = imagesMultilistField.GetItems().ToList().FirstOrDefault();
                                Log.Info($"BeltFinderContentResolver: Found image item {imageItem?.Paths.FullPath} for belt tool item {component.Paths.FullPath}", this);
                                Field imageField = imageItem?.Fields[Constants.BeltImage.Fields.Image];
                              
                                imageUrl = CommonFunctions.GetImageUrl(imageField);
                            }
                            Log.Info($"BeltFinderContentResolver: Adding belt tool model for item {component.Paths.FullPath} with title '{component.Fields[Constants.BeltTool.Fields.Title].Value}', series '{(parentItem.TemplateID.ToString() == Constants.PageTypes.BeltSeries ? parentItem.Fields[Constants.BeltSeries.Fields.SeriesNumber].Value : string.Empty)}', imageUrl '{imageUrl}'", this);
                            beltToolList.Add(new BeltToolModel()
                            {
                                Title = component.Fields[Constants.BeltTool.Fields.Title].Value,
                                Series = parentItem != null && parentItem.TemplateID.ToString() == Constants.PageTypes.BeltSeries ?
                                parentItem.Fields[Constants.BeltSeries.Fields.SeriesNumber].Value : string.Empty,
                                ImageUrl = imageUrl,
                                Link = LinkManager.GetItemUrl(component, ItemUrlHelper.GetLayoutServiceUrlOptions())
                            });
                        }
                    }                  
                }
                catch (Exception ex)
                {
                    Log.Error($"BeltFinderContentResolver: Error while mapping belt components and belt tools to models for context item {contextItem.Paths.FullPath}. Exception: {ex.StackTrace}", this);
                }

                Log.Info($"BeltFinderContentResolver: Mapped download {downloads.Count}, {beltComponentList.Count} belt components and {beltToolList.Count} belt tools to models for context item {contextItem.Paths.FullPath}", this);

                jObj = GetJObject(parentItem, beltToolList, beltComponentList, downloads);

                Log.Info($"BeltFinderContentResolver: Returning JObject with {beltComponentList.Count} belt components and {beltToolList.Count} belt tools for context item {contextItem.Paths.FullPath}", this);

            }

            return jObj;
        }

        /// <summary>
        /// used to create JObject for belt tools, belt components and downloads to be used in the front end.
        /// </summary>
        /// <param name="beltToolList"></param>
        /// <param name="beltComponentList"></param>
        /// <param name="downloads"></param>
        /// <returns></returns>
        private JObject GetJObject(Item parentItem, List<BeltToolModel> beltToolList, List<BeltComponentModel> beltComponentList, List<BeltDownloadsModel> downloads)
        {
            var beltToolJsonString = beltToolList.Count > 0 ? JsonConvert.SerializeObject(beltToolList) : string.Empty;
            var beltComponentListJsonString = beltComponentList.Count > 0 ? JsonConvert.SerializeObject(beltComponentList) : string.Empty;
            var downloadsJsonString = downloads.Count > 0 ? JsonConvert.SerializeObject(downloads) : string.Empty;

            BeltSeriesLinksModel beltSeriesLinks = GetPageLinks(parentItem);

            dynamic fieldObject = new
            {
                Downloads = new
                {
                    value = !string.IsNullOrWhiteSpace(downloadsJsonString) ? JToken.Parse(downloadsJsonString) : string.Empty
                },
                BeltComponents = new
                {
                    value = !string.IsNullOrWhiteSpace(beltComponentListJsonString) ? JToken.Parse(beltComponentListJsonString) : string.Empty
                },
                BeltTools = new
                {
                    value = !string.IsNullOrWhiteSpace(beltToolJsonString) ? JToken.Parse(beltToolJsonString) : string.Empty
                },
                ViewAllSprocketsLink = new
                {
                    value = beltSeriesLinks?.SprocketsPageLink,
                },
                ViewAllAccessoriesLink = new
                {
                    value = beltSeriesLinks?.AccessoriesPageLink,
                },
                ViewAllToolsLink = new
                {
                    value = beltSeriesLinks?.ToolsPageLink,
                },
            };

            JObject jObj = JObject.Parse(JsonConvert.SerializeObject(fieldObject));

            return jObj;
        }

        private JObject GetJObjectForPageLinks(Item parentItem)
        {
            BeltSeriesLinksModel beltSeriesLinks = GetPageLinks(parentItem);

            dynamic fieldObject = new
            {
                SeriesPageLink = new
                {
                    value = beltSeriesLinks?.BeltsPageLink,
                },
                SprocketsPageLink = new
                {
                    value = beltSeriesLinks?.SprocketsPageLink,
                },
                AccessoriesPageLink = new
                {
                    value = beltSeriesLinks?.AccessoriesPageLink,
                },
                ToolsPageLink = new
                {
                    value = beltSeriesLinks?.ToolsPageLink,
                },
            };

            JObject jObj = JObject.Parse(JsonConvert.SerializeObject(fieldObject));

            return jObj;
        }

        private BeltSeriesLinksModel GetPageLinks(Item contextItem)
        {
            BeltSeriesLinksModel beltSeriesLinks = new BeltSeriesLinksModel();

            beltSeriesLinks.BeltsPageLink = LinkManager.GetItemUrl(contextItem, ItemUrlHelper.GetLayoutServiceUrlOptions());

            var viewAllSprocketsPageLink = contextItem.Children.FirstOrDefault(child => child.TemplateID.ToString() == Constants.PageTypes.SprocketsPage
            && child.Visualization.GetLayout(Context.Device) != null);

            if (viewAllSprocketsPageLink != null)
            {
                beltSeriesLinks.SprocketsPageLink = LinkManager.GetItemUrl(viewAllSprocketsPageLink, ItemUrlHelper.GetLayoutServiceUrlOptions());
            }

            var viewAllAccessoriesPageLink = contextItem.Children.FirstOrDefault(child => child.TemplateID.ToString() == Constants.PageTypes.AccessoriesPage
            && child.Visualization.GetLayout(Context.Device) != null);

            if (viewAllAccessoriesPageLink != null)
            {
                beltSeriesLinks.AccessoriesPageLink = LinkManager.GetItemUrl(viewAllAccessoriesPageLink, ItemUrlHelper.GetLayoutServiceUrlOptions());
            }

            var viewAllToolsPageLink = contextItem.Children.FirstOrDefault(child => child.TemplateID.ToString() == Constants.PageTypes.ToolsPage
            && child.Visualization.GetLayout(Context.Device) != null);

            if (viewAllToolsPageLink != null)
            {
                beltSeriesLinks.ToolsPageLink = LinkManager.GetItemUrl(viewAllToolsPageLink, ItemUrlHelper.GetLayoutServiceUrlOptions());
            }

            return beltSeriesLinks;
        }

        private string GetFileExtensionFromUrl(string url)
        {
            if (string.IsNullOrWhiteSpace(url))
                return string.Empty;

            try
            {
                // Remove query string and fragments
                Uri uri = new Uri(url);
                string path = uri.AbsolutePath;

                // Get extension from path
                string extension = Path.GetExtension(path);

                return extension?.ToLowerInvariant() ?? string.Empty;
            }
            catch (UriFormatException ex)
            {
                Log.Warn($"GetFileExtensionFromUrl: Invalid URL format '{url}'. Exception: {ex.Message}", this);
                // Fallback for relative URLs or invalid URIs
                string cleanUrl = url.Split('?')[0].Split('#')[0];
                return Path.GetExtension(cleanUrl)?.ToLowerInvariant()
                       ?? string.Empty;
            }
        }

    }
}
