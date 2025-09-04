// ---------------------------------------------------------------------
// <copyright file="StorySessionManager.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Services
{
    using Netlarx.Products.Gobot.Models;
    using System.Collections.Concurrent;
    using System.Collections.Generic;

    public class StorySessionData
    {
        public List<UserInputPhrase> Phrases { get; set; } = new();

        public List<UserInputKeyword> Keywords { get; set; } = new();

        public List<UserInputTypeAnything> Anythings { get; set; } = new();

        public List<Connection> Connections { get; set; } = new();

        public List<ConversationalForm> ConversationalForms { get; set; } = new();

        public List<TypingDelay> TypingDelays { get; set; } = new();

        public List<LinkStory> LinkStories { get; set; } = new();

        public List<TextResponse> TextResponses { get; set; } = new();

        public List<JsonAPI> JsonAPIs { get; set; } = new();

        public Stories Story { get; set; } = new();
    }
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
