namespace Netlarx.Products.Gobot.Models
{
    public class ApiHeaderblock
    {
        /// <summary>
        /// Primary Key for the ApiHeader in the database.
        /// </summary>
        public int Id { get; set; }

        // Properties from the ApiHeader proto message
        public string Key { get; set; }
        public string Value { get; set; }

        /// <summary>
        /// Foreign Key linking this header to its parent Button.
        /// </summary>
        public int ButtonblockId { get; set; } // Conventionally named after the class + Id
        public virtual Buttonblock Button { get; set; }
    }
}