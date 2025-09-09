using Contract.Enum;

namespace Contract.ResultPattern
{
    public class Result
    {
        public bool Success { get; set; }
        public Error Error { get; set; }

        public Result()
        {
            Success = true;
            Error = new Error();
        }

        public Result(ErrorCode faultCode, ErrorMessage faultMessage)
        {
            Success = false;
            Error = new Error(faultCode, faultMessage);
        }

        public Result(bool success, Error error = null)
        {
            Success = success;
            Error = error ?? new Error();
        }
    }

}
