namespace DebugNotes.Backend.Services;

/// <summary>
/// The queues for a topic (i.e. for a user token + a given direction
/// (i.e. diagram -> client, or client -> diagram)
/// </summary>
public class BrowserTopic(string userId)
{
    private MessageQueue _messagesQueue = new MessageQueue();
    private Task<List<Message>>? _onGoingPoll = null;
    private string? _onGoingPoller = null;
    
    public void SendMessage(Message message)
    {
        _messagesQueue.SendMessage(message);
    }
    
    public Task<List<Message>> Poll(string browserId, TimeSpan waitTimeout)
    {
        lock (_messagesQueue)
        {
            if (_onGoingPoll != null)
            {
                if (_onGoingPoller == browserId)
                {
                    // The same browser is polling twice concurrently.
                    // This might happen in case of connectivity issues (e.g. the caller lost connectivity so its
                    // task returned on its side, but it's still going on the server side).
                    // In any case, there must be only one poll on the client side, because they should poll in a
                    // loop.
                    // So if that happens, we return the task of the already existing poll, thus making sure that
                    // the client receives the messages exactly once.
                    return _onGoingPoll;
                }
                else
                {
                    // Someone is already waiting on the queue. We want to deliver the messages only once, so we
                    // don't return anything to this poller.
                    return Task.Delay(waitTimeout).ContinueWith(_ => new List<Message>());
                }
            }

            _onGoingPoller = browserId;
            _onGoingPoll = _messagesQueue.WaitOrTimeout(waitTimeout);
            return _onGoingPoll;
        }
    }
}
