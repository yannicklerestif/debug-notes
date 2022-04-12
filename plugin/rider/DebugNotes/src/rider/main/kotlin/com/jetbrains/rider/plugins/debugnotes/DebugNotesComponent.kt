package com.jetbrains.rider.plugins.debugnotes

import com.intellij.ide.plugins.PluginManager
import com.intellij.openapi.project.Project
import com.jetbrains.rd.platform.util.getComponent
import com.jetbrains.rd.platform.util.idea.ProtocolSubscribedProjectComponent
import com.jetbrains.rider.debugnotes.model.debugNotesModel
import com.jetbrains.rider.projectView.solution

class DebugNotesComponent(project: Project) : ProtocolSubscribedProjectComponent(project) {

    val logger = PluginManager.getLogger()

    companion object {
        @Suppress("unused")
        fun getInstance(project: Project) = project.getComponent<DebugNotesComponent>()
    }

    private val model = project.solution.debugNotesModel

//    private val messageBus = ApplicationManager.getApplication().messageBus.connect()

    init {
        model.myStructure.advise(projectComponentLifetime) {
            logger.warn(it.toString())
        }
//        messageBus.subscribe()
    }



}