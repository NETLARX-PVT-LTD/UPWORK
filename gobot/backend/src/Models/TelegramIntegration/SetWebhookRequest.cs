// ---------------------------------------------------------------------
// <copyright file="SetWebhookRequest.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Product.Gobot.Models.TelegramIntegration
{
    public class SetWebhookRequest
    {
        public string AccessToken { get; set; }
        public string Url { get; set; }
    }
}
