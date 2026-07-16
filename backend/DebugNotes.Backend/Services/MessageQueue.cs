using System.Threading.Channels;

namespace DebugNotes.Backend.Services;

/// <summary>
/// A single queue, containing the messages for a given user and subscriber.
/// </summary>
public class MessageQueue
{
    private readonly Channel<Message> _channel = Channel.CreateUnbounded<Message>();
    public DateTimeOffset LastPollTime { get; private set; } = DateTimeOffset.MinValue;

    public void MarkPollStart()
    {
        LastPollTime = DateTimeOffset.UtcNow;
    }

    // TODO: Remember if a poll is ongoing to prevent another concurrent poll if poller has connectivity issues
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

    public void SendMessage(Message message)
    {
        // The channel is unbounded so TryWrite should never fail
        _channel.Writer.TryWrite(message);
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

    public void Cleanup(TimeSpan inactivityTimeout)
    {
        while (true)
        {
            // TODO: Check what a false return value means. I'm assuming it means no message is available.
            if (!_channel.Reader.TryPeek(out var message))
            {
                break;
            }
            
            if (!(message.CreationTime + inactivityTimeout <= DateTimeOffset.UtcNow))
            {
                break;
            }
            
            _channel.Reader.TryRead(out _);
        }
    }

    // TODO: Check that my channel can count. If not, use TryPeek that should be more easily available.
    public bool IsEmpty()
    {
        return _channel.Reader.Count == 0;
    }
}
