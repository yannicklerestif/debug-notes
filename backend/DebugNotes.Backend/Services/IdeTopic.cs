namespace DebugNotes.Backend.Services;

/// <summary>
/// The queues for a topic (i.e. for a user token + a given direction
/// (i.e. diagram -> client, or client -> diagram)
/// </summary>
public class IdeTopic(string userId)
{
    // the key to this dictionary is the subscriber id
    private readonly Dictionary<string, MessageQueue> _messagesQueues = new();
    private readonly Dictionary<string, Task<List<Message>>> _onGoingPolls = new();
    private DateTimeOffset _lastMessageTime = DateTimeOffset.MinValue;
    
    public bool IsActive { get; set; } = true;

    public void BroadcastMessage(Message message)
    {
        _lastMessageTime = DateTimeOffset.UtcNow;
        
        // No need to lock: queue creation (in MarkPollStart) and deletion (in Cleanup)
        // are done under a lock at the UserTopics level
        foreach (var messageQueue in _messagesQueues.Values)
        {
            messageQueue.SendMessage(message);
        }
    }
    
    // The method is not synchronized because the lock is taken above, at the UserTopics level
    public void MarkPollStart(string ideId)
    {
        MessageQueue messageQueue;
        if (_messagesQueues.TryGetValue(ideId, out var existingMessagesQueue))
        {
            messageQueue = existingMessagesQueue;
        }
        else
        {
            messageQueue = new MessageQueue();
            _messagesQueues[ideId] = messageQueue;
        }
        messageQueue.MarkPollStart();
    }
    
    public Task<List<Message>> PollAsync(string ideId, TimeSpan waitTimeout)
    {
        lock (_messagesQueues)
        {
            if (_onGoingPolls.TryGetValue(ideId, out var onGoingPoll))
            {
                // The same IDE is polling twice concurrently. This can happen if the caller loses
                // connectivity while its previous poll is still running on the server. Reusing the
                // existing task ensures that the queued messages are consumed only once.
                return onGoingPoll;
            }

            return PollInternalAsync(ideId, waitTimeout);
        }
    }

    private async Task<List<Message>> PollInternalAsync(string ideId, TimeSpan waitTimeout)
    {
        // The message queue exists because MarkPollStart created it before polling.
        var onGoingPoll = _messagesQueues[ideId].WaitOrTimeout(waitTimeout);
        _onGoingPolls[ideId] = onGoingPoll;

        try
        {
            return await onGoingPoll;
        }
        finally
        {
            lock (_messagesQueues)
            {
                _onGoingPolls.Remove(ideId);
            }
        }
    }

    // Inactive pollers are detected by the LastPollTime of each queue.
    // This is not 100% air-tight because a poll could still be in progress after 10 minutes if something
    // really blocks it, but given the code we execute I don't see it possible in practice.
    // Inactive senders are detected by _lastMessageTime.
    // If neither are active then the topic is considered inactive.
    public void Cleanup(TimeSpan inactivityTimeout)
    {
        foreach (var kvp in _messagesQueues)
        {
            if (kvp.Value.LastPollTime.Add(inactivityTimeout) <= DateTimeOffset.UtcNow)
            {
                _messagesQueues.Remove(kvp.Key);
            }
        }
        
        IsActive = _messagesQueues.Count != 0 || _lastMessageTime + inactivityTimeout > DateTimeOffset.UtcNow;
    }
}
