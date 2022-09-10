import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../../@app/store';
import {Clazz} from "./clazz";
import {v4 as uuidv4} from 'uuid';

export interface ClazzState {
  byId: Record<string, Clazz>;
  byNamespace: Record<string, Record<string, boolean>>;
}

const initialState: ClazzState = {
  byId: {
    'a': {clazzId: 'a', clazzName: 'ClassA', namespace: 'Some.Namespace', x: 20, y: 100, textWidth: 115, textHeight: 32, width: undefined, height: undefined },
    'b': {clazzId: 'b', clazzName: 'ClassB', namespace: 'Some.Namespace', x: 20, y: 200, textWidth: 115, textHeight: 32, width: undefined, height: undefined },
  },
  byNamespace: {
    'Some.Namespace': { 'a': true, 'b': true},
  }
};

export const selectClazzes = (state: RootState) => {
  return state.clazz.byId;
}

export const selectClazzesForSaving = (state: RootState) => {
  return state.clazz.byId;
}

// returns a dict with the namespaces as keys and "true" as values
export const selectUsedNamespaces = (state: RootState) => {
  return Object.assign({}, ...Object.keys(state.clazz.byNamespace).map(ns => ({[ns]: true})));
}

export const clazzSlice = createSlice({
  name: 'clazz',
  initialState,
  reducers: {
    loadClazzes: (state, action: PayloadAction<any>) => {
      const byId: Record<string, Clazz> = action.payload;
      // TODO: some duplication here
      const byNamespace: Record<string, Record<string, boolean>> = {};
      for(let clazzId in byId) {
        const namespaceName: string = byId[clazzId].namespace;
        if (byNamespace[namespaceName] == null)
          byNamespace[namespaceName] = {};
        byNamespace[namespaceName][clazzId] = true;
      }
      state.byId = byId;
      state.byNamespace = byNamespace;
    },
    addClazz: (state, action: PayloadAction<Clazz>) => {
      const clazz_ = action.payload;
      // don't do anything if there is already a class with the same name and namespace
      if (Object.values(state.byId).some((clazz) => clazz.clazzName === clazz_.clazzName && clazz.namespace === clazz_.namespace)) {
        return;
      }
      const clazzId: string = uuidv4();
      const clazz = { ...clazz_, clazzId };
      state.byId[clazzId] = clazz;
      let clazzIdsForNamespace = state.byNamespace[clazz.namespace];
      if (clazzIdsForNamespace == null) {
        clazzIdsForNamespace = {};
        state.byNamespace[clazz.namespace] = clazzIdsForNamespace;
      }
      clazzIdsForNamespace[clazzId] = true;
    },
    deleteClazzes: (state, action: PayloadAction<string[]>) => {
      for (let clazzId of action.payload) {
        const clazz = state.byId[clazzId];
        if (clazz == null)
          continue;
        delete state.byId[clazzId];
        delete state.byNamespace[clazz.namespace][clazzId];
      }
    },
  },
});

export const {loadClazzes, addClazz, deleteClazzes} = clazzSlice.actions;

export default clazzSlice.reducer;
