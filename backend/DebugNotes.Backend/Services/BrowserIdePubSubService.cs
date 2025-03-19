namespace DebugNotes.Backend.Services;

public class BrowserIdePubSubService(string userId)
{
    private string _userId = userId;
    
    private readonly PubSubQueue _ideSubscribers = new PubSubQueue(type: "IDE", userId: userId);
    private readonly PubSubQueue _browserSubscribers = new PubSubQueue(type: "Browser", userId: userId);
    
    public Task IdeSendMessageAsync(string ideId, string message)
    {
        // IDE sends message => browser subscribers
        return _browserSubscribers.SendMessageAsync(message);
    }

    public Task<(SubscriberStateType, string)> IdeWaitForMessageAsync(string ideId, bool connect)
    {
        // IDE waits for message => IDE subscribers
        return _ideSubscribers.WaitForMessageAsync(ideId, connect);
    }

    public Task<SubscriberStateType> IdeAckDeconnection(string ideId)
    {
        // IDE acknowledges deconnection => IDE subscribers
        return _ideSubscribers.AckDeconnection(ideId);
    }
    
    public Task BrowserSendMessageAsync(string browserId, string message)
    {
        // Browser sends message => IDE subscribers
        return _ideSubscribers.SendMessageAsync(message);
    }

    public Task<(SubscriberStateType, string)> BrowserWaitForMessageAsync(string browserId, bool connect)
    {
        // Browser waits for message => Browser subscribers
        return _browserSubscribers.WaitForMessageAsync(browserId, connect);
    }

    public Task<SubscriberStateType> BrowserAckDeconnection(string browserId)
    {
        // Browser acknowledges deconnection => Browser subscribers
        return _browserSubscribers.AckDeconnection(browserId);
    }
}