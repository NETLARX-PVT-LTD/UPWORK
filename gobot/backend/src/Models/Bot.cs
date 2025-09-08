// ---------------------------------------------------------------------
// <copyright file="BaseComponent.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Models
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.Runtime.CompilerServices;

    public class Bot
    {
        public int BotId { get; set; }

        [Required]
        public string BotName { get; set; }
    }
}
