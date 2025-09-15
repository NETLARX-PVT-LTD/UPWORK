// ---------------------------------------------------------------------
// <copyright file="ChatRequest.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Model
{
    using System.Collections.Generic;

    public class ChatRequest
    {
        public string Message { get; set; }      // User message
        public string BotId { get; set; }        // Chatbot ID
        public string SessionId { get; set; }    // Session ID
        public int storyId { get; set; }
    }

    public class ChatResponse
    {
        public string Response { get; set; }      // Chatbot reply
        public List<string>? Actions { get; set; } // Optional actions
    }
}
