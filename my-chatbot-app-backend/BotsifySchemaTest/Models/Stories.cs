using System.ComponentModel.DataAnnotations;

namespace BotsifySchemaTest.Models
{
    public class Stories
    {
        public int ID { get; set; }

        [Required]
        public string? Name { get; set; }

        public Guid RootBlockConnectionId { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;


    }
}
