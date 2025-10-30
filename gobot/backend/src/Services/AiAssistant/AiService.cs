// ---------------------------------------------------------------------
// <copyright file="AiService.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Service.AiAssistant
{
    using Gobot.Errors;
    using Microsoft.Extensions.Configuration;
    using Microsoft.Extensions.Logging;
    using Netlarx.Products.Gobot.Interface.Ai;
    using Netlarx.Products.Gobot.ModelDTO.AiAssistant;
    using System;
    using System.Net.Http;
    using System.Net.Http.Headers;
    using System.Text;
    using System.Text.Json;
    using System.Threading.Tasks;

    public class AiService : IAiService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AiService> _logger;

        public AiService(HttpClient httpClient, IConfiguration configuration, ILogger<AiService> logger)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<AiGenerateReponseResult> GenerateTextAsync(GenerateRequest request, Errors errors)
        {
            if (string.IsNullOrWhiteSpace(request.Prompt))
            {
                errors.Fill(FailureCode.ValidationError, "Prompt cannot be empty.");
                return new AiGenerateReponseResult(false, "400", string.Empty, errors);
            }

            try
            {
                var apiKey = _configuration["OpenAI:ApiKey"];
                if (string.IsNullOrEmpty(apiKey))
                {
                    errors.Fill(FailureCode.ConfigurationError, "AI API key is not configured.");
                    return new AiGenerateReponseResult(false, "500", string.Empty, errors);
                }

                var requestBody = new
                {
                    model = "gpt-4o-mini",
                    messages = new[] { new { role = "user", content = request.Prompt } },
                    max_tokens = 300
                };

                var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
                _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

                var response = await _httpClient.PostAsync("https://api.openai.com/v1/chat/completions", content);

                if (!response.IsSuccessStatusCode)
                {
                    var errorMessage = await response.Content.ReadAsStringAsync();
                    _logger.LogError("OpenAI API call failed: {Error}", errorMessage);
                    errors.Fill(FailureCode.ExternalApiError, errorMessage);
                    return new AiGenerateReponseResult(false, ((int)response.StatusCode).ToString(), string.Empty, errors);
                }

                var responseString = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(responseString);

                string generatedText = doc
                    .RootElement
                    .GetProperty("choices")[0]
                    .GetProperty("message")
                    .GetProperty("content")
                    .GetString() ?? string.Empty;

                return new AiGenerateReponseResult(true, "200", generatedText);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating AI text");
                errors.Fill(FailureCode.UnknownError, ex.Message);
                return new AiGenerateReponseResult(false, "500", string.Empty, errors);
            }
        }
    }
}