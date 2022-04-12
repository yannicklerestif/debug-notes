package org.debugnotes.toolWindow;

import com.intellij.openapi.project.Project;
import com.intellij.openapi.util.Disposer;
import com.intellij.ui.jcef.JBCefBrowser;
import org.jetbrains.annotations.NotNull;

import javax.swing.*;

public class DebugNotesToolWindow {


    private final JComponent content;

    public DebugNotesToolWindow(@NotNull Project project) {
        JBCefBrowser browser = new JBCefBrowser();
        browser.loadURL("http://localhost:3000");
        Disposer.register(project, browser);
        content = browser.getComponent();
    }

    public JComponent getContent() {
        return content;
    }
}
