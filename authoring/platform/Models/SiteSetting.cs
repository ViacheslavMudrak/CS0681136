using Sitecore.Data.Items;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Intralox.Platform.Models
{
    public class SiteSetting
    {
        public string SiteTheme { get; set; } = "Intralox";

        public List<Item> ItemLanguages { get; set; } = new List<Item>();
    }


}