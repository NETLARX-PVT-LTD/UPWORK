// ---------------------------------------------------------------------
// <copyright file="Startup.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot
{
    using Microsoft.AspNetCore.Builder;
    using Microsoft.AspNetCore.Hosting;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.Extensions.Configuration;
    using Microsoft.Extensions.DependencyInjection;
    using Microsoft.Extensions.Hosting;
    using Netlarx.Products.Gobot.Db;
    using Netlarx.Products.Gobot.Interface;
    using Netlarx.Products.Gobot.Services;
    using Netlarx.Products.Gobot.Middlewares;
    using Microsoft.AspNetCore.Mvc.Formatters;

    public class Startup(IConfiguration configuration)
    {
        private readonly IConfiguration configuration = configuration;

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddRouting(options => options.LowercaseUrls = true);
            services.AddControllers().AddJsonOptions(opts =>
            {
                opts.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
            });

            //services.AddControllers(options =>
            //{
            //    options.InputFormatters.Insert(0, new ProtobufInputFormatter());
            //    options.OutputFormatters.Insert(0, new ProtobufOutputFormatter());
            //});

            services.AddDbContext<BotDbContext>(options =>
                options.UseSqlServer(configuration.GetConnectionString("BootsifyConnection"))
            );

            services.AddScoped<IBotDbContext>(provider => provider.GetRequiredService<BotDbContext>());
            services.AddSingleton<StorySessionManager>();

            services.AddCors(options =>
            {
                options.AddPolicy("AllowAll", policy =>
                {
                    policy.WithOrigins()
                          .AllowAnyHeader()
                          .AllowAnyMethod();
                });
            });

            services.AddEndpointsApiExplorer();
            services.AddSwaggerGen();
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }
            app.UseHttpsRedirection();
            app.UseCors("AllowAll");
            app.UseAuthorization();
            app.UseRouting();
            //app.UseMiddleware<DeserializationMiddleware>();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}