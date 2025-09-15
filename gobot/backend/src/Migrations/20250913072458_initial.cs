using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gobot.Migrations
{
    /// <inheritdoc />
    public partial class initial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AiAssistants",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AssistantName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ApiKey = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Plateform = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Instruction = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Model = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    source = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FallbackTextMessage = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FallbackStory = table.Column<int>(type: "int", nullable: false),
                    MaxToken = table.Column<int>(type: "int", nullable: false),
                    Temperature = table.Column<double>(type: "float", nullable: false),
                    TopP = table.Column<double>(type: "float", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AiAssistants", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Connection",
                columns: table => new
                {
                    ID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StoryId = table.Column<int>(type: "int", nullable: false),
                    FromComponentType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FromComponentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Connection", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "CoversationalForm",
                columns: table => new
                {
                    ID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BotId = table.Column<int>(type: "int", nullable: false),
                    StoryId = table.Column<int>(type: "int", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FormName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    WebhookUrl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SendEmailNotification = table.Column<bool>(type: "bit", nullable: false),
                    NotificationEmail = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ShowAsInlineForm = table.Column<bool>(type: "bit", nullable: false),
                    RenderFormResponses = table.Column<bool>(type: "bit", nullable: false),
                    AllowMultipleSubmission = table.Column<bool>(type: "bit", nullable: false),
                    MultipleSubmissionMessage = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AllowExitForm = table.Column<bool>(type: "bit", nullable: false),
                    ExitFormMessage = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SuccessResponseType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ValidateEmail = table.Column<bool>(type: "bit", nullable: false),
                    ValidatePhone = table.Column<bool>(type: "bit", nullable: false),
                    SpamProtection = table.Column<bool>(type: "bit", nullable: false),
                    RequireCompletion = table.Column<bool>(type: "bit", nullable: false),
                    SuccessMessage = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RedirectUrl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ToComponentType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ToComponentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CoversationalForm", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "FormSubmissions",
                columns: table => new
                {
                    SubmissionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ConversationalFormId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SubmittedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FormSubmissions", x => x.SubmissionId);
                });

            migrationBuilder.CreateTable(
                name: "JsonAPI",
                columns: table => new
                {
                    ID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StoryId = table.Column<int>(type: "int", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ApiEndpoint = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RequestType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ToComponentType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ToComponentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JsonAPI", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "LandingConfigs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BackgroundStyle = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LandingConfigs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "LinkStory",
                columns: table => new
                {
                    ID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BotId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    StoryId = table.Column<int>(type: "int", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LinkStoryId = table.Column<int>(type: "int", nullable: false),
                    LinkStoryName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ToComponentType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ToComponentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LinkStory", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "Medias",
                columns: table => new
                {
                    ID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StoryId = table.Column<int>(type: "int", nullable: false),
                    MediaId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MediaType = table.Column<int>(type: "int", nullable: false),
                    SingleImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    VideoUrl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AudioUrl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FileUrl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MediaName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ButtonTitle = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ButtonTextMessage = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ButtonType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ButtonLinkedMediaId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ButtonUrl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ToComponentType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ToComponentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Medias", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "QuickReply",
                columns: table => new
                {
                    ID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Text = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    textResponseId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ToComponentType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ToComponentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuickReply", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "Stories",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BotId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RootBlockConnectionId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Stories", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "TextResponse",
                columns: table => new
                {
                    ID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BotId = table.Column<int>(type: "int", nullable: false),
                    StoryId = table.Column<int>(type: "int", nullable: false),
                    QuickReplyId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AlternateResponses = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ToComponentType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ToComponentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TextResponse", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "Themes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PrimaryColor = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Themes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TypingDelay",
                columns: table => new
                {
                    ID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StoryId = table.Column<int>(type: "int", nullable: false),
                    DelaySeconds = table.Column<double>(type: "float", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ToComponentType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ToComponentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TypingDelay", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "UserInputKeywords",
                columns: table => new
                {
                    ID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StoryId = table.Column<int>(type: "int", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ToComponentType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ToComponentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserInputKeywords", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "UserInputPhrases",
                columns: table => new
                {
                    ID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StoryId = table.Column<int>(type: "int", nullable: false),
                    Phrase = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ToComponentType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ToComponentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserInputPhrases", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "UserInputTypeAnythings",
                columns: table => new
                {
                    ID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StoryId = table.Column<int>(type: "int", nullable: false),
                    Anything = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ToComponentType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ToComponentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserInputTypeAnythings", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "Variables",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Variables", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WebsiteSources",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    WebsiteType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AssistantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Url = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AutoSync = table.Column<bool>(type: "bit", nullable: false),
                    MaxPages = table.Column<int>(type: "int", nullable: true),
                    MaxDepth = table.Column<int>(type: "int", nullable: true),
                    IncludeSubdomains = table.Column<bool>(type: "bit", nullable: true),
                    ExcludePatterns = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CssSelector = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RespectRobots = table.Column<bool>(type: "bit", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WebsiteSources", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TrainingFiles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FileName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FilePath = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AssistantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TrainingFiles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TrainingFiles_AiAssistants_AssistantId",
                        column: x => x.AssistantId,
                        principalTable: "AiAssistants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FormFields",
                columns: table => new
                {
                    FormFieldId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ConversationalFormId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Required = table.Column<bool>(type: "bit", nullable: false),
                    PromptPhrase = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Options = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OptionsText = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FormFields", x => x.FormFieldId);
                    table.ForeignKey(
                        name: "FK_FormFields_CoversationalForm_ConversationalFormId",
                        column: x => x.ConversationalFormId,
                        principalTable: "CoversationalForm",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FormResponses",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FormId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SubmittedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FormResponses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FormResponses_CoversationalForm_FormId",
                        column: x => x.FormId,
                        principalTable: "CoversationalForm",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ApiHeaders",
                columns: table => new
                {
                    jsonId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Key = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    JsonAPIID = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApiHeaders", x => x.jsonId);
                    table.ForeignKey(
                        name: "FK_ApiHeaders_JsonAPI_JsonAPIID",
                        column: x => x.JsonAPIID,
                        principalTable: "JsonAPI",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "Buttonblocks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProtoId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TextMessage = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LinkedMediaId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Url = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PhoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    StoryId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RssUrl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RssItemCount = table.Column<int>(type: "int", nullable: false),
                    RssButtonText = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    JsonApiUrl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    JsonApiMethod = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    JsonApiHeaders = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    JsonApiBody = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ApiEndpoint = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RequestType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MessageAfterAction = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    EmailForNotification = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    StopBotForUser = table.Column<bool>(type: "bit", nullable: false),
                    FormId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ShowInline = table.Column<bool>(type: "bit", nullable: false),
                    MediaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Buttonblocks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Buttonblocks_Medias_MediaId",
                        column: x => x.MediaId,
                        principalTable: "Medias",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ImageSlideblocks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Url = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MediaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ImageSlideblocks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ImageSlideblocks_Medias_MediaId",
                        column: x => x.MediaId,
                        principalTable: "Medias",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Bots",
                columns: table => new
                {
                    BotId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    BotName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ApiKey = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Story = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ThemeId = table.Column<int>(type: "int", nullable: false),
                    Position = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Size = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Greeting = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Placeholder = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AllowFullscreen = table.Column<bool>(type: "bit", nullable: false),
                    ShowBranding = table.Column<bool>(type: "bit", nullable: false),
                    BackgroundStyle = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LandingConfigId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bots", x => x.BotId);
                    table.ForeignKey(
                        name: "FK_Bots_LandingConfigs_LandingConfigId",
                        column: x => x.LandingConfigId,
                        principalTable: "LandingConfigs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Bots_Themes_ThemeId",
                        column: x => x.ThemeId,
                        principalTable: "Themes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "KeywordGroups",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserInputKeywordId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KeywordGroups", x => x.Id);
                    table.ForeignKey(
                        name: "FK_KeywordGroups_UserInputKeywords_UserInputKeywordId",
                        column: x => x.UserInputKeywordId,
                        principalTable: "UserInputKeywords",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "KeywordVariables",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UserInputKeywordId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KeywordVariables", x => x.Id);
                    table.ForeignKey(
                        name: "FK_KeywordVariables_UserInputKeywords_UserInputKeywordId",
                        column: x => x.UserInputKeywordId,
                        principalTable: "UserInputKeywords",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PlainKeywords",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UserInputKeywordId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlainKeywords", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PlainKeywords_UserInputKeywords_UserInputKeywordId",
                        column: x => x.UserInputKeywordId,
                        principalTable: "UserInputKeywords",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PhraseVariables",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UserInputPhraseId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PhraseVariables", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PhraseVariables_UserInputPhrases_UserInputPhraseId",
                        column: x => x.UserInputPhraseId,
                        principalTable: "UserInputPhrases",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AnythingVariables",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UserInputTypeAnythingId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AnythingVariables", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AnythingVariables_UserInputTypeAnythings_UserInputTypeAnythingId",
                        column: x => x.UserInputTypeAnythingId,
                        principalTable: "UserInputTypeAnythings",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FormFieldResponses",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FormResponseId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FieldName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FormFieldResponses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FormFieldResponses_FormResponses_FormResponseId",
                        column: x => x.FormResponseId,
                        principalTable: "FormResponses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ApiHeaderblock",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Key = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ButtonblockId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApiHeaderblock", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ApiHeaderblock_Buttonblocks_ButtonblockId",
                        column: x => x.ButtonblockId,
                        principalTable: "Buttonblocks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Keywords",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    KeywordGroupId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Keywords", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Keywords_KeywordGroups_KeywordGroupId",
                        column: x => x.KeywordGroupId,
                        principalTable: "KeywordGroups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AnythingVariables_UserInputTypeAnythingId",
                table: "AnythingVariables",
                column: "UserInputTypeAnythingId");

            migrationBuilder.CreateIndex(
                name: "IX_ApiHeaderblock_ButtonblockId",
                table: "ApiHeaderblock",
                column: "ButtonblockId");

            migrationBuilder.CreateIndex(
                name: "IX_ApiHeaders_JsonAPIID",
                table: "ApiHeaders",
                column: "JsonAPIID");

            migrationBuilder.CreateIndex(
                name: "IX_Bots_LandingConfigId",
                table: "Bots",
                column: "LandingConfigId");

            migrationBuilder.CreateIndex(
                name: "IX_Bots_ThemeId",
                table: "Bots",
                column: "ThemeId");

            migrationBuilder.CreateIndex(
                name: "IX_Buttonblocks_MediaId",
                table: "Buttonblocks",
                column: "MediaId");

            migrationBuilder.CreateIndex(
                name: "IX_FormFieldResponses_FormResponseId",
                table: "FormFieldResponses",
                column: "FormResponseId");

            migrationBuilder.CreateIndex(
                name: "IX_FormFields_ConversationalFormId",
                table: "FormFields",
                column: "ConversationalFormId");

            migrationBuilder.CreateIndex(
                name: "IX_FormResponses_FormId",
                table: "FormResponses",
                column: "FormId");

            migrationBuilder.CreateIndex(
                name: "IX_ImageSlideblocks_MediaId",
                table: "ImageSlideblocks",
                column: "MediaId");

            migrationBuilder.CreateIndex(
                name: "IX_KeywordGroups_UserInputKeywordId",
                table: "KeywordGroups",
                column: "UserInputKeywordId");

            migrationBuilder.CreateIndex(
                name: "IX_Keywords_KeywordGroupId",
                table: "Keywords",
                column: "KeywordGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_KeywordVariables_UserInputKeywordId",
                table: "KeywordVariables",
                column: "UserInputKeywordId");

            migrationBuilder.CreateIndex(
                name: "IX_PhraseVariables_UserInputPhraseId",
                table: "PhraseVariables",
                column: "UserInputPhraseId");

            migrationBuilder.CreateIndex(
                name: "IX_PlainKeywords_UserInputKeywordId",
                table: "PlainKeywords",
                column: "UserInputKeywordId");

            migrationBuilder.CreateIndex(
                name: "IX_TrainingFiles_AssistantId",
                table: "TrainingFiles",
                column: "AssistantId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AnythingVariables");

            migrationBuilder.DropTable(
                name: "ApiHeaderblock");

            migrationBuilder.DropTable(
                name: "ApiHeaders");

            migrationBuilder.DropTable(
                name: "Bots");

            migrationBuilder.DropTable(
                name: "Connection");

            migrationBuilder.DropTable(
                name: "FormFieldResponses");

            migrationBuilder.DropTable(
                name: "FormFields");

            migrationBuilder.DropTable(
                name: "FormSubmissions");

            migrationBuilder.DropTable(
                name: "ImageSlideblocks");

            migrationBuilder.DropTable(
                name: "Keywords");

            migrationBuilder.DropTable(
                name: "KeywordVariables");

            migrationBuilder.DropTable(
                name: "LinkStory");

            migrationBuilder.DropTable(
                name: "PhraseVariables");

            migrationBuilder.DropTable(
                name: "PlainKeywords");

            migrationBuilder.DropTable(
                name: "QuickReply");

            migrationBuilder.DropTable(
                name: "Stories");

            migrationBuilder.DropTable(
                name: "TextResponse");

            migrationBuilder.DropTable(
                name: "TrainingFiles");

            migrationBuilder.DropTable(
                name: "TypingDelay");

            migrationBuilder.DropTable(
                name: "Variables");

            migrationBuilder.DropTable(
                name: "WebsiteSources");

            migrationBuilder.DropTable(
                name: "UserInputTypeAnythings");

            migrationBuilder.DropTable(
                name: "Buttonblocks");

            migrationBuilder.DropTable(
                name: "JsonAPI");

            migrationBuilder.DropTable(
                name: "LandingConfigs");

            migrationBuilder.DropTable(
                name: "Themes");

            migrationBuilder.DropTable(
                name: "FormResponses");

            migrationBuilder.DropTable(
                name: "KeywordGroups");

            migrationBuilder.DropTable(
                name: "UserInputPhrases");

            migrationBuilder.DropTable(
                name: "AiAssistants");

            migrationBuilder.DropTable(
                name: "Medias");

            migrationBuilder.DropTable(
                name: "CoversationalForm");

            migrationBuilder.DropTable(
                name: "UserInputKeywords");
        }
    }
}
