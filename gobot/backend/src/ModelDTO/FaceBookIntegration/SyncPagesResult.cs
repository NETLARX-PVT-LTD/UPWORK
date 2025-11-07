// ---------------------------------------------------------------------
// <copyright file="EmailBotDetailRequest.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ------------------------------------------------------------------

namespace Netlarx.Products.Gobot.ModelDTO.FaceBookIntegration
{
    using Netlarx.Products.Gobot.Errors;
    using Netlarx.Products.Gobot.Result;

    public class SyncPagesResult : Result
    {
        public SyncPagesResult(bool success, string statusCode, SyncPageDto? data, Errors? error = null)
             : base(success, error, statusCode)
        {
            Data = data;
        }

        public SyncPageDto Data { get; set; }
    }
}
