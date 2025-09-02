// ---------------------------------------------------------------------
// <copyright file="Variable.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;

    public class KeywordGroup
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UserInputKeywordId { get; set; }

        public List<string> Keywords { get; set; } = new List<string>();
    }
}
