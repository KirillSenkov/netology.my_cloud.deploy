import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AdminUserDTO, UserLevel, UserRank } from '../../api/types';
import type { RejectedPayload, Status } from '../types';
import { getUsers, deleteUser, setUserLevel } from '../../api/admin';

type AdminUsersState = {
  items: AdminUserDTO[];

  fetchStatus: Status;
  removeStatus: Status;
  changeLevelStatus: Status;

  fetchError: string | null;
  removeError: string | null;
  changeLevelError: string | null;

  targetUser: AdminUserDTO | null;
};

const initialState: AdminUsersState = {
  items: [],

  fetchStatus: 'idle',
  removeStatus: 'idle',
  changeLevelStatus: 'idle',

  fetchError: null,
  removeError: null,
  changeLevelError: null,

  targetUser: null,
};

export const fetchUsers = createAsyncThunk<
  AdminUserDTO[],
  void,
  { rejectValue: RejectedPayload }
>('adminUsers/fetch', async (_, { rejectWithValue }) => {
  try {
    return await getUsers();
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.log('объект:', err);
      console.log('статус:', err.response?.status);
      console.log('башка:', err.response?.headers);
      console.log('data:', err.response?.data);
      console.log('урло:', err.config?.url);
      console.log('метод:', err.config?.method);
      const status = err.response?.status ?? null;
      const detailRaw = (err.response?.data as { detail?: unknown } | undefined)?.detail;
      const detail = typeof detailRaw === 'string' ? detailRaw : 'Failed to load users';

      return rejectWithValue({ status, detail });
    }
    return rejectWithValue({ status: null, detail: 'Failed to load users' });
  }
});

export const removeUser = createAsyncThunk<
  { userId: number; filesDeleted: boolean },
  { userId: number; deleteFiles: boolean },
  { rejectValue: RejectedPayload }
>('adminUsers/delete', async ({ userId, deleteFiles }, { rejectWithValue }) => {
  try {
    const { files_deleted } = await deleteUser(userId, deleteFiles);
    return { userId, filesDeleted: files_deleted };
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status ?? null;
      const detailRaw = (err.response?.data as { detail?: unknown } | undefined)?.detail;
      const detail = typeof detailRaw === 'string' ? detailRaw : 'Failed to delete user';
      return rejectWithValue({ status, detail });
    }
    return rejectWithValue({ status: null, detail: 'Failed to delete user' });
  }
});

export const changeUserLevel = createAsyncThunk<
  { userId: number;
    level: UserLevel;
    rank: UserRank;
    isAdmin: boolean;
    isStaff: boolean;
    isSuperuser: boolean
  },
  { userId: number; level: UserLevel },
  { rejectValue: RejectedPayload }
>('adminUsers/setLevel', async ({ userId, level }, { rejectWithValue }) => {
  try {
    const { user } = await setUserLevel(userId, level);
    return {
      userId: user.id,
      level: user.level,
      rank: user.rank,
      isAdmin: user.isAdmin,
      isStaff: user.isStaff,
      isSuperuser: user.isSuperuser,
    };
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status ?? null;
      const detailRaw = (err.response?.data as { detail?: unknown } | undefined)?.detail;
      const detail = typeof detailRaw === 'string' ? detailRaw : 'Failed to change level';
      return rejectWithValue({ status, detail });
    }
    return rejectWithValue({ status: null, detail: 'Failed to change level' });
  }
});

const adminUsersSlice = createSlice({
  name: 'adminUsers',
  initialState,
  reducers: {
    clearUsersErrors(state) {
      state.fetchError = null;
			state.removeError = null;
			state.changeLevelError = null;
    },
    setTargetUser: (state, action: PayloadAction<number>) => {
      const userId = action.payload;
      state.targetUser = state.items.find(user => user.id === userId) ?? null;
    },
    clearTargetUser: (state) => {
      state.targetUser = null;
    },
  },
  extraReducers(builder) {
    // fetchUsers
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.fetchStatus = 'loading';
        state.fetchError = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<AdminUserDTO[]>) => {
        state.fetchStatus = 'succeeded';
        state.items = action.payload;
        state.fetchError = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.fetchStatus = 'failed';
        state.fetchError = action.payload?.detail ?? 'Failed to load users';
      })

    // removeUser
			.addCase(removeUser.pending, (state) => {
				state.removeStatus = 'loading';
				state.removeError = null;
			})
			.addCase(removeUser.fulfilled, (state, action) => {
				state.removeStatus = 'succeeded';
				const { userId } = action.payload;
				state.items = state.items.filter((u) => u.id !== userId);
				state.removeError = null;
			})
			.addCase(removeUser.rejected, (state, action) => {
				state.removeStatus = 'failed';
				state.removeError = action.payload?.detail ?? 'Failed to delete user';
			})

    // changeUserLevel
    	.addCase(changeUserLevel.pending, (state) => {
        state.changeLevelStatus = 'loading';
        state.changeLevelError = null;
    })
			.addCase(changeUserLevel.fulfilled, (state, action) => {
        state.changeLevelStatus = 'succeeded';
        const { userId, level, rank, isAdmin, isStaff, isSuperuser } = action.payload;

        const target = state.items.find((u) => u.id === userId);
        if (target) {
          target.level = level;
          target.rank = rank;
          target.isAdmin = isAdmin;
          target.isStaff = isStaff;
          target.isSuperuser = isSuperuser;
        }

        if (state.targetUser && state.targetUser.id === userId) {
          state.targetUser = {
            ...state.targetUser,
            level,
            rank,
            isAdmin,
            isStaff,
            isSuperuser,
          };
        }
        state.changeLevelError = null;
    })
		.addCase(changeUserLevel.rejected, (state, action) => {
        state.changeLevelStatus = 'failed';
        state.changeLevelError = action.payload?.detail ?? 'Failed to change user level';
    });
  },
});

export default adminUsersSlice.reducer;
export const { clearUsersErrors, setTargetUser, clearTargetUser } = adminUsersSlice.actions;
