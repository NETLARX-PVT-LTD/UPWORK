// ---------------------------------------------------------------------
// <copyright file="Variable.cs" company="Netlarx">
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
        public Guid UserInputKeywordId { get; set; }

        public string name { get; set; }
        public string type { get; set; }
    }
}
