// ---------------------------------------------------------------------
// <copyright file="Theme.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Models
{
    using System.ComponentModel.DataAnnotations;
    using System;
    public class Theme
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        public string PrimaryColor { get; set; }
    }
}
