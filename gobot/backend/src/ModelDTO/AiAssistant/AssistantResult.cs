// ---------------------------------------------------------------------
// <copyright file="AssistantResult.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.ModelDTO.AIAssistant
{
    using Gobot.ModelDTO.AiAssistant;
    using Gobot.Errors;
    using Gobot.Result;

    public class AssistantResult : Result
    {
        public AssistantResult(bool success, string statusCode, AiAssistantBlockResposne? assistant, Errors? error = null)
            : base(success, error, statusCode)
        {
            Assistant = assistant;
        }

        public AiAssistantBlockResposne? Assistant { get; set; }
    }
}
