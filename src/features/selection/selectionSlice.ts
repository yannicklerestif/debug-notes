import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../../@app/store';
import {OBJECTS_TYPES} from "../../@app/objects";
import {Call} from "../call/call";
import {Method} from "../method/method";

export enum SelectionEventType { Select, Deselect}

export interface SelectionEvent {
  selectionEventType: SelectionEventType,
  type: string,
  id: string,
}

export interface SelectionState {
  selectedCalls: Record<string, boolean>,
  selectedMethods: Record<string, boolean>,
  selectedClazzes: Record<string, boolean>,
}

const initialState: SelectionState = {
  selectedCalls: {},
  selectedMethods: {},
  selectedClazzes: {},
};

export const selectSelectedCalls = (state: RootState): Call[] => {
  return Object.keys(state.selection.selectedCalls).map(callId => state.call.byId[callId]);
}

export const selectSelectedCallsMethods = (state: RootState): [Method, Method][] => {
  return selectSelectedCalls(state).map(call => [state.method.byId[call.sourceMethodId], state.method.byId[call.targetMethodId]]);
}

export const selectSelectedObjects = (state: RootState) => {
  return state.selection;
}

export const selectionSlice = createSlice({
  name: 'selection',
  initialState,
  reducers: {
    selectDeselectCells: (state, action: PayloadAction<SelectionEvent[]>) => {
      for (const selectionEvent of action.payload) {
        let map: Record<string, boolean>;
        switch (selectionEvent.type) {
          case OBJECTS_TYPES.call:
            map = state.selectedCalls;
            break;
          case OBJECTS_TYPES.method:
            map = state.selectedMethods;
            break;
          case OBJECTS_TYPES.clazz:
            map = state.selectedClazzes;
            break;
          default:
            throw new Error('Unknown type: ' + selectionEvent.type);
        }
        if (selectionEvent.selectionEventType === SelectionEventType.Select) {
          map[selectionEvent.id] = true;
        } else if (selectionEvent.selectionEventType === SelectionEventType.Deselect) {
          delete map[selectionEvent.id];
        }
      }
    }
  },
});

export const {selectDeselectCells} = selectionSlice.actions;

export default selectionSlice.reducer;
