using Contract.Enum;
using Contract.ResultPattern;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System;
using System.Threading.Tasks;

namespace Gobot.Middlewares
{
    public class ServiceExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ServiceExceptionMiddleware> _logger;

        public ServiceExceptionMiddleware(RequestDelegate next, ILogger<ServiceExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context); 
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled exception");

                context.Response.ContentType = "application/json";
                context.Response.StatusCode = StatusCodes.Status500InternalServerError;

                var result = new Result
                {
                    Success = false,
                    Error = new Error
                    {
                        FaultCode = ErrorCode.UnhandledException,  
                        FaultMessage = ErrorMessage.UnknownError  
                    }
                };

                var json = JsonConvert.SerializeObject(result);
                await context.Response.WriteAsync(json);
            }
        }
    }
}
