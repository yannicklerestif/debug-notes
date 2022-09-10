import {createSlice} from '@reduxjs/toolkit';
import {RootState} from '../../@app/store';
import {deleteCalls, selectCallsByMethodsIds} from '../call/callSlice';
import {deleteClazzes, selectUsedNamespaces} from '../clazz/clazzSlice';
import {deleteMethods, selectMethodsByClazzesIds} from '../method/methodSlice';
import {deleteUnusedNamespaces} from '../namespace/namespaceSlice';
import {selectDeselectCells, SelectionEvent, SelectionEventType, SelectionState, selectSelectedObjects} from "../selection/selectionSlice";
import {OBJECTS_TYPES} from "../../@app/objects";

export function deleteThunk() {
  return function(dispatch: any, getState: any) {
    const state: RootState = getState();
    const selectedObjects: SelectionState = selectSelectedObjects(state);
    const toDeselect: SelectionEvent[] = [];

    const selectedCalls = Object.keys(selectedObjects.selectedCalls);
    dispatch(deleteCalls(selectedCalls));
    toDeselect.push(...selectedCalls.map(selectedCallId => ({
      selectionEventType: SelectionEventType.Deselect,
      type: OBJECTS_TYPES.call,
      id: selectedCallId
    })));

    const selectedMethodsIds: string[] = Object.keys(selectedObjects.selectedMethods);
    const callsUsingSelectedMethodsIds: string[] = selectCallsByMethodsIds(selectedMethodsIds)(state);
    dispatch(deleteCalls(callsUsingSelectedMethodsIds));
    dispatch(deleteMethods(selectedMethodsIds));
    toDeselect.push(...selectedCalls.map(selectedMethodId => ({
      selectionEventType: SelectionEventType.Deselect,
      type: OBJECTS_TYPES.method,
      id: selectedMethodId
    })));

    const selectedClazzesIds: string[] = Object.keys(selectedObjects.selectedClazzes);
    const methodsFromSelectedClazzes: string[] = selectMethodsByClazzesIds(selectedClazzesIds)(state);
    const callsUsingSelectedClazzes: string[] = selectCallsByMethodsIds(methodsFromSelectedClazzes)(state);
    dispatch(deleteCalls(callsUsingSelectedClazzes));
    dispatch(deleteMethods(methodsFromSelectedClazzes));
    dispatch(deleteClazzes(selectedClazzesIds));
    toDeselect.push(...selectedCalls.map(selectedClazzId => ({
      selectionEventType: SelectionEventType.Deselect,
      type: OBJECTS_TYPES.clazz,
      id: selectedClazzId
    })));

    // remove orphaned namespaces.
    // this is to help cleaning them up after classes have been removed.
    // another possibility was to remove them explicitly (e.g. with a button in the ns dropdown)
    // but that is more clicks + dev work
    const usedNamespaces: Record<string, boolean> = selectUsedNamespaces(state);
    dispatch(deleteUnusedNamespaces(usedNamespaces));

    dispatch(selectDeselectCells(toDeselect));
  }
}

export const deletionSlice = createSlice({
  name: 'deletion',
  initialState: {},
  reducers: {},
});

export default deletionSlice.reducer;
