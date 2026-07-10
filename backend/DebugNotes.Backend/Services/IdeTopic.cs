namespace DebugNotes.Backend.Services;

/// <summary>
/// The queues for a topic (i.e. for a user token + a given direction
/// (i.e. diagram -> client, or client -> diagram)
/// </summary>
public class IdeTopic(string userId)
{
    // the key to this dictionary is the subscriber id
    private Dictionary<string, MessageQueue> _messagesQueues = new ();

    // The counter below kind of duplicates the _onGoingPoll / _onGoingPoller mechanism,
    // but is used for a different purpose (recording activity to know whether the topic should be
    // removed.
    private int _onGoingPollsCount = 0;
    private DateTimeOffset _lastPollTime = DateTimeOffset.MinValue;
    
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
    
    // The method is not synchronized because the lock is taken above
    public void MarkPollingStart()
    {
        _onGoingPollsCount++;
        _lastPollTime = DateTimeOffset.Now;
    }
    
    // The method is not synchronized because the lock is taken above
    public void MarkPollingEnd()
    {
        _onGoingPollsCount--;
        _lastPollTime = DateTimeOffset.Now;
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
