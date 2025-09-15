// ---------------------------------------------------------------------
// <copyright file="Theme.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Models
{
    using System.ComponentModel.DataAnnotations;
    public class Theme
    {
        [Key]
        public int Id { get; set; }

        public string PrimaryColor { get; set; }
    }
}
