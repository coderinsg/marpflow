import React from 'react';
import { useStore } from '../store/useStore';
import { X, BookOpen, Image as ImageIcon, Layout, Palette, Type } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Cheatsheet: React.FC = () => {
  const isCheatsheetOpen = useStore((state) => state.isCheatsheetOpen);
  const setCheatsheetOpen = useStore((state) => state.setCheatsheetOpen);

  const sections = [
    {
      title: 'Basics',
      icon: <BookOpen size={16} />,
      items: [
        { label: 'New Slide', code: '---' },
        { label: 'Header', code: '# Title' },
        { label: 'Bold', code: '**text**' },
        { label: 'List', code: '- item' },
      ]
    },
    {
      title: 'Directives',
      icon: <Layout size={16} />,
      items: [
        { label: 'Enable Marp', code: 'marp: true' },
        { label: 'Paginate', code: 'paginate: true' },
        { label: 'Theme', code: 'theme: default' },
        { label: 'Header', code: 'header: text' },
      ]
    },
    {
      title: 'Images',
      icon: <ImageIcon size={16} />,
      items: [
        { label: 'Resize', code: '![width:200px](url)' },
        { label: 'Background', code: '![bg](url)' },
        { label: 'Split Left', code: '![bg left](url)' },
        { label: 'Filters', code: '![blur:5px](url)' },
      ]
    },
    {
      title: 'Styling',
      icon: <Palette size={16} />,
      items: [
        { label: 'Slide Class', code: '<!-- _class: invert -->' },
        { label: 'Slide BG', code: '<!-- _backgroundColor: #000 -->' },
        { label: 'Slide Color', code: '<!-- _color: #fff -->' },
      ]
    }
  ];

  return (
    <AnimatePresence>
      {isCheatsheetOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]"
          >
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-neutral-900 text-white rounded-lg">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-lg">Marp Syntax Cheatsheet</h2>
                  <p className="text-xs text-neutral-500">Quick reference for your presentations</p>
                </div>
              </div>
              <button 
                onClick={() => setCheatsheetOpen(false)}
                className="p-2 hover:bg-neutral-200 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 gap-6">
              {sections.map((section) => (
                <div key={section.title} className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-neutral-400 uppercase tracking-widest">
                    {section.icon}
                    <span>{section.title}</span>
                  </div>
                  <div className="space-y-2">
                    {section.items.map((item) => (
                      <div key={item.label} className="flex flex-col gap-1">
                        <span className="text-[10px] text-neutral-500 font-medium">{item.label}</span>
                        <code className="bg-neutral-100 p-1.5 rounded text-xs font-mono text-neutral-800 border border-neutral-200">
                          {item.code}
                        </code>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-neutral-50 border-t border-neutral-100 text-center">
              <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">
                Click anywhere outside to close
              </p>
            </div>
          </motion.div>
          <div 
            className="absolute inset-0 -z-10" 
            onClick={() => setCheatsheetOpen(false)} 
          />
        </div>
      )}
    </AnimatePresence>
  );
};
