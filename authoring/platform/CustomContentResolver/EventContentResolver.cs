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
    public class EventContentResolver : RenderingContentsResolver
    {
        protected IContext Context { get; } = ServiceLocator.ServiceProvider.GetService<IContext>();

        public override object ResolveContents(Rendering rendering, IRenderingConfiguration renderingConfig)
        {
            Assert.ArgumentNotNull(rendering, nameof(rendering));
            Assert.ArgumentNotNull(renderingConfig, nameof(renderingConfig));

            Item contextItem = GetContextItem(rendering, renderingConfig);

            var multisiteContext = ServiceLocator.ServiceProvider.GetService<IMultisiteContext>();

            Item homeItem = multisiteContext.GetHomeItem(contextItem);
            JObject jObj = new JObject();
            Item datasourceItem = null;
            List<Item> childItems = new List<Item>();

            if (!string.IsNullOrWhiteSpace(rendering.DataSource))
            {
                datasourceItem = Sitecore.Context.Database.GetItem(rendering.DataSource);

                if (datasourceItem != null)
                {
                    MultilistField selectedEventsField = datasourceItem.Fields[Constants.ActiveEvent.Fields.SelectedEvent];
                    if (selectedEventsField != null && selectedEventsField.GetItems().Count() > 0)
                    {
                        selectedEventsField.GetItems().ForEach(ev => childItems.Add(ev));

                    }
                    else
                    {
                        DateTime eventStartDate = DateTime.MinValue;
                        DateField startDate = datasourceItem.Fields[Constants.ActiveEvent.Fields.StartDate];
                        eventStartDate = startDate.DateTime;

                        DateTime eventEndDate = DateTime.MinValue;
                        DateField endDate = datasourceItem.Fields[Constants.ActiveEvent.Fields.EndDate];
                        eventEndDate = endDate.DateTime;

                        childItems = GetFilteredItems(homeItem, eventStartDate, eventEndDate);
                    }

                }
            }
            else
            {
                return null;
            }

            jObj = FetchContentItems(childItems, datasourceItem, rendering, contextItem);

            return jObj;
        }

        /// <summary>
        /// filter insights items
        /// </summary>
        /// <param name="itemList">itemList</param>
        /// <param name="datasourceItem">datasourceItem</param>
        /// <param name="rendering">rendering</param>
        /// <returns>return jobject</returns>
        private JObject FetchContentItems(List<Item> itemList, Item datasourceItem, Rendering rendering, Item contextItem)
        {
            List<EventItem> contentListings = new List<EventItem>();
            List<dynamic> groupedContentListings = new List<dynamic>();

            foreach (Item item in itemList)
            {
                contentListings.Add(PageData(item));
            }

            if (contentListings.Count > 0)
            {
                var groupedContent = contentListings.GroupBy(cl => cl.EventYear);
                foreach (var content in groupedContent)
                {
                    groupedContentListings.Add(new
                    {
                        Year = content.Key,
                        EventItems = content.ToList()
                    });
                }
            }

            var jsonString = JsonConvert.SerializeObject(groupedContentListings);

            return GetJObject(jsonString);
        }

        /// <summary>
        /// used to get item detail object.
        /// </summary>
        /// <param name="item"></param>
        /// <returns>ServiceListing.</returns>
        private dynamic PageData(Item item)
        {
            DateTime eventStartDate = DateTime.MinValue;
            DateField startDate = item.Fields[Constants.Event.Fields.StartDate];
            eventStartDate = startDate.DateTime;

            DateTime eventEndDate = DateTime.MinValue;
            DateField endDate = item.Fields[Constants.Event.Fields.EndDate];
            eventEndDate = endDate.DateTime;

            JObject ctaLinkObj = new JObject();
            if (item.Fields[Constants.Event.Fields.EventUrl] != null)
            {
                var ctaink = (LinkField)item.Fields[Constants.Event.Fields.EventUrl];

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


            var contentItem = new EventItem()
            {
                EventName = item.Fields[Constants.Event.Fields.EventName].Value,
                Location = item.Fields[Constants.Event.Fields.Location].Value,
                Region = item.Fields[Constants.Event.Fields.Region].Value,
                StartDate = eventStartDate != DateTime.MinValue ? eventStartDate.ToString("MMMM dd, yyyy") : "",
                EndDate = eventEndDate != DateTime.MinValue ? eventEndDate.ToString("MMMM dd, yyyy") : "",
                EventUrl = ctaLinkObj,
                EventStartDate = eventStartDate,
                EventEndDate = eventEndDate,
                EventYear = eventStartDate != DateTime.MinValue ? eventStartDate.ToString("yyyy") : ""
            };

            return contentItem;
        }

        private JObject GetJObject(string jsonString)
        {

            dynamic fieldObject = new
            {
                EventListings = new
                {
                    value = JToken.Parse(jsonString)
                }
            };

            JObject jObj = JObject.Parse(JsonConvert.SerializeObject(fieldObject));

            return jObj;
        }

        private List<Item> GetFilteredItems(Item homeItem, DateTime startDate, DateTime endDate)
        {
            List<Item> childItems = new List<Item>();

            if (startDate != DateTime.MinValue && endDate != DateTime.MinValue)
            {
                childItems = homeItem.Axes.GetDescendants().Where(x =>
                             x.TemplateID.ToString() == Constants.PageTypes.EventType
                             && ((DateField)x.Fields[Constants.Event.Fields.StartDate]).DateTime >= startDate
                             && ((DateField)x.Fields[Constants.Event.Fields.EndDate]).DateTime <= endDate).ToList();
            }
            else
            {
                childItems = homeItem.Axes.GetDescendants().Where(x =>
                             x.TemplateID.ToString() == Constants.PageTypes.EventType).ToList();
            }

            childItems = childItems.OrderBy(ci => ci.Fields[Constants.Event.Fields.StartDate].Value).ToList();
            return childItems;
        }
    }
}
