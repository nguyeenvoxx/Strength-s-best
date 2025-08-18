import { create } from 'zustand';

interface SelectedItemsState {
  selectedItemIds: string[];
  setSelectedItemIds: (ids: string[]) => void;
  clearSelectedItems: () => void;
}

export const useSelectedItemsStore = create<SelectedItemsState>((set) => ({
  selectedItemIds: [],
  setSelectedItemIds: (ids: string[]) => set({ selectedItemIds: ids }),
  clearSelectedItems: () => set({ selectedItemIds: [] }),
}));
