package com.jetbrains.rider.plugins.debugnotes.actions

import com.jetbrains.rider.actions.base.RiderAnAction
import com.intellij.icons.AllIcons

class AddMethodAction : RiderAnAction(
        "AddMethodAction",
        "Add Method to Debug Notes",
        "Add clicked method to debug notes. This works on both methods declarations and calls.",
        AllIcons.Debugger.AddToWatch)
