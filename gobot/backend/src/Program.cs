// ---------------------------------------------------------------------
// <copyright file="Program.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot
{
    using Microsoft.AspNetCore.Hosting;
    using Microsoft.Extensions.Hosting;
    using System;
    using System.Threading.Tasks;

    public class Program
    {
        public static void Main(string[] args)
        {
            CreateHostBuilder(args).Build().Run(); // normal run
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .UseContentRoot(AppContext.BaseDirectory)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseUrls("https://localhost:7221", "http://localhost:5223");

                    if (OperatingSystem.IsWindows())
                    {
                        webBuilder.ConfigureKestrel(options =>
                        {
                            options.ConfigureHttpsDefaults(httpsOptions =>
                            {
                                httpsOptions.AllowAnyClientCertificate();
                            });
                            options.Limits.MaxRequestBodySize = null;
                        });
                    }

                    webBuilder.UseStartup<Startup>();
                });
    }

}