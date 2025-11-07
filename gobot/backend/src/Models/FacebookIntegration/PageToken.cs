// ---------------------------------------------------------------------
// <copyright file="PageToken.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Models.FacebookIntegration
{
    using System;

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
}
