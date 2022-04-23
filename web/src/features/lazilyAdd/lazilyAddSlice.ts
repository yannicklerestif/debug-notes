import {createSlice} from '@reduxjs/toolkit';
import {addClazz, selectClazzes} from '../clazz/clazzSlice';
import {addMethod, selectMethods} from '../method/methodSlice';
import {LazyMethod} from "./lazyMethod";
import {addNamespace} from "../namespace/namespaceSlice";
import {LazyCall} from "./lazyCall";
import {RootState} from "../../@app/store";
import {Clazz} from "../clazz/clazz";
import {Method} from "../method/method";
import {addCall} from "../call/callSlice";

// TODO use a selector to get class by class name + namespace
const findClazz = (state: RootState, clazzName: string, namespace: string): Clazz => {
  let clazzes = Object.values(selectClazzes(state));
  return clazzes.find((clazz) => clazzName === clazz.clazzName && namespace === clazz.namespace)!;
}

// TODO use a selector to get method by methodName + clazzId
const findMethod = (state: RootState, methodName: string, clazzId: string): Method => {
  let methods = Object.values(selectMethods(state));
  return methods.find((method) => methodName === method.methodName && clazzId === method.classId)!;
}

const lazilyAddMethod = (lazyMethod: LazyMethod, dispatch: any, getState: any) => {
  dispatch(addNamespace(lazyMethod.namespace));
  dispatch(addClazz({
    clazzId: undefined,
    clazzName: lazyMethod.clazzName,
    namespace: lazyMethod.namespace,
    x: undefined,
    y: undefined,
    textWidth: lazyMethod.clazzTextWidth!,
    textHeight: lazyMethod.clazzTextHeight!,
    width: undefined,
    height: undefined,
  }))

  // need to fetch the state again to get the new class if it didn't exist before
  const clazz = findClazz(getState(), lazyMethod.clazzName, lazyMethod.namespace);

  dispatch(addMethod({
    height: lazyMethod.height!,
    width: lazyMethod.width!,
    x: undefined,
    y: undefined,
    methodId: undefined,
    methodName: lazyMethod.methodName,
    classId: clazz.clazzId!
  }));
}

export function lazilyAddMethodThunk(lazyMethod: LazyMethod) {
  return function(dispatch: any, getState: any) {
    lazilyAddMethod(lazyMethod, dispatch, getState);
  }
}

export function lazilyAddCallThunk(lazyCall: LazyCall) {
  return function(dispatch: any, getState: any) {
    lazilyAddMethod(lazyCall.sourceMethod, dispatch, getState);
    lazilyAddMethod(lazyCall.targetMethod, dispatch, getState);
    const state = getState();
    const sourceClazz = findClazz(state, lazyCall.sourceMethod.clazzName, lazyCall.sourceMethod.namespace);
    const targetClazz = findClazz(state, lazyCall.targetMethod.clazzName, lazyCall.targetMethod.namespace);
    const sourceMethod = findMethod(state, lazyCall.sourceMethod.methodName, sourceClazz.clazzId!);
    const targetMethod = findMethod(state, lazyCall.targetMethod.methodName, targetClazz.clazzId!);

    dispatch(addCall({ callId: undefined, sourceMethodId: sourceMethod.methodId!, targetMethodId: targetMethod.methodId! }));
  }
}

export const deletionSlice = createSlice({
  name: 'lazilyAdd',
  initialState: {},
  reducers: {},
});

export default deletionSlice.reducer;
