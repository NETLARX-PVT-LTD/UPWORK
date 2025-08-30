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
        public static async Task Main(string[] args)
        {
            try
            {
                var host = CreateHostBuilder(args).Build();
                await host.RunAsync();
            }
            catch (Exception ex)
            {
                Environment.Exit(1);
            }
        }

        public static IHostBuilder CreateHostBuilder(string[] args)
        {
            return Host.CreateDefaultBuilder(args)
                .UseContentRoot(AppContext.BaseDirectory)
                .ConfigureAppConfiguration((hostingContext, config) =>
                {
                    // Additional configuration can be set up here if needed
                })
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    var endpoint = "";
                    webBuilder.UseUrls(endpoint);

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
}