using System;
using System.Net;
using System.Net.Http;

namespace ReSharperPlugin.DebugNotes.Http;

public class HttpClientFactory : IDisposable
{
    private HttpClientHandler _httpClientHandler;
    private DateTimeOffset _lastHttpClientHandlerCreationTime = DateTimeOffset.MinValue;
    private const string BaseAddress = "http://localhost:5151/api";
    private static readonly TimeSpan HttpClientHandlerTtl = TimeSpan.FromMinutes(5);

    public HttpClient GetClient()
    {
        if (DateTimeOffset.UtcNow > _lastHttpClientHandlerCreationTime + HttpClientHandlerTtl)
        {
            _httpClientHandler?.Dispose();
            _httpClientHandler = new HttpClientHandler
            {
                AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate
            };
            _lastHttpClientHandlerCreationTime = DateTimeOffset.UtcNow;
        }

        return new HttpClient(_httpClientHandler)
        {
            BaseAddress = new Uri(BaseAddress),
            Timeout = TimeSpan.FromMinutes(2)
        };
    }

    public void Dispose()
    {
        _httpClientHandler.Dispose();
    }
}