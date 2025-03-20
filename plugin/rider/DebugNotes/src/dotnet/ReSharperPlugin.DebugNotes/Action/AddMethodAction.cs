using JetBrains.Application.DataContext;
using JetBrains.Application.UI.Actions;
using JetBrains.Application.UI.ActionsRevised.Menu;
using JetBrains.Application.UI.ActionSystem.ActionsRevised.Menu;
using JetBrains.ReSharper.Psi.Files;

namespace ReSharperPlugin.DebugNotes
{
    [Action("AddMethodAction", "Add Method to Debug Notes in C# Code")]
    public class AddMethodAction : IActionWithExecuteRequirement, IExecutableAction
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
            DebugNotesTempLogger.Log("AddMethodAction.Execute -----------------------------------");
            var declaredMethod = ActionHelper.GetMethod(context);
            if (declaredMethod == null)
            {
                return;
            }

            ActionHelper.GetDebugNotesComponent(context).SendMethod(declaredMethod);
        }
    }
}

