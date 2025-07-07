import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingState {
  isFirstTime: boolean;
  hasHydrated: boolean;
  setIsFirstTime: (isFirstTime: boolean) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

export const useSettingStore = create<SettingState>()(
  persist(
    (set, get) => ({
      isFirstTime: true,
      hasHydrated: false,
      setIsFirstTime: (isFirstTime: boolean) => set({ isFirstTime }),
      setHasHydrated: (hasHydrated: boolean) => set({ hasHydrated }),
    }),
    {
      name: 'setting-storage',
      storage: {
        getItem: async (name: string) => {
          const value = await AsyncStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (name: string, value: any) => {
          await AsyncStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: async (name: string) => {
          await AsyncStorage.removeItem(name);
        },
      },
      onRehydrateStorage: () => (state) => {
        console.log('🔄 Setting store rehydrating...', {
          isFirstTime: state?.isFirstTime
        });
        state?.setHasHydrated(true);
        console.log('✅ Setting store hydrated');
      },
    }
  )
);