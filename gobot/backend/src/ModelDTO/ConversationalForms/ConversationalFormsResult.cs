// ---------------------------------------------------------------------
// <copyright file="ConversationalFormsResult.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.ModelDTO.ConversationalForms
{
    using Netlarx.Products.Gobot.Errors;
    using Netlarx.Products.Gobot.ModelDTO.Bots;
    using Netlarx.Products.Gobot.Result;
    using System.Collections.Generic;

    public class ConversationalFormsResult : Result
    {
        public ConversationalFormsResult(bool success, string statusCode, List<ConversationalFormBlockDto>? conversationalForm, Errors? error = null)
            : base(success, error, statusCode)
        {
            ConversationalForm = conversationalForm;
        }

        public List<ConversationalFormBlockDto>? ConversationalForm { get; set; }
    }
}