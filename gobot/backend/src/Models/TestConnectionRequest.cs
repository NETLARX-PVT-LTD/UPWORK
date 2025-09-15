// ---------------------------------------------------------------------
// <copyright file="TestConnectionRequest.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Models
{
    public class TestConnectionRequest
    {
        public string BotId { get; set; }
        public string ApiType { get; set; }   // e.g. "meta-cloud"
        public string AccessToken { get; set; }
        public string PhoneNumberId { get; set; }
        public string BusinessAccountId { get; set; }
    }

    public class TestConnectionResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public object Details { get; set; }
    }
}
