// ---------------------------------------------------------------------
// <copyright file="ConversationalForm.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Models
{
    using System;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;

    public class WebsiteData
    {
        [Key]
        public int Id { get; set; }
        public string WebsiteType { get; set; }

        [Required]
        public Guid AssistantId { get; set; }

        [Required]
        public string Url { get; set; } = null!;

        public bool AutoSync { get; set; } = true;

        // Crawl settings
        public int? MaxPages { get; set; } = 50;
        public int? MaxDepth { get; set; } = 3;
        public bool? IncludeSubdomains { get; set; } = false;

        // Advanced options
        public string? ExcludePatterns { get; set; } = string.Empty;
        public string? CssSelector { get; set; } = string.Empty;
        public bool? RespectRobots { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

}
