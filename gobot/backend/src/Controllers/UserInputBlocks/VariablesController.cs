// ---------------------------------------------------------------------
// <copyright file="VariablesController.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Netlarx.Products.Gobot.Controllers.UserInputBlocks
{
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.Extensions.Logging;
    using Netlarx.Products.Gobot.Controllers;
    using Netlarx.Products.Gobot.Interface;
    using Netlarx.Products.Gobot.ModelDTO;
    using Netlarx.Products.Gobot.Models;
    using System;
    using System.Collections.Generic;
    using System.Threading.Tasks;
    using Chatbot;

    [Route("api/[controller]")]
    [ApiController]
    public class VariablesController : ControllerBase
    {
        private readonly IBotDbContext _db;
        private readonly ILogger<VariablesController> _logger;

        public VariablesController(IBotDbContext context, ILogger<VariablesController> logger)
        {
            _db = context;
            _logger = logger;
        }

        // GET /variables
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Models.Variable>>> GetVariables()
        {
            return Ok(await _db.Variables.ToListAsync());
        }

        // POST /variables (Create new variables)
        [HttpPost]
        public async Task<IActionResult> CreateVariable([FromBody] VariableBlock variable)
        {
            if (variable == null) return BadRequest("Invalid data");

            var newVariable = new Models.Variable
            {
                Id = Guid.NewGuid(),
                Name = variable.Name,
                Type = variable.Type
            };

            _db.Variables.Add(newVariable);
            await _db.SaveChangesAsync();

            return Ok(newVariable);
        }

        // GET /api/variables
        [HttpGet("/all-variables")]
        public async Task<ActionResult<IEnumerable<Models.Variable>>> GetAvailableVariables()
        {
            return Ok(await _db.Variables.ToListAsync());
        }
    }
}
