using System.Collections.Concurrent;
using NLog;
using LogLevel = NLog.LogLevel;

namespace DebugNotes.Backend.Services;

public class UserTopics(string userId, ConcurrentDictionary<string, UserTopics> usersTopics)
{
    private static Logger Logger = LogManager.GetCurrentClassLogger();

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

            _browsersTopic.MarkPollStart();
        }
        
        return await _browsersTopic.Poll(browserId, waitTimeout);
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

            _ideTopic.MarkPollStart(ideId);
        }

        return await _ideTopic.PollAsync(ideId, waitTimeout);
    }

    public void Cleanup(TimeSpan inactivityTimeout)
    {
        lock (_userLock)
        {
            if (WasDeleted)
            {
                throw new UserTopicsDeletedException();
            }
            
            // Cleanup both topics
            _browsersTopic.Cleanup(inactivityTimeout);
            _ideTopic.Cleanup(inactivityTimeout);

            // if browsersTopic and ideTopic have had no activity in the last 10 minutes,
            // remove the whole UserTopics object
            if (!_browsersTopic.IsActive && !_ideTopic.IsActive)
            {
                if (!usersTopics.TryRemove(userId, out _))
                {
                    // If we couldn't remove the UserTopics object, don't flag it as deleted,
                    // so we can continue to use it and have a chance to delete it later
                    Logger.Log(LogLevel.Error, $"UserTopics cleanup failed: {userId}");
                }
                else
                {
                    WasDeleted = true;
                }
            }
        }
    }
}