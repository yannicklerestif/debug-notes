using JetBrains.Application.DataContext;
using JetBrains.Application.UI.Actions;
using JetBrains.Application.UI.ActionsRevised.Menu;
using JetBrains.ProjectModel;

namespace ReSharperPlugin.DebugNotes.Rider.Model
{
    [Action("DebugNotesActionWindow", "Open Debug Notes Window")]
    public class DebugNotesAction : IExecutableAction
    {
        public bool Update(IDataContext context, ActionPresentation presentation, DelegateUpdate nextUpdate)
        {
            return true;

        }

        public void Execute(IDataContext context, DelegateExecute nextExecute)
        {
            var solution = context.GetComponent<ISolution>();
            var debugModelHost = solution.GetComponent<DebugNotesModelHost>();
            debugModelHost.SendMyStructure(new MyStructure("ce file.txt", "lui"));
        }
    }
}