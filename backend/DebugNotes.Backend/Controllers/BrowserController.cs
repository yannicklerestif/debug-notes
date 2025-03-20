using System.Text.Json;
using DebugNotes.Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace DebugNotes.Backend.Controllers;

[Route("api/[controller]")]
public class BrowserController : ControllerBase
{
    private readonly IBrowserIdePubSubServices _service;

    public BrowserController(IBrowserIdePubSubServices service)
    {
        _service = service;
    }

    [HttpPost("send_message")]
    public async Task<ActionResult<string>> SendMessage([FromQuery] string userId, [FromQuery] string browserId, [FromBody] JsonElement message)
    {
        await _service.BrowserSendMessageAsync(userId, browserId, message);
        return Ok("Message sent successfully");
    }

    [HttpGet("wait_for_message")]
    public async Task<ActionResult<StateAndMessageResponse>> WaitForMessageAsync([FromQuery] string userId, [FromQuery] string browserId, bool connect)
    {
        var result = await _service.BrowserWaitForMessageAsync(userId, browserId, connect);
        return Ok(new StateAndMessageResponse { State = result.Item1, Message = result.Item2 });
    }

    [HttpGet("ack_deconnection")]
    public async Task<ActionResult<StateAndMessageResponse>> AckDeconnection([FromQuery] string userId, [FromQuery] string browserId)
    {
        var result = await _service.BrowserAckDeconnection(userId, browserId);
        return Ok(new StateAndMessageResponse { State = result });
    }
}