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
    using System.ComponentModel.DataAnnotations.Schema;

    public class KeywordGroup
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        //[ForeignKey("ID")]
        //public Guid ID { get; set; }
        //public UserInputKeyword UserInputKeyword { get; set; }

        public Guid UserInputKeywordId { get; set; }

        public List<string> Keywords { get; set; } = new List<string>();
    }
}
