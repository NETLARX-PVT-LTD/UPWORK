using BotsifySchemaTest.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace GoBootBackend.Interface
{
    public interface IBotDbContext
    {
        DbSet<Stories> Stories { get; set; }
        DbSet<UserInputPhrase> UserInputPhrase { get; set; }
        DbSet<UserInputKeyword> UserInputKeyword { get; set; }
        DbSet<UserInputTypeAnything> UserInputTypeAnything { get; set; }
        DbSet<Connection> Connection { get; set; }
        DbSet<TypingDelay> TypingDelay { get; set; }
        DbSet<ConversationalForm> ConversationalForm { get; set; }

        DbSet<JsonAPI> JsonAPI { get; set; }

        DbSet<TextResponse> TextResponse { get; set; }

        public DbSet<LinkStory> LinkStory { get; set; }
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
