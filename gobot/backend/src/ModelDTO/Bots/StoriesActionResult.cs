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

    public class StoriesActionResult : Result
    {
        public StoriesActionResult(bool success, string statusCode, Guid? storyId, Errors? error = null)
            : base(success, error, statusCode)
        {
            StoryId = storyId;
        }

        public Guid? StoryId { get; set; }
    }
}