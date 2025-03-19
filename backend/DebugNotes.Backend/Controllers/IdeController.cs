using DebugNotes.Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace DebugNotes.Backend.Controllers;

[Route("api/[controller]")]
public class IdeController : ControllerBase
{
    private readonly IBrowserIdePubSubServices _service;

    public IdeController(IBrowserIdePubSubServices service)
    {
        _service = service;
    }

    [HttpPost("send_message")]
    public async Task<ActionResult<string>> SendMessage([FromQuery] string userId, [FromQuery] string ideId, [FromBody] string message)
    {
        await _service.IdeSendMessageAsync(userId, ideId, message);
        return Ok("Message sent successfully");
    }
    
    [HttpGet("wait_for_message")]
    public async Task<ActionResult<StateAndMessageResponse>> WaitForMessageAsync([FromQuery] string userId, [FromQuery] string ideId, bool connect)
    {
        var result = await _service.IdeWaitForMessageAsync(userId, ideId, connect);
        return Ok(new StateAndMessageResponse { State = result.Item1, Message = result.Item2 });
    }
    
    [HttpGet("ack_deconnection")]
    public async Task<ActionResult<StateAndMessageResponse>> AckDeconnection([FromQuery] string userId, [FromQuery] string ideId)
    {
        var result = await _service.IdeAckDeconnection(userId, ideId);
        return Ok(new StateAndMessageResponse { State = result });
    }
}