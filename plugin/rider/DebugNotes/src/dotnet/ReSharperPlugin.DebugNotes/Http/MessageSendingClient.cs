using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using ReSharperPlugin.DebugNotes.Rider.Model;

namespace ReSharperPlugin.DebugNotes.Http;

public class MessageSendingClient(HttpClientFactory _factory)
{
    public async Task SendCallMessage(string userId, Call call)
    {
        await SendMessage(userId, call);
    }
    
    public async Task SendMethodMessage(string userId, MethodStructure methodStructure)
    {
        await SendMessage(userId, methodStructure);
    }
    
    private async Task SendMessage(string userId, object payload)
    {
        var client = _factory.GetClient();
        var message = JsonConvert.SerializeObject(payload);
        var content = new StringContent(message, Encoding.UTF8, "application/json");
        var response = await client.PostAsync($"api/browser/messages?userId={userId}", content);
        response.EnsureSuccessStatusCode();
    }
}
