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
    public IActionResult SendMessageToBrowser([FromQuery] string userId, [FromBody] Message message)
    {
        _service.SendMessageToBrowser(userId, message);
        return NoContent();
    }

    [HttpGet("browser/messages")]
    public async Task<ActionResult<List<Message>>> PollBrowserMessages(
        [FromQuery] string userId,
        [FromQuery] string browserId)
    {
        return Ok(await _service.PollBrowserMessages(userId, browserId));
    }

    [HttpPost("ide/messages")]
    public IActionResult SendMessageToIde([FromQuery] string userId, [FromBody] Message message)
    {
        _service.SendMessageToIde(userId, message);
        return NoContent();
    }

    [HttpGet("ide/messages")]
    public async Task<ActionResult<List<Message>>> PollIdeMessagesAsync(
        [FromQuery] string userId,
        [FromQuery] string ideId)
    {
        return Ok(await _service.PollIdeMessagesAsync(userId, ideId));
    }
}
