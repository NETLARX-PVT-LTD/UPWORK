using Contract.Enum;

namespace Contract.ResultPattern
{
    public class Error
    {
        public ErrorCode FaultCode { get; set; }
        public ErrorMessage FaultMessage { get; set; }
        public Error()
        {
            FaultCode = ErrorCode.None;
            FaultMessage = ErrorMessage.None;
                
        }

        public Error(ErrorCode faultCode , ErrorMessage faultMessage)
        {
            FaultCode = faultCode;
            FaultMessage = faultMessage;
        }

    }

}

