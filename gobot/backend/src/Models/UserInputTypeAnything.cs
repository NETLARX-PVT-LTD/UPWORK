// ---------------------------------------------------------------------
// <copyright file="UserInputTypeAnything.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Models
{
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;

    public class UserInputTypeAnything : BaseComponent
    {
        [Required]
        public int StoryId { get; set; }
        public string? Anything { get; set; }
        public virtual ICollection<VariableAnything>? Variables { get; set; } = new List<VariableAnything>();
    }
}
