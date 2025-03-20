package com.jetbrains.rider.plugins.debugnotes;

import com.intellij.openapi.components.PersistentStateComponent;

interface DebugNotesPersistenceService extends PersistentStateComponent<DebugNotesState> {
    public void updateState(DebugNotesState state);
}
