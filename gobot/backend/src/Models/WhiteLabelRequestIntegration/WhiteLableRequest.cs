// ---------------------------------------------------------------------
// <copyright file="SetWebhookRequest.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Models.WhiteLabelRequestIntegration
{
    using Microsoft.AspNetCore.Http;
    using System;
    using System.ComponentModel.DataAnnotations;

    public class WhiteLableRequestDTO
    {
        public string CompanyName { get; set; }
        public string maskUrl { get; set; }
        public string PrimaryColor { get; set; }
        public string SecondaryColor { get; set; }

        public Boolean EnableCustumDomain { get; set; }

        public Boolean enableSSL { get; set; }
        public string sslProvider { get; set; }
        public IFormFile Logo { get; set; }
    }

    public class WhiteLableRequest
    {
        [Key]
        public Guid PartnerId { get; set; }
        public string CompanyName { get; set; }
        public string maskUrl { get; set; }
        public string PrimaryColor { get; set; }
        public string SecondaryColor { get; set; }

        public Boolean EnableCustumDomain { get; set; }

        public Boolean enableSSL { get; set; }
        public string sslProvider { get; set; }
        public string Logo { get; set; }
    }

    public class WhiteLabelResponse
    {
        public string status { get; set; }
        public string message { get; set; }
    }

    public class DomainRequest
    {
        public string Domain { get; set; }
    }

    public class SSLInstallRequest
    {
        public string Domain { get; set; }
        public string SslProvider { get; set; }
    }

}
