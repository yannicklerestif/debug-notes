namespace DebugNotes.Backend.Services;

public class UserTopics(string userId)
{
    private readonly BrowserTopic _browsersTopic = new (userId);
    private readonly IdeTopic _ideTopic = new (userId);

    private readonly object _userLock = new ();

    private bool WasDeleted { get; set; } = false;
    
    public void SendMessageToBrowser(Message message)
    {
        lock (_userLock)
        {
            if (WasDeleted)
            {
                throw new UserTopicsDeletedException();
            }
            
            _browsersTopic.SendMessage(message);
        }
    }

    public async Task<List<Message>> PollBrowserMessages(string browserId, TimeSpan waitTimeout)
    {
        lock (_userLock)
        {
            if (WasDeleted)
            {
                throw new UserTopicsDeletedException();
            }

            _browsersTopic.MarkPollingStart();
        }

        try
        {
            return await _browsersTopic.Poll(browserId, waitTimeout);
        }
        finally
        {
            lock (_userLock)
            {
                _browsersTopic.MarkPollingEnd();
            }
        }
    }

    public void SendMessageToIde(Message message)
    {
        lock (_userLock)
        {
            if (WasDeleted)
            {
                throw new UserTopicsDeletedException();
            }
            
            _ideTopic.BroadcastMessage(message);
        }
    }
    
    public async Task<List<Message>> PollIdeMessagesAsync(string ideId, TimeSpan waitTimeout)
    {
        lock (_userLock)
        {
            if (WasDeleted)
            {
                throw new UserTopicsDeletedException();
            }

            _ideTopic.MarkPollingStart();
        }

        try
        {
            return await _ideTopic.PollAsync(ideId, waitTimeout);
        }
        finally
        {
            lock (_userLock)
            {
                _ideTopic.MarkPollingEnd();
            }
        }
    }

    public void Cleanup()
    {
        lock (_userLock)
        {
            if (WasDeleted)
            {
                throw new UserTopicsDeletedException();
            }

            // TODO
            throw new NotImplementedException();
            
            // Browsers topic cleanup
            // _browsersTopic.Cleanup();
            // _ideTopic.Cleanup();

            // if browsersTopic and ideTopic have had no activity in the last 10 minutes:
            // - Mark the UserTopics object as deleted
            // - Remove it from the dictionary
        }
    }
}