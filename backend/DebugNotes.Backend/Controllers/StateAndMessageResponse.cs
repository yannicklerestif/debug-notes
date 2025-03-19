using DebugNotes.Backend.Services;

namespace DebugNotes.Backend.Controllers;

public class StateAndMessageResponse
{
    public SubscriberStateType State { get; set; }
    public string Message { get; set; }
}