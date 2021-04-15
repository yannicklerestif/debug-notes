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
    'a': {clazzId: 'a', clazzName: 'ClassA', namespace: 'Some.Namespace', x: 20, y: 100, width: undefined, height: undefined },
    'b': {clazzId: 'b', clazzName: 'ClassB', namespace: 'Some.Namespace', x: 20, y: 200, width: undefined, height: undefined },
  },
  byNamespace: {
    'Some.Namespace': { 'a': true, 'b': true},
  }
};

export const selectClazzes = (state: RootState) => {
  return state.clazz.byId;
}

export const selectClazzesForNamespace = (state: RootState) => {
  return Object.keys(state.clazz.byNamespace).map(clazzId => state.clazz.byId[clazzId]);
}

export const clazzSlice = createSlice({
  name: 'clazz',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    addClazz: (state, action: PayloadAction<Clazz>) => {
      const clazz = action.payload;
      const clazzId: string = uuidv4();
      clazz.clazzId = clazzId;
      state.byId[clazzId] = clazz;
      let clazzIdsForNamespace = state.byNamespace[clazz.namespace];
      if (clazzIdsForNamespace == null) {
        clazzIdsForNamespace = {};
        state.byNamespace[clazz.namespace] = clazzIdsForNamespace;
      }
      clazzIdsForNamespace[clazzId] = true;
    },
    removeClazz: (state, action: PayloadAction<string>) => {
      const clazzId: string = action.payload;
      const clazz = state.byId[clazzId];
      delete state.byId[clazzId];
      delete state.byNamespace[clazz.namespace][clazzId];
    },
  },
});

export const {addClazz, removeClazz} = clazzSlice.actions;

export default clazzSlice.reducer;
