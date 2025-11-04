// ---------------------------------------------------------------------
// <copyright file="ConversationalFormsActionResult.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.ModelDTO.ConversationalForms
{
    using Netlarx.Products.Gobot.Errors;
    using Netlarx.Products.Gobot.Result;
    using System;

    public class ConversationalFormsActionResult : Result
    {
        public ConversationalFormsActionResult(bool success, string statusCode, Guid? id, Errors? error = null)
            : base(success, error, statusCode)
        {
            Id = id;
        }

        public Guid? Id { get; set; }
    }
}