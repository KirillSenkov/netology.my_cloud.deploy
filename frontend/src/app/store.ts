import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import filesReducer from '../features/files/filesSlice';
import adminUsersReducer from '../features/adminUsers/adminUsersSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    files: filesReducer,
    adminUsers: adminUsersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
