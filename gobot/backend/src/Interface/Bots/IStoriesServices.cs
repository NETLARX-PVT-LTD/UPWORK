// ---------------------------------------------------------------------
// <copyright file="IAssistantService.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Interface.Bots
{
    using Netlarx.Products.Gobot.Errors;
    using Netlarx.Products.Gobot.ModelDTO.Bots;
    using System;
    using System.Threading.Tasks;

    public interface IStoriesService
    {
        Task<StoriesDetail> GetStoriesAsync(Guid botId, Errors errors);
        Task<StoriesDetail> GetStoryAsync(Guid botId, int storyId, Errors errors);
        Task<StoriesResult> AddStoryAsync(Guid botId, StoriesRequest storyDto, Errors errors);
        Task<StoriesResult> UpdateStoryAsync(Guid botId, int storyId, StoriesRequest storyDto, Errors errors);
        Task<StoriesResult> DeleteStoryAsync(Guid botId, int storyId, Errors errors);
    }
}