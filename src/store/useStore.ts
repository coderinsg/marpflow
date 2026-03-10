import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { EditorView } from '@codemirror/view';

interface ThemeConfig {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
}

interface AppState {
  markdown: string;
  setMarkdown: (markdown: string) => void;
  editorView: EditorView | null;
  setEditorView: (view: EditorView | null) => void;
  theme: ThemeConfig;
  setTheme: (theme: Partial<ThemeConfig>) => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  isPreviewFullscreen: boolean;
  setPreviewFullscreen: (value: boolean) => void;
  isCheatsheetOpen: boolean;
  setCheatsheetOpen: (value: boolean) => void;
  isLayoutPickerOpen: boolean;
  setLayoutPickerOpen: (value: boolean) => void;
  currentSlide: number;
  setCurrentSlide: (index: number) => void;
  slideCount: number;
  setSlideCount: (count: number) => void;
  loadProject: (markdown: string, theme: ThemeConfig) => void;
}

const DEFAULT_MARKDOWN = `---
marp: true
theme: default
paginate: true
backgroundColor: #fff
---

# Welcome to MarpFlow 🚀

Professional presentations from Markdown.

---

# Air-Gapped Ready

This application is designed to work without an internet connection.
All rendering is done locally in your browser.

- **Marp Core**: Local
- **CodeMirror**: Local
- **Icons**: Local

---

# Layouts & Themes

Use the sidebar to:
1. Change colors and fonts
2. Insert slide templates
3. Export to PDF or HTML

---

<!-- _class: invert -->

# Thank You!

Built with ❤️ using Marp and React.
`;

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      markdown: DEFAULT_MARKDOWN,
      // ✅ Fix 1: Just set markdown — no Marp rendering in the store
      setMarkdown: (markdown) => {
        if (get().markdown === markdown) return;
        set({ markdown });
      },

      editorView: null,
      setEditorView: (view) => set((state) => state.editorView === view ? state : { editorView: view }),

      theme: {
        primaryColor: '#3b82f6',
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        fontFamily: 'Inter',
      },
      setTheme: (newTheme) =>
        set((state) => {
          const updatedTheme = { ...state.theme, ...newTheme };
          if (
            updatedTheme.primaryColor === state.theme.primaryColor &&
            updatedTheme.backgroundColor === state.theme.backgroundColor &&
            updatedTheme.textColor === state.theme.textColor &&
            updatedTheme.fontFamily === state.theme.fontFamily
          ) {
            return state;
          }
          return { theme: updatedTheme };
        }),

      isSidebarOpen: true,
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

      isPreviewFullscreen: false,
      setPreviewFullscreen: (value) => set((state) => state.isPreviewFullscreen === value ? state : { isPreviewFullscreen: value }),

      isCheatsheetOpen: false,
      setCheatsheetOpen: (value) => set((state) => state.isCheatsheetOpen === value ? state : { isCheatsheetOpen: value }),
      isLayoutPickerOpen: false,
      setLayoutPickerOpen: (value) => set((state) => state.isLayoutPickerOpen === value ? state : { isLayoutPickerOpen: value }),

      currentSlide: 0,
      // ✅ Fix 2: Just clamp to slideCount from store — no Marp rendering here
      setCurrentSlide: (index) => {
        const { currentSlide, slideCount } = get();
        const safeIndex = Math.max(0, Math.min(index, slideCount - 1));
        if (currentSlide === safeIndex) return;
        set({ currentSlide: safeIndex });
      },

      // ✅ Fix 3: slideCount is now a plain store value, updated by Preview
      // after it has already rendered Marp — single source of rendering
      slideCount: 1,
      setSlideCount: (count) => {
        if (get().slideCount === count) return;
        set((state) => {
          // Also clamp currentSlide if it's now out of bounds
          const currentSlide = state.currentSlide >= count
            ? Math.max(0, count - 1)
            : state.currentSlide;
          return { slideCount: count, currentSlide };
        });
      },

      loadProject: (markdown, theme) => {
        set({ markdown, theme, currentSlide: 0 });
        // Update editor if it exists
        const { editorView } = get();
        if (editorView) {
          editorView.dispatch({
            changes: { from: 0, to: editorView.state.doc.length, insert: markdown }
          });
        }
      },
    }),
    {
      name: 'marpflow-storage',
      partialize: (state) => ({
        markdown: state.markdown,
        theme: state.theme,
        isSidebarOpen: state.isSidebarOpen,
      }),
    }
  )
);