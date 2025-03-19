namespace DebugNotes.Backend.Services;

public class SubscriberState
{
    public SubscriberStateType StateType { get; set; }
    public TaskCompletionSource<(SubscriberStateType state, string message)> Tcs { get; set; }
}