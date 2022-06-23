package com.jetbrains.rider.plugins.debugnotes

import com.intellij.ide.plugins.PluginManager
import org.cef.callback.CefCallback
import org.cef.handler.CefLoadHandler
import org.cef.handler.CefResourceHandler
import org.cef.misc.IntRef
import org.cef.misc.StringRef
import org.cef.network.CefRequest
import org.cef.network.CefResponse
import java.io.IOException
import java.net.URLConnection

class JavaResourceResourceHandler : CefResourceHandler {
    private var connection: Connection? = null;

    override fun processRequest(cefRequest: CefRequest?, cefCallback: CefCallback): Boolean {
        val url = cefRequest?.url
        if (url == null)
            return false
        // /!\ don't use a leading slash with clazz.classLoader.getResource(), it doesn't expect one
        // and is always absolute so it's not necessary.
        // Worse, Intellij will throw if we do that. (as opposed to clazz.getResource())
        val pathToResource = url.replace("http://webview", "webview")
        val newUrl = javaClass.classLoader.getResource(pathToResource)
        if (newUrl == null) {
            this.connection = null
            PluginManager.getLogger().warn("Can't get resource with path: " + pathToResource)
            return false
        }
        this.connection = Connection(newUrl.openConnection())
        cefCallback.Continue()
        return true
    }

    override fun getResponseHeaders(cefResponse: CefResponse?, responseLength: IntRef?, redirectUrl: StringRef?) {
        connection?.getResponseHeaders(cefResponse, responseLength, redirectUrl)
    }

    override fun readResponse(dataOut: ByteArray?, designedBytesToRead: Int, bytesRead: IntRef?, callback: CefCallback?): Boolean {
        return connection?.readResponse(dataOut, designedBytesToRead, bytesRead, callback) ?: false
    }

    override fun cancel() {
        connection?.close()
        connection = null
    }
}

class Connection(var connection: URLConnection) {
    var inputStream = connection.getInputStream()

    fun getResponseHeaders(cefResponse: CefResponse?, responseLength: IntRef?, redirectUrl: StringRef?) {
        try {
            val url = connection.url.toString()
            if (url.contains(".css"))
                cefResponse?.setMimeType("text/css")
            else if (url.contains(".js"))
                cefResponse?.setMimeType("text/javascript")
            else if (url.contains(".html"))
                cefResponse?.setMimeType("text/html")
            else
                cefResponse?.setMimeType(connection.getContentType())
            responseLength?.set(inputStream.available())
            cefResponse?.setStatus(200)
        } catch (e: IOException) {
            cefResponse?.setError(CefLoadHandler.ErrorCode.ERR_FILE_NOT_FOUND)
            cefResponse?.setStatusText(e.getLocalizedMessage())
            cefResponse?.setStatus(404)
        }
    }

    fun readResponse(dataOut: ByteArray?, designedBytesToRead: Int, bytesRead: IntRef?, callback: CefCallback?): Boolean {
        try {
            val availableSize = inputStream.available()
            if (availableSize > 0) {
                val maxBytesToRead = Math.min(availableSize, designedBytesToRead)
                val realNumberOfReadBytes =
                    inputStream.read(dataOut, 0, maxBytesToRead)
                bytesRead?.set(realNumberOfReadBytes)
                return true
            } else {
                inputStream.close()
                return false
            }
        } catch(e: Exception) {
            PluginManager.getLogger().error("Error loading resource", e)
            return false
        }
    }

    fun close() {
        inputStream.close()
    }
}