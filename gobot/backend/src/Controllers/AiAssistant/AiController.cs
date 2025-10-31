// ---------------------------------------------------------------------
// <copyright file="AIController.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Controllers.AiAssistant
{
    using Gobot.Helper;
    using Gobot.Interface.Ai;
    using Gobot.ModelDTO.AiAssistant;
    using Microsoft.AspNetCore.Mvc;
    using Netlarx.Products.Gobot.Errors;
    using System.Threading.Tasks;

    [ApiController]
    [Route("api/ai")]
    public class AIController : ControllerBase
    {
        private readonly IAiService _aiService;
        public AIController(IAiService aiService)
        {
            _aiService = aiService;
        }

        // POST /api/ai/GenerateText
        [HttpPost("GenerateText")]
        public async Task<AiGenerateReponseResult> GenerateTextAsync([FromBody] GenerateRequest request)
        {
            var errors = new Errors();
            var result = await _aiService.GenerateTextAsync(request, errors);
            HttpStatusCodeHelper.SetStatusCodeFromString(Response, result.StatusCode);
            return result;
        }
    }
}
