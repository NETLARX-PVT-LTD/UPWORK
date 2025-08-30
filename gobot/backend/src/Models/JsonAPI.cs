// ---------------------------------------------------------------------
// <copyright file="School.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Netlarx.Products.Gobot.Models
{
    public class ApiHeader
    {
        [Key]
        public int jsonId { get; set; }
        public string Key { get; set; }
        public string Value { get; set; }
    }

    public class JsonAPI : BaseComponent
    {
        [Required]
        public int StoryId { get; set; }
        public string Type { get; set; } // "jsonApi"
        public string ApiEndpoint { get; set; }
        public string RequestType { get; set; } // "GET", "POST", etc.
        public List<ApiHeader> ApiHeaders { get; set; }
    }
}

