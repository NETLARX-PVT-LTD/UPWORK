// ---------------------------------------------------------------------
// <copyright file="DeserializationMiddleware.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Middlewares
{
    using Chatbot;
    using Google.Protobuf;
    using Microsoft.AspNetCore.Http;
    using Microsoft.Extensions.Logging;
    using Netlarx.Products.Gobot.Services;
    using System;
    using System.Collections.Generic;
    using System.IO;
    using System.Reflection;
    using System.Threading.Tasks;

    public class DeserializationMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<DeserializationMiddleware> _logger;

        // Registry of endpoint paths → Proto types
        private static readonly Dictionary<string, Type> ProtoMap = new()
        {
            { "/api/components/AddUserInputKeyword", typeof(UserInputBlock) },
            { "/api/story/SaveStorytoDbBlock", typeof(StorySessionDataBlock) },
            { "/api/bots/{botId}/stories", typeof(StoryBlock) },
            { "/api/story/SaveStoryToDb", typeof(StorySessionData) },
            { "/api/components/AddUserInputPhrase", typeof(UserInputBlock) },
            { "/api/components/AddUserInputTypeAnything", typeof(UserInputBlock) },
            { "/api/components/AddTypingDelay", typeof(TypingDelayBlock) },
            { "/api/components/AddLinkStory", typeof(LinkStoryBlock) },
            { "/api/components/AddJsonApi", typeof(JsonApiBlock) },
            { "/api/components/AddConversationalForm", typeof(ConversationalFormBlock) },
            { "/api/components/AddTextResponse", typeof(TextResponseBlock) },
            { "/api/components/AddMedia", typeof(MediaBlock) },
            { "/api/bots/{botId}/linkstories", typeof(LinkStoryBlock) }
            // add more mappings here
        };

        public DeserializationMiddleware(RequestDelegate next, ILogger<DeserializationMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task Invoke(HttpContext context)
        {
            if (context.Request.ContentType == "application/x-protobuf")
            {
                var path = context.Request.Path.Value;

                if (!ProtoMap.TryGetValue(path, out var targetType))
                {
                    _logger.LogWarning("No registered protobuf type for path: {Path}", path);
                    context.Response.StatusCode = StatusCodes.Status400BadRequest;
                    await context.Response.WriteAsync("Unsupported protobuf endpoint");
                    return;
                }

                using var memoryStream = new MemoryStream();
                await context.Request.Body.CopyToAsync(memoryStream);
                memoryStream.Position = 0;

                try
                {
                    // Find static Parser property for the type
                    var parserProp = targetType.GetProperty("Parser", BindingFlags.Public | BindingFlags.Static);
                    if (parserProp?.GetValue(null) is not MessageParser parser)
                    {
                        _logger.LogWarning("Parser not found for type {Type}", targetType.Name);
                        context.Response.StatusCode = StatusCodes.Status400BadRequest;
                        await context.Response.WriteAsync("Invalid protobuf type (no parser)");
                        return;
                    }

                    // Deserialize into correct message type
                    var deserialized = parser.ParseFrom(memoryStream);

                    if (deserialized != null)
                    {
                        context.Items["ProtobufBody"] = deserialized;
                    }
                    else
                    {
                        _logger.LogWarning("Protobuf body is null for {Type}", targetType.Name);
                        context.Response.StatusCode = StatusCodes.Status400BadRequest;
                        await context.Response.WriteAsync("Invalid Protobuf data");
                        return;
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to deserialize Protobuf body for path {Path}", path);
                    context.Response.StatusCode = StatusCodes.Status400BadRequest;
                    await context.Response.WriteAsync("Invalid Protobuf data");
                    return;
                }

                memoryStream.Position = 0;
                context.Request.Body = memoryStream;
            }

            await _next(context);
        }
    }
}