// ---------------------------------------------------------------------
// <copyright file="IAiService.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Interface.Ai
{
    using Gobot.Errors;
    using Gobot.ModelDTO.AiAssistant;
    using System.Threading.Tasks;

    public interface IAiService
    {
        Task<AiGenerateReponseResult> GenerateTextAsync(GenerateRequest prompt, Errors errors);
    }
}