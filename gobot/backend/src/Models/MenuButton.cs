using SendGrid.Helpers.Mail;
using System.Collections.Generic;

namespace Netlarx.Products.Gobot.Models
{
    public class MenuButton
    {
        public string Id { get; set; }
        public string Label { get; set; }
        public string Type { get; set; } // action | submenu | weblink
        public string ParentId { get; set; }
        public bool IsActive { get; set; }
        public int Order { get; set; }

        // Action type specific fields
        public string Message { get; set; }
        public string Story { get; set; }
        public string Template { get; set; }
        public string Plugin { get; set; }

        // Weblink specific
        public string Url { get; set; }

        // Submenu specific
        public List<MenuButton> Children { get; set; } = new();

        // Metadata
        public Metadata Metadata { get; set; }
    }
    public class Metadata
    {
        public string Color { get; set; }
        public string Icon { get; set; }
        public string Description { get; set; }
        public string CreatedAt { get; set; }
        public string UpdatedAt { get; set; }
        public List<string> Tags { get; set; }
        public Analytics Analytics { get; set; }
    }
    public class Analytics
    {
        public int ClickCount { get; set; }
        public string LastClicked { get; set; }
    }
}
