// ---------------------------------------------------------------------
// <copyright file="StoriesService.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Services.Bots
{
    using Gobot.Db.DbLayer.Bots.Stories;
    using Microsoft.Extensions.Logging;
    using Netlarx.Products.Gobot.Db.Bots.Bot;
    using Netlarx.Products.Gobot.Errors;
    using Netlarx.Products.Gobot.Interface.Bots;
    using Netlarx.Products.Gobot.ModelDTO.Bots;
    using Netlarx.Products.Gobot.Models;
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;

    public class StoriesService : IStoriesService
    {
        private readonly IStoriesRepository _storiesRepository;
        private readonly IBotRepository _botRepository;

        private readonly ILogger<StoriesService> _logger;

        public StoriesService(IStoriesRepository storiesRepository, IBotRepository botRepository, ILogger<StoriesService> logger)
        {
            _storiesRepository = storiesRepository;
            _botRepository = botRepository;
            _logger = logger;
        }

        public async Task<StoriesDetail> GetStoriesAsync(Guid botId, Errors errors)
        {
            if (botId == Guid.Empty)
            {
                errors.Fill(FailureCode.ValidationError, "Invalid BotId.");
                return new StoriesDetail(false, "400", null, errors);
            }

            var (checkBot, bot) = await _botRepository.GetBotById(botId, errors);
            if (!checkBot || bot == null)
            {
                return new StoriesDetail(false, "500", null, errors);
            }

            var (success, stories) = await _storiesRepository.GetStoriesAsync(botId, errors);
            if (!success || stories == null)
            {
                return new StoriesDetail(false, "500", null, errors);
            }

            var dtoList = stories.Select(s => new StoryBlockdto
            {
                StoryId = s.ID,
                Name = s.Name,
                RootBlockConnectionId = s.RootBlockConnectionId.ToString(),
                BotId = s.BotId.ToString(),
                CreatedDate = s.CreatedDate,
            }).ToList();

            return new StoriesDetail(true, "200", dtoList);
        }

        public async Task<StoriesDetail> GetStoryAsync(Guid botId, int storyId, Errors errors)
        {
            if (botId == Guid.Empty || storyId < 0)
            {
                errors.Fill(FailureCode.ValidationError, "Invalid BotId or StoryId provided.");
                return new StoriesDetail(false, "400", null, errors);
            }

            var (success, story) = await _storiesRepository.GetStoryAsync(botId, storyId, errors);
            if (!success || story == null)
            {
                return new StoriesDetail(false, "404", null, errors);
            }

            var dto = new StoryBlockdto
            {
                StoryId = story.ID,
                Name = story.Name,
                RootBlockConnectionId = story.RootBlockConnectionId.ToString(),
                BotId = story.BotId.ToString(),
                CreatedDate = story.CreatedDate,
            };

            return new StoriesDetail(true, "200", new List<StoryBlockdto> { dto });
        }

        public async Task<StoriesResult> AddStoryAsync(Guid botId, StoriesRequest storyDto, Errors errors)
        {
            if (botId == Guid.Empty)
            {
                errors.Fill(FailureCode.ValidationError, "Invalid BotId provided.");
                return new StoriesResult(false, "400", null, errors);
            }

            if (storyDto == null || string.IsNullOrWhiteSpace(storyDto.Name))
            {
                errors.Fill(FailureCode.ValidationError, "Story name is required.");
                return new StoriesResult(false, "400", null, errors);
            }

            try
            {
                var story = new Stories
                {
                    Name = storyDto.Name.Trim(),
                    RootBlockConnectionId = Guid.TryParse(storyDto.RootBlockConnectionId, out var rootId)
                        ? rootId : Guid.NewGuid(),
                    CreatedDate = DateTime.UtcNow,
                    BotId = botId
                };

                var success = await _storiesRepository.AddStoryAsync(story, errors);
                if (!success)
                {
                    return new StoriesResult(false, "500", null, errors);
                }

                _logger.LogInformation("Story '{StoryName}' added successfully for BotId {BotId}", story.Name, botId);
                return new StoriesResult(true, "200", story.ID);
            }
            catch (Exception ex)
            {
                errors.Fill(FailureCode.UnknownError, $"Unexpected error while adding story: {ex.Message}");
                _logger.LogError(ex, "AddStoryAsync failed for BotId {BotId}", botId);
                return new StoriesResult(false, "500", null, errors);
            }
        }

        public async Task<StoriesResult> UpdateStoryAsync(Guid botId, int storyId, StoriesRequest storyDto, Errors errors)
        {
            if (botId == Guid.Empty || storyId < 0)
            {
                errors.Fill(FailureCode.ValidationError, "Invalid BotId or StoryId provided.");
                return new StoriesResult(false, "400", null, errors);
            }

            var (found, story) = await _storiesRepository.GetStoryAsync(botId, storyId, errors);
            if (!found || story == null)
            {
                return new StoriesResult(false, "404", null, errors);
            }

            try
            {
                if (!string.IsNullOrWhiteSpace(storyDto.Name))
                {
                    story.Name = storyDto.Name.Trim();
                }

                if (Guid.TryParse(storyDto.RootBlockConnectionId, out var rootId) && rootId != Guid.Empty)
                {
                    story.RootBlockConnectionId = rootId;
                }

                story.CreatedDate = DateTime.UtcNow;

                var success = await _storiesRepository.UpdateStoryAsync(story, errors);
                if (!success)
                {
                    return new StoriesResult(false, "500", null, errors);
                }

                _logger.LogInformation("Story {StoryId} updated successfully for BotId {BotId}", storyId, botId);
                return new StoriesResult(true, "200", story.ID);
            }
            catch (Exception ex)
            {
                errors.Fill(FailureCode.UnknownError, $"Unexpected error while updating story: {ex.Message}");
                _logger.LogError(ex, "UpdateStoryAsync failed for BotId {BotId}, StoryId {StoryId}", botId, storyId);
                return new StoriesResult(false, "500", null, errors);
            }
        }

        public async Task<StoriesResult> DeleteStoryAsync(Guid botId, int storyId, Errors errors)
        {
            if (botId == Guid.Empty || storyId < 0)
            {
                errors.Fill(FailureCode.ValidationError, "Invalid BotId or StoryId provided.");
                return new StoriesResult(false, "400", null, errors);
            }

            var (found, story) = await _storiesRepository.GetStoryAsync(botId, storyId, errors);
            if (!found || story == null)
            {
                return new StoriesResult(false, "404", null, errors);
            }

            try
            {
                var success = await _storiesRepository.DeleteStoryAsync(story, errors);
                if (!success)
                {
                    return new StoriesResult(false, "500", null, errors);
                }

                _logger.LogInformation("Story {StoryId} deleted successfully for BotId {BotId}", storyId, botId);
                return new StoriesResult(true, "200", story.ID);
            }
            catch (Exception ex)
            {
                errors.Fill(FailureCode.UnknownError, $"Unexpected error while deleting story: {ex.Message}");
                _logger.LogError(ex, "DeleteStoryAsync failed for BotId {BotId}, StoryId {StoryId}", botId, storyId);
                return new StoriesResult(false, "500", null, errors);
            }
        }
    }
}