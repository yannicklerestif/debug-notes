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

        public void SendMethodStructure(MethodStructure structure)
        {
            _model.MethodStructure.Fire(structure);
        }
    }
}