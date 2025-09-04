// ---------------------------------------------------------------------
// <copyright file="VariableKeyword.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Models
{
    using System;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    public class VariableKeyword
        {
            [Key]
            public Guid Id { get; set; } = Guid.NewGuid();

            [Required]
            public string Name { get; set; } // e.g., "Location"

            [Required]
            public string Type { get; set; } // e.g., "string"

            public Guid UserInputKeywordId { get; set; }

            [ForeignKey(nameof(UserInputKeywordId))]
            public virtual UserInputKeyword? UserInputKeyword { get; set; }
        }
}
