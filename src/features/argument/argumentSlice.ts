import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../../@app/store';
import {Argument, ArgumentDirection} from "./argument";

export interface ArgumentState {
  byId: Record<string, Argument>;
  byCallId: Record<string, Record<string, boolean>>;
}

const initialState: ArgumentState = {
  byId: {
    '1-1234-a': {callId: '1-1234', direction: ArgumentDirection.In, name: 'a'},
    '1-1234-b': {callId: '1-1234', direction: ArgumentDirection.In, name: 'b'},
    '1-1234-result': {callId: '1-1234', direction: ArgumentDirection.Out, name: 'result'},
    '1-22-b': {callId: '1-22', direction: ArgumentDirection.In, name: 'b'},
    '1-22-result': {callId: '1-22', direction: ArgumentDirection.Out, name: 'result'},
  },
  byCallId: {
    '1-1234': {'1-1234-a': true, '1-1234-b': true, '1-1234-result': true},
    '1-22': {'1-22-b': true, '1-22-result': true},
  }
};

export const selectArguments = (state: RootState) => {
  return state.argument.byId;
}

export const argumentSlice = createSlice({
  name: 'argument',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  // TODO save / load calls
  reducers: {
  },
});

export const {} = argumentSlice.actions;

export default argumentSlice.reducer;
