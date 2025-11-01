// ---------------------------------------------------------------------
// <copyright file="Startup.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot
{
    using Microsoft.AspNetCore.Builder;
    using Microsoft.AspNetCore.Hosting;
    using Microsoft.AspNetCore.Mvc.Formatters;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.Extensions.Configuration;
    using Microsoft.Extensions.DependencyInjection;
    using Microsoft.Extensions.Hosting;
    using Netlarx.Products.Gobot.Controllers.AiAssistant;
    using Netlarx.Products.Gobot.Controllers.Bots;
    using Netlarx.Products.Gobot.Db;
    using Netlarx.Products.Gobot.Db.Bots.Bot;
    using Netlarx.Products.Gobot.Db.DbLayer.AiAssistant.Assistant;
    using Netlarx.Products.Gobot.Interface;
    using Netlarx.Products.Gobot.Interface.Ai;
    using Netlarx.Products.Gobot.Interface.Assistant;
    using Netlarx.Products.Gobot.Interface.Bots;
    using Netlarx.Products.Gobot.Middlewares;
    using Netlarx.Products.Gobot.Service.AiAssistant;
    using Netlarx.Products.Gobot.Services;
    using Netlarx.Products.Gobot.Services.AiAssistant;
    using Netlarx.Products.Gobot.Services.Bots;
    using Netlarx.Products.Gobot.Validations;

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
            services.AddSingleton<StoryControllerValidation>();

            services.AddScoped<IAiService, AiService>();
            services.AddHttpClient<AIController>();

            services.AddScoped<IAssistantService, AssistantService>();
            services.AddScoped<IAssistantRepository, AssistantRepository>();
            services.AddHttpClient<AssistantsController>();

            services.AddScoped<IBotService, BotService>();
            services.AddScoped<IBotRepository, BotRepository>();
            services.AddHttpClient<BotsController>();

            services.AddCors(options =>
            {
                options.AddPolicy("AllowAll", policy =>
                {
                    policy.WithOrigins("http://localhost:4200")
                          .AllowAnyHeader()
                          .AllowAnyMethod();
                });
            });

            services.AddEndpointsApiExplorer();

            services.AddSwaggerGen(options =>
            {
                options.CustomSchemaIds(type => type.FullName);
            });
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }
            app.UseHttpsRedirection();
            app.UseAuthorization();
            app.UseRouting();
            app.UseCors("AllowAll");
            //app.UseMiddleware<DeserializationMiddleware>();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}