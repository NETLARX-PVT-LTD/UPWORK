// ---------------------------------------------------------------------
// <copyright file="VariablesController.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Controllers.UserInputBlocks
{
    using Chatbot;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;
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
            try
            {
                // ✅ Retrieve the deserialized Protobuf object from middleware
                if (!HttpContext.Items.TryGetValue("ProtobufBody", out var obj) || obj is not KeywordGroup group)
                {
                    _logger.LogWarning("Protobuf body missing or invalid");
                    return BadRequest(new { Success = false, FailureCode = "InvalidInput", Message = "Protobuf body missing or invalid" });
                }

                if (group == null)
                    return BadRequest(new { Success = false, FailureCode = "InvalidInput", Message = "Group is null" });

                if (string.IsNullOrWhiteSpace(group.Id))
                {
                    _logger.LogWarning("GroupId is null or empty");
                    return BadRequest(new { Success = false, FailureCode = "InvalidInput", Message = "GroupId is null or empty" });
                }

                if (string.IsNullOrWhiteSpace(group.UserInputKeywordId))
                {
                    _logger.LogWarning("UserInputKeywordId is null or empty");
                    return BadRequest(new { Success = false, FailureCode = "InvalidInput", Message = "UserInputKeywordId is null or empty" });
                }

                var userInputKeyword = await _db.UserInputKeywords.FirstOrDefaultAsync(u => u.ID == Guid.Parse(group.UserInputKeywordId));


                // ✅ Build KeywordGroup entity
                var keywordGroup = new Models.KeywordGroupp
                {
                    Id = Guid.NewGuid(),
                    // For new data always assign new Guid (not parsing frontend ID) No Every UserInputKeyword should be one of its part
                    UserInputKeywordId = Guid.Parse(group.UserInputKeywordId)
                };

                // ✅ Add Keywords
                foreach (var keyword in group.Keywords ?? Enumerable.Empty<string>())
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

                // ✅ Save to DB
                await _db.SaveChangesAsync();

                _logger.LogInformation("Keyword group {GroupId} created successfully.", keywordGroup.Id);
                return Ok(new { Success = true, Data = keywordGroup });
            }
            catch (DbUpdateException dbEx)
            {
                // DB-specific failure (e.g., constraints, FK violation)
                _logger.LogError(dbEx, "Database error occurred while creating KeywordGroup.");
                return StatusCode(500, new
                {
                    Success = false,
                    FailureCode = "DatabaseError",
                    Message = dbEx.InnerException?.Message ?? dbEx.Message
                });
            }
            catch (Exception ex)
            {
                // General failure
                _logger.LogError(ex, "Unexpected error while creating KeywordGroup.");
                return StatusCode(500, new
                {
                    Success = false,
                    FailureCode = "ServerError",
                    Message = ex.InnerException?.Message ?? ex.Message
                });
            }
        }


        // PUT /keyword-groups/{groupId} (Update keyword groups)
        [MiddlewareFilter(typeof(ProtoPipeline))]
        [Consumes("application/x-protobuf")]
        [HttpPut("/keyword-groups/{groupId}")]
        public async Task<IActionResult> UpdateKeywordGroup(string groupId)
        {
            //Retrieve the deserialized Protobuf object from middleware
            if (!HttpContext.Items.TryGetValue("ProtobufBody", out var obj) || obj is not KeywordGroup updated)
            {
                _logger.LogWarning("Protobuf body missing or invalid");
                return BadRequest("Protobuf body missing or invalid");
            }

            if (string.IsNullOrWhiteSpace(groupId))
            {
                _logger.LogWarning("GroupId is null or empty");
                return BadRequest(new { Success = false, FailureCode = "InvalidInput", Message = "GroupId is null or empty" });
            }

            var keywordGroup = await _db.KeywordGroups.FirstOrDefaultAsync(kg => kg.Id == Guid.Parse(groupId));

            if (keywordGroup == null)
            {
                return BadRequest(new { Success = false, FailureCode = "InvalidInput GroupId is not present in DB", Message = "KeywordGroup is not present" });
            };

            var userInputKeyword = await _db.UserInputKeywords.FirstOrDefaultAsync(u => u.ID == keywordGroup.UserInputKeywordId);

            if(userInputKeyword == null)
            {
                return BadRequest(new { Success = false, FailureCode = "InvalidInput", Message = "userInputKeyword is not present" });
            }

            // update FK
            keywordGroup.UserInputKeywordId = Guid.Parse(updated.UserInputKeywordId);

            // delete old keywords
            var existingKeywords = _db.Keywords.Where(k => k.KeywordGroupId == Guid.Parse(groupId)).ToList();
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
