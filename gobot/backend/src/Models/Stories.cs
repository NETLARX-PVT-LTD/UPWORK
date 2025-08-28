using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BotsifySchemaTest.Models
{
    public class Stories
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }

        [Required]
        public string? Name { get; set; }

        public Guid RootBlockConnectionId { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

    }
}
