using System;
using System.Collections.Generic;
using JetBrains.Application.DataContext;
using JetBrains.Application.UI.Actions;
using JetBrains.Application.UI.ActionsRevised.Menu;
using JetBrains.Application.UI.ActionSystem.ActionsRevised.Menu;
using JetBrains.ProjectModel;
using JetBrains.ReSharper.Feature.Services.ContextActions;
using JetBrains.ReSharper.Feature.Services.Intentions;
using JetBrains.ReSharper.Psi.DataContext;
using JetBrains.ReSharper.Psi.Files;
using JetBrains.Util;
using ReSharperPlugin.DebugNotes.Rider.Model;

namespace ReSharperPlugin.DebugNotes
{
    [Action("SampleAction", "Do Something")]
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
            var data = context.GetData(PsiDataConstants.DECLARED_ELEMENTS)?.AsArray()[0].ToString();
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