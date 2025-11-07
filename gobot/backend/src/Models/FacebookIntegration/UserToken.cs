// ---------------------------------------------------------------------
// <copyright file="UserToken.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Models.FacebookIntegration
{
    using System;
    using System.Collections.Generic;

    public class UserToken
    {
        public Guid Id { get; set; }
        public string LongLivedUserToken { get; set; }
        public ICollection<PageToken> PageTokens { get; set; }
    }

}
