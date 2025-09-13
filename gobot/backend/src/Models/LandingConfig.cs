// ---------------------------------------------------------------------
// <copyright file="Bot.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Models
{
    using System;
    using System.ComponentModel.DataAnnotations;

    public class LandingConfig
    {
        [Key]
        public Guid Id { get; set; }

        public string Title { get; set; }
        public string Description { get; set; }
        public string BackgroundStyle { get; set; }
    }
}
