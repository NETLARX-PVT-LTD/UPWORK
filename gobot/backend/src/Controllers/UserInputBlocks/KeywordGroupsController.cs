// ---------------------------------------------------------------------
// <copyright file="VariablesController.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Controllers.UserInputBlocks
{
    using Chatbot;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore.Infrastructure;
    using Microsoft.Extensions.Logging;
    using Netlarx.Products.Gobot.Controllers;
    using Netlarx.Products.Gobot.Interface;
    using Netlarx.Products.Gobot.ModelDTO;
    using Netlarx.Products.Gobot.Pipelines;
    using System;
    using System.Linq;
    using System.Threading.Tasks;

    [Route("api/[controller]")]
    [ApiController]
    public class KeywordGroupsController : ControllerBase
    {
        private readonly IBotDbContext _db;
        private readonly ILogger<KeywordGroupsController> _logger;

        public KeywordGroupsController(IBotDbContext context, ILogger<KeywordGroupsController> logger)
        {
            _db = context;
            _logger = logger;
        }

        // POST /keyword-groups (Create keyword groups)
        [MiddlewareFilter(typeof(ProtoPipeline))]
        [Consumes("application/x-protobuf")]
        [HttpPost("/keyword-groups")]
        public async Task<IActionResult> CreateKeywordGroup()
        {
            //Retrieve the deserialized Protobuf object from middleware
            if (!HttpContext.Items.TryGetValue("ProtobufBody", out var obj) || obj is not KeywordGroup group)
            {
                _logger.LogWarning("Protobuf body missing or invalid");
                return BadRequest("Protobuf body missing or invalid");
            }

            if (group == null) return BadRequest("Invalid data");

            var keywordGroup = new Models.KeywordGroupp
            {
                Id = Guid.NewGuid(),
                UserInputKeywordId = Guid.Parse(group.UserInputKeywordId)
            };

            foreach(var keyword in group.Keywords)
            {
                var newKeyword = new Models.Keyword
                {
                    Id = Guid.NewGuid(),
                    Value = keyword,
                    KeywordGroupId = keywordGroup.Id
                };

                _db.Keywords.Add(newKeyword);
            }

            _db.KeywordGroups.Add(keywordGroup);
            await _db.SaveChangesAsync();

            return Ok(keywordGroup);
        }


        // PUT /keyword-groups/{groupId} (Update keyword groups)
        [MiddlewareFilter(typeof(ProtoPipeline))]
        [Consumes("application/x-protobuf")]
        [HttpPut("/keyword-groups/{groupId}")]
        public async Task<IActionResult> UpdateKeywordGroup(Guid groupId)
        {
            //Retrieve the deserialized Protobuf object from middleware
            if (!HttpContext.Items.TryGetValue("ProtobufBody", out var obj) || obj is not KeywordGroup updated)
            {
                _logger.LogWarning("Protobuf body missing or invalid");
                return BadRequest("Protobuf body missing or invalid");
            }

            var keywordGroup = await _db.KeywordGroups.FindAsync(groupId);
            if (keywordGroup == null) return NotFound();

            // update FK
            keywordGroup.UserInputKeywordId = Guid.Parse(updated.UserInputKeywordId);

            // delete old keywords
            var existingKeywords = _db.Keywords.Where(k => k.KeywordGroupId == groupId).ToList();
            _db.Keywords.RemoveRange(existingKeywords);

            // insert new keywords
            if (updated.Keywords != null)
            {
                foreach (var keyword in updated.Keywords)
                {
                    var newKeyword = new Models.Keyword
                    {
                        Id = Guid.NewGuid(),
                        Value = keyword,
                        KeywordGroupId = keywordGroup.Id
                    };
                    _db.Keywords.Add(newKeyword);
                }
            }

            _db.KeywordGroups.Update(keywordGroup);
            await _db.SaveChangesAsync();

            return Ok(keywordGroup);
        }
    }
}
