// ---------------------------------------------------------------------
// <copyright file="Startup.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot
{
    using Gobot.Controllers.Email;
    using Gobot.Db.DbLayer.Bots.Stories;
    using Microsoft.AspNetCore.Builder;
    using Microsoft.AspNetCore.Hosting;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.Extensions.Configuration;
    using Microsoft.Extensions.DependencyInjection;
    using Microsoft.Extensions.Hosting;
    using Nelarx.Products.Gobot.Db.DbLayer.Bots.Stories;
    using Netlarx.Products.Gobot.Controllers.AiAssistant;
    using Netlarx.Products.Gobot.Controllers.Bots;
    using Netlarx.Products.Gobot.Controllers.Config;
    using Netlarx.Products.Gobot.Controllers.ConversationalForms;
    using Netlarx.Products.Gobot.Controllers.EmailSettings;
    using Netlarx.Products.Gobot.Controllers.FacebookIntegration;
    using Netlarx.Products.Gobot.Db;
    using Netlarx.Products.Gobot.Db.Bots.Bot;
    using Netlarx.Products.Gobot.Db.ConversationalForms;
    using Netlarx.Products.Gobot.Db.DbLayer.AiAssistant.Assistant;
    using Netlarx.Products.Gobot.Db.FacebookIntegration.BotConnection;
    using Netlarx.Products.Gobot.Db.FacebookIntegration.PageToken;
    using Netlarx.Products.Gobot.Db.FacebookIntegration.UserToken;
    using Netlarx.Products.Gobot.Interface;
    using Netlarx.Products.Gobot.Interface.Ai;
    using Netlarx.Products.Gobot.Interface.Assistant;
    using Netlarx.Products.Gobot.Interface.Bots;
    using Netlarx.Products.Gobot.Interface.Config;
    using Netlarx.Products.Gobot.Interface.ConversationalForms;
    using Netlarx.Products.Gobot.Interface.Email;
    using Netlarx.Products.Gobot.Interface.EmailSetting;
    using Netlarx.Products.Gobot.Interface.FacebookIntegration;
    using Netlarx.Products.Gobot.Repository.EmailSetting;
    using Netlarx.Products.Gobot.Service.AiAssistant;
    using Netlarx.Products.Gobot.Services;
    using Netlarx.Products.Gobot.Services.AiAssistant;
    using Netlarx.Products.Gobot.Services.Bots;
    using Netlarx.Products.Gobot.Services.Config;
    using Netlarx.Products.Gobot.Services.ConversationalForm;
    using Netlarx.Products.Gobot.Services.Email;
    using Netlarx.Products.Gobot.Services.EmailSetting;
    using Netlarx.Products.Gobot.Services.FacebookIntegration;
    using Netlarx.Products.Gobot.Validations;

    public class Startup
    {
        private readonly IConfiguration _configuration;

        public Startup(IConfiguration configuration)
        {
            _configuration = configuration;
        }

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
                options.UseSqlServer(_configuration.GetConnectionString("BootsifyConnection"))
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

            services.AddScoped<IStoriesService, StoriesService>();
            services.AddScoped<IStoriesRepository, StoriesRepository>();
            services.AddHttpClient<StoriesController>();

            services.AddScoped<IConversationalFormsServcie, ConversationalFormsService>();
            services.AddScoped<IConversationalFormsRepository, ConversationalFormsRepository>();
            services.AddHttpClient<FormsController>();

            services.AddScoped<IConfigService, ConfigService>();
            services.AddHttpClient<ConfigController>();

            services.AddScoped<IEmailService, EmailService>();
            services.AddHttpClient<EmailController>();

            services.AddScoped<IEmailSettingsService, EmailSettingsService>();
            services.AddScoped<IEmailSettingsRepository, EmailSettingsRepository>();
            services.AddHttpClient<EmailSettingController>();

           services.AddScoped<IFacebookIntegrationService, FacebookIntegrationService>();
            services.AddScoped<IUserTokenRepository, UserTokenRepository>();
            services.AddScoped<IPageTokenRepository, PageTokenRepository>();
            services.AddScoped<IBotConnectionRepository, BotConnectionRepository>();
            services.AddHttpClient<FacebookIntegrationController>();

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
            app.UseRouting();
            app.UseCors("AllowAll");
            app.UseAuthorization();
            //app.UseMiddleware<DeserializationMiddleware>();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}