using JetBrains.Application.DataContext;
using JetBrains.Application.UI.Actions;
using JetBrains.Application.UI.ActionsRevised.Menu;
using JetBrains.Application.UI.ActionSystem.ActionsRevised.Menu;
using JetBrains.ReSharper.Psi.Files;

namespace ReSharperPlugin.DebugNotes
{
    [Action("AddCallAction", "Add Call to Debug Notes in C# Code")]
    public class AddCallAction : IActionWithExecuteRequirement, IExecutableAction
    {
        public IActionRequirement GetRequirement(IDataContext dataContext)
        {
            return CommitAllDocumentsRequirement.TryGetInstance(dataContext);
        }

        public bool Update(IDataContext context, ActionPresentation presentation, DelegateUpdate nextUpdate)
        {
            return true;
        }

        public void Execute(IDataContext context, DelegateExecute nextExecute)
        {
            var call = ActionHelper.GetCall(context);
            if (call == null)
            {
                return;
            }

            ActionHelper.GetDebugNotesComponent(context).SendCall(call.Value.targetMethod, call.Value.sourceMethod);
        }
    }
}

