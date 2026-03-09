import React, { useEffect } from 'react';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import { Sidebar } from './components/Sidebar';
import { Cheatsheet } from './components/Cheatsheet';
import { LayoutPicker } from './components/LayoutPicker';
import { Toolbar } from './components/Toolbar';
import { useStore } from './store/useStore';
import { PanelLeftClose, PanelLeftOpen, Share2, Play, FileText, X, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const isSidebarOpen = useStore((state) => state.isSidebarOpen);
  const toggleSidebar = useStore((state) => state.toggleSidebar);
  const isPreviewFullscreen = useStore((state) => state.isPreviewFullscreen);
  const setPreviewFullscreen = useStore((state) => state.setPreviewFullscreen);
  const isCheatsheetOpen = useStore((state) => state.isCheatsheetOpen);
  const setCheatsheetOpen = useStore((state) => state.setCheatsheetOpen);
  const setCurrentSlide = useStore((state) => state.setCurrentSlide);

  // Exit presentation mode on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPreviewFullscreen(false);
        setCheatsheetOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setPreviewFullscreen, setCheatsheetOpen]);

  // Reset slide index when entering fullscreen
  const handleStartPresentation = () => {
    setCurrentSlide(0);
    setPreviewFullscreen(true);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-white overflow-hidden font-sans text-neutral-900">
      <Cheatsheet />
      <LayoutPicker />

      {/* Fullscreen Preview Overlay */}
      <AnimatePresence>
        {isPreviewFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex flex-col"
          >
            <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
              <span className="text-white/40 text-[10px] uppercase tracking-widest font-bold mr-2">Press ESC to exit</span>
              <button
                onClick={() => setPreviewFullscreen(false)}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-neutral-900">
              {/* ✅ Only mounted when fullscreen is active */}
              <Preview />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="h-14 border-b border-neutral-200 flex items-center justify-between px-6 shrink-0 bg-white z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center text-white font-bold italic">
              M
            </div>
            <h1 className="font-bold tracking-tight text-lg">MarpFlow</h1>
          </div>
          <div className="h-4 w-[1px] bg-neutral-200 mx-2" />
          <div className="flex items-center gap-1 text-neutral-400 text-sm font-medium">
            <FileText size={16} />
            <span>untitled-deck.md</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCheatsheetOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50 rounded-md transition-colors"
          >
            <HelpCircle size={16} />
            <span>Help</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50 rounded-md transition-colors">
            <Share2 size={16} />
            <span>Share</span>
          </button>
          <button
            onClick={handleStartPresentation}
            className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium bg-neutral-900 text-white hover:bg-neutral-800 rounded-md transition-colors shadow-sm"
          >
            <Play size={16} fill="currentColor" />
            <span>Present</span>
          </button>
          <button
            onClick={toggleSidebar}
            className="p-2 text-neutral-500 hover:bg-neutral-50 rounded-md transition-colors"
          >
            {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex overflow-hidden">
          {/* Left Pane: Editor */}
          <div className="w-1/2 h-full flex flex-col relative">
            <Toolbar />
            <div className="flex-1 overflow-hidden">
              <Editor />
            </div>
          </div>

          {/* Right Pane: Preview — hidden during fullscreen to avoid dual-instance loop */}
          <div className="w-1/2 h-full relative bg-neutral-50 border-l border-neutral-200">
            {/* ✅ Only mounted when NOT in fullscreen */}
            {!isPreviewFullscreen && <Preview />}
          </div>
        </div>

        {/* Sidebar */}
        <Sidebar />
      </main>

      {/* Footer / Status Bar */}
      <footer className="h-8 border-t border-neutral-200 bg-white flex items-center justify-between px-4 shrink-0 text-[10px] uppercase tracking-widest font-bold text-neutral-400">
        <div className="flex items-center gap-4">
          <span>UTF-8</span>
          <span>Markdown</span>
          <span>Marp Core v3.x</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Ready</span>
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </footer>
    </div>
  );
}