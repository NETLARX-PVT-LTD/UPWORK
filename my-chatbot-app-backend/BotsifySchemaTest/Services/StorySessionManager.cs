using BotsifySchemaTest.Models;

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
        private static Dictionary<int, StorySessionData> _stories = new();

        public static StorySessionData GetStory(int storyId)
        {
            if (!_stories.ContainsKey(storyId))
                _stories[storyId] = new StorySessionData();
            return _stories[storyId];
        }

        public static void ClearStory(int storyId)
        {
            if (!_stories.ContainsKey(storyId))
                _stories.Remove(storyId);
            
        }

    }
}
