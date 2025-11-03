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

    public class StoriesDetail : Result
    {
        public StoriesDetail(bool success, string statusCode, List<StoryBlockdto>? stories, Errors? error = null)
            : base(success, error, statusCode)
        {
            Stories = stories;
        }

        public List<StoryBlockdto>? Stories { get; set; }
    }
}