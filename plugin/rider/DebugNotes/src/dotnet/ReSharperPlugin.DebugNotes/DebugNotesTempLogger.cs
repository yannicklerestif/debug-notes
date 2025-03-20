using System;
using System.IO;

namespace ReSharperPlugin.DebugNotes;

public static class DebugNotesTempLogger
{
    private const string FileName = "/Users/y.lerestif/repos/debug-notes/debugNotes.log";
    
    public static void Log(string message)
    {
        File.AppendAllText(FileName, $"[{DateTimeOffset.UtcNow}] {message} \n");
    }
}