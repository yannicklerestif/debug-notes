package com.jetbrains.rider.plugins.debugnotes;

import com.intellij.ide.plugins.PluginManager;
import com.intellij.openapi.components.State;
import com.intellij.openapi.components.Storage;
import com.intellij.openapi.components.StoragePathMacros;
import com.intellij.openapi.diagnostic.Logger;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;

@State(
    // the name of the entry in the XML file
    name = "DebugNotes",
    // tells Rider to store the settings in .idea/.../workspace.xml
    storages = { @Storage(StoragePathMacros.WORKSPACE_FILE) }
)
class DebugNotesPersistenceServiceImpl implements DebugNotesPersistenceService {

    private Logger logger = PluginManager.getLogger();

    private DebugNotesState state = new DebugNotesState("");

    // this is called by the application to update the state that needs to be persisted.
    @Override
    public void updateState(DebugNotesState state) {
        this.state = state;
    }

    // this is called by Rider. the result is what will be persisted.
    @Override
    public @Nullable DebugNotesState getState() {
        return state;
    }

    // called by Rider at startup to tell this service what was persisted.
    @Override
    public void loadState(@NotNull DebugNotesState state) {
        this.state = state;
    }
}
