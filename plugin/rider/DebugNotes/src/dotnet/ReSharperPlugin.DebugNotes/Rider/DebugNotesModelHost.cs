using System.Collections.Generic;
using System.Linq;
using JetBrains.Annotations;
using JetBrains.ProjectModel;
using JetBrains.ReSharper.Feature.Services.Navigation.NavigationExtensions;
using JetBrains.ReSharper.Feature.Services.Protocol;
using JetBrains.ReSharper.Psi;
using JetBrains.ReSharper.Psi.Caches;
using JetBrains.ReSharper.Psi.CSharp.Tree;
using JetBrains.ReSharper.Psi.Tree;
using JetBrains.ReSharper.Resources.Shell;
using JetBrains.Util;


namespace ReSharperPlugin.DebugNotes.Rider.Model
{
    [SolutionComponent]
    public class DebugNotesModelHost
    {
        private readonly DebugNotesModel _model;
        private readonly ISolution _solution;

        public DebugNotesModelHost(ISolution solution)
        {
            _solution = solution;
            var rdSolution = solution.GetProtocolSolution();
            _model = rdSolution.GetDebugNotesModel();
            _model.NavigateMethod.Advise(solution.GetLifetime(), NavigateToMethod);
            _model.NavigateClass.Advise(solution.GetLifetime(), NavigateToClass);
        }

        public void SendCall(MethodStructure method, MethodStructure parent)
        {
            _model.Call.Fire(new Call(method, parent));
        }

        public void SendMethod(MethodStructure method)
        {
            _model.Method.Fire(method);
        }

        private void NavigateToMethod(MethodStructure method)
        {
            var declaredElements = FindTypesByQualifiedName(_solution, method.Namespace + "." + method.ClassName);

            var declaredElement = declaredElements[0];
            using (ReadLockCookie.Create())
            {
                var classDeclaration = declaredElement.GetDeclarations().First() as IClassLikeDeclaration;
                var methodDeclaration = classDeclaration.MethodDeclarations.First(m => m.NameIdentifier.Name == method.MethodName);
                var startTextRange =
                    TextRange.FromLength(methodDeclaration.GetDocumentRange().TextRange.StartOffset, 1);
                classDeclaration.GetSourceFile().Navigate(startTextRange, true);
            }
        }

        private void NavigateToClass(ClassStructure clazz)
        {
            var declaredElements = FindTypesByQualifiedName(_solution, clazz.Namespace + "." + clazz.ClassName);

            var declaredElement = declaredElements[0];
            using (ReadLockCookie.Create())
            {
                var classDeclaration = declaredElement.GetDeclarations().First() as IClassLikeDeclaration;
                var startTextRange = TextRange.FromLength(classDeclaration.GetDocumentRange().TextRange.StartOffset, 1);
                classDeclaration.GetSourceFile().Navigate(startTextRange, true);
            }
        }

        [NotNull, Pure]
        private static List<IClrDeclaredElement> FindTypesByQualifiedName([NotNull] ISolution solution, [NotNull] string name)
        {
            var symbolCache = solution.GetPsiServices().Symbols;
            var symbolScope = symbolCache.GetSymbolScope(LibrarySymbolScope.FULL, caseSensitive: false);

            return symbolScope.GetElementsByQualifiedName(name).ToList();
        }
    }
}