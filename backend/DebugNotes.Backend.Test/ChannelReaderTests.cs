using System.Threading.Channels;
using NUnit.Framework;

namespace DebugNotes.Backend.Test;

public class ChannelReaderTests
{
    [Test]
    public void UnboundedChannel_WithMultipleWritersAndReaders_SupportsCountAndPeek()
    {
        var channel = Channel.CreateUnbounded<int>(new UnboundedChannelOptions
        {
            SingleReader = false,
            SingleWriter = false
        });

        Assert.Multiple(() =>
        {
            Assert.That(channel.Reader.CanCount, Is.True);
            Assert.That(channel.Reader.CanPeek, Is.True);
            Assert.That(channel.Reader.Count, Is.Zero);
            Assert.That(channel.Reader.TryPeek(out _), Is.False);
        });

        Assert.That(channel.Writer.TryWrite(42), Is.True);
        Assert.That(channel.Reader.TryPeek(out var peekedValue), Is.True);

        Assert.Multiple(() =>
        {
            Assert.That(channel.Reader.Count, Is.EqualTo(1));
            Assert.That(peekedValue, Is.EqualTo(42));
        });

        Assert.That(channel.Reader.TryRead(out var readValue), Is.True);

        Assert.Multiple(() =>
        {
            Assert.That(readValue, Is.EqualTo(42));
            Assert.That(channel.Reader.Count, Is.Zero);
            Assert.That(channel.Reader.TryPeek(out _), Is.False);
        });
    }
}
