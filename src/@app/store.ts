import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import callReducer from '../features/call/callSlice';
import clazzReducer from '../features/clazz/clazzSlice';
import methodReducer from '../features/method/methodSlice';
import namespaceReducer from '../features/namespace/namespaceSlice';

export const store = configureStore({
  reducer: {
    call: callReducer,
    clazz: clazzReducer,
    method: methodReducer,
    namespace: namespaceReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
