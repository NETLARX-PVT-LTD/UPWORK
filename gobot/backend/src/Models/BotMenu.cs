// ---------------------------------------------------------------------
// <copyright file="BotMenu.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Models
{
    using System;
    using System.ComponentModel.DataAnnotations;

    public class BotMenu
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string BotId { get; set; }

        // Store menu as JSON string for flexibility
        public string MenuJson { get; set; }

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
