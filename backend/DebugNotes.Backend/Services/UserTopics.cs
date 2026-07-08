namespace DebugNotes.Backend.Services;

public class UserTopics(string userId)
{
    private readonly BrowserTopic _browsersTopic = new (userId);
    private readonly IdeTopic _ideTopic = new (userId);
    
    public void SendMessageToBrowser(Message message)
    {
        _browsersTopic.SendMessage(message);
    }

    public Task<List<Message>> PollBrowserMessages(string browserId, TimeSpan waitTimeout)
    {
        return _browsersTopic.Poll(browserId, waitTimeout);
    }

    public void SendMessageToide(Message message)
    {
        _ideTopic.BroadcastMessage(message);
    }
    
    public Task<List<Message>> PollIdeMessagesAsync(string ideId, TimeSpan waitTimeout)
    {
        return _ideTopic.PollAsync(ideId, waitTimeout);
    }
}