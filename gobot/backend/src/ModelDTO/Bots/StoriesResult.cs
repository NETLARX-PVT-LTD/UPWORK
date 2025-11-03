// ---------------------------------------------------------------------
// <copyright file="StoriesResult.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.ModelDTO.Bots
{
    using Netlarx.Products.Gobot.Errors;
    using Netlarx.Products.Gobot.Result;
    using System;

    public class StoriesResult : Result
    {
        public StoriesResult(bool success, string statusCode, int? storyId, Errors? error = null)
            : base(success, error, statusCode)
        {
            StoryId = storyId;
        }

        public int? StoryId { get; set; }
    }
}