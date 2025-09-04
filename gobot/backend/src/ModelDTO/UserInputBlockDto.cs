
namespace Netlarx.Products.Gobot.ModelDTO
{
    using System.Collections.Generic;
    public class UserInputBlockDto
    {
        public string? Id { get; set; }
        public string? Type { get; set; }
        public string? SubType { get; set; }
        public List<string>? Keywords { get; set; }
        public List<KeywordGroupDto>? KeywordGroups { get; set; }
        public List<VariableDto>? AvailableVariables { get; set; }
        public string? PhraseText { get; set; }
        public string? CustomMessage { get; set; }
        public string? ToComponentType { get; set; }
        public string? ToComponentId { get; set; }
        public string? StoryId { get; set; }
    }

    public class KeywordGroupDto
    {
        public string? Id { get; set; }
        public List<string>? Keywords { get; set; }
    }

    public class VariableDto
    {
        public string? Name { get; set; }
        public string? Type { get; set; }
    }

}