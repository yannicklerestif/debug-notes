using System.Text.Json;
using NLog;
using LogLevel = NLog.LogLevel;

namespace DebugNotes.Backend.Services;

public class PubSubQueue(string type, string userId)
{
    private string _userId = userId;
    private string _type = type;

    private static Logger Logger = LogManager.GetCurrentClassLogger();
    
    private readonly Dictionary<string, SubscriberState> _subscribers = new();

    public Task SendMessageAsync(JsonElement message)
    {
        lock (_subscribers)
        {
            // Look for the current subscriber, send the result
            foreach (var (subscriberId, subscriberState) in _subscribers)
            {
                if (subscriberState.StateType == SubscriberStateType.Current)
                {
                    subscriberState.Tcs.SetResult((SubscriberStateType.Current, message));
                }
            }
        }

        return Task.CompletedTask;
    }

    public Task<(SubscriberStateType, JsonElement)> WaitForMessageAsync(string subscriberId, bool connect)
    {
        lock (_subscribers)
        {
            bool subscriberAlreadyExists = _subscribers.TryGetValue(subscriberId, out var subscriber);
            // If the subscriber explicitly asked to connect, connect it.
            // If the subscriber is not already the current subscriber, but it shouldn't be disconnected either,
            // give it the benefit of the doubt and consider that it's starting a connection
            if (connect || !subscriberAlreadyExists)
            {
                StartConnection(subscriberId);
                return WaitOrTimeout(_subscribers[subscriberId].Tcs.Task);
            }
            
            // The subscriber is not current: kick it
            // This can happen if another subscriber connected and tried to kick it but failed because the
            // first subscriber had connectivity issues
            if (subscriber.StateType != SubscriberStateType.Current)
            {
                return Task.FromResult((SubscriberStateType.ShouldDisconnect, JsonDocument.Parse("null").RootElement));
            }
            
            // Otherwise we're simply renewing the lease, just renew the tcs
            subscriber.Tcs = new TaskCompletionSource<(SubscriberStateType state, JsonElement message)>();
            return WaitOrTimeout(_subscribers[subscriberId].Tcs.Task);
        }
    }

    public Task<SubscriberStateType> AckDeconnection(string subscriberId)
    {
        lock (_subscribers)
        {
            Logger.Log(LogLevel.Info, $" {_type} | {_userId} | ---> Removing subscriber {subscriberId}");
            _subscribers.Remove(subscriberId, out var _);
            return Task.FromResult(SubscriberStateType.Disconnected);
        }
    }
    
    private void StartConnection(string subscriberId)
    {
        Logger.Log(LogLevel.Info, $" {_type} | {_userId} | Starting connection for subscriber {subscriberId}");
        
        // Disconnect other subscribers
        foreach (var kvp in _subscribers)
        {
            if (kvp.Key == subscriberId)
            {
                continue;
            }
            // If the subscriber is still listening, tell them to disconnect
            kvp.Value.Tcs.TrySetResult((SubscriberStateType.ShouldDisconnect, JsonDocument.Parse("null").RootElement));
            if (kvp.Value.StateType != SubscriberStateType.ShouldDisconnect)
            {
                Logger.Log(LogLevel.Info, $" {_type} | {_userId} | ---> Disconnecting subscriber {kvp.Key}");
            }
            kvp.Value.StateType = SubscriberStateType.ShouldDisconnect;
        }
        // Make the subscriber current
        _subscribers[subscriberId] = new SubscriberState
        {
            StateType = SubscriberStateType.Current,
            Tcs = new TaskCompletionSource<(SubscriberStateType state, JsonElement message)>()
        };
    }

    private async Task<(SubscriberStateType, JsonElement)> WaitOrTimeout(Task<(SubscriberStateType, JsonElement)> originalTask)
    {
        try
        {
            return await originalTask.WaitAsync(TimeSpan.FromMinutes(1));
        }
        catch (TimeoutException e)
        {
            return (SubscriberStateType.Current, JsonDocument.Parse("null").RootElement);
        }
    }
}