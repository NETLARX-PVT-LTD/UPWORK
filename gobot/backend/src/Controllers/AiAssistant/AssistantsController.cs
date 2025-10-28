// ---------------------------------------------------------------------
// <copyright file="AssistantsController.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Controllers.AiAssistant
{
    using Chatbot;
    using Microsoft.AspNetCore.Http;
    using Microsoft.AspNetCore.Mvc;
    using Netlarx.Products.Gobot.Errors;
    using Netlarx.Products.Gobot.Interface.Assistant;
    using Netlarx.Products.Gobot.ModelDTO.AIAssistant;
    using System;
    using System.Threading.Tasks;

    [Route("api/[controller]")]
    [ApiController]
    public class AssistantsController : ControllerBase
    {
        private readonly IAssistantService _assistantService;

        public AssistantsController(IAssistantService assistantService)
        {
            _assistantService = assistantService;
        }


        [HttpPost("CreateAssistant")]
        public async Task<AssistantActionResult> CreateAssistantAsync([FromBody] AiAssistantBlock request)
        {
            var errors = new Errors();
            var result = await _assistantService.CreateAssistantAsync(request, errors);
            return result;
        }

        [HttpPut("UpdateAssistantByAssistantId{assistantId}")]
        public async Task<AssistantActionResult> UpdateAssistantByAssistantIdAsync(Guid assistantId, [FromBody] AiAssistantBlock request)
        {
            var errors = new Errors();
            var result = await _assistantService.UpdateAssistantAsync(assistantId, request, errors);
            return result;
        }

        [HttpGet("GetAssistantByAssistantId{assistantId}")]
        public async Task<AssistantResult> GetAssistantByAssistantIdAsync(Guid assistantId)
        {
            var errors = new Errors();
            var result = await _assistantService.GetAiAssistantByIdAsync(assistantId, errors);
            return result;
        }

        [HttpPost("UploadTrainingFilesByAssistantId{assistantId}/files")]
        public async Task<AssistantActionResult> UploadTrainingFilesByAssistantIdAsync(Guid assistantId, [FromForm] IFormFileCollection files)
        {
            var errors = new Errors();
            var result = await _assistantService.UploadTrainingFilesAsync(assistantId, files, errors);
            return result;
        }

        [HttpPost("AddWebsiteSourcesByAssistantId{assistantId}/websites")]
        public async Task<AssistantWebSiteResult> AddWebsiteSourcesByAssistantIdAsync(Guid assistantId, [FromBody] WebsiteDataBlock webSiteData)
        {
            var errors = new Errors();
            var result = await _assistantService.AddWebsiteSourcesAsync(assistantId, webSiteData, errors);
            return result;
        }

    }
}
