// ---------------------------------------------------------------------
// <copyright file="EmailBotDetailRequest.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ------------------------------------------------------------------

namespace Netlarx.Products.Gobot.ModelDTO.Email
{
    public class EmailBotDetailRequest
    {
        public string To { get; set; }
        public string Subject { get; set; }
        public string Message { get; set; }
        public string BotId { get; set; }
        public string ApiKey { get; set; }
        public string LandingUrl { get; set; }
        public string EmbedCode { get; set; }
    }
}