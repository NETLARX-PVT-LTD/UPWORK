using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using Google.Protobuf; // For Protobuf serialization
using Chatbot;         // Namespace generated from your .proto file

class Program
{
    static async Task Main(string[] args)
    {
        // 1. Build your Protobuf message
        var userInputBlock = new UserInputBlock
        {
            Id = "your_block_id",
            Type = "userInput",
            SubType = "Keyword", // Use correct string or enum value as defined in your proto
            Keywords = { "apple", "banana", "orange" },
            KeywordGroups =
            {
                new KeywordGroup
                {
                    Id = "group1_id",
                    Keywords = { "greetings", "hello", "hi" }
                },
                new KeywordGroup
                {
                    Id = "group2_id",
                    Keywords = { "goodbye", "bye", "see ya" }
                }
            },
            AvailableVariables =
            {
                new Variable { Name = "fruit_choice", Type = "string" }
            },
            StoryId = "12345"
        };

        // 2. Serialize the object to a byte array
        byte[] protobufData;
        using (var stream = new MemoryStream())
        {
            userInputBlock.WriteTo(stream);
            protobufData = stream.ToArray();
        }

        // 3. Send the request with HttpClient
        using (var client = new HttpClient())
        {
            var content = new ByteArrayContent(protobufData);
            content.Headers.ContentType = new MediaTypeHeaderValue("application/x-protobuf");

            try
            {
                HttpResponseMessage response = await client.PostAsync(
                    "https://localhost:7221/api/components/AddUserInputKeyword?storyId=12345",
                    content
                );

                // Ensure success
                response.EnsureSuccessStatusCode();

                // Read and print response
                string result = await response.Content.ReadAsStringAsync();
                Console.WriteLine("Request successful!");
                Console.WriteLine($"Response Status: {response.StatusCode}");
                Console.WriteLine($"Response Body: {result}");
            }
            catch (HttpRequestException e)
            {
                Console.WriteLine($"Error during request: {e.Message}");
            }
        }
    }
}
