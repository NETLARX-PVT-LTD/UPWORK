// ---------------------------------------------------------------------
// <copyright file="IBotDbContext.cs" company="Netlarx">
// Copyright (c) Netlarx softwares pvt ltd. All rights reserved.
// </copyright>
// ---------------------------------------------------------------------

namespace Netlarx.Products.Gobot.Interface
{
    using Gobot.Models;
    using Microsoft.EntityFrameworkCore;
    using Netlarx.Products.Gobot.Models;
    using Netlarx.Products.Gobot.Models.FacebookIntegration;
    using System.Collections.Generic;
    using System.Threading;
    using System.Threading.Tasks;

    public interface IBotDbContext
    {
        DbSet<Bot> Bots { get; set; }
        DbSet<Stories> Stories { get; set; }
        DbSet<UserInputPhrase> UserInputPhrases { get; set; }
        DbSet<UserInputKeyword> UserInputKeywords { get; set; }
        DbSet<UserInputTypeAnything> UserInputTypeAnythings { get; set; }
        DbSet<Variable> Variables { get; set; }
        DbSet<Connection> Connection { get; set; }
        DbSet<TypingDelay> TypingDelay { get; set; }
        DbSet<ConversationalForm> ConversationalForm { get; set; }

        DbSet<VariablePhrase> PhraseVariables { get; set; }
        DbSet<VariableKeyword> KeywordVariables { get; set; }
        DbSet<VariableAnything> AnythingVariables { get; set; }

        DbSet<KeywordGroupp> KeywordGroups { get; set; }
        DbSet<Keyword> Keywords { get; set; }

        DbSet<PlainKeyword> PlainKeywords { get; set; }
        DbSet<JsonAPI> JsonAPI { get; set; }

        DbSet<TextResponse> TextResponse { get; set; }
        DbSet<QuickReplyModel> QuickReplies { get; set; }

        DbSet<Media> Medias { get; set; }

        DbSet<LinkStory> LinkStory { get; set; }

        DbSet<FormField> FormFields { get; set; }
        DbSet<FormSubmission> FormSubmissions { get; set; }

        DbSet<ApiHeader> ApiHeaders { get; set; }
        DbSet<ImageSlideblock> ImageSlideblocks { get; set; }
        DbSet<Buttonblock> Buttonblocks { get; set; }
        DbSet<BotConfig> BotConfigs { get; set; }
        DbSet<BotMenu> BotMenus { get; set; }

        DbSet<AiAssistant> AiAssistants { get; set; }
        DbSet<TrainingFile> TrainingFiles { get; set; }

        DbSet<WebsiteData> WebsiteSources { get; set; }
        DbSet<FormResponse> FormResponses { get; set; }
        
        DbSet<FormFieldResponse> FormFieldResponses { get; set; }

        DbSet<Theme> Themes { get; set; }
        DbSet<LandingConfig> LandingConfigs { get; set; }
        DbSet<PageMessage> PageMessages { get; set; }

        DbSet<BotPublishRequest> BotPublishRequests { get; set; }

        DbSet<UserToken> UserTokens { get; set; }
        DbSet<PageToken> PageTokens { get; set; }
        DbSet<BotConnection> BotConnections { get; set; }
        void addStory(Stories model);

        void addConnection(Connection connection);

        void addUserInputPhrase(UserInputPhrase phrase);

        void addUserInputKeyword(UserInputKeyword keyword);

        void addUserInputAnything(UserInputTypeAnything anything);
        void addTypingDelay(TypingDelay typingDelay);
        void EntryAll<T>(T entity, T existing) where T : class;

        Task<List<TypingDelay>> allTypingDelay(int storyId);

        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
        int SaveChanges();
    }
}
