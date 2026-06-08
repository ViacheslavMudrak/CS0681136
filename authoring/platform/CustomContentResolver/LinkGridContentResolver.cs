using DocumentFormat.OpenXml.Vml.Office;
using Intralox.Platform.Models;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.OData.Edm.Vocabularies;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Sitecore.Data;
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

namespace Intralox.Platform.CustomContentResolver
{
    public class LinkGridContentResolver : RenderingContentsResolver
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
            List<string> contentTypes = new List<string>();
            List<string> tagIds = new List<string>();
            string linkType = string.Empty;
            string linkTypeName = string.Empty;
            int itemCount = 4;

            if (!string.IsNullOrWhiteSpace(rendering.DataSource))
            {
                datasourceItem = Sitecore.Context.Database.GetItem(rendering.DataSource);

                if (datasourceItem != null)
                {
                    if (datasourceItem.Fields[Constants.LinkGrid.Fields.LinkType] != null)
                    {
                        ReferenceField referenceField = datasourceItem.Fields[Constants.LinkGrid.Fields.LinkType];
                        if (referenceField != null && referenceField.TargetItem != null)
                        {
                            linkType = referenceField.TargetItem.ID.ToString();
                            linkTypeName = referenceField.TargetItem.Fields["Value"].Value;
                        }

                        ReferenceField itemCountField = datasourceItem.Fields[Constants.LinkGrid.Fields.ItemCount];
                        if (itemCountField != null && itemCountField.TargetItem != null)
                        {
                            int.TryParse(itemCountField.TargetItem.Name, out itemCount);
                        }
                    }
                }
            }
            else
            {
                return null;
            }

            JObject jObj = new JObject();
            List<Item> childItems = new List<Item>();
            if (!string.IsNullOrWhiteSpace(linkType))
            {
                switch (linkType)
                {
                    case Constants.LinkGrid.ServiceListing:

                        childItems = homeItem.Axes.GetDescendants().Where(x =>
                          x.TemplateID.ToString() == Constants.PageTypes.Solution
                          && x.Visualization.GetLayout(Context.Device) != null).ToList();

                        jObj = FetchServiceContentItems(childItems, datasourceItem, rendering, contextItem, itemCount, linkTypeName);
                        break;
                    case Constants.LinkGrid.IndustryListing:

                        childItems = homeItem.Axes.GetDescendants().Where(x =>
                          x.TemplateID.ToString() == Constants.PageTypes.Industry
                          && x.Visualization.GetLayout(Context.Device) != null).ToList();

                        jObj = FetchIndustryContentItems(childItems, datasourceItem, rendering, contextItem, itemCount, linkTypeName);
                        break;
                    case Constants.LinkGrid.SubIndustryListing:

                        childItems = contextItem.GetChildren().Where(x =>
                          x.TemplateID.ToString() == Constants.PageTypes.SubIndustry
                          && x.Visualization.GetLayout(Context.Device) != null).ToList();

                        jObj = FetchSubIndustryContentItems(childItems, datasourceItem, rendering, contextItem, itemCount, linkTypeName);
                        break;
                    case Constants.LinkGrid.ProductGroups:

                        childItems = contextItem.GetChildren().Where(x =>
                          x.TemplateID.ToString() == Constants.PageTypes.ProductGroup
                          && x.Visualization.GetLayout(Context.Device) != null).ToList();

                        jObj = FetchProductGroupContentItems(childItems, datasourceItem, rendering, contextItem, itemCount, linkTypeName);
                        break;
                    default:
                        break;
                }
            }

            return jObj;
        }

        /// <summary>
        /// filter insights items
        /// </summary>
        /// <param name="itemList">itemList</param>
        /// <param name="datasourceItem">datasourceItem</param>
        /// <param name="rendering">rendering</param>
        /// <returns>return jobject</returns>
        private JObject FetchServiceContentItems(List<Item> itemList, Item datasourceItem, Rendering rendering, Item contextItem, int itemCount, string linkType)
        {
            List<ItemListing> serviceListings = new List<ItemListing>();

            foreach (Item item in itemList)
            {
                serviceListings.Add(GetPageData(item));
            }

            var jsonString = JsonConvert.SerializeObject(serviceListings);

            return GetJObject(datasourceItem, itemCount, linkType, jsonString);
        }

        private JObject FetchIndustryContentItems(List<Item> itemList, Item datasourceItem, Rendering rendering, Item contextItem, int itemCount, string linkType)
        {
            List<ItemListing> industryListings = new List<ItemListing>();

            foreach (Item item in itemList)
            {
                ItemListing industryListing = GetPageData(item);
                industryListing.SubIndustries = new List<PageItem>();

                foreach (var childItem in item.GetChildren().ToList())
                {
                    industryListing.SubIndustries.Add(new PageItem()
                    {
                        Title = childItem["Title"],
                        Url = LinkManager.GetItemUrl(childItem, ItemUrlHelper.GetLayoutServiceUrlOptions())
                    });
                }

                industryListings.Add(industryListing);
            }

            var jsonString = JsonConvert.SerializeObject(industryListings);

            return GetJObject(datasourceItem, itemCount, linkType, jsonString);
        }

        private JObject FetchSubIndustryContentItems(List<Item> itemList, Item datasourceItem, Rendering rendering, Item contextItem, int itemCount, string linkType)
        {
            List<ItemListing> serviceListings = new List<ItemListing>();

            foreach (Item item in itemList)
            {
                serviceListings.Add(GetPageData(item));
            }

            var jsonString = JsonConvert.SerializeObject(serviceListings);

            return GetJObject(datasourceItem, itemCount, linkType, jsonString);
        }

        private JObject FetchProductGroupContentItems(List<Item> itemList, Item datasourceItem, Rendering rendering, Item contextItem, int itemCount, string linkType)
        {
            List<ItemListing> productGroupListings = new List<ItemListing>();

            foreach (Item item in itemList)
            {
                productGroupListings.Add(GetPageData(item));
            }

            var jsonString = JsonConvert.SerializeObject(productGroupListings);

            return GetJObject(datasourceItem, itemCount, linkType, jsonString);
        }



        /// <summary>
        /// used to get item detail object.
        /// </summary>
        /// <param name="item"></param>
        /// <returns>ServiceListing.</returns>
        private ItemListing GetPageData(Item item)
        {          
            Field imageField = item.Fields["Image"];
            string url = CommonFunctions.GetImageUrl(imageField);          

            ItemListing serviceListing = new ItemListing()
            {
                Title = item["Title"],
                Description = item["Description"],
                Image = url,
                LinkURL = LinkManager.GetItemUrl(item, ItemUrlHelper.GetLayoutServiceUrlOptions())
            };

            return serviceListing;
        }

        private JObject GetJObject(Item datasourceItem, int itemCount, string linkType, string jsonString)
        {
            dynamic fieldObject = new
            {
                Eyebrow = new
                {
                    value = datasourceItem[Constants.LinkGrid.Fields.Eyebrow],
                },
                Headline = new
                {
                    value = datasourceItem[Constants.LinkGrid.Fields.Headline],
                },
                Description = new
                {
                    value = datasourceItem[Constants.LinkGrid.Fields.Description],
                },
                ItemCount = new
                {
                    Value = itemCount.ToString()
                },
                Type = new
                {
                    Value = linkType
                },
                ContentItems = new
                {
                    value = JToken.Parse(jsonString)
                }
            };

            JObject jObj = JObject.Parse(JsonConvert.SerializeObject(fieldObject));

            return jObj;
        }
    }
}
