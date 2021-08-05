import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../../@app/store';
import {OBJECTS_TYPES} from "../../@app/objects";

export interface SelectionEvent {
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

export const selectSelectedObjects = (state: RootState) => {
  return state.selection;
}

export const selectionSlice = createSlice({
  name: 'selection',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    selectCell: (state, action: PayloadAction<SelectionEvent>) => {
      switch (action.payload.type) {
        case OBJECTS_TYPES.method:
          state.selectedMethods[action.payload.id] = true;
          // we don't want calls and clazzes selected when methods are selected,
          // because x6 behaves weirdly when different types are moved together
          state.selectedClazzes = {};
          break;
        case OBJECTS_TYPES.call:
          state.selectedCalls[action.payload.id] = true;
          break;
        case OBJECTS_TYPES.clazz:
          // refuse to select clazzes if there are already some methods (see above)
          if (Object.keys(state.selectedMethods).length === 0)
            state.selectedClazzes[action.payload.id] = true;
          break;
      }
    },
    deselectCell: (state, action: PayloadAction<SelectionEvent>) => {
      let map: Record<string, boolean>;
      switch (action.payload.type) {
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
          throw new Error('Unknown type: ' + action.payload.type);
      }
      delete map[action.payload.id];
    },
  },
});

export const {selectCell, deselectCell} = selectionSlice.actions;

export default selectionSlice.reducer;
