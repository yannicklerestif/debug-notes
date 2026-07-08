using System.Collections.Concurrent;

namespace DebugNotes.Backend.Services;

public class DebugNotesService
{
    private TimeSpan _waitTimeout = TimeSpan.FromSeconds(30);
    
    private readonly ConcurrentDictionary<string, UserTopics> _usersTopics = new();

    public Task SendMessageToBrowser(string userId, Message message)
    {
        return GetOrCreateUserTopics(userId).SendMessageToBrowser(message);
    }

    public Task<List<Message>> PollBrowserMessages(string userId, string browserId)
    {
        return GetOrCreateUserTopics(userId).PollBrowserMessages(browserId, _waitTimeout);
    }

    public Task SendMessageToIde(string userId, Message message)
    {
        return GetOrCreateUserTopics(userId).SendMessageToide(message);
    }

    public Task<List<Message>> PollIdeMessages(string userId, string ideId)
    {
        return GetOrCreateUserTopics(userId).PollIdeMessages(ideId, _waitTimeout);
    }
    
    private UserTopics GetOrCreateUserTopics(string userId)
    {
        return _usersTopics.GetOrAdd(userId, _ =>  new UserTopics(userId));
    }
}