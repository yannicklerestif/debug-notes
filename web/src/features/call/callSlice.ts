import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../../@app/store';
import {v4 as uuidv4} from 'uuid';
import {Call} from "./call";

export interface CallState {
  byId: Record<string, Call>;
}

const initialState: CallState = {
  byId: {
    '1-1234': { callId: '1-1234', sourceMethodId: '1', targetMethodId: '1234' },
    '1-22': { callId: '1-22', sourceMethodId: '1', targetMethodId: '22' },
  },
};

export const selectCalls = (state: RootState) => {
  return state.call.byId;
}

export const selectCallsForSaving = (state: RootState) => {
  return state.call.byId;
}

export const selectCallsByMethodsIds = (methodsIds: string[]) => (state: RootState) => {
  const methodsIdsMap: Record<string, boolean> = {};
  for (let methodsId of methodsIds) {
    methodsIdsMap[methodsId] = true;
  }
  return Object.keys(state.call.byId)
      .filter(callId => {
        const call: Call = state.call.byId[callId];
        return methodsIdsMap[call.targetMethodId!] || methodsIdsMap[call.sourceMethodId];
  })
}

export const callSlice = createSlice({
  name: 'call',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    loadCalls: (state, action: PayloadAction<any>) => {
      state.byId = action.payload;
    },
    addCall: (state, action: PayloadAction<Call>) => {
      const call = action.payload;
      const callId: string = uuidv4();
      call.callId = callId;
      state.byId[callId] = call;
    },
    deleteCalls: (state, action: PayloadAction<string[]>) => {
      for (let callId of action.payload) {
        delete state.byId[callId];
      }
    },
  },
});

export const {loadCalls, addCall, deleteCalls} = callSlice.actions;

export default callSlice.reducer;
