// ---------------------------------------------------------------------
// <copyright file="School.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Pipelines
{
    using Microsoft.AspNetCore.Builder;
    using Netlarx.Products.Gobot.Middlewares;
    public class ProtoPipeline
    {
        public void Configure(IApplicationBuilder app)
        {
            app.UseMiddleware<DeserializationMiddleware>();
        }
    }
}
