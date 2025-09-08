using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gobot.Migrations
{
    /// <inheritdoc />
    public partial class intital : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Bots",
                columns: table => new
                {
                    BotId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BotName = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bots", x => x.BotId);
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
                    StoryId = table.Column<int>(type: "int", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FormId = table.Column<string>(type: "nvarchar(max)", nullable: false),
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
                name: "LinkStory",
                columns: table => new
                {
                    ID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StoryId = table.Column<int>(type: "int", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LinkStoryId = table.Column<string>(type: "nvarchar(max)", nullable: false),
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
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TextResponseId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
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
                    BotId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RootBlockConnectionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
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
                    StoryId = table.Column<int>(type: "int", nullable: false),
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
                name: "TypingDelay",
                columns: table => new
                {
                    ID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StoryId = table.Column<int>(type: "int", nullable: false),
                    DelaySeconds = table.Column<double>(type: "float", nullable: false),
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
                name: "FormField",
                columns: table => new
                {
                    FormFieldId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Required = table.Column<bool>(type: "bit", nullable: false),
                    PromptPhrase = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Options = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OptionsText = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ConversationalFormID = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FormField", x => x.FormFieldId);
                    table.ForeignKey(
                        name: "FK_FormField_CoversationalForm_ConversationalFormID",
                        column: x => x.ConversationalFormID,
                        principalTable: "CoversationalForm",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "ApiHeader",
                columns: table => new
                {
                    jsonId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Key = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    JsonAPIID = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApiHeader", x => x.jsonId);
                    table.ForeignKey(
                        name: "FK_ApiHeader_JsonAPI_JsonAPIID",
                        column: x => x.JsonAPIID,
                        principalTable: "JsonAPI",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateTable(
                name: "Buttonblock",
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
                    table.PrimaryKey("PK_Buttonblock", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Buttonblock_Medias_MediaId",
                        column: x => x.MediaId,
                        principalTable: "Medias",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ImageSlideblock",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Url = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MediaId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ImageSlideblock", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ImageSlideblock_Medias_MediaId",
                        column: x => x.MediaId,
                        principalTable: "Medias",
                        principalColumn: "ID",
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
                        name: "FK_ApiHeaderblock_Buttonblock_ButtonblockId",
                        column: x => x.ButtonblockId,
                        principalTable: "Buttonblock",
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
                name: "IX_ApiHeader_JsonAPIID",
                table: "ApiHeader",
                column: "JsonAPIID");

            migrationBuilder.CreateIndex(
                name: "IX_ApiHeaderblock_ButtonblockId",
                table: "ApiHeaderblock",
                column: "ButtonblockId");

            migrationBuilder.CreateIndex(
                name: "IX_Buttonblock_MediaId",
                table: "Buttonblock",
                column: "MediaId");

            migrationBuilder.CreateIndex(
                name: "IX_FormField_ConversationalFormID",
                table: "FormField",
                column: "ConversationalFormID");

            migrationBuilder.CreateIndex(
                name: "IX_ImageSlideblock_MediaId",
                table: "ImageSlideblock",
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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AnythingVariables");

            migrationBuilder.DropTable(
                name: "ApiHeader");

            migrationBuilder.DropTable(
                name: "ApiHeaderblock");

            migrationBuilder.DropTable(
                name: "Bots");

            migrationBuilder.DropTable(
                name: "Connection");

            migrationBuilder.DropTable(
                name: "FormField");

            migrationBuilder.DropTable(
                name: "ImageSlideblock");

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
                name: "TypingDelay");

            migrationBuilder.DropTable(
                name: "UserInputTypeAnythings");

            migrationBuilder.DropTable(
                name: "JsonAPI");

            migrationBuilder.DropTable(
                name: "Buttonblock");

            migrationBuilder.DropTable(
                name: "CoversationalForm");

            migrationBuilder.DropTable(
                name: "KeywordGroups");

            migrationBuilder.DropTable(
                name: "UserInputPhrases");

            migrationBuilder.DropTable(
                name: "Medias");

            migrationBuilder.DropTable(
                name: "UserInputKeywords");
        }
    }
}
