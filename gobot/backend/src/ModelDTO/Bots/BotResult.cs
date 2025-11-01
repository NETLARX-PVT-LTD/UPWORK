// ---------------------------------------------------------------------
// <copyright file="BotActionResult.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.ModelDTO.Bots
{
    using Netlarx.Products.Gobot.Errors;
    using Netlarx.Products.Gobot.Result;
    using System;

    public class BotResult : Result
    {
        public BotResult(bool success, string statusCode, Guid? botId, Errors? error = null)
            : base(success, error, statusCode)
        {
            BotId = botId;
        }

        public Guid? BotId { get; set; }
    }
}