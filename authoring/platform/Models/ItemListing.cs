using System.Collections.Generic;

namespace Intralox.Platform.Models
{
    public class ItemListing
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public object Image { get; set; }        
        public string LinkURL { get; set; }

        public List<PageItem> SubIndustries { get; set; }
    }
}