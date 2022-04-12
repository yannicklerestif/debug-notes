import {createSlice} from '@reduxjs/toolkit';
import {addClazz, selectClazzes} from '../clazz/clazzSlice';
import {addMethod} from '../method/methodSlice';
import {LazyMethod} from "./lazyMethod";
import {addNamespace} from "../namespace/namespaceSlice";

export function lazilyAddMethodThunk(lazyMethod: LazyMethod) {
  return function(dispatch: any, getState: any) {
    console.log('calling lazily add', lazyMethod);

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
    // TODO use a selector to get class by class name + namespace
    const clazz = Object.values(selectClazzes(getState())).find((clazz_) => lazyMethod.clazzName === clazz_.clazzName && lazyMethod.namespace === clazz_.namespace);

    dispatch(addMethod({
      height: lazyMethod.height!,
      width: lazyMethod.width!,
      x: undefined,
      y: undefined,
      methodId: undefined,
      methodName: lazyMethod.methodName,
      classId: clazz!.clazzId!
    }));
  }
}

export const deletionSlice = createSlice({
  name: 'lazilyAdd',
  initialState: {},
  reducers: {},
});

export default deletionSlice.reducer;
