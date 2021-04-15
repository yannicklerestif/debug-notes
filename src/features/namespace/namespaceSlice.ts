import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../../@app/store';

export interface NamespaceState {
  byName: Record<string, boolean>;
}

const initialState: NamespaceState = {
  byName: {
    '': true,
    'Some.Namespace': true,
    'Another.Namespace': true,
  }
};

export const selectNamespacesMap = (state: RootState) => {
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
    addNamespace: (state, action: PayloadAction<string>) => {
      const namespaceName = action.payload;
      state.byName[namespaceName] = true;
    },
    removeNamespace: (state, action: PayloadAction<string>) => {
      const namespaceName = action.payload;
      delete state.byName[namespaceName];
    },
  },
});

export const {addNamespace, removeNamespace} = namespaceSlice.actions;

export default namespaceSlice.reducer;
