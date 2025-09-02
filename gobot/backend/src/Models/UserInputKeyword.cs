// ---------------------------------------------------------------------
// <copyright file="UserInputKeyword.cs" 
// company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. 
// All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    public class UserInputKeyword : BaseComponent
    {
        [Required]
        public int StoryId { get; set; }

        public List<string> Keywords { get; set; } = new List<string>();

        public List<KeywordGroup>? KeywordGroup { get; set; }

        public List<Variable> Variables { get; set; }

    }
}
