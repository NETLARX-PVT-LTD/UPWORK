namespace Netlarx.Products.Gobot.Result
{
    using Gobot.Errors;
    public class Result
    {
        public Result(bool success, Errors error, string statusCode)
        {
            Success = success;
            Error = error;
            StatusCode = statusCode;
        }
        public bool Success { get; set; }
        public Errors Error { get; set; }
        public string StatusCode { get; set; }
    }
}
