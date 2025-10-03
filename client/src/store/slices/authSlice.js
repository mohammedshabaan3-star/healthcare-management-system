// client/src/store/slices/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: null,
    isAuthenticated: false,
    // token removed: using session-based auth via cookies
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginSuccess: (state, action) => {
            state.user = action.payload.user;
            state.isAuthenticated = true;
        },
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
        },
        setUser: (state, action) => {
            state.user = action.payload;
        }
    }
});

export const { loginSuccess, logout, setUser } = authSlice.actions;
export default authSlice.reducer;