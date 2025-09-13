// ---------------------------------------------------------------------
// <copyright file="EmailRequest.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Models
{
    public class EmailRequest
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
