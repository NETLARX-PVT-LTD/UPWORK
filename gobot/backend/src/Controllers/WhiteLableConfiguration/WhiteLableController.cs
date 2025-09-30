// ---------------------------------------------------------------------
// <copyright file="WhiteLabelController.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Controllers.WhiteLableConfiguration
{
    using Microsoft.AspNetCore.Http;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.EntityFrameworkCore;
using Netlarx.Products.Gobot.Interface;
    using Netlarx.Products.Gobot.Models.WhiteLabelRequestIntegration;
    using System;
    using System.IO;
    using System.Linq;
    using System.Net;
    using System.Net.Sockets;
    using System.Threading.Tasks;

    [ApiController]
    [Route("api/partner/whitelabel")]
    public class WhiteLabelController : ControllerBase
    {
        private readonly IBotDbContext _context;
        public WhiteLabelController(IBotDbContext context)
        {
            _context = context;
        }

        [HttpPost("config")]
        public async Task<IActionResult> SaveWhiteLabelConfig([FromForm] WhiteLableRequestDTO requestBody)
        {
            if (string.IsNullOrEmpty(requestBody.CompanyName))
                return BadRequest("Company name is required.");

            if (requestBody.Logo == null || requestBody.Logo.Length == 0)
                return BadRequest("Logo file is required.");


            // Handle file upload
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var logoFileName = Path.GetFileName(requestBody.Logo.FileName);
            var filePath = Path.Combine(uploadsFolder, logoFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await requestBody.Logo.CopyToAsync(stream);
            }

            // Save to DB (mock example)
            var whitelabelSettings = new WhiteLableRequest
            {
                CompanyName = requestBody.CompanyName,
                maskUrl = requestBody.maskUrl,
                Logo = $"/uploads/{logoFileName}",
                PrimaryColor = requestBody.PrimaryColor,
                SecondaryColor = requestBody.SecondaryColor,
                EnableCustumDomain = requestBody.EnableCustumDomain,
                enableSSL = requestBody.enableSSL,
                sslProvider = requestBody.sslProvider
            };

            // TODO: Save whitelabelSettings to your database
            await _context.WhiteLableRequests.AddAsync(whitelabelSettings);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                message = "Whitelabel settings saved successfully",
                data = whitelabelSettings
            });
        }

        [HttpGet("config")]
        public async Task<WhiteLableRequest> GetWhiteLabelConfig()
        {
            var config = await _context.WhiteLableRequests.FirstOrDefaultAsync();

            if (config == null)
            {
                return null;
            }

            return new WhiteLableRequest
            {
                CompanyName = config.CompanyName,
                maskUrl = config.maskUrl,
                Logo = $"{Request.Scheme}://{Request.Host}{config.Logo}", // ✅ return public logo URL
                PrimaryColor = config.PrimaryColor,
                SecondaryColor = config.SecondaryColor,
                EnableCustumDomain = config.EnableCustumDomain,
                enableSSL = config.enableSSL,
                sslProvider = config.sslProvider
            };
        }

        [HttpPost("test-domain")]
        public async Task<IActionResult> TestCustomDomain([FromBody] DomainRequest request)
        {
            if (string.IsNullOrEmpty(request.Domain))
                return BadRequest(new { status = "error", message = "Domain is required." });

            try
            {
                // Perform DNS lookup for the domain
                var hostEntry = await Dns.GetHostEntryAsync(request.Domain);

                // ✅ Example: Check if it points to your server’s IP
                // Replace with your actual server IP or expected CNAME
                var expectedIp = "192.168.1.4"; // your server IP here

                bool isConfigured = hostEntry.AddressList.Any(ip => ip.ToString() == expectedIp);

                if (isConfigured)
                {
                    return Ok(new
                    {
                        status = "success",
                        message = "Domain successfully configured."
                    });
                }
                else
                {
                    return Ok(new
                    {
                        status = "error",
                        message = "Domain does not point to the correct server."
                    });
                }
            }
            catch (SocketException)
            {
                return Ok(new
                {
                    status = "error",
                    message = "Domain DNS lookup failed."
                });
            }
        }

        [HttpPost("install-ssl")]
        public IActionResult InstallSSL([FromBody] SSLInstallRequest request)
        {
            if (string.IsNullOrEmpty(request.Domain))
                return BadRequest(new { status = "error", message = "Domain is required." });

            if (string.IsNullOrEmpty(request.SslProvider))
                return BadRequest(new { status = "error", message = "SSL provider is required." });

            // ✅ Kick off background task (simulate long-running SSL provisioning)
            Task.Run(async () =>
            {
                // Here you’d integrate with Let’s Encrypt / Certbot / ACME client
                // Example: call an external script, API, or service to issue certificate
                await Task.Delay(10000); // simulate 10s SSL setup

                // TODO: Save SSL certificate info into DB
                Console.WriteLine($"SSL successfully installed for {request.Domain} with {request.SslProvider}");
            });

            // Return 202 Accepted immediately
            return Accepted(new
            {
                status = "pending",
                message = $"SSL installation started for domain {request.Domain}.",
                provider = request.SslProvider
            });
        }
    }
}
