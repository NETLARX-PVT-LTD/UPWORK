// ---------------------------------------------------------------------
// <copyright file="AssistantWebSiteResult.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.ModelDTO.AIAssistant
{
    using Gobot.Errors;
    using Gobot.Result;
    using System;
    public class AssistantWebSiteResult : Result
    {
        public AssistantWebSiteResult(bool success, string statusCode, int websiteId, Errors? error = null)
            : base(success, error, statusCode)
        {
            WebsiteId = websiteId;
        }

        public int WebsiteId { get; set; }
    }
}
