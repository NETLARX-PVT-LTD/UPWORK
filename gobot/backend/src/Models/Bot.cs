// ---------------------------------------------------------------------
// <copyright file="Bot.cs" company="Netlarx">
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
        [Key]
        public string BotId { get; set; }

        [Required]
        public string BotName { get; set; }

        [Required]
        public string ApiKey { get; set; } // generated API key

        public string Story { get; set; }

        // JSON navigation properties
        public Theme Theme { get; set; }
        public string Position { get; set; }
        public string Size { get; set; }
        public string Greeting { get; set; }
        public string Placeholder { get; set; }
        public bool AllowFullscreen { get; set; }
        public bool ShowBranding { get; set; }
        public string BackgroundStyle { get; set; }

        public LandingConfig LandingConfig { get; set; }
    }
}
