import { create } from 'zustand';
import { User, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/firebase';
import { useInterfaceStore } from '../interface/interfaceStore';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  signIn: async (email: string, password: string) => {
    const { fetchDataStart, fetchDataSuccess, fetchDataFailure } = useInterfaceStore.getState();
    fetchDataStart();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      set({ user: userCredential.user, isAuthenticated: true });
      fetchDataSuccess();
    } catch (error) {
      fetchDataFailure('Invalid email or password');
      throw error;
    }
  },

  signOut: async () => {
    await auth.signOut();
    set({ user: null, isAuthenticated: false });
  },

  register: async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    set({ user: userCredential.user, isAuthenticated: true });
  }
})); 

export const useAuth = () => ({
  user: useAuthStore(state => state.user),
  isAuthenticated: useAuthStore(state => state.isAuthenticated),
  signIn: useAuthStore(state => state.signIn),
  signOut: useAuthStore(state => state.signOut),
  register: useAuthStore(state => state.register),
})