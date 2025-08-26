import { create } from 'zustand';

interface InterfaceState {
  loading: boolean;
  error: string | null;
  syncing: boolean;
  fetchDataStart: () => void;
  fetchDataSuccess: () => void;
  fetchDataFailure: (error: string) => void;
  syncStart: () => void;
  syncEnd: () => void;
}

export const useInterfaceStore = create<InterfaceState>((set) => ({
  loading: false,
  error: null,
  syncing: false,
  fetchDataStart: () => set({ loading: true, error: null }),
  fetchDataSuccess: () => set({ loading: false, error: null }),
  fetchDataFailure: (error) => set({ loading: false, error }),
  syncStart: () => set({ syncing: true }),
  syncEnd: () => set({ syncing: false })
})); 


export const useInterface = () => ({
  loading: useInterfaceStore(state => state.loading),
  error: useInterfaceStore(state => state.error),
  syncing: useInterfaceStore(state => state.syncing),
  fetchDataStart: useInterfaceStore(state => state.fetchDataStart),
  fetchDataSuccess: useInterfaceStore(state => state.fetchDataSuccess),
  fetchDataFailure: useInterfaceStore(state => state.fetchDataFailure),
  syncStart: useInterfaceStore(state => state.syncStart),
  syncEnd: useInterfaceStore(state => state.syncEnd),
})