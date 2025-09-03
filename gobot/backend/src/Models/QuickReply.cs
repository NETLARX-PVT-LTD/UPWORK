// ---------------------------------------------------------------------
// <copyright file="QuickReply.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Models
{
    using System;
    using System.ComponentModel.DataAnnotations;

    public class QuickReply
    {
        [Key]
        public Guid ID { get; set; }

        [Required]
        public string Title { get; set; }

        public string Value { get; set; }

        // Foreign Key
        public Guid TextResponseId { get; set; }

        //// Navigation property
        //public TextResponse TextResponse { get; set; }
    }
}
