// ---------------------------------------------------------------------
// <copyright file="TypingDelay.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Models
{
    using System.ComponentModel.DataAnnotations;

    public class TypingDelay : BaseComponent
    {
        [Required]
        //[ForeignKey("StoryId")]
        //public Stories? Story { get; set; }
        public int StoryId { get; set; }

        public double DelaySeconds { get; set; }

        // Navigation property (important for EF relationships)
    }
}
