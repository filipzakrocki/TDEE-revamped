import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import calcReducer from '../features/calc/calcSlice';
import interfaceReducer from '../features/interface/interfaceSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    calc: calcReducer,
    interface: interfaceReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;