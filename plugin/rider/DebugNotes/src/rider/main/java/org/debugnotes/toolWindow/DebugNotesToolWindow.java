package org.debugnotes.toolWindow;

import com.intellij.ide.plugins.PluginManager;
import com.intellij.openapi.project.Project;
import com.intellij.openapi.util.Disposer;
import com.intellij.ui.jcef.JBCefBrowser;
import org.jetbrains.annotations.NotNull;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

public class DebugNotesToolWindow {


    private final JComponent content;
    private final JBCefBrowser browser;

    private void sendJavascriptToBrowser() {
        browser.getCefBrowser().executeJavaScript("window.lazilyAddMethod({"
                + "namespace:'someNamespace',"
                + "clazzName: 'someClazzName',"
                + "methodName: 'someMethodName'});", "", 0);
    }

    public DebugNotesToolWindow(@NotNull Project project) {
        // I use it to have a button to trigger stuff manually
        boolean debugMode = true;
        JPanel container = null;
        PluginManager.getLogger().warn("Starting tool window");
        if (debugMode) {
            container = new JPanel(new FlowLayout(FlowLayout.CENTER, 0, 0));
            JButton button = new JButton("TEST");
            button.addActionListener(new ActionListener() {
                @Override
                public void actionPerformed(ActionEvent e) {
                    PluginManager.getLogger().warn("Hello, World!");
                    sendJavascriptToBrowser();
                }
            });
            button.setPreferredSize(new Dimension(100, 100));
            container.add(button);
        }

        this.browser = new JBCefBrowser();
        browser.loadURL("http://localhost:3000");
        Disposer.register(project, browser);

        if (debugMode) {
            container.add(browser.getComponent());
            content = container;
        } else {
            content = browser.getComponent();
        }
    }

    public JComponent getContent() {
        return content;
    }
}
