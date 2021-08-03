import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../../@app/store';
import {v4 as uuidv4} from 'uuid';
import {Call} from "./call";

export interface CallState {
  byId: Record<string, Call>;
}

const initialState: CallState = {
  byId: {
    '1-1234': { callId: '1-1234', outMethodId: '1', inMethodId: '1234' },
    '1-22': { callId: '1-22', outMethodId: '1', inMethodId: '22' },
  },
};

export const selectCalls = (state: RootState) => {
  return state.call.byId;
}

export const selectCallsForSaving = (state: RootState) => {
  return state.call.byId;
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
  },
});

export const {loadCalls, addCall} = callSlice.actions;

export default callSlice.reducer;
