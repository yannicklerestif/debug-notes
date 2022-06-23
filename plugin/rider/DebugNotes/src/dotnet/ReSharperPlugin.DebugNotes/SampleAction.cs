using System;
using JetBrains.Application.DataContext;
using JetBrains.Application.UI.Actions;
using JetBrains.Application.UI.ActionsRevised.Menu;
using JetBrains.Application.UI.ActionSystem.ActionsRevised.Menu;
using JetBrains.ProjectModel;
using JetBrains.ReSharper.Psi;
using JetBrains.ReSharper.Psi.CSharp.Tree;
using JetBrains.ReSharper.Psi.DataContext;
using JetBrains.ReSharper.Psi.Files;
using JetBrains.ReSharper.Psi.Resolve;
using JetBrains.ReSharper.Psi.Tree;
using JetBrains.Util;
using NuGet.Protocol.Plugins;
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
            // when cursor is on a method declaration:
            // - declaredElement is a IMethod, its value the declared method (the method under which the cursor is)
            // - referenceElement is null
            // - parentMethod is null
            // when cursor is inside a method call:
            // - declaredElement is also the method under which the cursor is
            // - referenceElement is also the method under which the cursor is
            // - parentMethod is the method from which the call is done
            IDeclaredElement declaredElement = context.GetData(PsiDataConstants.DECLARED_ELEMENT);
            ITreeNode referenceElement = context.GetData(PsiDataConstants.REFERENCE)?.GetTreeNode();
            MethodStructure method = null;
            MethodStructure parent = null;
            if (declaredElement is IMethod declaredMethod)
            {
                method = ConvertMethodToStructure(declaredMethod);

                var parentMethod = referenceElement?.GetContainingNode<IMethodDeclaration>()?.DeclaredElement;
                if (parentMethod != null)
                {
                    parent = ConvertMethodToStructure(parentMethod);
                }
            }

            var solution = context.GetComponent<ISolution>();
            var debugModelHost = solution.GetComponent<DebugNotesModelHost>();

            if (method != null && parent != null)
            {
                debugModelHost.SendCall(method, parent);
            } else if (method != null)
            {
                debugModelHost.SendMethod(method);
            }
        }

        private MethodStructure ConvertMethodToStructure(IMethod method) =>
            new MethodStructure(method.ContainingType.GetContainingNamespace().QualifiedName, method.ContainingType.ShortName, method.ShortName);
    }
}

