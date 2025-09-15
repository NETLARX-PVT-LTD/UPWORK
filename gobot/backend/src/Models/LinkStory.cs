// ---------------------------------------------------------------------
// <copyright file="LinkStory.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------


namespace Netlarx.Products.Gobot.Models
{

    using System.ComponentModel.DataAnnotations;

    public class LinkStory : BaseComponent
    {
        public string BotId { get; set; }
        [Required]
        public int StoryId { get; set; }
        public string Type { get; set; } // "linkStory"
        public int LinkStoryId { get; set; }
        public string LinkStoryName { get; set; }
    }
}
