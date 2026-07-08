using System.Text.Json;

namespace DebugNotes.Backend.Services;

public class Message
{
    public JsonElement Payload { get; set; }
}