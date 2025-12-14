import { create } from 'zustand';
import { User, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/firebase';
import { useInterfaceStore } from '../interface/interfaceStore';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  continueAsGuest: () => void;
}

// Check if guest mode was previously set
const wasGuest = localStorage.getItem('tdee-guest-mode') === 'true';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: wasGuest, // Auto-authenticate if was guest before
  isGuest: wasGuest,

  signIn: async (email: string, password: string) => {
    const { fetchDataStart, fetchDataSuccess, fetchDataFailure } = useInterfaceStore.getState();
    fetchDataStart();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      localStorage.removeItem('tdee-guest-mode'); // Clear guest mode on login
      set({ user: userCredential.user, isAuthenticated: true, isGuest: false });
      fetchDataSuccess();
    } catch (error) {
      fetchDataFailure('Invalid email or password');
      throw error;
    }
  },

  signOut: async () => {
    await auth.signOut();
    localStorage.removeItem('tdee-guest-mode');
    set({ user: null, isAuthenticated: false, isGuest: false });
  },

  register: async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    localStorage.removeItem('tdee-guest-mode');
    set({ user: userCredential.user, isAuthenticated: true, isGuest: false });
  },

  continueAsGuest: () => {
    localStorage.setItem('tdee-guest-mode', 'true');
    set({ user: null, isAuthenticated: true, isGuest: true });
  },
})); 

export const useAuth = () => ({
  user: useAuthStore(state => state.user),
  isAuthenticated: useAuthStore(state => state.isAuthenticated),
  isGuest: useAuthStore(state => state.isGuest),
  signIn: useAuthStore(state => state.signIn),
  signOut: useAuthStore(state => state.signOut),
  register: useAuthStore(state => state.register),
  continueAsGuest: useAuthStore(state => state.continueAsGuest),
})