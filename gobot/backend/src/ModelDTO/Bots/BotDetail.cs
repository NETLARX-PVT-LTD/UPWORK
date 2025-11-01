// ---------------------------------------------------------------------
// <copyright file="BotActionResult.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.ModelDTO.Bots
{
    using Netlarx.Products.Gobot.Errors;
    using Netlarx.Products.Gobot.Result;

    public class BotDetail : Result
    {
        public BotDetail(bool success, string statusCode, BotBlockDto? bot, Errors? error = null)
            : base(success, error, statusCode)
        {
            Bot = bot;
        }

        public BotBlockDto? Bot { get; set; }
    }
}