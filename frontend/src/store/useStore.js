import { create } from 'zustand';

export const useStore = create((set) => ({
  routes: [],
  selectedRoute: null,
  locations: [],
  darkMode: false,

  setRoutes: (routes) => set({ routes }),
  setSelectedRoute: (route) => set({ selectedRoute: route }),
  setLocations: (locations) => set({ locations }),
  toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
}));
