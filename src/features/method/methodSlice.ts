import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../../@app/store';
import {Method} from "./method";
import {v4 as uuidv4} from 'uuid';

import {MoveEvent} from '../diagram/moveEvent';

export interface MethodState {
  byId: Record<string, Method>;
  byClassId: Record<string, Record<string, boolean>>;
}

const initialState: MethodState = {
  byId: {
    '1': {methodId: '1', methodName: 'method 1', classId: 'a', x: 20, y: 150, width: 100, height: 40},
    '22': {methodId: '22', methodName: 'method 22', classId: 'b', x: 400, y: 240, width: 100, height: 40},
    '1234': {methodId: '1234', methodName: 'method 1234', classId: 'a', x: 200, y: 80, width: 100, height: 40},
  },
  byClassId: {
    'a': {'1': true, '1234': true},
    'b': {'22': true},
  }
};

export const selectMethods = (state: RootState) => {
  return state.method.byId;
}

export const methodSlice = createSlice({
  name: 'method',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    addMethod: (state, action: PayloadAction<Method>) => {
      const method = action.payload;
      const methodId: string = uuidv4();
      method.methodId = methodId;
      method.width = 80;
      method.height = 40;
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
        state.byId[moveEvent.id].x! += moveEvent.x! - moveEvent.oldX;
        state.byId[moveEvent.id].y! += moveEvent.y! - moveEvent.oldY;
      }
    },
    removeMethod: (state, action: PayloadAction<string>) => {
      const methodId: string = action.payload;
      const method = state.byId[methodId];
      delete state.byId[methodId];
      delete state.byClassId[method.classId][methodId];
    },
  },
});

export const {addMethod, moveMethods, removeMethod} = methodSlice.actions;

export default methodSlice.reducer;
