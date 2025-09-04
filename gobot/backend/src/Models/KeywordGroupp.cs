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

    public class KeywordGroupp
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        // FK to UserInputKeyword
        public Guid UserInputKeywordId { get; set; }

        [ForeignKey(nameof(UserInputKeywordId))]
        public virtual UserInputKeyword? UserInputKeyword { get; set; }

        public virtual ICollection<Keyword> Keywords { get; set; } = new List<Keyword>();
    }
}
