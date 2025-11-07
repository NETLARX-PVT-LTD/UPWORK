// ---------------------------------------------------------------------
// <copyright file="TelegramWebhookInfoResponse.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Models.TelegramIntegration
{
    // C# classes to map Telegram API response
    public class TelegramWebhookInfoResponse
    {
        public bool Ok { get; set; }
        public TelegramWebhookInfo Result { get; set; }
    }

    public class TelegramWebhookInfo
    {
        public string Url { get; set; }
        public bool HasCustomCertificate { get; set; }
        public int PendingUpdateCount { get; set; }
        public int? LastErrorDate { get; set; }  // Unix timestamp
        public string LastErrorMessage { get; set; }

        public string Status { get; set; }

        // Optional field to indicate errors
        public string? Message { get; set; }
    }

    public class WebhookActionResponse
    {
        public bool Ok { get; set; }
        public string Description { get; set; }
    }

    // Telegram response mapping class
    public class TelegramActionResponse
    {
        public bool Ok { get; set; }
        public string Description { get; set; }
    }
}
