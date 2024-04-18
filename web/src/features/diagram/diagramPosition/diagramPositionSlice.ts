import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../../../@app/store';
import {DiagramPosition} from "./diagramPosition";

export interface DiagramPositionState {
  diagramPosition: DiagramPosition;
}

const initialState: DiagramPositionState = { diagramPosition: { x: 0, y: 0, zoom: 1 } };

export const selectDiagramPosition = (state: RootState) => {
  return state.diagramPosition.diagramPosition;
}

export const selectDiagramPositionForSaving = (state: RootState) => {
  return state.diagramPosition.diagramPosition;
}

export const diagramPositionSlice = createSlice({
  name: 'diagramPosition',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    loadDiagramPosition: (state, action: PayloadAction<any>) => {
      state.diagramPosition = action.payload;
    },
    updateDiagramPosition: (state, action: PayloadAction<DiagramPosition>) => {
      const diagramPosition = action.payload;
      state.diagramPosition = diagramPosition;
    },
  },
});

export const {loadDiagramPosition, updateDiagramPosition, } = diagramPositionSlice.actions;

export default diagramPositionSlice.reducer;
