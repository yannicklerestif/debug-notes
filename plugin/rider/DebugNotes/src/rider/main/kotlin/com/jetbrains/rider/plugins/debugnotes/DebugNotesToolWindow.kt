package com.jetbrains.rider.plugins.debugnotes

import com.intellij.ide.plugins.PluginManager
import com.intellij.openapi.application.ApplicationManager
import com.intellij.openapi.application.WriteAction
import com.intellij.openapi.components.service
import com.intellij.openapi.project.Project
import com.intellij.openapi.util.Disposer
import com.intellij.ui.jcef.JBCefBrowser
import com.intellij.ui.jcef.JBCefBrowserBase
import com.intellij.ui.jcef.JBCefJSQuery
import com.jetbrains.rd.platform.util.getComponent
import com.jetbrains.rd.platform.util.idea.ProtocolSubscribedProjectComponent
import com.jetbrains.rider.debugnotes.model.Call
import com.jetbrains.rider.debugnotes.model.ClassStructure
import com.jetbrains.rider.debugnotes.model.MethodStructure
import com.jetbrains.rider.debugnotes.model.debugNotesModel
import com.jetbrains.rider.projectView.solution
import org.cef.CefApp
import org.cef.browser.CefBrowser
import org.cef.browser.CefFrame
import org.cef.handler.*
import org.cef.network.CefRequest
import java.awt.*
import javax.swing.JButton
import javax.swing.JComponent
import javax.swing.JPanel

class DebugNotesToolWindow(project: Project) : ProtocolSubscribedProjectComponent(project) {
    val content: JComponent
    private val browser: JBCefBrowser
    private val navigationClassQuery: JBCefJSQuery
    private val navigationMethodQuery: JBCefJSQuery
    private val cursorChangeQuery: JBCefJSQuery
    private val saveQuery: JBCefJSQuery

    companion object {
        @Suppress("unused")
        fun getInstance(project: Project) = project.getComponent<DebugNotesToolWindow>()
    }

    private val model = project.solution.debugNotesModel

    private fun loadPersistedState() {
        var serializedState = project.service<DebugNotesPersistenceService>().state
        browser.cefBrowser.executeJavaScript(
            """
                window.persistedState = '${serializedState!!.serializedState}'
            """.trimIndent(), "", 0
        )
    }

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

    private fun setupBrowserCallbacks() {
        browser.cefBrowser.executeJavaScript(
            """
                window.JavaPanelBridge = {
                    clickClass : function(classWithNamespace) {
                        ${navigationClassQuery.inject("classWithNamespace")}
                    },
                    clickMethod : function(methodWithClassAndNamespace) {
                        ${navigationMethodQuery.inject("methodWithClassAndNamespace")}
                    },
                    changeCursor : function(cursorName) {
                        ${cursorChangeQuery.inject("cursorName")}
                    },
                    save: function(serializedState) {
                        ${saveQuery.inject("serializedState")}
                    }
                };
            """.trimIndent(), "", 0
        )
    }

    private val logger = PluginManager.getLogger()

    init {
        // Set debugMode = true below to display a button you can use to trigger
        // methods manually
        val debugMode = false

        var container: JPanel? = null
        logger.warn("Starting tool window")
        if (debugMode) {
            container = JPanel(FlowLayout(FlowLayout.CENTER, 0, 0))
            val button = JButton("TEST")
            button.addActionListener {
                lazilyAddMethod(MethodStructure("Some.Namespace", "SomeClass", "SomeMethodName"))
            }
            button.preferredSize = Dimension(100, 100)
            container.add(button)
        }
        browser = JBCefBrowser()
        CefApp
            .getInstance()
            // we use a special domain (webview) to get all files requested
            // with that scheme from Java resources
            // I tried with a custom scheme first but it seems there is a problem with CORS if we do that
            // (origin is null so requests are cross-domain and this is not allowed with a custom scheme)
            .registerSchemeHandlerFactory(
                "http",
                "webview",
                JavaResourceResourceHandlerFactory()
            )

        browser.jbCefClient.addLoadHandler(object : CefLoadHandler {
            override fun onLoadStart(p0: CefBrowser?, p1: CefFrame?, p2: CefRequest.TransitionType?) {
                loadPersistedState()
            }
            override fun onLoadError(
                p0: CefBrowser?,
                p1: CefFrame?,
                p2: CefLoadHandler.ErrorCode?,
                p3: String?,
                p4: String?
            ) {
            }

            override fun onLoadingStateChange(p0: CefBrowser?, p1: Boolean, p2: Boolean, p3: Boolean) {}

            override fun onLoadEnd(p0: CefBrowser?, p1: CefFrame?, p2: Int) {
                setupBrowserCallbacks()
            }
        }, browser.cefBrowser)

        // using an env variable to know if we are in dev mode.
        // the env variable is set by the runIde gradle task.
        // if it is set, we'll target the Webpack dev server
        // if it isn't (production) we'll use the embedded Java resources.
        val isDevEnvVariable = System.getenv("IS_DEV_ENV")
        val isDevEnv = isDevEnvVariable != null && isDevEnvVariable.lowercase() == "true"
        browser.loadURL(if (isDevEnv) "http://localhost:3000" else "http://webview/index.html")

        Disposer.register(project, browser)
        content = if (debugMode) {
            container!!.add(browser.component)
            container
        } else {
            browser.component
        }
        navigationClassQuery = JBCefJSQuery.create(browser as JBCefBrowserBase)
        navigationMethodQuery = JBCefJSQuery.create(browser as JBCefBrowserBase)

        navigationClassQuery.addHandler {
            val (namespace, className) = it.split(":")
            ApplicationManager.getApplication().invokeLater {
                WriteAction.run<Throwable> {
                    model.navigateClass.fire(ClassStructure(namespace, className))
                }
            }
            null
        }

        navigationMethodQuery.addHandler {
            val (namespace, className, methodName) = it.split(":")
            ApplicationManager.getApplication().invokeLater {
                WriteAction.run<Throwable> {
                    model.navigateMethod.fire(MethodStructure(namespace, className, methodName))
                }
            }
            null
        }

        cursorChangeQuery = JBCefJSQuery.create(browser as JBCefBrowserBase)
        cursorChangeQuery.addHandler {
            val newCursor: Int = when (it) {
                "auto" -> Cursor.DEFAULT_CURSOR
                "crosshair" -> Cursor.CROSSHAIR_CURSOR
                // unfortunately, Swing doesn't have built-in grab cursors
                "grab" -> Cursor.DEFAULT_CURSOR
                "grabbing" -> Cursor.DEFAULT_CURSOR
                "move" -> Cursor.MOVE_CURSOR
                "pointer" -> Cursor.HAND_CURSOR
                "text" -> Cursor.TEXT_CURSOR
                else -> Cursor.DEFAULT_CURSOR
            }
            if (newCursor != content.cursor.type) {
                content.cursor = Cursor(newCursor)
            }
            null
        }

        saveQuery = JBCefJSQuery.create(browser as JBCefBrowserBase)
        // TODO: call each time the user changes something?
        saveQuery.addHandler {
            val newState = DebugNotesState(it)
            project.service<DebugNotesPersistenceService>().updateState(newState)
            null
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