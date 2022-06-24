using System;
using JetBrains.Application.DataContext;
using JetBrains.ProjectModel;
using JetBrains.ReSharper.Psi;
using JetBrains.ReSharper.Psi.CSharp.Tree;
using JetBrains.ReSharper.Psi.DataContext;
using JetBrains.ReSharper.Psi.Tree;
using ReSharperPlugin.DebugNotes.Rider.Model;

namespace ReSharperPlugin.DebugNotes
{
    public static class ActionHelper
    {
        public static MethodStructure GetMethod(IDataContext context)
        {
            var (declaredMethod, parentMethod) = GetDeclaredAndParentMethods(context);
            // The cursor is on a method <=> declaredMethod != null
            if (declaredMethod == null)
            {
                return null;
            }

            return ConvertMethodToStructure(declaredMethod);
        }

        public static (MethodStructure sourceMethod, MethodStructure targetMethod)? GetCall(IDataContext context)
        {
            var (declaredMethod, parentMethod) = GetDeclaredAndParentMethods(context);
            if (declaredMethod == null || parentMethod == null)
            {
                return null;
            }

            return (ConvertMethodToStructure(parentMethod), ConvertMethodToStructure(declaredMethod));
        }

        public static DebugNotesModelHost GetDebugNotesModelHost(IDataContext context)
        {
            var solution = context.GetComponent<ISolution>();
            return solution.GetComponent<DebugNotesModelHost>();
        }

        private static MethodStructure ConvertMethodToStructure(IMethod method) =>
            new MethodStructure(method.ContainingType.GetContainingNamespace().QualifiedName,
                method.ContainingType.ShortName, method.ShortName);

        // when the cursor is on a method declaration:
        // - declaredElement is a IMethod, its value the declared method (the method under the cursor)
        // - referenceElement is null
        // - parentMethod is null
        // when the cursor is inside a method call:
        // - declaredElement is also the method under the cursor
        // - referenceElement is also the method under the cursor
        // - parentMethod is the method from which the call is done
        private static (IMethod declaredMethod, IMethod parentMethod) GetDeclaredAndParentMethods(IDataContext context)
        {
            IDeclaredElement declaredElement = context.GetData(PsiDataConstants.DECLARED_ELEMENT);
            ITreeNode referenceElement = context.GetData(PsiDataConstants.REFERENCE)?.GetTreeNode();
            if (declaredElement is IMethod declaredMethod)
            {
                IMethod parentMethod = referenceElement?.GetContainingNode<IMethodDeclaration>()?.DeclaredElement;
                return (declaredMethod, parentMethod);
            }
            else
            {
                return (null, null);
            }
        }
    }
}