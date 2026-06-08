using Sitecore.Data.Fields;
using Sitecore.Links.UrlBuilders;
using Sitecore.Resources.Media;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Intralox.Platform
{
    public static class CommonFunctions
    {
        public static string GetImageUrl(Field field)
        {

            if (field == null || string.IsNullOrEmpty(field.Value))
                return string.Empty;

            ImageField imageField = field;

            // DAM asset: not in the media library, so MediaItem is null.
            if (imageField.MediaItem == null)
            {
                XmlField xmlField = field;
                return xmlField.GetAttribute("src"); // the public Content Hub URL
            }

            // Standard Sitecore media library item.
            return MediaManager.GetMediaUrl(imageField.MediaItem, new MediaUrlBuilderOptions
            {
                AlwaysIncludeServerUrl = true,
                IncludeExtension = true
            });
        }
    }
}