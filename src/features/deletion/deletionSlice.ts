import {createSlice} from '@reduxjs/toolkit';
import {RootState} from '../../@app/store';
import { deleteCalls } from '../call/callSlice';
import {SelectionState, selectSelectedObjects} from "../selection/selectionSlice";

export function deleteThunk() {
  return function(dispatch: any, getState: any) {
    const selectedObjects: SelectionState = selectSelectedObjects(getState());
    dispatch(deleteCalls(Object.keys(selectedObjects.selectedCalls)));
    const selectedMethodsIds: string[] = Object.keys(selectedObjects.selectedMethods);
    // TODO: methods, classes
  }
}

export const deletionSlice = createSlice({
  name: 'deletion',
  initialState: {},
  reducers: {},
});

export default deletionSlice.reducer;
