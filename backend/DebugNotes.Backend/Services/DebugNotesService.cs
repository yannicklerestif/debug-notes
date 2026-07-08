using System.Collections.Concurrent;

namespace DebugNotes.Backend.Services;

public class DebugNotesService
{
    private static readonly TimeSpan WaitTimeout = TimeSpan.FromSeconds(30);
    
    private readonly ConcurrentDictionary<string, UserTopics> _usersTopics = new();

    public void SendMessageToBrowser(string userId, Message message)
    {
        GetOrCreateUserTopics(userId).SendMessageToBrowser(message);
    }

    public Task<List<Message>> PollBrowserMessages(string userId, string browserId)
    {
        return GetOrCreateUserTopics(userId).PollBrowserMessages(browserId, WaitTimeout);
    }

    public void SendMessageToIde(string userId, Message message)
    {
        GetOrCreateUserTopics(userId).SendMessageToide(message);
    }

    public Task<List<Message>> PollIdeMessagesAsync(string userId, string ideId)
    {
        return GetOrCreateUserTopics(userId).PollIdeMessagesAsync(ideId, WaitTimeout);
    }
    
    private UserTopics GetOrCreateUserTopics(string userId)
    {
        return _usersTopics.GetOrAdd(userId, _ =>  new UserTopics(userId));
    }
}