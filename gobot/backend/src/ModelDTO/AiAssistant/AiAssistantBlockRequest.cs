// ---------------------------------------------------------------------
// <copyright file="AiGenerateReponseResult.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.ModelDTO.AiAssistant
{
    using Microsoft.AspNetCore.Http;
    using System.Collections.Generic;

    public class AiAssistantBlockRequest
    {
        public string? AssistantName { get; set; }
        public string? ApiKey { get; set; }
        public string? Platform { get; set; }                // OpenAPI, Gemini, OpenRouter
        public string? Instruction { get; set; }
        public string? Model { get; set; }                   // GPT, Gemini, GPT Pro
        public string? Source { get; set; }
        public string? FallbackTextMessage { get; set; }
        public int FallbackStory { get; set; }              // Story Id
        public int MaxToken { get; set; }                   // Max token limit
        public double Temperature { get; set; }             // Temperature (0–2)
        public double TopP { get; set; }                    // Top-P sampling        
        public List<IFormFile>? TrainingFiles { get; set; } = new();
    }
}
