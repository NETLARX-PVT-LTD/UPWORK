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

        public virtual ICollection<KeywordGroupp>? KeywordGroups { get; set; } = new List<KeywordGroupp>();

        public virtual ICollection<PlainKeyword>? PlainKeywords { get; set; } = new List<PlainKeyword>();

        public virtual ICollection<VariableKeyword>? Variables { get; set; } = new List<VariableKeyword>();
    }
}
