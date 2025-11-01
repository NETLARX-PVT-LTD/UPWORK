// ---------------------------------------------------------------------
// <copyright file="StoriesResult.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.ModelDTO.Bots
{
    using Chatbot;
    using Netlarx.Products.Gobot.Errors;
    using Netlarx.Products.Gobot.Result;
    using System.Collections.Generic;

    public class StoriesResult : Result
    {
        public StoriesResult(bool success, string statusCode, List<StoryBlock>? stories, Errors? error = null)
            : base(success, error, statusCode)
        {
            Stories = stories;
        }

        public List<StoryBlock>? Stories { get; set; }
    }
}