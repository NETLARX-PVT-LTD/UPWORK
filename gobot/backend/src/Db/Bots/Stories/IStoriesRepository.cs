// ---------------------------------------------------------------------
// <copyright file="IStoriesRepository.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------


namespace Netlarx.Products.Gobot.Db.DbLayer.Bots.Stories
{
    using Netlarx.Products.Gobot.Errors;
    using Netlarx.Products.Gobot.Models;
    using System;
    using System.Collections.Generic;
    using System.Threading.Tasks;

    public interface IStoriesRepository
    {
        Task<(bool success,List<Stories>? stories)> GetStoriesAsync(Guid botId,Errors errors);
        Task<(bool success, Stories? story)> GetStoryAsync(Guid botId, int storyId, Errors errors);
        Task<bool> AddStoryAsync(Stories story,Errors errors);
        Task<bool> UpdateStoryAsync(Stories story, Errors errors);
        Task<bool> DeleteStoryAsync(Stories story, Errors errors);
    }
}