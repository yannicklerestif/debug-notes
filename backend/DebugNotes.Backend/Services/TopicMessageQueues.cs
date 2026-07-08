namespace DebugNotes.Backend.Services;

/// <summary>
/// The queues for a topic (i.e. for a user token + a given direction
/// (i.e. diagram -> client, or client -> diagram)
/// </summary>
public class TopicMessageQueues(string userId)
{
    // the key to this dictionary is the subscriber id
    private Dictionary<string, MessageQueue> _messagesQueues = new Dictionary<string, MessageQueue>();

    public async Task BroadcastMessage(Message message)
    {
        foreach (var messageQueue in _messagesQueues.Values)
        {
            await messageQueue.SendMessage(message);
        }
    }

    public async Task SendToYoungestSubscriber(Message message)
    {
        // TODO:
        //   1. Should favor queues that are actively being polled (i.e. the
        //      ones for which a poll is in progress first, then the ones that were
        //      polled last). If there are several ones with in-progress polls, 
        //      only then choose the one that was created last.
        //   2. It would probably make sense to pass the comparison as an argument
        //      to this method, so that this class is agnostic of it and only knows
        //      how to send messages to a single subscriber
        MessageQueue youngestQueue = _messagesQueues.Values.MaxBy(messageQueue => messageQueue.CreationTime);
        if (youngestQueue != null)
        {
            await youngestQueue.SendMessage(message);
        }
    }
    
    public Task<List<Message>> Poll(string subscriberId, TimeSpan waitTimeout)
    {
        MessageQueue messageQueue;
        if (_messagesQueues.TryGetValue(subscriberId, out var existingMessagesQueue))
        {
            messageQueue = existingMessagesQueue;
        }
        else
        {
            messageQueue = new MessageQueue();
            _messagesQueues[subscriberId] = messageQueue;
        }
        
        // In theory, we should also remember that we're processing a query,
        // because if the subscriber has connectivity issues it could query us
        // twice... let's keep this simple for now
        return messageQueue.WaitOrTimeout(waitTimeout);
    }
}
