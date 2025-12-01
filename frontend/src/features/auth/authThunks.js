import { createAsyncThunk } from "@reduxjs/toolkit";
import { loginApi, registerApi, logoutApi, checkAuthApi } from "../../api/auth";

export const loginThunk = createAsyncThunk(
  "auth/login",
  async (data, { rejectWithValue }) => {
    try {
      const res = await loginApi(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Login failed");
    }
  }
);

export const registerThunk = createAsyncThunk(
  "auth/register",
  async (data, { rejectWithValue }) => {
    try {
      const res = await registerApi(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Registration failed"
      );
    }
  }
);

export const logoutThunk = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await logoutApi();
      return {};
    } catch (err) {
      return rejectWithValue("Logout failed");
    }
  }
);

export const checkAuthThunk = createAsyncThunk(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      const res = await checkAuthApi();
      return res.data;
    } catch (err) {
      return rejectWithValue("Not authenticated");
    }
  }
);
