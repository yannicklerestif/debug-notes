using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using NUnit.Framework;

namespace DebugNotes.Backend.Test;

public class EndToEndTest
{
    private WebApplicationFactory<Program> _factory = null!;

    [SetUp]
    public void SetUp()
    {
        _factory = new WebApplicationFactory<Program>();
    }

    [TearDown]
    public void TearDown()
    {
        _factory.Dispose();
    }

    [Test]
    public async Task Browser_CanReceiveAMessageSentBeforePolling()
    {
        using var client = _factory.CreateClient();
        var payload = CreatePayload("hello browser");

        TestContext.Progress.WriteLine(
            $"[Browser] Sending payload: {payload.GetRawText()}");
        using var sendResponse = await client.PostAsJsonAsync(
            "/api/browser/messages?userId=browser-test-user",
            payload);
        TestContext.Progress.WriteLine(
            $"[Browser] Send response: {(int)sendResponse.StatusCode} {sendResponse.StatusCode}");

        Assert.That(sendResponse.StatusCode, Is.EqualTo(HttpStatusCode.NoContent));

        TestContext.Progress.WriteLine("[Browser] Polling as browser-1");
        using var pollResponse = await client.GetAsync(
            "/api/browser/messages?userId=browser-test-user&browserId=browser-1");
        var receivedPayloads = await pollResponse.Content.ReadFromJsonAsync<List<JsonElement>>();
        TestContext.Progress.WriteLine(
            $"[Browser] Poll response: {(int)pollResponse.StatusCode} {pollResponse.StatusCode}; " +
            $"payloads: {JsonSerializer.Serialize(receivedPayloads)}");

        Assert.That(pollResponse.StatusCode, Is.EqualTo(HttpStatusCode.OK));
        Assert.That(receivedPayloads, Has.Count.EqualTo(1));
        AssertPayload(receivedPayloads![0], payload);
    }

    [Test]
    public async Task TwoIdesPollingBeforeSend_BothReceiveTheMessage()
    {
        using var ide1Client = _factory.CreateClient();
        using var ide2Client = _factory.CreateClient();
        using var senderClient = _factory.CreateClient();

        TestContext.Progress.WriteLine("[IDEs] Starting polls for ide-1 and ide-2");
        var ide1Poll = ide1Client.GetAsync(
            "/api/ide/messages?userId=ide-test-user&ideId=ide-1");
        var ide2Poll = ide2Client.GetAsync(
            "/api/ide/messages?userId=ide-test-user&ideId=ide-2");

        // Give both requests time to reach the controller and register their IDE queues.
        await Task.Delay(TimeSpan.FromMilliseconds(250));

        var payload = CreatePayload("hello IDEs");
        TestContext.Progress.WriteLine(
            $"[IDEs] Sending payload after both polls started: {payload.GetRawText()}");
        using var sendResponse = await senderClient.PostAsJsonAsync(
            "/api/ide/messages?userId=ide-test-user",
            payload);
        TestContext.Progress.WriteLine(
            $"[IDEs] Send response: {(int)sendResponse.StatusCode} {sendResponse.StatusCode}");

        Assert.That(sendResponse.StatusCode, Is.EqualTo(HttpStatusCode.NoContent));

        var pollResponses = await Task.WhenAll(ide1Poll, ide2Poll)
            .WaitAsync(TimeSpan.FromSeconds(5));
        using var ide1Response = pollResponses[0];
        using var ide2Response = pollResponses[1];
        var ide1Payloads = await ide1Response.Content.ReadFromJsonAsync<List<JsonElement>>();
        var ide2Payloads = await ide2Response.Content.ReadFromJsonAsync<List<JsonElement>>();

        TestContext.Progress.WriteLine(
            $"[IDEs] ide-1 response: {(int)ide1Response.StatusCode} {ide1Response.StatusCode}; " +
            $"payloads: {JsonSerializer.Serialize(ide1Payloads)}");
        TestContext.Progress.WriteLine(
            $"[IDEs] ide-2 response: {(int)ide2Response.StatusCode} {ide2Response.StatusCode}; " +
            $"payloads: {JsonSerializer.Serialize(ide2Payloads)}");

        Assert.Multiple(() =>
        {
            Assert.That(ide1Response.StatusCode, Is.EqualTo(HttpStatusCode.OK));
            Assert.That(ide2Response.StatusCode, Is.EqualTo(HttpStatusCode.OK));
            Assert.That(ide1Payloads, Has.Count.EqualTo(1));
            Assert.That(ide2Payloads, Has.Count.EqualTo(1));
        });
        AssertPayload(ide1Payloads![0], payload);
        AssertPayload(ide2Payloads![0], payload);
    }

    private static JsonElement CreatePayload(string text)
    {
        return JsonSerializer.SerializeToElement(new { text });
    }

    private static void AssertPayload(JsonElement actual, JsonElement expected)
    {
        Assert.That(actual.GetRawText(), Is.EqualTo(expected.GetRawText()));
    }
}
