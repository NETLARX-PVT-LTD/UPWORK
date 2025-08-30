using System;
using System.ComponentModel.DataAnnotations;

namespace BotsifySchemaTest.Models
{
    public class Connection
    {
        public Guid ID { get; set; }
        public int StoryId { get; set; }

        public string FromComponentType { get; set; } = "";
        public Guid FromComponentId { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    }
}
