
namespace Netlarx.Products.Gobot.Errors
{
    using System.Text.Json.Serialization;

    [JsonConverter(typeof(JsonStringEnumConverter))]

    public enum FailureCode
    {
        UnknownError = 0,
        ValidationError = 1,
        UnauthorizedAccess = 2,
        DatabaseError = 3,
        Duplication = 4,
        InternalServerError = 5,
        NotFound = 6,
        InvalidInput = 7,
        Expired = 8,
        InvalidRequest = 9,
        BadRequest=10,
        ConfigurationError =11,
        ExternalApiError =12,
    }
}
