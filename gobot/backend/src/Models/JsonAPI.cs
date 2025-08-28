using BotsifySchemaTest.Models;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace BotsifySchemaTest.Models
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

