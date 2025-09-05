using System.Collections.Generic;

namespace Netlarx.Products.Gobot.ModelDTO
{
    public class MediaBlockDto
    {
        public string Type { get; set; }
        public string MediaId { get; set; }
        public MediaTypeDto MediaType { get; set; }
        public string SingleImageUrl { get; set; }
        public string VideoUrl { get; set; }
        public string AudioUrl { get; set; }
        public string FileUrl { get; set; }
        public string MediaName { get; set; }
        public string ButtonTitle { get; set; }
        public string ButtonTextMessage { get; set; }
        public string ButtonType { get; set; }
        public string ButtonLinkedMediaId { get; set; }
        public string ButtonUrl { get; set; }
        public List<ImageSlideDto> Slides { get; set; } = new List<ImageSlideDto>();
        public List<ButtonDto> Buttons { get; set; } = new List<ButtonDto>();
    }

    public class ImageSlideDto
    {
        public string Url { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
    }

    public class ButtonDto
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public string Type { get; set; }
        public string Value { get; set; }
        public string TextMessage { get; set; }
        public string LinkedMediaId { get; set; }
        public string Url { get; set; }
        public string PhoneNumber { get; set; }
        public string StoryId { get; set; }
        public List<ApiHeaderDto> ApiHeaders { get; set; } = new List<ApiHeaderDto>();
    }

    public class ApiHeaderDto
    {
        public string Key { get; set; }
        public string Value { get; set; }
    }

    public enum MediaTypeDto
    {
        TEXT = 0,
        IMAGE = 1,
        VIDEO = 2,
        FILE = 3,
        IMAGE_SLIDER = 4,
        AUDIO = 5
    }
}