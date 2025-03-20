package com.jetbrains.rider.plugins.debugnotes

import org.cef.browser.CefBrowser
import org.cef.browser.CefFrame
import org.cef.callback.CefSchemeHandlerFactory
import org.cef.handler.CefResourceHandler
import org.cef.network.CefRequest

class JavaResourceResourceHandlerFactory : CefSchemeHandlerFactory {
    override fun create(p0: CefBrowser?, p1: CefFrame?, p2: String?, p3: CefRequest?): CefResourceHandler {
        // maybe make java resource handler thread safe at some point
        return JavaResourceResourceHandler()
    }
}