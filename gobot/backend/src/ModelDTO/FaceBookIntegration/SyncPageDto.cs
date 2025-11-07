// ---------------------------------------------------------------------
// <copyright file="SyncPageDto.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ------------------------------------------------------------------

namespace Netlarx.Products.Gobot.ModelDTO.FacebookIntegration
{
    using System.Collections.Generic;
    public class SyncPageDto
    {
        public string? LongLivedUserToken { get; set; }
        public List<FacebookPageDto> Pages { get; set; } = new();
    }

    public class FacebookPageDto
    {
        public string? PageId { get; set; }
        public string? Name { get; set; }
        public string? Category { get; set; }
        public string? AccessToken { get; set; }
    }
}
