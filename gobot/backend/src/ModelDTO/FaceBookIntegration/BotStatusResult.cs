// ---------------------------------------------------------------------
// <copyright file="GetBotStatusResult.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ------------------------------------------------------------------

namespace Netlarx.Products.Gobot.ModelDTO.FacebookIntegration
{
    using Netlarx.Products.Gobot.Errors;
    using Netlarx.Products.Gobot.Result;

    public class BotStatusResult : Result
    {

        public BotStatusResult(bool success, string statusCode, BotStatusDto? data = null, Errors? error = null)
            : base(success, error, statusCode)
        {
            Data = data;
        }

        public BotStatusDto? Data { get; set; } 
    }
}
