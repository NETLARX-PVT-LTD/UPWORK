// ---------------------------------------------------------------------
// <copyright file="StorySessionManager.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Services
{
    using Netlarx.Products.Gobot.Models;
    using System.Collections.Concurrent;

    public class StorySessionManager
    {
        private ConcurrentDictionary<int, StorySessionData> _stories = new();

        public StorySessionData GetStory(int storyId)
        {
            return _stories.GetOrAdd(storyId, new StorySessionData());
        }

        public void ClearStory(int storyId)
        {
            _stories.TryRemove(storyId, out _);
        }
    }
}
