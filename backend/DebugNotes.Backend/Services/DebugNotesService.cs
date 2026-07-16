using System.Collections.Concurrent;
using System.Runtime.CompilerServices;
using NLog;
using LogLevel = NLog.LogLevel;

namespace DebugNotes.Backend.Services;

public class DebugNotesService
{
    private static Logger Logger = LogManager.GetCurrentClassLogger();

    private static readonly TimeSpan WaitTimeout = TimeSpan.FromSeconds(30);
    private static readonly TimeSpan InactivityTimeout = TimeSpan.FromMinutes(10);
    
    private readonly ConcurrentDictionary<string, UserTopics> _usersTopics = new();
    
    private CancellationTokenSource _cts = new();

    public void Start()
    {
        _ = StartCleaningLoop();
    }

    public void Stop()
    {
        _cts.Cancel();
    }

    public void SendMessageToBrowser(string userId, Message message)
    {
        while (true)
        {
            try
            {
                GetOrCreateUserTopics(userId).SendMessageToBrowser(message);
                break;
            }
            catch (UserTopicsDeletedException e)
            {
                Logger.Log(LogLevel.Info, "UserTopicsDeleted", e);
            }
        }
    }

    public Task<List<Message>> PollBrowserMessages(string userId, string browserId)
    {
        while (true)
        {
            try
            {
                return GetOrCreateUserTopics(userId).PollBrowserMessages(browserId, WaitTimeout);
            }
            catch (UserTopicsDeletedException e)
            {
                Logger.Log(LogLevel.Info, "UserTopicsDeleted", e);
            }
        }
    }

    public void SendMessageToIde(string userId, Message message)
    {
        while (true)
        {
            try
            {
                GetOrCreateUserTopics(userId).SendMessageToIde(message);
                break;
            }
            catch (UserTopicsDeletedException e)
            {
                Logger.Log(LogLevel.Info, "UserTopicsDeleted", e);
            }
        }
    }

    public Task<List<Message>> PollIdeMessagesAsync(string userId, string ideId)
    {
        while (true)
        {
            try
            {
                return GetOrCreateUserTopics(userId).PollIdeMessagesAsync(ideId, WaitTimeout);
            }
            catch (UserTopicsDeletedException e)
            {
                Logger.Log(LogLevel.Info, "UserTopicsDeleted", e);
            }
        }
    }
    
    private UserTopics GetOrCreateUserTopics(string userId)
    {
        return _usersTopics.GetOrAdd(userId, _ =>  new UserTopics(userId, _usersTopics));
    }
    
    private async Task StartCleaningLoop()
    {
        while (!_cts.IsCancellationRequested)
        {
            try
            {
                await Task.Delay(InactivityTimeout, _cts.Token);
                await Cleanup();
            }
            catch (OperationCanceledException _)
            {
                throw;
            }
            catch (Exception e)
            {
                Logger.Log(LogLevel.Error, $"Error during cleaning loop. Make sure to keep the loop going.", e);
            }
        }
    }

    // TODO: Adding TimeProviders and testing cleanup would be welcome.
    private async Task Cleanup()
    {
        foreach (var userId in _usersTopics.Keys)
        {
            if (!_usersTopics.TryGetValue(userId, out var userTopics))
            {
                // The key was removed while we were iterating: ignoring.
                continue;
            }

            userTopics.Cleanup(InactivityTimeout);
        }
    }
}