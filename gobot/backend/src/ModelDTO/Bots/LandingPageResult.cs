// ---------------------------------------------------------------------
// <copyright file="LandingPageResult.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.ModelDTO.Bots
{
    using Netlarx.Products.Gobot.Errors;
    using Netlarx.Products.Gobot.Result;
    using System;

    public class LandingPageResult : Result
    {
        public LandingPageResult(bool success, string statusCode, LandingPageDto? landingBlock, Errors? error = null)
            : base(success, error, statusCode)
        {
            LandingBlock = landingBlock;
        }

        public LandingPageDto? LandingBlock { get; set; }

    }
    public class LandingPageDto
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? BackgroundStyle { get; set; }
        public BotConfigDto BotConfig { get; set; } = null!;
    }

    public class BotConfigDto
    {
        public Guid Id { get; set; }

        // public int StoryId { get; set; } 
        public string? PrimaryColor { get; set; }
        public string? Name { get; set; }
        public string? Greeting { get; set; }
    }
}