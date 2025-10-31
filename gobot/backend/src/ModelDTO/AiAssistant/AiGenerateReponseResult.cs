// ---------------------------------------------------------------------
// <copyright file="AiGenerateReponseResult.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.ModelDTO.AiAssistant
{
    using Gobot.Errors;
    using Gobot.Result;

    public class AiGenerateReponseResult: Result
    {
        public AiGenerateReponseResult(bool success, string statusCode, string generatedText, Errors? error = null)
            : base(success, error, statusCode)
        {
             GeneratedText =  generatedText;
        }

        public string GeneratedText { get; set; } = string.Empty;
    }
}
