using DebugNotes.Backend.Services;
using Microsoft.OpenApi.Models;
using NLog.Extensions.Logging;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddLogging(logging =>
{
    logging.ClearProviders();
});
builder.Services.AddSingleton<ILoggerProvider, NLogLoggerProvider>();
builder.Services.AddSingleton<DebugNotesService>();
builder.Services.AddControllers();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Debug Notes Backend", Version = "v1" });
});
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: "AllowAll",
        policy => { policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader(); });
});

var app = builder.Build();

var debugNotesService = app.Services.GetRequiredService<DebugNotesService>();
debugNotesService.Start();
app.Lifetime.ApplicationStopping.Register(debugNotesService.Stop);

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "V1");
        c.RoutePrefix = "swagger"; // Serve Swagger at root
    });
}
app.UseStaticFiles();
app.UseRouting();
app.UseAuthorization();
app.UseCors("AllowAll");
app.MapGet("/status", () => Results.Text("ok"));
app.MapControllers();
app.Run();

public partial class Program;
