using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Intralox.Platform.Models
{
    public class EventItem
    {
        public string EventName { get; set; }

        public string Location { get; set; }

        public string Region { get; set; }

        public string StartDate { get; set; }
        public string EndDate { get; set; }

        public object EventUrl { get; set; }

        public DateTime EventStartDate { get; set; }

        public DateTime EventEndDate { get; set; }

        public string EventYear { get; set; }
    }
}