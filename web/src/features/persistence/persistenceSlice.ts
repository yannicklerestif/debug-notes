import {createSlice} from '@reduxjs/toolkit';
import {RootState} from '../../@app/store';
import {loadCalls, selectCallsForSaving} from '../call/callSlice';
import {loadClazzes, selectClazzesForSaving} from "../clazz/clazzSlice";
import {loadNamespaces, selectNamespacesForSaving} from "../namespace/namespaceSlice";
import {loadMethods, selectMethodsForSaving} from "../method/methodSlice";

export function saveThunk() {
  return function(dispatch: any, getState: () => RootState) {
    const rootState = getState();
    const toSave = {
      calls: selectCallsForSaving(rootState),
      methods: selectMethodsForSaving(rootState),
      clazzes: selectClazzesForSaving(rootState),
      namespaces: selectNamespacesForSaving(rootState),
    }
    // TODO factorize plugin vs standalone
    const serializedState = JSON.stringify(toSave);
    // @ts-ignore
    if (window.JavaPanelBridge === undefined) {
      localStorage.setItem('currentProject', JSON.stringify(toSave));
    } else {
      // @ts-ignore
      window.JavaPanelBridge.save(serializedState);
    }
  };
}

export function loadThunk() {
  return function(dispatch: any, getState: any) {
    // TODO: factorize plugin vs standalone
    let toLoadString: string | null;
    // @ts-ignore
    if (window.persistedState === undefined) {
      toLoadString = localStorage.getItem('currentProject');
    } else {
      // @ts-ignore
      toLoadString = window.persistedState == '' ? null : window.persistedState;
    }
    if (toLoadString == null)
      return;
    const toLoad = JSON.parse(toLoadString);
    dispatch(loadCalls(toLoad.calls));
    dispatch(loadMethods(toLoad.methods));
    dispatch(loadClazzes(toLoad.clazzes));
    dispatch(loadNamespaces(toLoad.namespaces));
  }
}
export const persistenceSlice = createSlice({
  name: 'persistence',
  initialState: {},
  reducers: {},
});

export default persistenceSlice.reducer;
