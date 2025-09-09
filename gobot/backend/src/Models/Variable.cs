// ---------------------------------------------------------------------
// <copyright file="UserInputPhrase.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Models
{
    using System;
    using System.ComponentModel.DataAnnotations;
    public class Variable
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public string Name { get; set; } // e.g., "Name"

        [Required]
        public string Type { get; set; } // e.g., "string"
    }
}
