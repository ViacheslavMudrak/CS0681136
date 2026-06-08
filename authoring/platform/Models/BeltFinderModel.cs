using Sitecore.LayoutService.Helpers;
using Sitecore.Links;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Intralox.Platform.Models
{
    public class BeltComponentModel
    {
        public string Title { get; set; }

        public string Series { get; set; }

        public string ImageUrl { get; set; }

        public string Component { get; set; }

        public string Link { get; set; }

    }

    public class BeltToolModel
    {
        public string Title { get; set; }

        public string Series { get; set; }

        public string ImageUrl { get; set; }

        public string Link { get; set; }

    }

    public class BeltDownloadsModel
    {
        public string DocumentName { get; set; }

        public string DocumentType { get; set; }

        public string FileType { get; set; }

        public string FileSize { get; set; }

        public string Link { get; set; }
    }

    public class BeltSeriesLinksModel
    {
        public string BeltsPageLink { get; set; }

        public string SprocketsPageLink { get; set; }

        public string AccessoriesPageLink { get; set; }

        public string ToolsPageLink { get; set; }
    }
}