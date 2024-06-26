import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../../@app/store';
import {Method} from "./method";
import {v4 as uuidv4} from 'uuid';
import {snapToGrid} from '../diagram/snapToGrid';

import {MoveEvent} from '../diagram/moveEvent';

export interface MethodState {
  byId: Record<string, Method>;
  byClassId: Record<string, Record<string, boolean>>;
}

const initialState: MethodState = {
  byId: {},
  byClassId: {}
};

export const selectMethods = (state: RootState) => {
  return state.method.byId;
}

export const selectMethodById = (methodId: string) => (state: RootState): Method => {
  return state.method.byId[methodId];
}

export const selectMethodsByClazzesIds = (clazzesIds: string[]) => (state: RootState) => {
  let result: string[] = [];
  for (let clazzId of clazzesIds) {
    const methodsIdsForClazzIdMap = state.method.byClassId[clazzId];
    const methodsIdsForClazzId: string[] = (methodsIdsForClazzIdMap && Object.keys(methodsIdsForClazzIdMap)) || [];
    result = [...result, ...methodsIdsForClazzId];
  }
  return result;
}

export const selectMethodsForSaving = (state: RootState) => {
  return state.method.byId;
}

export const methodSlice = createSlice({
  name: 'method',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    loadMethods: (state, action: PayloadAction<any>) => {
      const byId: Record<string, Method> = action.payload;
      // TODO: some duplication here
      const byClazzId: Record<string, Record<string, boolean>> = {};
      for(let methodId in byId) {
        const clazzId: string = byId[methodId].classId;
        if (byClazzId[clazzId] == null)
          byClazzId[clazzId] = {};
        byClazzId[clazzId][methodId] = true;
      }
      state.byId = byId;
      state.byClassId = byClazzId;
    },
    addMethod: (state, action: PayloadAction<Method>) => {
      const method = action.payload;
      // don't do anything if there is already a method with the same name and class
      if (Object.values(state.byId).some((method_) => method.methodName === method_.methodName && method.classId === method_.classId)) {
        return;
      }
      const methodId: string = uuidv4();
      method.methodId = methodId;
      method.x = 20;
      method.y = Object.values(state.byId).reduce(
        (previousValue: number, currentValue: Method) => Math.max(previousValue, currentValue.y! + currentValue.height!), 0);
      state.byId[methodId] = method;
      let methodIdsForClassId = state.byClassId[method.classId];
      if (methodIdsForClassId == null) {
        methodIdsForClassId = {};
        state.byClassId[method.classId] = methodIdsForClassId;
      }
      methodIdsForClassId[methodId] = true;
    },
    moveMethods: (state, action: PayloadAction<MoveEvent[]>) => {
      for (let moveEvent of action.payload) {
        if (moveEvent.type !== 'method') {
          console.error(new Error('wrong move event type (should be method)'), moveEvent);
          continue;
        }
        // snapping method to grids:
        // the built-in method (from X6) for snapping is not enough because when classes are snapped they don't
        // snap the methods correctly.
        // the following is kind of a work-around (it would be best that the snapping is done when the objects are
        // moved, so now they will move a little bit atfer we are done dragging) but at least the objects are at the
        // right place.
        state.byId[moveEvent.id].x = snapToGrid(state.byId[moveEvent.id].x! + moveEvent.x! - moveEvent.oldX);
        state.byId[moveEvent.id].y = snapToGrid(state.byId[moveEvent.id].y! + moveEvent.y! - moveEvent.oldY);
      }
    },
    deleteMethods: (state, action: PayloadAction<string[]>) => {
      for (let methodId of action.payload) {
        const method = state.byId[methodId];
        if (method == null)
          continue;
        delete state.byId[methodId];
        delete state.byClassId[method.classId][methodId];
      }
    },
  },
});

export const {loadMethods, addMethod, moveMethods, deleteMethods} = methodSlice.actions;

export default methodSlice.reducer;
