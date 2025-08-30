// ---------------------------------------------------------------------
// <copyright file="School.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

using System.ComponentModel.DataAnnotations;

namespace Netlarx.Products.Gobot.Models
{
    public class LinkStory : BaseComponent
    {
        [Required]
        public int StoryId { get; set; }
        public string Type { get; set; } // "linkStory"
        public string LinkStoryId { get; set; }
        public string LinkStoryName { get; set; }
    }
}
