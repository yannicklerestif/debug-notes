using System;
using System.Collections.Generic;
using JetBrains.Application.DataContext;
using JetBrains.Application.UI.Actions;
using JetBrains.Application.UI.ActionsRevised.Menu;
using JetBrains.Application.UI.ActionSystem.ActionsRevised.Menu;
using JetBrains.ProjectModel;
using JetBrains.ReSharper.Psi;
using JetBrains.ReSharper.Psi.DataContext;
using JetBrains.ReSharper.Psi.Files;
using JetBrains.Util;
using ReSharperPlugin.DebugNotes.Rider.Model;

namespace ReSharperPlugin.DebugNotes
{
    [Action("SampleAction", "DebugNotes")]
    public class SampleAction : IActionWithExecuteRequirement, IExecutableAction
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
            IDeclaredElement declaredElement = context.GetData(PsiDataConstants.DECLARED_ELEMENTS)?.AsArray()[0];
            if (declaredElement is IMethod declaredMethod)
            {
                string methodName = declaredMethod.ShortName;
                string className = declaredMethod.ContainingType.ShortName;
                string namespaceName = declaredMethod.ContainingType.GetContainingNamespace().ShortName;
            }
            var data = declaredElement?.ToString();
            var value = data.Split(':');
            var type = value[0];
            var name = value[1];

            var solution = context.GetComponent<ISolution>();
            var debugModelHost = solution.GetComponent<DebugNotesModelHost>();

            debugModelHost.SendMyStructure(new MyStructure(type, name));
            MessageBox.ShowInfo(!string.IsNullOrEmpty(data) ? data : "Nothing to show");
        }
    }
}