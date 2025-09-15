// ---------------------------------------------------------------------
// <copyright file="WebhookValidationRequest.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Models
{
    public class WebhookValidationRequest
    {
        public string WebhookUrl { get; set; }
        public string VerifyToken { get; set; }
    }
    public class WebhookValidationResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; }
    }
}
