using JetBrains.RdBackend.Common.Features;
using JetBrains.ProjectModel;

namespace ReSharperPlugin.DebugNotes.Rider.Model
{
    [SolutionComponent]
    public class DebugNotesModelHost
    {
        private readonly DebugNotesModel _model;
        public DebugNotesModelHost(ISolution solution)
        {
            var rdSolution = solution.GetProtocolSolution();
            _model = rdSolution.GetDebugNotesModel();
        }

        public void SendCall(MethodStructure method, MethodStructure parent)
        {
            _model.Call.Fire(new Call(method, parent));
        }

        public void SendMethod(MethodStructure method)
        {
            _model.Method.Fire(method);
        }
    }
}