// ---------------------------------------------------------------------
// <copyright file="DeserializationMiddleware.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Middlewares
{
    using Chatbot;
    using Microsoft.AspNetCore.Http;
    using Microsoft.Extensions.Logging;
    using System;
    using System.IO;
    using System.Threading.Tasks;

    public class DeserializationMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<DeserializationMiddleware> _logger;

        public DeserializationMiddleware(RequestDelegate next, ILogger<DeserializationMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task Invoke(HttpContext context)
        {
            // Only deserialize if content-type is protobuf
            if (context.Request.ContentType == "application/x-protobuf")
            {
                using var memoryStream = new MemoryStream();
                await context.Request.Body.CopyToAsync(memoryStream);
                memoryStream.Position = 0;

                try
                {
                    var deserialized = UserInputBlock.Parser.ParseFrom(memoryStream);

                    if (deserialized != null)
                    {
                        // Store deserialized object in HttpContext.Items
                        context.Items["ProtobufBody"] = deserialized;
                    }
                    else
                    {
                        _logger.LogWarning("Protobuf body is null");
                        context.Response.StatusCode = StatusCodes.Status400BadRequest;
                        await context.Response.WriteAsync("Invalid Protobuf data");
                        return; // Stop pipeline if invalid
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to deserialize Protobuf body");
                    context.Response.StatusCode = StatusCodes.Status400BadRequest;
                    await context.Response.WriteAsync("Invalid Protobuf data");
                    return; // Stop pipeline if invalid
                }

                // Reset stream so controller can read it if needed
                memoryStream.Position = 0;
                context.Request.Body = memoryStream;
            }

            await _next(context);
        }
    }
}
