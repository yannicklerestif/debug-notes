package com.jetbrains.rider.plugins.debugnotes;

public class DebugNotesState {
    public DebugNotesState() {}

    public DebugNotesState(String serializedState) {
        this.serializedState = serializedState;
    }

    public String getSerializedState() {
        return serializedState;
    }

    public void setSerializedState(String serializedState) {
        this.serializedState = serializedState;
    }

    private String serializedState;
}