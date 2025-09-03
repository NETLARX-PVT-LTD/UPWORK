// ---------------------------------------------------------------------
// <copyright file="TextResponse.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;

    public class TextResponse : BaseComponent
    {
        [Required]
        public int StoryId { get; set; }

        public string Type { get; set; }

        public string Content { get; set; }

        public List<string> AlternateResponses { get; set; }

        // Navigation property (One-to-Many relation)
        //public ICollection<QuickReply> QuickReplies { get; set; } = new List<QuickReply>();
    }
}
