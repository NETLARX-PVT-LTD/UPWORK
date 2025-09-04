// ---------------------------------------------------------------------
// <copyright file="KeywordGroup.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    public class Keyword
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public string Value { get; set; }

        public Guid KeywordGroupId { get; set; }

        [ForeignKey(nameof(KeywordGroupId))]
        public KeywordGroupp KeywordGroup { get; set; }
    }
}
