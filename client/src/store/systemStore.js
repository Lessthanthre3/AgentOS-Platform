import create from 'zustand';

const useSystemState = create((set) => ({
  isMatrixEnabled: true,
  isSettingsOpen: false,
  theme: 'dark',
  
  toggleMatrix: () =>
    set((state) => ({
      isMatrixEnabled: !state.isMatrixEnabled,
    })),

  toggleSettings: () =>
    set((state) => ({
      isSettingsOpen: !state.isSettingsOpen,
    })),

  setTheme: (theme) =>
    set(() => ({
      theme,
    })),
}));

export default useSystemState;
