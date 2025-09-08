// ---------------------------------------------------------------------
// <copyright file="Stories.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Models
{
    using System;
    using System.ComponentModel.DataAnnotations;

    public class Stories
    {
        public int ID { get; set; }

        // Foreign Key
        public int BotId { get; set; }

        [Required]
        public string? Name { get; set; }

        public Guid? RootBlockConnectionId { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    }
}
