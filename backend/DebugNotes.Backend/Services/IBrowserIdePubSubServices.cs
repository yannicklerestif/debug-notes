namespace DebugNotes.Backend.Services;

public interface IBrowserIdePubSubServices
{
    Task IdeSendMessageAsync(string userId, string ideId, string message);
    Task<(SubscriberStateType, string)> IdeWaitForMessageAsync(string userId, string ideId, bool connect);
    Task<SubscriberStateType> IdeAckDeconnection(string userId, string ideId);
    Task BrowserSendMessageAsync(string userId, string browserId, string message);
    Task<(SubscriberStateType, string)> BrowserWaitForMessageAsync(string userId, string browserId, bool connect);
    Task<SubscriberStateType> BrowserAckDeconnection(string userId, string browserId);

}