using System;
using System.Collections.Generic;

namespace Netlarx.Products.Gobot.Models
{
    public class Buttonblock
    {
        /// <summary>
        /// Primary Key for the Button in the database.
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Stores the original 'id' string from the proto file.
        /// </summary>
        public string ProtoId { get; set; }

        // All other properties from the Button proto message
        public string Title { get; set; }
        public string Type { get; set; }
        public string Value { get; set; }
        public string TextMessage { get; set; }
        public string LinkedMediaId { get; set; }
        public string Url { get; set; }
        public string PhoneNumber { get; set; }
        public string StoryId { get; set; }
        public string RssUrl { get; set; }
        public int RssItemCount { get; set; }
        public string RssButtonText { get; set; }
        public string JsonApiUrl { get; set; }
        public string JsonApiMethod { get; set; }
        public string JsonApiHeaders { get; set; }
        public string JsonApiBody { get; set; }
        public string ApiEndpoint { get; set; }
        public string RequestType { get; set; }
        public string MessageAfterAction { get; set; }
        public string EmailForNotification { get; set; }
        public bool StopBotForUser { get; set; }
        public string FormId { get; set; }
        public bool ShowInline { get; set; }

        /// <summary>
        /// Foreign Key linking this Button to its parent Media component.
        /// </summary>
        public Guid MediaId { get; set; }
        public virtual Media Media { get; set; }

        /// <summary>
        /// Navigation property for related API headers.
        /// </summary>
       public virtual ICollection<ApiHeaderblock> ApiHeaders { get; set; } = new List<ApiHeaderblock>();
    }
}