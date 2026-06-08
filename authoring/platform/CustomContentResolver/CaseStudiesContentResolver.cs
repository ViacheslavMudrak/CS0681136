using Microsoft.Extensions.DependencyInjection;
using Microsoft.Practices.EnterpriseLibrary.Common.Utility;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
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
using Sitecore.XA.Foundation.Abstractions;
using Sitecore.XA.Foundation.Multisite;
using System;
using System.Collections.Generic;
using System.Linq;
using static Intralox.Platform.Constants;

namespace Intralox.Platform.CustomContentResolver
{
    public class CaseStudiesContentResolver : RenderingContentsResolver
    {
        protected IContext Context { get; } = ServiceLocator.ServiceProvider.GetService<IContext>();

        public override object ResolveContents(Rendering rendering, IRenderingConfiguration renderingConfig)
        {
            Assert.ArgumentNotNull(rendering, nameof(rendering));
            Assert.ArgumentNotNull(renderingConfig, nameof(renderingConfig));

            Item contextItem = GetContextItem(rendering, renderingConfig);

            var multisiteContext = ServiceLocator.ServiceProvider.GetService<IMultisiteContext>();
            Item homeItem = multisiteContext.GetHomeItem(contextItem);

            Item datasourceItem = null;
            bool showFeatured = false;
            JObject jObj = new JObject();
            List<string> industries = new List<string>();
            List<string> solutions = new List<string>();
            List<string> products = new List<string>();
            List<Item> childItems = new List<Item>();

            int itemCount = 5;

            if (!string.IsNullOrWhiteSpace(rendering.DataSource))
            {
                datasourceItem = Sitecore.Context.Database.GetItem(rendering.DataSource);

                if (datasourceItem != null)
                {
                    ReferenceField itemCountField = datasourceItem.Fields[Constants.RelatedCaseStudies.Fields.ItemCount];
                    Log.Info($"itemCountField value: {contextItem?.Paths.FullPath ?? "null"}", this);
                    if (itemCountField != null && itemCountField.TargetItem != null)
                    {
                        int.TryParse(itemCountField.TargetItem.Fields[Constants.TagItem.Fields.Value].Value, out itemCount);
                    }

                    CheckboxField showFeaturedField = datasourceItem.Fields[Constants.RelatedCaseStudies.Fields.ShowFeatured];
                    if (showFeaturedField.Checked)
                    {
                        showFeatured = true;
                    }

                    MultilistField manualCaseStudiesField = datasourceItem.Fields[Constants.RelatedCaseStudies.Fields.ManualCaseStudies];
                    if (manualCaseStudiesField != null && manualCaseStudiesField.GetItems().Count() > 0)
                    {
                        manualCaseStudiesField.GetItems().ForEach(cs => childItems.Add(cs));                        
                    }
                    else
                    {
                        MultilistField industriesField = datasourceItem.Fields[Constants.RelatedCaseStudies.Fields.Industries];
                        if (industriesField != null && industriesField.GetItems().Count() > 0)
                        {
                            industriesField.GetItems().ForEach(ind => industries.Add(ind.ID.ToString()));
                        }

                        MultilistField solutionsField = datasourceItem.Fields[Constants.RelatedCaseStudies.Fields.Solutions];
                        if (solutionsField != null && solutionsField.GetItems().Count() > 0)
                        {
                            solutionsField.GetItems().ForEach(ind => solutions.Add(ind.ID.ToString()));
                        }

                        MultilistField productsField = datasourceItem.Fields[Constants.RelatedCaseStudies.Fields.Products];
                        if (productsField != null && productsField.GetItems().Count() > 0)
                        {
                            productsField.GetItems().ForEach(ind => products.Add(ind.ID.ToString()));
                        }

                        childItems = GetFilteredItems(contextItem, homeItem, industries, solutions, products, itemCount, showFeatured);
                    }

                }
            }
            else
            {
                return null;
            }

            jObj = FetchContentItems(childItems, datasourceItem, rendering, contextItem, itemCount);

            return jObj;
        }

        /// <summary>
        /// filter insights items
        /// </summary>
        /// <param name="itemList">itemList</param>
        /// <param name="datasourceItem">datasourceItem</param>
        /// <param name="rendering">rendering</param>
        /// <returns>return jobject</returns>
        private JObject FetchContentItems(List<Item> itemList, Item datasourceItem, Rendering rendering, Item contextItem, int itemCount)
        {
            List<dynamic> contentListings = new List<dynamic>();

            foreach (Item item in itemList)
            {
                contentListings.Add(PageData(item));
            }

            var jsonString = JsonConvert.SerializeObject(contentListings);

            return GetJObject(datasourceItem, itemCount, jsonString);
        }

        /// <summary>
        /// used to get item detail object.
        /// </summary>
        /// <param name="item"></param>
        /// <returns>ServiceListing.</returns>
        private dynamic PageData(Item item)
        {
            Field imageField = item.Fields[Constants.CaseStudy.Fields.Image];         
            string url = CommonFunctions.GetImageUrl(imageField);

            DateTime postDateTime = DateTime.MinValue;
            DateField postDate = item.Fields[Constants.CaseStudy.Fields.PostDate];
            postDateTime = postDate.DateTime;

            dynamic videoItemData = null;
            var videoItemId = item.Fields[Constants.CaseStudy.Fields.Video].Value;
            if (!string.IsNullOrWhiteSpace(videoItemId))
            {
                var videoItem = Sitecore.Context.Database.GetItem(videoItemId);

                Field coverImageField = videoItem.Fields[Constants.VideoItem.Fields.CoverImage];               
                string coverImageUrl = CommonFunctions.GetImageUrl(coverImageField);
                
                videoItemData = new
                {
                    Title = videoItem.Fields[Constants.VideoItem.Fields.Title].Value,
                    Autoplay = videoItem.Fields[Constants.VideoItem.Fields.Autoplay].Value,
                    Loop = videoItem.Fields[Constants.VideoItem.Fields.Loop].Value,
                    BrightcoveId = videoItem.Fields[Constants.VideoItem.Fields.BrightcoveId].Value,
                    Caption = videoItem.Fields[Constants.VideoItem.Fields.Caption].Value,
                    CoverImage = coverImageUrl
                };
            }


            dynamic companyItemData = null;
            var companyItemId = item.Fields[Constants.CaseStudy.Fields.Company].Value;
            if (!string.IsNullOrWhiteSpace(companyItemId))
            {
                var companyItem = Sitecore.Context.Database.GetItem(companyItemId);

                Field logoField = companyItem.Fields[Constants.Company.Fields.Logo];
               
                string logoImageUrl = CommonFunctions.GetImageUrl(logoField);
             
                JObject ctaLinkObj = new JObject();
                if (companyItem.Fields[Constants.Company.Fields.Link] != null)
                {
                    var ctaink = (LinkField)companyItem.Fields[Constants.Company.Fields.Link];

                    if (ctaink.LinkType.ToLower() == "external")
                    {
                        ctaLinkObj = new JObject()
                        {
                            ["id"] = string.Empty,
                            ["url"] = ctaink.Url,
                            ["name"] = ctaink.Text,
                            ["displayName"] = ctaink.Title,
                            ["target"] = ctaink.Target
                        };
                    }
                    else
                    {
                        if (ctaink != null && ctaink.TargetItem != null)
                        {
                            ctaLinkObj = new JObject()
                            {
                                ["id"] = (JToken)ctaink.TargetItem.ID.Guid.ToString(),
                                ["url"] = (JToken)LinkManager.GetItemUrl(ctaink.TargetItem, ItemUrlHelper.GetLayoutServiceUrlOptions()),
                                ["name"] = !string.IsNullOrWhiteSpace(ctaink.Text) ? ctaink.Text : (JToken)ctaink.TargetItem.Name,
                                ["displayName"] = (JToken)ctaink.TargetItem.DisplayName,
                                ["target"] = (JToken)ctaink.Target,
                                ["querystring"] = (JToken)ctaink.QueryString
                            };
                        }
                    }
                }

                companyItemData = new
                {
                    Name = companyItem.Fields[Constants.Company.Fields.Name].Value,
                    Logo = logoImageUrl,
                    Link = ctaLinkObj
                };
            }

            List<string> industries = new List<string>();
            List<string> solutions = new List<string>();
            List<string> products = new List<string>();

            MultilistField industriesField = item.Fields[Constants.CaseStudy.Fields.Industries];
            if (industriesField != null && industriesField.GetItems().Count() > 0)
            {
                industriesField.GetItems().ForEach(ind => industries.Add(ind["Title"]));
            }

            MultilistField solutionsField = item.Fields[Constants.CaseStudy.Fields.Solutions];
            if (solutionsField != null && solutionsField.GetItems().Count() > 0)
            {
                solutionsField.GetItems().ForEach(sv => solutions.Add(sv["Title"]));
            }

            MultilistField productsField = item.Fields[Constants.CaseStudy.Fields.Products];
            if (productsField != null && productsField.GetItems().Count() > 0)
            {
                productsField.GetItems().ForEach(pd => products.Add(pd["Title"]));
            }

            bool hideDate = false;
            CheckboxField hideDateField = item.Fields[Constants.CaseStudy.Fields.HideDate];
            if (hideDateField.Checked)
            {
                hideDate = true;
            }

            bool showBreadcrumb = false;
            CheckboxField showBreadcrumbField = item.Fields[Constants.CaseStudy.Fields.ShowBreadcrumb];
            if (showBreadcrumbField.Checked)
            {
                showBreadcrumb = true;
            }

            bool showFeatured = false;
            CheckboxField showFeaturedField = item.Fields[Constants.CaseStudy.Fields.IsFeatured];
            if (showFeaturedField.Checked)
            {
                showFeatured = true;
            }

            string caseStudyUrl = LinkManager.GetItemUrl(item, ItemUrlHelper.GetLayoutServiceUrlOptions());

            var contentItem = new
            {
                Company = companyItemData,
                Headline = item.Fields[Constants.CaseStudy.Fields.Headline].Value,
                Summary = item.Fields[Constants.CaseStudy.Fields.Summary].Value,
                PostDate = postDateTime != DateTime.MinValue ? postDateTime.ToString("MMMM dd, yyyy") : "",
                HideDate = hideDate,
                ShowBreadcrumb = showBreadcrumb,
                ShowFeatured = showFeatured,
                Image = url,
                Video = videoItemData,
                Industries = industries.Count > 0 ? string.Join(",", industries) : "",
                Solutions = solutions.Count > 0 ? string.Join(",", solutions) : "",
                Products = products.Count > 0 ? string.Join(",", products) : "",
                url = caseStudyUrl
            };

            return contentItem;
        }

        private JObject GetJObject(Item datasourceItem, int itemCount, string jsonString)
        {
            bool showCompany = false;
            CheckboxField showCompanyField = datasourceItem.Fields[Constants.RelatedCaseStudies.Fields.ShowCompany];
            if (showCompanyField.Checked)
            {
                showCompany = true;
            }

            dynamic fieldObject = new
            {
                Eyebrow = new
                {
                    value = datasourceItem[Constants.RelatedCaseStudies.Fields.Eyebrow],
                },
                Headline = new
                {
                    value = datasourceItem[Constants.RelatedCaseStudies.Fields.Headline],
                },
                Description = new
                {
                    value = datasourceItem[Constants.RelatedCaseStudies.Fields.Description],
                },
                ItemCount = new
                {
                    Value = itemCount.ToString()
                },
                ShowCompany = new
                {
                    value = showCompany,
                },
                CaseStudyListings = new
                {
                    value = JToken.Parse(jsonString)
                }
            };

            JObject jObj = JObject.Parse(JsonConvert.SerializeObject(fieldObject));

            return jObj;
        }

        private List<Item> GetFilteredItems(Item contextItem, Item homeItem, List<string> industries, List<string> solutions, List<string> products, int itemCount, bool showFeatured)
        {
            List<Item> childItems = new List<Item>();

            if (industries.Count > 0 && solutions.Count > 0 && products.Count > 0)
            {
                childItems = homeItem.Axes.GetDescendants().Where(x =>
                        x.TemplateID.ToString() == Constants.PageTypes.CaseStudy
                        && industries.Exists(c => x.Fields[Constants.CaseStudy.Fields.Industries].Value.Contains(c))
                        && solutions.Exists(c => x.Fields[Constants.CaseStudy.Fields.Solutions].Value.Contains(c))
                        && products.Exists(c => x.Fields[Constants.CaseStudy.Fields.Products].Value.Contains(c))
                        && x.Visualization.GetLayout(Context.Device) != null).ToList();
            }
            else if (industries.Count > 0 && solutions.Count > 0 && products.Count == 0)
            {
                childItems = homeItem.Axes.GetDescendants().Where(x =>
                       x.TemplateID.ToString() == Constants.PageTypes.CaseStudy
                       && industries.Exists(c => x.Fields[Constants.CaseStudy.Fields.Industries].Value.Contains(c))
                       && solutions.Exists(c => x.Fields[Constants.CaseStudy.Fields.Solutions].Value.Contains(c))
                       && x.Visualization.GetLayout(Context.Device) != null).ToList();
            }
            else if (industries.Count > 0 && products.Count > 0 && solutions.Count == 0)
            {
                childItems = homeItem.Axes.GetDescendants().Where(x =>
                       x.TemplateID.ToString() == Constants.PageTypes.CaseStudy
                       && industries.Exists(c => x.Fields[Constants.CaseStudy.Fields.Industries].Value.Contains(c))
                       && products.Exists(c => x.Fields[Constants.CaseStudy.Fields.Products].Value.Contains(c))
                       && x.Visualization.GetLayout(Context.Device) != null).ToList();
            }
            else if (industries.Count == 0 && products.Count > 0 && solutions.Count > 0)
            {
                childItems = homeItem.Axes.GetDescendants().Where(x =>
                       x.TemplateID.ToString() == Constants.PageTypes.CaseStudy
                       && solutions.Exists(c => x.Fields[Constants.CaseStudy.Fields.Solutions].Value.Contains(c))
                       && products.Exists(c => x.Fields[Constants.CaseStudy.Fields.Products].Value.Contains(c))
                       && x.Visualization.GetLayout(Context.Device) != null).ToList();
            }
            else if (industries.Count > 0 && products.Count == 0 && solutions.Count == 0)
            {
                childItems = homeItem.Axes.GetDescendants().Where(x =>
                       x.TemplateID.ToString() == Constants.PageTypes.CaseStudy
                       && industries.Exists(c => x.Fields[Constants.CaseStudy.Fields.Industries].Value.Contains(c))
                       && x.Visualization.GetLayout(Context.Device) != null).ToList();
            }
            else if (industries.Count == 0 && products.Count == 0 && solutions.Count > 0)
            {
                childItems = homeItem.Axes.GetDescendants().Where(x =>
                       x.TemplateID.ToString() == Constants.PageTypes.CaseStudy
                       && solutions.Exists(c => x.Fields[Constants.CaseStudy.Fields.Solutions].Value.Contains(c))
                       && x.Visualization.GetLayout(Context.Device) != null).ToList();
            }
            else if (industries.Count == 0 && products.Count > 0 && solutions.Count == 0)
            {
                childItems = homeItem.Axes.GetDescendants().Where(x =>
                      x.TemplateID.ToString() == Constants.PageTypes.CaseStudy
                      && products.Exists(c => x.Fields[Constants.CaseStudy.Fields.Products].Value.Contains(c))
                      && x.Visualization.GetLayout(Context.Device) != null).ToList();
            }
            else
            {
                childItems = homeItem.Axes.GetDescendants().Where(x =>
                             x.TemplateID.ToString() == Constants.PageTypes.CaseStudy
                             && x.Visualization.GetLayout(Context.Device) != null).ToList();
            }

            if (showFeatured)
            {
                childItems = childItems.Where(ci => ci.Fields[Constants.CaseStudy.Fields.IsFeatured].Value == "1").ToList();
            }

            childItems = childItems.Where(ci => ci.ID.ToString() != contextItem.ID.ToString()).ToList();
            childItems = childItems.OrderByDescending(ci => ci.Fields[Constants.CaseStudy.Fields.PostDate].Value).Take(itemCount).ToList();
            return childItems;
        }
    }
}
