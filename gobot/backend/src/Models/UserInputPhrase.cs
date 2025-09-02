// ---------------------------------------------------------------------
// <copyright file="UserInputPhrase.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    public class UserInputPhrase : BaseComponent
    {
        [Required]
        public int StoryId { get; set; }

        public string? Phrase { get; set; }

        public List<Variable> Variables { get; set; }
    }
}
