using System.Text.Json;
using DebugNotes.Backend.Services;
using NUnit.Framework;

namespace DebugNotes.Backend.Test;

public class IdeTopicTests
{
    [Test]
    public async Task ConcurrentPollsForTheSameIde_ShareOnePoll()
    {
        var topic = new IdeTopic("user-1");
        topic.MarkPollStart("ide-1");

        var firstPoll = topic.PollAsync("ide-1", TimeSpan.FromSeconds(5));
        var duplicatePoll = topic.PollAsync("ide-1", TimeSpan.FromSeconds(5));

        var message = new Message(
            JsonSerializer.SerializeToElement(new { text = "hello" }),
            DateTimeOffset.UtcNow);
        topic.BroadcastMessage(message);

        var firstResult = await firstPoll;
        var duplicateResult = await duplicatePoll;

        Assert.Multiple(() =>
        {
            Assert.That(duplicateResult, Is.SameAs(firstResult));
            Assert.That(firstResult, Has.Count.EqualTo(1));
            Assert.That(firstResult[0], Is.SameAs(message));
        });
    }
}
