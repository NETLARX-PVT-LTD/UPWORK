namespace Netlarx.Products.Gobot.Errors
{
    public class Errors
    {
        public Errors() : this(FailureCode.UnknownError, "Unknown") { }
        public Errors(FailureCode failureCode, string faultMessage)
        {
            this.FaultCode = failureCode;
            this.FaultMessage = faultMessage;
        }

        public FailureCode FaultCode { get; set; }
        public string FaultMessage { get; set; }

        public void Fill(FailureCode failureCode, string faultMessage)
        {
            this.FaultCode = failureCode;
            this.FaultMessage = faultMessage;
        }
    }
}
