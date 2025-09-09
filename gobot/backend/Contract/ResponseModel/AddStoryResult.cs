using Contract.Enum;
using Contract.ResultPattern;

namespace Contract.ResponseModel
{
    public class AddStoryResult : Result
    {
        public int StoryId { get; set; }

        public AddStoryResult() : base() { }

        public AddStoryResult(int storyId) : base(true)
        {
            StoryId = storyId;
        }

        public AddStoryResult(ErrorCode faultCode, ErrorMessage faultMessage)
            : base(faultCode, faultMessage)
        {
            StoryId = 0;
        }
    }

}
