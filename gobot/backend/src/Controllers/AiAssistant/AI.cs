using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Netlarx.Products.Gobot.Controllers.AiAssistant
{
    [ApiController]
    [Route("api/ai")]
    public class AIController : ControllerBase
    {
        private readonly ILogger<AIController> _logger;
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;

        public AIController(ILogger<AIController> logger, HttpClient httpClient, IConfiguration configuration)
        {
            _logger = logger;
            _httpClient = httpClient;
            _configuration = configuration;
        }

        // Request model
        public class GenerateRequest
        {
            public string Prompt { get; set; } = string.Empty;
        }

        // Response model
        public class GenerateResponse
        {
            public bool Success { get; set; }
            public string GeneratedText { get; set; } = string.Empty;
            public string? Error { get; set; }
        }

        // POST /api/ai/generate-text
        [HttpPost("generate-text")]
        public async Task<IActionResult> GenerateText([FromBody] String Prompt)
        {
            if (string.IsNullOrEmpty(Prompt))
            {
                return BadRequest(new GenerateResponse
                {
                    Success = false,
                    Error = "Prompt cannot be empty."
                });
            }

            try
            {
                // ✅ Get API key from config (appsettings.json or env var)
                var apiKey = _configuration["OpenAI:ApiKey"];
                if (string.IsNullOrEmpty(apiKey))
                {
                    return StatusCode(500, new GenerateResponse
                    {
                        Success = false,
                        Error = "AI API key is not configured."
                    });
                }

                // 🔹 Build request for OpenAI Chat Completions API
                var requestBody = new
                {
                    model = "gpt-4o-mini", // lightweight + stable model
                    messages = new[]
                    {
                        new { role = "user", content =  Prompt }
                    },
                    max_tokens = 300
                };

                var json = JsonSerializer.Serialize(requestBody);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                _httpClient.DefaultRequestHeaders.Authorization =
                    new AuthenticationHeaderValue("Bearer", apiKey);

                var response = await _httpClient.PostAsync("https://api.openai.com/v1/chat/completions", content);

                if (!response.IsSuccessStatusCode)
                {
                    var error = await response.Content.ReadAsStringAsync();
                    _logger.LogError("OpenAI API call failed: {Error}", error);

                    return StatusCode((int)response.StatusCode, new GenerateResponse
                    {
                        Success = false,
                        Error = error
                    });
                }

                var responseString = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(responseString);

                string generatedText = doc
                    .RootElement
                    .GetProperty("choices")[0]
                    .GetProperty("message")
                    .GetProperty("content")
                    .GetString() ?? string.Empty;

                return Ok(new GenerateResponse
                {
                    Success = true,
                    GeneratedText = generatedText
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating AI text");
                return StatusCode(500, new GenerateResponse
                {
                    Success = false,
                    Error = ex.Message
                });
            }
        }
    }
}
