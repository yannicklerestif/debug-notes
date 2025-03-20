using System.Text.Json;

namespace DebugNotes.Backend.Services;

public interface IBrowserIdePubSubServices
{
    Task IdeSendMessageAsync(string userId, string ideId, JsonElement message);
    Task<(SubscriberStateType, JsonElement)> IdeWaitForMessageAsync(string userId, string ideId, bool connect);
    Task<SubscriberStateType> IdeAckDeconnection(string userId, string ideId);
    Task BrowserSendMessageAsync(string userId, string browserId, JsonElement message);
    Task<(SubscriberStateType, JsonElement)> BrowserWaitForMessageAsync(string userId, string browserId, bool connect);
    Task<SubscriberStateType> BrowserAckDeconnection(string userId, string browserId);

}