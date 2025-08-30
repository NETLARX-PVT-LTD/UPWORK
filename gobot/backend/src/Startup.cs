using BotsifySchemaTest.Db;
using BotsifySchemaTest.Services;
using GoBootBackend.Interface;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace Netlarx.Products.Gobot
{
    public class Startup(IConfiguration configuration)
    {
        private readonly IConfiguration configuration = configuration;

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddRouting(options => options.LowercaseUrls = true);
            services.AddControllers();

            services.AddDbContext<BotDbContext>(options =>
                options.UseSqlServer(configuration.GetConnectionString("BootsifyConnection"))
            );

            services.AddScoped<IBotDbContext>(provider => provider.GetRequiredService<BotDbContext>());
            services.AddScoped<StorySessionManager>();

            services.AddCors(options =>
            {
                options.AddPolicy("AllowAngularApp", policy =>
                {
                    policy.WithOrigins("http://localhost:4200")
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
            app.UseCors("AllowAngularApp");
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}