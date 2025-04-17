import { create } from 'zustand';

interface InterfaceState {
  loading: boolean;
  error: string | null;
  fetchDataStart: () => void;
  fetchDataSuccess: () => void;
  fetchDataFailure: (error: string) => void;
}

export const useInterfaceStore = create<InterfaceState>((set) => ({
  loading: false,
  error: null,
  fetchDataStart: () => set({ loading: true, error: null }),
  fetchDataSuccess: () => set({ loading: false, error: null }),
  fetchDataFailure: (error) => set({ loading: false, error })
})); 