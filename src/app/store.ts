import { configureStore } from '@reduxjs/toolkit';

import authReducer from '../stores/auth/authSlice';
import calcReducer from '../stores/calc/calcSlice';
import interfaceReducer from '../stores/interface/interfaceSlice';

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
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;