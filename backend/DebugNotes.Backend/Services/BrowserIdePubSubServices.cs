namespace DebugNotes.Backend.Services;

public class BrowserIdePubSubServices : IBrowserIdePubSubServices
{
    Dictionary<string, BrowserIdePubSubService> _services = new Dictionary<string, BrowserIdePubSubService>();

    public Task IdeSendMessageAsync(string userId, string ideId, string message)
    {
        var service = GetOrCreateService(userId);
        return service.IdeSendMessageAsync(ideId, message);
    }

    public Task<(SubscriberStateType, string)> IdeWaitForMessageAsync(string userId, string ideId, bool connect)
    {
        var service = GetOrCreateService(userId);
        return service.IdeWaitForMessageAsync(ideId, connect);
    }

    public Task<SubscriberStateType> IdeAckDeconnection(string userId, string ideId)
    {
        var service = GetOrCreateService(userId);
        return service.IdeAckDeconnection(ideId);
    }

    public Task BrowserSendMessageAsync(string userId, string browserId, string message)
    {
        var service = GetOrCreateService(userId);
        return service.BrowserSendMessageAsync(browserId, message);
    }

    public Task<(SubscriberStateType, string)> BrowserWaitForMessageAsync(string userId, string browserId, bool connect)
    {
        var service = GetOrCreateService(userId);
        return service.BrowserWaitForMessageAsync(browserId, connect);
    }

    public Task<SubscriberStateType> BrowserAckDeconnection(string userId, string browserId)
    {
        var service = GetOrCreateService(userId);
        return service.BrowserAckDeconnection(browserId);
    }

    private BrowserIdePubSubService GetOrCreateService(string userId)
    {
        lock (_services) {
            if (!_services.TryGetValue(userId, out var service)) {
                service = new BrowserIdePubSubService(userId);
                _services[userId] = service;
            }
            return service;
        }
    }
}