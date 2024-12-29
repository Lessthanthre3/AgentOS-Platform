import create from 'zustand';

const useWindowManager = create((set) => ({
  windows: [],
  activeWindowId: null,
  nextZIndex: 1000,

  addWindow: (window) =>
    set((state) => ({
      windows: [
        ...state.windows,
        {
          ...window,
          id: `window-${Date.now()}`,
          zIndex: state.nextZIndex,
        },
      ],
      nextZIndex: state.nextZIndex + 1,
      activeWindowId: `window-${Date.now()}`,
    })),

  removeWindow: (windowId) =>
    set((state) => ({
      windows: state.windows.filter((w) => w.id !== windowId),
      activeWindowId:
        state.activeWindowId === windowId
          ? state.windows[state.windows.length - 2]?.id || null
          : state.activeWindowId,
    })),

  minimizeWindow: (windowId) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === windowId ? { ...w, isMinimized: !w.isMinimized } : w
      ),
    })),

  focusWindow: (windowId) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === windowId
          ? { ...w, zIndex: state.nextZIndex }
          : w
      ),
      nextZIndex: state.nextZIndex + 1,
      activeWindowId: windowId,
    })),

  updateWindowPosition: (windowId, position) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === windowId ? { ...w, position } : w
      ),
    })),

  updateWindowSize: (windowId, size) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === windowId ? { ...w, size } : w
      ),
    })),
}));

export default useWindowManager;
