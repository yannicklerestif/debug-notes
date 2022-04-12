package model.rider

import com.jetbrains.rider.model.nova.ide.SolutionModel
import com.jetbrains.rd.generator.nova.*
import com.jetbrains.rd.generator.nova.PredefinedType.*
import com.jetbrains.rd.generator.nova.csharp.CSharp50Generator
import com.jetbrains.rd.generator.nova.kotlin.Kotlin11Generator

@Suppress("unused")
object DebugNotesModel : Ext(SolutionModel.Solution) {

//    val MyEnum = enum {
//        +"FirstValue"
//        +"SecondValue"
//    }

    val MyStructure = structdef {
        field("type", string)
        field("name", string)
//        field("projectFile", string)
//        field("target", string)
    }

    init {
        setting(CSharp50Generator.Namespace, "ReSharperPlugin.DebugNotes.Rider.Model")
        setting(Kotlin11Generator.Namespace, "com.jetbrains.rider.debugnotes.model")

//        property("myString", string)
//        property("myBool", bool)
//        property("myEnum", MyEnum.nullable)
//
//        map("data", string, string)

        signal("myStructure", MyStructure)
    }
}