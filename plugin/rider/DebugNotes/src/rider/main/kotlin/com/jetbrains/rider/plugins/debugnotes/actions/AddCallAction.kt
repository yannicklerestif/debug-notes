package com.jetbrains.rider.plugins.debugnotes.actions

import com.jetbrains.rider.actions.base.RiderAnAction
import com.intellij.icons.AllIcons
        
class AddCallAction : RiderAnAction(
        "AddCallAction",
        "Add Call to Debug Notes",
        "Add the target method, the enclosing method and the call between the two to Debug Notes",
        AllIcons.Debugger.AddToWatch)
