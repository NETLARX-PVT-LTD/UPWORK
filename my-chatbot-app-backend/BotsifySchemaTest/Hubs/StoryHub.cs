using Microsoft.AspNetCore.SignalR;

namespace BotsifySchemaTest.Hubs
{
    public class StoryHub : Hub
    {
        public async Task JoinStory(int storyId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"story-{storyId}");
        }

        public async Task SendStoryUpdate(int storyId, object sessionData)
        {
            await Clients.Group($"story-{storyId}")
                         .SendAsync("StoryUpdated", sessionData);
        }
    }
}
