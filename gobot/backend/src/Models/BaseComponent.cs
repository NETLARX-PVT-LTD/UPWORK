// ---------------------------------------------------------------------
// <copyright file="School.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

using System;
using System.ComponentModel.DataAnnotations;

namespace Netlarx.Products.Gobot.Models
{
    public abstract class BaseComponent
    {
        [Key]
        public Guid ID { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public string? ToComponentType { get; set; } 
        public Guid? ToComponentId { get; set; }
    }


}
