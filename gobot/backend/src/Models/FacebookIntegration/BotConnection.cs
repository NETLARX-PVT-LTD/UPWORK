// ---------------------------------------------------------------------
// <copyright file="BotConnection.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Models.FacebookIntegration
{
    using System;

    public class BotConnection
    {
        public Guid Id { get; set; }
        public string PageId { get; set; }
        public string BotName { get; set; }
        public string WebhookStatus { get; set; } // e.g., "connected"
    }
}
