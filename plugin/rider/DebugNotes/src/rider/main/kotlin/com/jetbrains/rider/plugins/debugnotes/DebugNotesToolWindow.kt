package com.jetbrains.rider.plugins.debugnotes

import com.intellij.ide.plugins.PluginManager
import com.intellij.openapi.project.Project
import com.intellij.openapi.util.Disposer
import com.intellij.ui.jcef.JBCefBrowser
import com.jetbrains.rd.platform.util.getComponent
import com.jetbrains.rd.platform.util.idea.ProtocolSubscribedProjectComponent
import com.jetbrains.rider.debugnotes.model.Call
import com.jetbrains.rider.debugnotes.model.MethodStructure
import com.jetbrains.rider.debugnotes.model.debugNotesModel
import com.jetbrains.rider.projectView.solution
import java.awt.Dimension
import java.awt.FlowLayout
import javax.swing.JButton
import javax.swing.JComponent
import javax.swing.JPanel

class DebugNotesToolWindow(project: Project) : ProtocolSubscribedProjectComponent(project) {
    val content: JComponent
    private val browser: JBCefBrowser

    companion object {
        @Suppress("unused")
        fun getInstance(project: Project) = project.getComponent<DebugNotesToolWindow>()
    }

    private val model = project.solution.debugNotesModel

    private fun lazilyAddMethod(method: MethodStructure) {
        browser.cefBrowser.executeJavaScript(
            """
                window.lazilyAddMethod({
                    namespace: '${method.namespace}',
                    clazzName: '${method.className}',
                    methodName: '${method.methodName}'
                });
            """.trimIndent(), "", 0
        )
    }

    private fun lazilyAddCall(call: Call) {
        browser.cefBrowser.executeJavaScript(
            """
                window.lazilyAddCall({
                    sourceMethod: {
                      namespace: '${call.parent.namespace}',
                      clazzName: '${call.parent.className}',
                      methodName: '${call.parent.methodName}'
                    }, targetMethod: {
                      namespace: '${call.method.namespace}',
                      clazzName: '${call.method.className}',
                      methodName: '${call.method.methodName}'
                    }
                  });
            """.trimIndent(), "", 0
        )
    }

    private val logger = PluginManager.getLogger()

    init {
        // I use it to have a button to trigger stuff manually
        val debugMode = true
        var container: JPanel? = null
        logger.warn("Starting tool window")
        if (debugMode) {
            container = JPanel(FlowLayout(FlowLayout.CENTER, 0, 0))
            val button = JButton("TEST")
            button.addActionListener {
                logger.warn("Hello, World!")
                lazilyAddMethod(MethodStructure("Some.Namespace", "SomeClass", "SomeMethodName"))
            }
            button.preferredSize = Dimension(100, 100)
            container.add(button)
        }
        browser = JBCefBrowser()
        browser.loadURL("http://localhost:3000")
        Disposer.register(project, browser)
        content = if (debugMode) {
            container!!.add(browser.component)
            container
        } else {
            browser.component
        }

        model.method.advise(projectComponentLifetime) {
            logger.warn(it.toString())
            lazilyAddMethod(it)
        }

        model.call.advise(projectComponentLifetime) {
            logger.warn(it.toString())
            lazilyAddCall(it)
        }

    }
}