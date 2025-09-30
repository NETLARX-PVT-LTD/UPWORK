namespace Netlarx.Products.Gobot.Models.FacebookIntegration
{
    using System;
    using System.Collections.Generic;

    // Request model
    public class TokenRequest
    {
        public string ShortLivedAccessToken { get; set; }
    }

    // EF Core models
    public class UserToken
    {
        public Guid Id { get; set; }
        public string LongLivedUserToken { get; set; }
        public ICollection<PageToken> PageTokens { get; set; }
    }

    public class PageToken
    {
        public Guid Id { get; set; }
        public string PageId { get; set; }
        public string Name { get; set; }
        public string Category { get; set; }
        public string PageAccessToken { get; set; }
        public Guid UserTokenId { get; set; }
        public UserToken UserToken { get; set; }
    }

    public class ConnectBotRequest
    {
        public string PageId { get; set; }
        public string BotName { get; set; }
    }

    public class BotConnection
    {
        public Guid Id { get; set; }
        public string PageId { get; set; }
        public string BotName { get; set; }
        public string WebhookStatus { get; set; } // e.g., "connected"
    }

    public class DisconnectBotRequest
    {
        public string PageId { get; set; }
    }
}
