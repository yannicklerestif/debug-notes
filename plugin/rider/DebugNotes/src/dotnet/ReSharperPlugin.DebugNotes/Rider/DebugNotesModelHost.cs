using System;
using System.Linq;
using JetBrains.Application.Threading.Tasks;
using JetBrains.Lifetimes;
using JetBrains.Platform.MsBuildTask.Utils;
using JetBrains.ProjectModel;
using JetBrains.Rider.Model;

namespace ReSharperPlugin.DebugNotes.Rider.Model
{
    [SolutionComponent]
    public class DebugNotesModelHost
    {
        private readonly DebugNotesModel model;
        public DebugNotesModelHost(SolutionModel solutionModel)
        {
            // TODO upgrade to 2022.1, use TryGetSolution or GetProtocolSolution
            var rdSolution = solutionModel.Solutions.First().Value;
            if (rdSolution != null)
            {
                model = rdSolution.GetDebugNotesModel();
            }
        }

        public void SendMyStructure(MyStructure structure)
        {
            model.MyStructure.Fire(structure);
        }
    }
}