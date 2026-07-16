using System.Text.Json;

namespace DebugNotes.Backend.Services;

public class Message(JsonElement payload, DateTimeOffset creationTime)
{
    public JsonElement Payload { get; } = payload;
    public DateTimeOffset CreationTime { get; } = creationTime;
}
