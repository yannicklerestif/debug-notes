using System.Text.Json;

namespace DebugNotes.Backend.Services;

public class SubscriberState
{
    public SubscriberStateType StateType { get; set; }
    public TaskCompletionSource<(SubscriberStateType state, JsonElement message)> Tcs { get; set; }
}