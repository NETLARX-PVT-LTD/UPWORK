// ---------------------------------------------------------------------
// <copyright file="School.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Hubs
{
    using Microsoft.AspNetCore.SignalR;
    using System.Threading.Tasks;

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
