import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { auth } from '../../firebase/firebase';
import { User, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { fetchDataStart, fetchDataFailure, fetchDataSuccess } from '../interface/interfaceSlice';

export const signIn = createAsyncThunk('auth/signIn', async ({ email, password }: { email: string; password: string; }, {dispatch}) => {
  dispatch(fetchDataStart());
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    if (userCredential) dispatch(fetchDataSuccess());
    return userCredential.user;
  } catch {
    dispatch(fetchDataFailure('Invalid email or password'));
    throw new Error('Invalid email or password');
  }
});

export const signOut = createAsyncThunk('auth/signOut', async () => {
  await auth.signOut();
});

export const register = createAsyncThunk('auth/register', async ({ email, password }: { email: string; password: string; }) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  return userCredential.user;
});

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null as User | null, isAuthenticated: false as boolean},
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(signIn.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(signOut.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      });
  },
});

export default authSlice.reducer;