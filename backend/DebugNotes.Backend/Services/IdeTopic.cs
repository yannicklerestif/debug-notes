namespace DebugNotes.Backend.Services;

/// <summary>
/// The queues for a topic (i.e. for a user token + a given direction
/// (i.e. diagram -> client, or client -> diagram)
/// </summary>
public class IdeTopic(string userId)
{
    // the key to this dictionary is the subscriber id
    private Dictionary<string, MessageQueue> _messagesQueues = new Dictionary<string, MessageQueue>();

    public void BroadcastMessage(Message message)
    {
        // Locking to make sure no queues are added while we iterate
        lock (_messagesQueues)
        {
            foreach (var messageQueue in _messagesQueues.Values)
            {
                messageQueue.SendMessage(message);
            }
        }
    }
    
    public Task<List<Message>> PollAsync(string ideId, TimeSpan waitTimeout)
    {
        MessageQueue messageQueue;
        lock (_messagesQueues)
        {
            if (_messagesQueues.TryGetValue(ideId, out var existingMessagesQueue))
            {
                messageQueue = existingMessagesQueue;
            }
            else
            {
                messageQueue = new MessageQueue();
                _messagesQueues[ideId] = messageQueue;
            }
        }
        
        return messageQueue.WaitOrTimeout(waitTimeout);
    }
}
