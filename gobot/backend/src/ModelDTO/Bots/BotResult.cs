// ---------------------------------------------------------------------
// <copyright file="BotActionResult.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.ModelDTO.Bots
{
    using Chatbot;
    using Netlarx.Products.Gobot.Errors;
    using Netlarx.Products.Gobot.Result;

    public class BotResult : Result
    {
        public BotResult(bool success, string statusCode, BotBlock? bot, Errors? error = null)
            : base(success, error, statusCode)
        {
            Bot = bot;
        }
        public BotBlock? Bot { get; set; }
    }
}