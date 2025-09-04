// ---------------------------------------------------------------------
// <copyright file="Variable.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Models
{
    using System;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;

    public class VariableAnything
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
        [Required]
        public string Name { get; set; } // e.g., "Name"
        [Required]
        public string Type { get; set; } // e.g., "string"
        public Guid UserInputTypeAnythingId { get; set; }

        [ForeignKey(nameof(UserInputTypeAnythingId))]
        public virtual UserInputTypeAnything? UserInputTypeAnything { get; set; }
    }
}
