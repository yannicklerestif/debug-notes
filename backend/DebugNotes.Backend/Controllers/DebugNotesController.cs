using System.Text.Json;
using DebugNotes.Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace DebugNotes.Backend.Controllers;

[ApiController]
[Route("api")]
public class DebugNotesController : ControllerBase
{
    private readonly DebugNotesService _service;

    public DebugNotesController(DebugNotesService service)
    {
        _service = service;
    }

    [HttpPost("browser/messages")]
    public IActionResult SendMessageToBrowser([FromQuery] string userId, [FromBody] JsonElement payload)
    {
        _service.SendMessageToBrowser(
            userId,
            new Message(payload.Clone(), DateTimeOffset.UtcNow));
        return NoContent();
    }

    [HttpGet("browser/messages")]
    public async Task<ActionResult<List<JsonElement>>> PollBrowserMessages(
        [FromQuery] string userId,
        [FromQuery] string browserId)
    {
        var messages = await _service.PollBrowserMessages(userId, browserId);
        return Ok(messages.Select(message => message.Payload).ToList());
    }

    [HttpPost("ide/messages")]
    public IActionResult SendMessageToIde([FromQuery] string userId, [FromBody] JsonElement payload)
    {
        _service.SendMessageToIde(
            userId,
            new Message(payload.Clone(), DateTimeOffset.UtcNow));
        return NoContent();
    }

    [HttpGet("ide/messages")]
    public async Task<ActionResult<List<JsonElement>>> PollIdeMessagesAsync(
        [FromQuery] string userId,
        [FromQuery] string ideId)
    {
        var messages = await _service.PollIdeMessagesAsync(userId, ideId);
        return Ok(messages.Select(message => message.Payload).ToList());
    }
}
