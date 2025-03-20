package model.rider

import com.jetbrains.rider.model.nova.ide.SolutionModel
import com.jetbrains.rd.generator.nova.*
import com.jetbrains.rd.generator.nova.PredefinedType.*
import com.jetbrains.rd.generator.nova.csharp.CSharp50Generator
import com.jetbrains.rd.generator.nova.kotlin.Kotlin11Generator

@Suppress("unused")
object DebugNotesModel : Ext(SolutionModel.Solution) {

    val MethodStructure = structdef {
        field("namespace", string)
        field("className", string)
        field("methodName", string)
    }

    val ClassStructure = structdef {
        field("namespace", string)
        field("className", string)
    }

    val Call = structdef {
        field("method", MethodStructure)
        field("parent", MethodStructure)
    }

    init {
        setting(CSharp50Generator.Namespace, "ReSharperPlugin.DebugNotes.Rider.Model")
        setting(Kotlin11Generator.Namespace, "com.jetbrains.rider.debugnotes.model")

        signal("call", Call)
        signal("method", MethodStructure)
        signal("navigateMethod", MethodStructure)
        signal("navigateClass", ClassStructure)
    }
}