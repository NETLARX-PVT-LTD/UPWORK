// ---------------------------------------------------------------------
// <copyright file="QuickReply.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Models
{
    using System;
    using System.ComponentModel.DataAnnotations;

    public class QuickReplyModel : BaseComponent
    {

        [Required]
        public string Text { get; set; }

        //// Foreign Key
        //public Guid TextResponseId { get; set; }

        //// Navigation property
        //public TextResponse TextResponse { get; set; }
    }
}
