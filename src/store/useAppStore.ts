import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  currentStoreId: number | null;
  setCurrentStore: (id: number | null) => void;
  collapsed: boolean;
  toggleCollapsed: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentStoreId: 1,
      setCurrentStore: (id) => set({ currentStoreId: id }),
      collapsed: false,
      toggleCollapsed: () => set({ collapsed: !get().collapsed }),
    }),
    { name: 'qz-shop-app' }
  )
);
