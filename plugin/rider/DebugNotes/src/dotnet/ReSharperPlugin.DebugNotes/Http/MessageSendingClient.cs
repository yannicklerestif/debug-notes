using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using ReSharperPlugin.DebugNotes.Rider.Model;

namespace ReSharperPlugin.DebugNotes.Http;

public class MessageSendingClient(HttpClientFactory _factory)
{
    public async Task SendCallMessage(string userId, string ideId, Call call)
    {
        await SendMessage(userId, ideId, call);
    }
    
    public async Task SendMethodMessage(string userId, string ideId, MethodStructure methodStructure)
    {
        await SendMessage(userId, ideId, methodStructure);
    }
    
    private async Task SendMessage(string userId, string ideId, object payload)
    {
        var client = _factory.GetClient();
        var message = JsonConvert.SerializeObject(payload);
        var content = new StringContent(message, Encoding.UTF8, "application/json");
        var response = await client.PostAsync($"api/Ide/send_message?userId={userId}&ideId={ideId}", content);
        response.EnsureSuccessStatusCode();
    }
}