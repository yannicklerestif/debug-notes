using System.Threading.Channels;

namespace DebugNotes.Backend.Services;

/// <summary>
/// A single queue, containing the messages for a given user and subscriber.
/// </summary>
public class MessageQueue
{
    private readonly Channel<Message> _channel = Channel.CreateUnbounded<Message>();

    public DateTimeOffset CreationTime { get; } = DateTimeOffset.UtcNow;

    public async Task<List<Message>> WaitOrTimeout(TimeSpan waitTimeout)
    {
        var messages = DrainMessages();
        if (messages.Count > 0)
        {
            return messages;
        }

        using var timeoutCancellation = new CancellationTokenSource(waitTimeout);

        try
        {
            if (!await _channel.Reader.WaitToReadAsync(timeoutCancellation.Token))
            {
                // The channel was closed, there is nothing to return
                return [];
            }
        }
        catch (OperationCanceledException) when (timeoutCancellation.IsCancellationRequested)
        {
            // The query timed out before there was a message: nothing to return
            return [];
        }

        // Otherwise return whatever is in the channel
        return DrainMessages();
    }

    public ValueTask SendMessage(Message message)
    {
        return _channel.Writer.WriteAsync(message);
    }

    private List<Message> DrainMessages()
    {
        var messages = new List<Message>();
        while (_channel.Reader.TryRead(out var message))
        {
            messages.Add(message);
        }

        return messages;
    }
}
