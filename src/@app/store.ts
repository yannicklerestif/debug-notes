import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import argumentReducer from '../features/argument/argumentSlice';
import callReducer from '../features/call/callSlice';
import clazzReducer from '../features/clazz/clazzSlice';
import deletionReducer from '../features/clazz/clazzSlice';
import methodReducer from '../features/method/methodSlice';
import namespaceReducer from '../features/namespace/namespaceSlice';
import persistenceReducer from '../features/persistence/persistenceSlice';
import selectionReducer from '../features/selection/selectionSlice';

export const store = configureStore({
  reducer: {
    argument: argumentReducer,
    call: callReducer,
    clazz: clazzReducer,
    deletion: deletionReducer,
    method: methodReducer,
    namespace: namespaceReducer,
    persistence: persistenceReducer,
    selection: selectionReducer,
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
