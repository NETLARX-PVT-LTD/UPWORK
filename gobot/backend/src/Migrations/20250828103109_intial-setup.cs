using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GoBootBackend.Migrations
{
    /// <inheritdoc />
    public partial class intialsetup : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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
                    NotificationEmail = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ShowAsInlineForm = table.Column<bool>(type: "bit", nullable: false),
                    RenderFormResponses = table.Column<bool>(type: "bit", nullable: false),
                    AllowMultipleSubmission = table.Column<bool>(type: "bit", nullable: false),
                    MultipleSubmissionMessage = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AllowExitForm = table.Column<bool>(type: "bit", nullable: false),
                    ExitFormMessage = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SuccessResponseType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SuccessRedirectStoryId = table.Column<string>(type: "nvarchar(max)", nullable: false),
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
                name: "Stories",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
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
                    delaySeconds = table.Column<double>(type: "float", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ToComponentType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ToComponentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TypingDelay", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "UserInputKeyword",
                columns: table => new
                {
                    ID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StoryId = table.Column<int>(type: "int", nullable: false),
                    json = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ToComponentType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ToComponentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserInputKeyword", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "UserInputPhrase",
                columns: table => new
                {
                    ID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StoryId = table.Column<int>(type: "int", nullable: false),
                    json = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ToComponentType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ToComponentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserInputPhrase", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "UserInputTypeAnything",
                columns: table => new
                {
                    ID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StoryId = table.Column<int>(type: "int", nullable: false),
                    json = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ToComponentType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ToComponentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserInputTypeAnything", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "Validation",
                columns: table => new
                {
                    validationId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MinLength = table.Column<int>(type: "int", nullable: false),
                    MaxLength = table.Column<int>(type: "int", nullable: false),
                    Pattern = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Min = table.Column<double>(type: "float", nullable: false),
                    Max = table.Column<double>(type: "float", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Validation", x => x.validationId);
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
                name: "QuickReply",
                columns: table => new
                {
                    TestReponseId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TextResponseID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ToComponentType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ToComponentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuickReply", x => x.TestReponseId);
                    table.ForeignKey(
                        name: "FK_QuickReply_TextResponse_TextResponseID",
                        column: x => x.TextResponseID,
                        principalTable: "TextResponse",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
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
                    Options = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OptionsText = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RulesvalidationId = table.Column<int>(type: "int", nullable: false),
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
                    table.ForeignKey(
                        name: "FK_FormField_Validation_RulesvalidationId",
                        column: x => x.RulesvalidationId,
                        principalTable: "Validation",
                        principalColumn: "validationId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ApiHeader_JsonAPIID",
                table: "ApiHeader",
                column: "JsonAPIID");

            migrationBuilder.CreateIndex(
                name: "IX_FormField_ConversationalFormID",
                table: "FormField",
                column: "ConversationalFormID");

            migrationBuilder.CreateIndex(
                name: "IX_FormField_RulesvalidationId",
                table: "FormField",
                column: "RulesvalidationId");

            migrationBuilder.CreateIndex(
                name: "IX_QuickReply_TextResponseID",
                table: "QuickReply",
                column: "TextResponseID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ApiHeader");

            migrationBuilder.DropTable(
                name: "Connection");

            migrationBuilder.DropTable(
                name: "FormField");

            migrationBuilder.DropTable(
                name: "LinkStory");

            migrationBuilder.DropTable(
                name: "QuickReply");

            migrationBuilder.DropTable(
                name: "Stories");

            migrationBuilder.DropTable(
                name: "TypingDelay");

            migrationBuilder.DropTable(
                name: "UserInputKeyword");

            migrationBuilder.DropTable(
                name: "UserInputPhrase");

            migrationBuilder.DropTable(
                name: "UserInputTypeAnything");

            migrationBuilder.DropTable(
                name: "JsonAPI");

            migrationBuilder.DropTable(
                name: "CoversationalForm");

            migrationBuilder.DropTable(
                name: "Validation");

            migrationBuilder.DropTable(
                name: "TextResponse");
        }
    }
}
