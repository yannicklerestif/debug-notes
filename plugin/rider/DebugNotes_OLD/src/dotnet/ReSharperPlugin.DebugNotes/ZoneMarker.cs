using JetBrains.Application.BuildScript.Application.Zones;

namespace ReSharperPlugin.DebugNotes
{
    [ZoneMarker]
    public class ZoneMarker : IRequire<IDebugNotesZone>
    {
    }
}