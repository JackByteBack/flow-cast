import { create } from 'zustand';

export const useStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  routes: [],
  selectedRoute: null,
  locations: [],
  darkMode: false,

  setUser: (user) => set({ user }),
  setToken: (token) => {
    localStorage.setItem('token', token);
    set({ token });
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, routes: [], selectedRoute: null });
  },
  setRoutes: (routes) => set({ routes }),
  setSelectedRoute: (route) => set({ selectedRoute: route }),
  setLocations: (locations) => set({ locations }),
  toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
}));
