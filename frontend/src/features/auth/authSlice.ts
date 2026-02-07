import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RejectedPayload, AuthState, FieldErrors  } from '../types';
import type { UserPublic } from '../../api/types';
import {
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
  me as apiMe,
} from '../../api/auth';
import type { RegisterRequest, RegisterResponse } from '../../api/types';

const initialState: AuthState = {
  user: null,
  status: 'idle',
  error: null,
  fieldErrors: null,
};

export const login = createAsyncThunk<
  UserPublic,
  { username: string, password: string },
  { rejectValue: RejectedPayload }
>(
  'auth/login',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await apiLogin(payload);
      return res.user;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status ?? null;
        const detailRaw = (err.response?.data as { detail?: unknown } | undefined)?.detail;
        const detail = typeof detailRaw === 'string' ? detailRaw : 'Login failed';

        return rejectWithValue({ status, detail });
      }

      return rejectWithValue({ status: null, detail: 'Login failed' });
    }
  }
);

export const logout = createAsyncThunk<
  void,
  void,
  { rejectValue: RejectedPayload }
>(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await apiLogout();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status ?? null;
        const detailRaw = (err.response?.data as { detail?: unknown } | undefined)?.detail;
        const detail = typeof detailRaw === 'string' ? detailRaw : 'Logout failed';

        return rejectWithValue({ status, detail });
      }

      return rejectWithValue({ status: null, detail: 'Logout failed' });
    }
  }
);

export const bootstrapAuth = createAsyncThunk<
  UserPublic,
  void,
  { rejectValue: RejectedPayload }
>(
  'auth/bootstrapAuth',
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiMe();
      return res.user;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status ?? null;

        if (status === 401) {
          return rejectWithValue({ status, detail: 'Not authenticated' });
        }

        const detailRaw = (err.response?.data as { detail?: unknown } | undefined)?.detail;
        const detail = typeof detailRaw === 'string' ? detailRaw : 'Auth bootstrap failed';
        return rejectWithValue({ status, detail });
      }

      return rejectWithValue({ status: null, detail: 'Auth bootstrap failed' });
    }
  }
);


export const register = createAsyncThunk<
  RegisterResponse,
  RegisterRequest,
  { rejectValue: RejectedPayload }
>(
  'auth/register',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await apiRegister(payload);
      return res;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status ?? null;
        const data = err.response?.data as { detail?: unknown, errors?: unknown } | undefined;

        const detail = typeof data?.detail === 'string' ? data.detail : 'Registration failed';

        const errorsUnknown = data?.errors;
        const errors = typeof errorsUnknown === 'object' && errorsUnknown !== null
          ? (errorsUnknown as FieldErrors)
          : undefined;

        return rejectWithValue({ status, detail, errors });
      }

      return rejectWithValue({ status: null, detail: 'Registration failed' });
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetAuthError(state) {
      state.error = null;
      state.fieldErrors = null;
    },
  },
  extraReducers(builder) {
    builder.addCase(login.pending, (state) => {
      state.status = 'loading';
      state.error = null;
      state.fieldErrors = null;
    });

    builder.addCase(login.fulfilled, (state, action: PayloadAction<UserPublic>) => {
      state.status = 'succeeded';
      state.user = action.payload;
      state.error = null;
      state.fieldErrors = null;
    });

    builder.addCase(login.rejected, (state, action) => {
      state.status = 'failed';
      state.user = null;
      state.error = action.payload?.detail ?? 'Login failed';
      state.fieldErrors = null;
    });

    builder.addCase(logout.pending, (state) => {
      state.status = 'loading';
      state.error = null;
      state.fieldErrors = null;
    });

    builder.addCase(logout.fulfilled, (state) => {
      state.status = 'idle';
      state.user = null;
      state.error = null;
      state.fieldErrors = null;
    });

    builder.addCase(logout.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload?.detail ?? 'Logout failed';
      state.fieldErrors = null;
    });

    builder.addCase(bootstrapAuth.pending, (state) => {
      state.status = 'loading';
      state.error = null;
      state.fieldErrors = null;
    });

    builder.addCase(bootstrapAuth.fulfilled, (state, action: PayloadAction<UserPublic>) => {
      state.status = 'succeeded';
      state.user = action.payload;
      state.error = null;
      state.fieldErrors = null;
    });

    builder.addCase(bootstrapAuth.rejected, (state, action) => {
      const status = action.payload?.status ?? null;

      if (status === 401) {
        state.status = 'idle';
        state.user = null;
        state.error = null;
        state.fieldErrors = null;
        return;
      }

      state.status = 'failed';
      state.user = null;
      state.error = action.payload?.detail ?? 'Auth bootstrap failed';
      state.fieldErrors = null;
    });

    builder.addCase(register.pending, (state) => {
      state.status = 'loading';
      state.error = null;
      state.fieldErrors = null;
    });

    builder.addCase(register.fulfilled, (state) => {
      state.status = 'succeeded';
      state.error = null;
      state.fieldErrors = null;
    });

    builder.addCase(register.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload?.detail ?? 'Registration failed';
      state.fieldErrors = action.payload?.errors ?? null;
    });
  },
});

export const { resetAuthError } = authSlice.actions;

export default authSlice.reducer;
