// ---------------------------------------------------------------------
// <copyright file="VariablePhrase.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Models
{
    using System;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    public class VariablePhrase
        {
            [Key]
            public Guid Id { get; set; } = Guid.NewGuid();

            [Required]
            public string Name { get; set; } // e.g., "Email"

            [Required]
            public string Type { get; set; } // e.g., "string"

            public Guid UserInputPhraseId { get; set; }

            [ForeignKey(nameof(UserInputPhraseId))]
            public virtual UserInputPhrase? UserInputPhrase { get; set; }
        }
}
