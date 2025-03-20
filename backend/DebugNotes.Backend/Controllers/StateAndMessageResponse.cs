using System.Text.Json;
using DebugNotes.Backend.Services;

namespace DebugNotes.Backend.Controllers;

public class StateAndMessageResponse
{
    public SubscriberStateType State { get; set; }
    public JsonElement Message { get; set; }
}