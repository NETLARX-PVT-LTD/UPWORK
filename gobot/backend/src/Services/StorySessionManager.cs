using BotsifySchemaTest.Models;
using System.Collections.Concurrent;

namespace BotsifySchemaTest.Services
{
    public class StorySessionData
    {
        public List<UserInputPhrase> Phrases { get; set; } = new();
        public List<UserInputKeyword> Keywords { get; set; } = new();
        public List<UserInputTypeAnything> Anythings { get; set; } = new();
        public List<Connection> Connections { get; set; } = new();
        public Stories Story { get; set; } = new();
    }

    public static class StorySessionManager
    {
        private static ConcurrentDictionary<int, StorySessionData> _stories = new();

        public static StorySessionData GetStory(int storyId)
        {
            return _stories.GetOrAdd(storyId, new StorySessionData());
        }

        public static void ClearStory(int storyId)
        {
            _stories.TryRemove(storyId, out _);
        }
    }
}
