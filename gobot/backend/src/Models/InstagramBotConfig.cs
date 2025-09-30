// ---------------------------------------------------------------------
// <copyright file="InstagramBotConfig.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Models
{
    public class InstagramBotConfig
    {
        public string name { get; set; }
        public string welcomeMessage { get; set; }

        public string fallbackMessage { get; set; }
        public bool isActive { get; set; }

    }

    public class InstagramPublishBotRequest
    {
        public string igAccountId { get; set; }
        public string pageAccessToken { get; set; }
        public InstagramBotConfig botConfig { get; set; }
    }

    public class InstagramPublishBotResponse
    {
        public bool success { get; set; }
        public string message { get; set; }
        public string botId { get; set; }
    }
}
