import {createSlice} from '@reduxjs/toolkit';
import {RootState} from '../../@app/store';
import {deleteCalls, selectCallsByMethodsIds} from '../call/callSlice';
import { deleteClazzes } from '../clazz/clazzSlice';
import {deleteMethods, selectMethodsByClazzesIds} from '../method/methodSlice';
import {SelectionState, selectSelectedObjects} from "../selection/selectionSlice";

export function deleteThunk() {
  return function(dispatch: any, getState: any) {
    const state: RootState = getState();
    const selectedObjects: SelectionState = selectSelectedObjects(state);

    dispatch(deleteCalls(Object.keys(selectedObjects.selectedCalls)));

    const selectedMethodsIds: string[] = Object.keys(selectedObjects.selectedMethods);
    const callsUsingSelectedMethodsIds: string[] = selectCallsByMethodsIds(selectedMethodsIds)(state);
    dispatch(deleteCalls(callsUsingSelectedMethodsIds));
    dispatch(deleteMethods(selectedMethodsIds));

    const selectedClazzesIds: string[] = Object.keys(selectedObjects.selectedClazzes);
    const methodsFromSelectedClazzes: string[] = selectMethodsByClazzesIds(selectedClazzesIds)(state);
    const callsUsingSelectedClazzes: string[] = selectCallsByMethodsIds(methodsFromSelectedClazzes)(state);
    dispatch(deleteCalls(callsUsingSelectedClazzes));
    dispatch(deleteMethods(methodsFromSelectedClazzes));
    dispatch(deleteClazzes(selectedClazzesIds));
  }
}

export const deletionSlice = createSlice({
  name: 'deletion',
  initialState: {},
  reducers: {},
});

export default deletionSlice.reducer;
