import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import type { PayloadAction } from '@reduxjs/toolkit';
import { getFiles, postFile, deleteFile  } from '../../api/files';
import type { FilesState, FileDTO, RejectedPayload } from '../types';

const initialState: FilesState = {
  items: [],
  status: 'idle',
  error: null,
  uploadStatus: 'idle',
  uploadError: null,
};

export const fetchFiles = createAsyncThunk<
  FileDTO[],
  { userId?: number } | void,
  { rejectValue: RejectedPayload }
>(
  'files/fetchFiles',
  async (arg, { rejectWithValue }) => {
    try {
      const userId = arg && 'userId' in arg ? arg.userId : undefined;
      const files = await getFiles(userId);
      return files;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status ?? null;
        const detailRaw = (err.response?.data as { detail?: unknown } | undefined)?.detail;
        const detail = typeof detailRaw === 'string' ? detailRaw : 'Failed to load files';

        return rejectWithValue({ status, detail });
      }

      return rejectWithValue({ status: null, detail: 'Failed to load files' });
    }
  }
);

export const uploadFile = createAsyncThunk<
  FileDTO,
  { file: File, comment: string | null },
  { rejectValue: RejectedPayload }
>(
  'files/uploadFile',
  async ({ file, comment }, { rejectWithValue }) => {
    try {
      const normalizedComment = comment && comment.trim().length > 0 ? comment : null;
      const created = await postFile(file, normalizedComment);
      return created;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status ?? null;

        const data = err.response?.data as { detail?: unknown; errors?: unknown } | undefined;

        const detailRaw = data?.detail;
        const detail = typeof detailRaw === 'string' ? detailRaw : 'Failed to upload file';

        const errorsRaw = data?.errors;
        const errors = typeof errorsRaw === 'object' && errorsRaw !== null ? (errorsRaw as Record<string, string[]>) : undefined;

        return rejectWithValue({ status, detail, errors });
      }

      return rejectWithValue({ status: null, detail: 'Failed to upload file' });
    }
  }
);

export const removeFile = createAsyncThunk<
  { fileId: number },
  { fileId: number },
  { rejectValue: RejectedPayload }
>(
  'files/removeFile',
  async ({ fileId }, { rejectWithValue }) => {
    try {
      await deleteFile(fileId);
      return { fileId };
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status ?? null;
        const detailRaw = (err.response?.data as { detail?: unknown } | undefined)?.detail;
        const detail = typeof detailRaw === 'string' ? detailRaw : 'Failed to delete file';

        return rejectWithValue({ status, detail });
      }

      return rejectWithValue({ status: null, detail: 'Failed to delete file' });
    }
  }
);

const filesSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {
    resetUploadState: (state) => {
      state.uploadStatus = initialState.uploadStatus;
      state.uploadError = initialState.uploadError;
    },
    markDownloaded(state, action: PayloadAction<{ fileId: number; iso: string }>) {
      const { fileId, iso } = action.payload;

      const target = state.items.find((f) => f.id === fileId);
      if (!target) return;

      target.last_downloaded = iso;
    },
    updateFileMeta(
      state,
      action: PayloadAction<{
        fileId: number;
        original_name?: string;
        comment?: string | null;
        share_url?: string | null;
        share_created?: string | null;
      }>
    ) {
      const {
        fileId,
        original_name,
        comment,
        share_url,
        share_created,
      } = action.payload;

      const target = state.items.find((f) => f.id === fileId);
      if (!target) return;

      if (original_name !== undefined) {
        target.original_name = original_name;
      }

      if (comment !== undefined) {
        target.comment = comment;
      }

      if (share_url !== undefined) {
        target.share_url = share_url;
      }

      if (share_created !== undefined) {
        target.share_created = share_created;
      }
    },
  },
  extraReducers(builder) {
    builder.addCase(fetchFiles.pending, (state) => {
      state.status = 'loading';
      state.error = null;
    });

    builder.addCase(fetchFiles.fulfilled, (state, action: PayloadAction<FileDTO[]>) => {
      state.status = 'succeeded';
      state.items = action.payload;
      state.error = null;
    });

    builder.addCase(fetchFiles.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload?.detail ?? 'Failed to load files';
    });

    builder.addCase(uploadFile.pending, (state) => {
      state.uploadStatus = 'loading';
      state.uploadError = null;
    });

    builder.addCase(uploadFile.fulfilled, (state, action: PayloadAction<FileDTO>) => {
      state.uploadStatus = 'succeeded';
      state.uploadError = null;
      state.items = [action.payload, ...state.items];
    });

    builder.addCase(uploadFile.rejected, (state, action) => {
      state.uploadStatus = 'failed';
      state.uploadError = action.payload?.detail ?? 'Failed to upload file';
    });

    builder.addCase(removeFile.fulfilled, (state, action: PayloadAction<{ fileId: number }>) => {
      state.items = state.items.filter((f) => f.id !== action.payload.fileId);
    });

    builder.addCase(removeFile.rejected, (state, action) => {
      state.error = action.payload?.detail ?? 'Failed to delete file';
    });

  },
});

export default filesSlice.reducer;

export const { resetUploadState, markDownloaded, updateFileMeta } = filesSlice.actions;