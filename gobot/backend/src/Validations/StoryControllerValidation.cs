// ---------------------------------------------------------------------
// <copyright file="StoryControllerValidation.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;

namespace Netlarx.Products.Gobot.Validations
{
    public class StoryControllerValidation
    {
        public ActionResult? Validate(string id, string fieldName, ILogger logger)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                logger.LogWarning($"{fieldName} is missing or invalid");
                return new BadRequestObjectResult(new { Success = false, FailureCode = $"InvalidInput: {fieldName}" });
            }

            return null; // success
        }

    }
}
