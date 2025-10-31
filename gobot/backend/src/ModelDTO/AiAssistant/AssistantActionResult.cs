// ---------------------------------------------------------------------
// <copyright file="AssistantActionResult.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.ModelDTO.AIAssistant
{
    using Gobot.Errors;
    using Gobot.Result;
    using System;
    public class AssistantActionResult: Result
    {
        public AssistantActionResult(bool success, string statusCode, Guid assistantId, Errors? error = null)
            : base(success, error, statusCode)
        {
            AssistantId = assistantId;
        }

        public Guid AssistantId { get; set; }
    }
}
