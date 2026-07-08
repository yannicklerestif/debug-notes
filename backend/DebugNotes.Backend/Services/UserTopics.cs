namespace DebugNotes.Backend.Services;

public class UserTopics(string userId)
{
    private readonly TopicMessageQueues _browsersTopic = new TopicMessageQueues(userId);
    private readonly TopicMessageQueues _ideTopic = new TopicMessageQueues(userId);
    
    public async Task SendMessageToBrowser(Message message)
    {
        await _browsersTopic.SendToYoungestSubscriber(message);
    }

    public Task<List<Message>> PollBrowserMessages(string browserId, TimeSpan waitTimeout)
    {
        return _browsersTopic.Poll(browserId, waitTimeout);
    }

    public Task SendMessageToide(Message message)
    {
        return _ideTopic.BroadcastMessage(message);
    }
    
    public Task<List<Message>> PollIdeMessages(string ideId, TimeSpan waitTimeout)
    {
        return _ideTopic.Poll(ideId, waitTimeout);
    }
}