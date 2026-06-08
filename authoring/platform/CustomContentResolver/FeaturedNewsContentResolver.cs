using DocumentFormat.OpenXml.Vml.Office;
using Intralox.Platform.Models;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.OData.Edm.Vocabularies;
using Microsoft.Practices.EnterpriseLibrary.Common.Utility;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using RWS.Tms.LanguageCloud.API;
using Sitecore.Data;
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
using Sitecore.Speak.Applications.Dependencies;
using Sitecore.XA.Foundation.Abstractions;
using Sitecore.XA.Foundation.Multisite;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.IdentityModel.Protocols.WSTrust;
using System.Linq;
using System.Security.Policy;
using static Intralox.Platform.Constants;

namespace Intralox.Platform.CustomContentResolver
{
    public class FeaturedNewsContentResolver : RenderingContentsResolver
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
            string articleType = string.Empty;
            string articleTypeText = string.Empty;
            List<string> industries = new List<string>();
            List<string> solutions = new List<string>();
            List<string> products = new List<string>();

            int itemCount = 5;

            if (!string.IsNullOrWhiteSpace(rendering.DataSource))
            {
                datasourceItem = Sitecore.Context.Database.GetItem(rendering.DataSource);

                if (datasourceItem != null)
                {
                    MultilistField industriesField = datasourceItem.Fields[Constants.FeaturedNews.Fields.Industries];
                    if (industriesField != null && industriesField.GetItems().Count() > 0)
                    {
                        industriesField.GetItems().ForEach(ind => industries.Add(ind.ID.ToString()));
                    }

                    MultilistField solutionsField = datasourceItem.Fields[Constants.FeaturedNews.Fields.Solutions];
                    if (solutionsField != null && solutionsField.GetItems().Count() > 0)
                    {
                        solutionsField.GetItems().ForEach(ind => solutions.Add(ind.ID.ToString()));
                    }

                    MultilistField productsField = datasourceItem.Fields[Constants.FeaturedNews.Fields.Products];
                    if (productsField != null && productsField.GetItems().Count() > 0)
                    {
                        productsField.GetItems().ForEach(ind => products.Add(ind.ID.ToString()));
                    }

                    ReferenceField referenceField = datasourceItem.Fields[Constants.FeaturedNews.Fields.ArticleType];
                    if (referenceField != null && referenceField.TargetItem != null)
                    {
                        articleType = referenceField.TargetItem.ID.ToString();
                        articleTypeText = referenceField.TargetItem.Fields["Value"].Value;
                    }

                    int.TryParse(datasourceItem.Fields[Constants.FeaturedNews.Fields.ItemCount].Value, out itemCount);
                }
            }
            else
            {
                return null;
            }

            JObject jObj = new JObject();
            Log.Info($"FeaturedNewsContentResolver: articleType: {articleType}, industries: {string.Join(",", industries)}, solutions: {string.Join(",", solutions)}, products: {string.Join(",", products)}, itemCount: {itemCount}", this);
            List<Item> childItems = GetFilteredItems(contextItem, homeItem, industries, solutions, products, articleType, itemCount);
            jObj = FetchContentItems(childItems, datasourceItem, rendering, contextItem, itemCount, articleTypeText);

            return jObj;
        }

        /// <summary>
        /// filter insights items
        /// </summary>
        /// <param name="itemList">itemList</param>
        /// <param name="datasourceItem">datasourceItem</param>
        /// <param name="rendering">rendering</param>
        /// <returns>return jobject</returns>
        private JObject FetchContentItems(List<Item> itemList, Item datasourceItem, Rendering rendering, Item contextItem, int itemCount, string contentType)
        {
            List<dynamic> contentListings = new List<dynamic>();

            foreach (Item item in itemList)
            {
                contentListings.Add(PageData(item));
            }

            var jsonString = JsonConvert.SerializeObject(contentListings);

            return GetJObject(datasourceItem, itemCount, contentType, jsonString);
        }

        /// <summary>
        /// used to get item detail object.
        /// </summary>
        /// <param name="item"></param>
        /// <returns>ServiceListing.</returns>
        private dynamic PageData(Item item)
        {
            Field imageField = item.Fields[Constants.ArticleType.Fields.Image];
            string url = CommonFunctions.GetImageUrl(imageField);

            DateTime postDateTime = DateTime.MinValue;
            DateField postDate = item.Fields[Constants.ArticleType.Fields.PostDate];
            postDateTime = postDate.DateTime;

            dynamic videoItemData = null;
            var videoItemId = item.Fields[Constants.ArticleType.Fields.Video].Value;
            if (!string.IsNullOrWhiteSpace(videoItemId))
            {
                var videoItem = Sitecore.Context.Database.GetItem(videoItemId);

                Field coverImageField = videoItem.Fields[Constants.VideoItem.Fields.CoverImage];
                string coverImageUrl = CommonFunctions.GetImageUrl(imageField);

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

            dynamic authorItemData = null;
            var authorItemId = item.Fields[Constants.ArticleType.Fields.Author].Value;
            if (!string.IsNullOrWhiteSpace(authorItemId))
            {
                var authorItem = Sitecore.Context.Database.GetItem(authorItemId);

                Field authorImageField = authorItem.Fields[Constants.Author.Fields.Image];
                string authorImageUrl = CommonFunctions.GetImageUrl(imageField);

                authorItemData = new
                {
                    Name = authorItem.Fields[Constants.Author.Fields.Name].Value,
                    Bio = authorItem.Fields[Constants.Author.Fields.Bio].Value,
                    CoverImage = authorImageUrl
                };
            }

            List<string> industries = new List<string>();
            List<string> solutions = new List<string>();
            List<string> products = new List<string>();

            MultilistField industriesField = item.Fields[Constants.ArticleType.Fields.Industries];
            if (industriesField != null && industriesField.GetItems().Count() > 0)
            {
                industriesField.GetItems().ForEach(ind => industries.Add(ind["Title"]));
            }

            MultilistField solutionsField = item.Fields[Constants.ArticleType.Fields.Solutions];
            if (solutionsField != null && solutionsField.GetItems().Count() > 0)
            {
                solutionsField.GetItems().ForEach(sv => solutions.Add(sv["Title"]));
            }

            MultilistField productsField = item.Fields[Constants.ArticleType.Fields.Products];
            if (productsField != null && productsField.GetItems().Count() > 0)
            {
                productsField.GetItems().ForEach(pd => products.Add(pd["Title"]));
            }

            string articleType = string.Empty;
            ReferenceField articleTypeField = item.Fields[Constants.ArticleType.Fields.ArticleType];
            if (articleTypeField != null && articleTypeField.TargetItem != null)
            {
                articleType = articleTypeField.TargetItem.Fields["Value"].Value;
            }

            bool hideDate = false;
            CheckboxField hideDateField = item.Fields[Constants.ArticleType.Fields.HideDate];
            if (hideDateField.Checked)
            {
                hideDate = true;
            }

            bool showBreadcrumb = false;
            CheckboxField showBreadcrumbField = item.Fields[Constants.ArticleType.Fields.ShowBreadcrumb];
            if (showBreadcrumbField.Checked)
            {
                showBreadcrumb = true;
            }

            bool hideFromHomePage = false;
            CheckboxField hideFromHomePageField = item.Fields[Constants.ArticleType.Fields.HideFromHomePage];
            if (hideFromHomePageField.Checked)
            {
                hideFromHomePage = true;
            }

            string articleUrl = LinkManager.GetItemUrl(item, ItemUrlHelper.GetLayoutServiceUrlOptions());

            var contentItem = new
            {
                Title = item.Fields[Constants.ArticleType.Fields.Title].Value,
                SubHeadline = item.Fields[Constants.ArticleType.Fields.SubHeadline].Value,
                Summary = item.Fields[Constants.ArticleType.Fields.Summary].Value,
                PostDate = postDateTime != DateTime.MinValue ? postDateTime.ToString("MMMM dd, yyyy") : "",
                HideDate = hideDate,
                ShowBreadcrumb = showBreadcrumb,
                HideFromHomePage = hideFromHomePage,
                Image = url,
                ArticleType = articleType,
                Author = authorItemData,
                Video = videoItemData,
                Industries = industries.Count > 0 ? string.Join(",", industries) : "",
                Solutions = solutions.Count > 0 ? string.Join(",", solutions) : "",
                Products = products.Count > 0 ? string.Join(",", products) : "",
                Url = articleUrl
            };

            return contentItem;
        }

        private JObject GetJObject(Item datasourceItem, int itemCount, string contentType, string jsonString)
        {
            JObject ctaLinkObj = new JObject();
            if (datasourceItem.Fields[Constants.FeaturedNews.Fields.ViewAllLink] != null)
            {
                var ctaink = (LinkField)datasourceItem.Fields[Constants.FeaturedNews.Fields.ViewAllLink];

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

            dynamic fieldObject = new
            {
                Eyebrow = new
                {
                    value = datasourceItem[Constants.FeaturedNews.Fields.Eyebrow],
                },
                Headline = new
                {
                    value = datasourceItem[Constants.FeaturedNews.Fields.Headline],
                },
                Description = new
                {
                    value = datasourceItem[Constants.FeaturedNews.Fields.Description],
                },
                ItemCount = new
                {
                    Value = itemCount.ToString()
                },
                Type = new
                {
                    Value = contentType
                },
                ViewAllLink = new
                {
                    value = JsonConvert.SerializeObject(ctaLinkObj),
                },
                ArticleListings = new
                {
                    value = JToken.Parse(jsonString)
                }
            };

            JObject jObj = JObject.Parse(JsonConvert.SerializeObject(fieldObject));

            return jObj;
        }

        private List<Item> GetFilteredItems(Item contextItem, Item homeItem, List<string> industries, List<string> solutions, List<string> products, string articleType, int itemCount)
        {
            List<Item> childItems = new List<Item>();
            try
            {
                if (!string.IsNullOrWhiteSpace(articleType))
                {
                    if (industries.Count > 0 && solutions.Count > 0 && products.Count > 0)
                    {
                        childItems = homeItem.Axes.GetDescendants().Where(x =>
                                x.TemplateID.ToString() == Constants.PageTypes.ArticleType
                                && x.Fields[Constants.ArticleType.Fields.ArticleType].Value == articleType
                                && industries.Exists(c => x.Fields[Constants.ArticleType.Fields.Industries].Value.Contains(c))
                                && solutions.Exists(c => x.Fields[Constants.ArticleType.Fields.Solutions].Value.Contains(c))
                                && products.Exists(c => x.Fields[Constants.ArticleType.Fields.Products].Value.Contains(c))
                                && x.Visualization.GetLayout(Context.Device) != null).ToList();
                    }
                    else if (industries.Count > 0 && solutions.Count > 0 && products.Count == 0)
                    {
                        childItems = homeItem.Axes.GetDescendants().Where(x =>
                               x.TemplateID.ToString() == Constants.PageTypes.ArticleType
                               && x.Fields[Constants.ArticleType.Fields.ArticleType].Value == articleType
                               && industries.Exists(c => x.Fields[Constants.ArticleType.Fields.Industries].Value.Contains(c))
                               && solutions.Exists(c => x.Fields[Constants.ArticleType.Fields.Solutions].Value.Contains(c))
                               && x.Visualization.GetLayout(Context.Device) != null).ToList();
                    }
                    else if (industries.Count > 0 && products.Count > 0 && solutions.Count == 0)
                    {
                        childItems = homeItem.Axes.GetDescendants().Where(x =>
                               x.TemplateID.ToString() == Constants.PageTypes.ArticleType
                               && x.Fields[Constants.ArticleType.Fields.ArticleType].Value == articleType
                               && industries.Exists(c => x.Fields[Constants.ArticleType.Fields.Industries].Value.Contains(c))
                               && products.Exists(c => x.Fields[Constants.ArticleType.Fields.Products].Value.Contains(c))
                               && x.Visualization.GetLayout(Context.Device) != null).ToList();
                    }
                    else if (industries.Count == 0 && products.Count > 0 && solutions.Count > 0)
                    {
                        childItems = homeItem.Axes.GetDescendants().Where(x =>
                               x.TemplateID.ToString() == Constants.PageTypes.ArticleType
                               && x.Fields[Constants.ArticleType.Fields.ArticleType].Value == articleType
                               && solutions.Exists(c => x.Fields[Constants.ArticleType.Fields.Solutions].Value.Contains(c))
                               && products.Exists(c => x.Fields[Constants.ArticleType.Fields.Products].Value.Contains(c))
                               && x.Visualization.GetLayout(Context.Device) != null).ToList();
                    }
                    else if (industries.Count > 0 && products.Count == 0 && solutions.Count == 0)
                    {
                        childItems = homeItem.Axes.GetDescendants().Where(x =>
                               x.TemplateID.ToString() == Constants.PageTypes.ArticleType
                               && x.Fields[Constants.ArticleType.Fields.ArticleType].Value == articleType
                               && industries.Exists(c => x.Fields[Constants.FeaturedNews.Fields.Industries].Value.Contains(c))
                               && x.Visualization.GetLayout(Context.Device) != null).ToList();
                    }
                    else if (industries.Count == 0 && products.Count == 0 && solutions.Count > 0)
                    {
                        childItems = homeItem.Axes.GetDescendants().Where(x =>
                               x.TemplateID.ToString() == Constants.PageTypes.ArticleType
                               && x.Fields[Constants.ArticleType.Fields.ArticleType].Value == articleType
                               && solutions.Exists(c => x.Fields[Constants.ArticleType.Fields.Solutions].Value.Contains(c))
                               && x.Visualization.GetLayout(Context.Device) != null).ToList();
                    }
                    else if (industries.Count == 0 && products.Count > 0 && solutions.Count == 0)
                    {
                        childItems = homeItem.Axes.GetDescendants().Where(x =>
                              x.TemplateID.ToString() == Constants.PageTypes.ArticleType
                              && x.Fields[Constants.ArticleType.Fields.ArticleType].Value == articleType
                              && products.Exists(c => x.Fields[Constants.FeaturedNews.Fields.Products].Value.Contains(c))
                              && x.Visualization.GetLayout(Context.Device) != null).ToList();
                    }
                    else
                    {
                        childItems = homeItem.Axes.GetDescendants().Where(x =>
                                     x.TemplateID.ToString() == Constants.PageTypes.ArticleType
                                     && x.Fields[Constants.ArticleType.Fields.ArticleType].Value == articleType
                                     && x.Visualization.GetLayout(Context.Device) != null).ToList();
                    }
                }
                else
                {
                    if (industries.Count > 0 && solutions.Count > 0 && products.Count > 0)
                    {
                        childItems = homeItem.Axes.GetDescendants().Where(x =>
                                x.TemplateID.ToString() == Constants.PageTypes.ArticleType
                                && industries.Exists(c => x.Fields[Constants.ArticleType.Fields.Industries].Value.Contains(c))
                                && solutions.Exists(c => x.Fields[Constants.ArticleType.Fields.Solutions].Value.Contains(c))
                                && products.Exists(c => x.Fields[Constants.ArticleType.Fields.Products].Value.Contains(c))
                                && x.Visualization.GetLayout(Context.Device) != null).ToList();
                    }
                    else if (industries.Count > 0 && solutions.Count > 0 && products.Count == 0)
                    {
                        childItems = homeItem.Axes.GetDescendants().Where(x =>
                               x.TemplateID.ToString() == Constants.PageTypes.ArticleType
                               && industries.Exists(c => x.Fields[Constants.ArticleType.Fields.Industries].Value.Contains(c))
                               && solutions.Exists(c => x.Fields[Constants.ArticleType.Fields.Solutions].Value.Contains(c))
                               && x.Visualization.GetLayout(Context.Device) != null).ToList();
                    }
                    else if (industries.Count > 0 && products.Count > 0 && solutions.Count == 0)
                    {
                        childItems = homeItem.Axes.GetDescendants().Where(x =>
                               x.TemplateID.ToString() == Constants.PageTypes.ArticleType
                               && industries.Exists(c => x.Fields[Constants.ArticleType.Fields.Industries].Value.Contains(c))
                               && products.Exists(c => x.Fields[Constants.ArticleType.Fields.Products].Value.Contains(c))
                               && x.Visualization.GetLayout(Context.Device) != null).ToList();
                    }
                    else if (industries.Count == 0 && products.Count > 0 && solutions.Count > 0)
                    {
                        childItems = homeItem.Axes.GetDescendants().Where(x =>
                               x.TemplateID.ToString() == Constants.PageTypes.ArticleType
                               && solutions.Exists(c => x.Fields[Constants.ArticleType.Fields.Solutions].Value.Contains(c))
                               && products.Exists(c => x.Fields[Constants.ArticleType.Fields.Products].Value.Contains(c))
                               && x.Visualization.GetLayout(Context.Device) != null).ToList();
                    }
                    else if (industries.Count > 0 && products.Count == 0 && solutions.Count == 0)
                    {
                        childItems = homeItem.Axes.GetDescendants().Where(x =>
                               x.TemplateID.ToString() == Constants.PageTypes.ArticleType
                               && industries.Exists(c => x.Fields[Constants.ArticleType.Fields.Industries].Value.Contains(c))
                               && x.Visualization.GetLayout(Context.Device) != null).ToList();
                    }
                    else if (industries.Count == 0 && products.Count == 0 && solutions.Count > 0)
                    {
                        childItems = homeItem.Axes.GetDescendants().Where(x =>
                               x.TemplateID.ToString() == Constants.PageTypes.ArticleType
                               && solutions.Exists(c => x.Fields[Constants.ArticleType.Fields.Solutions].Value.Contains(c))
                               && x.Visualization.GetLayout(Context.Device) != null).ToList();
                    }
                    else if (industries.Count == 0 && products.Count > 0 && solutions.Count == 0)
                    {
                        childItems = homeItem.Axes.GetDescendants().Where(x =>
                              x.TemplateID.ToString() == Constants.PageTypes.ArticleType
                              && products.Exists(c => x.Fields[Constants.ArticleType.Fields.Products].Value.Contains(c))
                              && x.Visualization.GetLayout(Context.Device) != null).ToList();
                    }
                    else
                    {
                        childItems = homeItem.Axes.GetDescendants().Where(x =>
                                     x.TemplateID.ToString() == Constants.PageTypes.ArticleType
                                     && x.Visualization.GetLayout(Context.Device) != null).ToList();
                    }
                }

            }
            catch (Exception ex)
            {
                Log.Error($"Error in fetching child items for FeaturedNewsContentResolver. Error {ex.Message}", this);
            }

            Log.Info($"FeaturedNewsContentResolver: total items after filtering: {childItems.Count}", this);
            childItems = childItems.Where(ci => ci.ID.ToString() != contextItem.ID.ToString() && ci.Fields[Constants.ArticleType.Fields.HideFromHomePage].Value != "1").ToList();
            childItems = childItems.OrderByDescending(ci => ci.Fields[Constants.ArticleType.Fields.PostDate].Value).Take(itemCount).ToList();
            Log.Info($"FeaturedNewsContentResolver: total items after excluding current item and hidden items: {childItems.Count}", this);
            return childItems;
        }
    }
}
