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
        GetOrCreateUserTopics(userId).SendMessageToBrowser(message);
    }

    public Task<List<Message>> PollBrowserMessages(string userId, string browserId)
    {
        return GetOrCreateUserTopics(userId).PollBrowserMessages(browserId, WaitTimeout);
    }

    public void SendMessageToIde(string userId, Message message)
    {
        GetOrCreateUserTopics(userId).SendMessageToide(message);
    }

    public Task<List<Message>> PollIdeMessagesAsync(string userId, string ideId)
    {
        return GetOrCreateUserTopics(userId).PollIdeMessagesAsync(ideId, WaitTimeout);
    }
    
    private UserTopics GetOrCreateUserTopics(string userId)
    {
        return _usersTopics.GetOrAdd(userId, _ =>  new UserTopics(userId));
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

    private async Task Cleanup()
    {
        foreach (var userId in _usersTopics.Keys)
        {
            if (!_usersTopics.TryGetValue(userId, out var userTopics))
            {
                // The key was removed while we were iterating: ignoring.
                continue;
            }

            userTopics.Cleanup();
        }
    }
}