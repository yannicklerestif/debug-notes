import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../../@app/store';

export interface NamespaceState {
  byName: Record<string, boolean>;
}

const initialState: NamespaceState = {
  byName: {}
};

export const selectNamespacesMap = (state: RootState) => {
  return state.namespace.byName;
}

export const selectNamespacesForSaving = (state: RootState) => {
  return state.namespace.byName;
}

export const selectNamespacesList = (state: RootState) => {
  return Object.keys(state.namespace.byName).sort((a, b) => a.localeCompare(b));
}

export const namespaceSlice = createSlice({
  name: 'namespace',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    loadNamespaces: (state, action: PayloadAction<any>) => {
      state.byName = action.payload;
    },
    addNamespace: (state, action: PayloadAction<string>) => {
      const namespaceName = action.payload;
      state.byName[namespaceName] = true;
    },
    deleteUnusedNamespaces: (state, action: PayloadAction<Record<string, boolean>>) => {
      const allNamespaces = Object.keys(state.byName);
      for (let ns of allNamespaces) {
        if (!action.payload[ns]) {
          delete state.byName[ns];
        }
      }
    },
    removeNamespaces: (state, action: PayloadAction<string[]>) => {
      for (let namespaceName of action.payload) {
        delete state.byName[namespaceName];
      }
    },
  },
});

export const {loadNamespaces, addNamespace, deleteUnusedNamespaces, removeNamespaces} = namespaceSlice.actions;

export default namespaceSlice.reducer;
