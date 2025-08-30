// ---------------------------------------------------------------------
// <copyright file="QuickReply.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Models
{
    using System.ComponentModel.DataAnnotations;

    public class QuickReply : BaseComponent
    {
        [Key]
        public int TestReponseId { get; set; }

        public string Title { get; set; }

        public string Value { get; set; }
    }
}
