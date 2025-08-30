// ---------------------------------------------------------------------
// <copyright file="UserInputKeyword.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

using System.ComponentModel.DataAnnotations;

namespace Netlarx.Products.Gobot.Models
{
    public class UserInputKeyword : BaseComponent
    {
        [Required]
        public int StoryId { get; set; }

        public string? json { get; set; }

        
    }
}
