import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import argumentReducer from '../features/argument/argumentSlice';
import callReducer from '../features/call/callSlice';
import clazzReducer from '../features/clazz/clazzSlice';
import deletionReducer from '../features/clazz/clazzSlice';
import methodReducer from '../features/method/methodSlice';
import namespaceReducer from '../features/namespace/namespaceSlice';
import diagramPositionReducer from '../features/diagram/diagramPosition/diagramPositionSlice';
import persistenceReducer from '../features/persistence/persistenceSlice';
import selectionReducer from '../features/selection/selectionSlice';
import ideListenerMiddleware from '../features/lazilyAdd/ideListenerMiddleware';

export const store = configureStore({
  reducer: {
    argument: argumentReducer,
    call: callReducer,
    clazz: clazzReducer,
    deletion: deletionReducer,
    method: methodReducer,
    namespace: namespaceReducer,
    diagramPosition: diagramPositionReducer,
    persistence: persistenceReducer,
    selection: selectionReducer,
  },
  middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(ideListenerMiddleware),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
