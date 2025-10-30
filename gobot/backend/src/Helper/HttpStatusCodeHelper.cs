// ---------------------------------------------------------------------
// <copyright file="HttpStatusCodeHelper.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Helper
{
    using Microsoft.AspNetCore.Http;
    public class HttpStatusCodeHelper
    {
        public static void SetStatusCodeFromString(HttpResponse response, string? statusCodeStr, int defaultCode = 500)
            {
                if (int.TryParse(statusCodeStr, out int statusCode) && statusCode >= 100 && statusCode < 600)
                {
                    response.StatusCode = statusCode;
                }
                else
                {
                    response.StatusCode = defaultCode;
                }
            }
    }
}
