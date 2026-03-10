import React, { useRef } from 'react';
import { Settings, Download, Palette, Type, Layout, Save, FolderOpen, FileJson } from 'lucide-react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'motion/react';

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
  '#10b981', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6',
  '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#000000', '#1f2937',
  '#4b5563', '#9ca3af', '#e5e7eb', '#ffffff', '#78350f', '#14532d'
];

const ColorPicker = ({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) => (
  <div className="space-y-2">
    <label className="text-xs text-neutral-500 font-medium block">{label}</label>
    <div className="grid gap-1 mb-2" style={{ gridTemplateColumns: 'repeat(12, minmax(0, 1fr))' }}>
      {PRESET_COLORS.map((color) => (
        <button
          key={color}
          onClick={() => onChange(color)}
          className={`w-full aspect-square rounded-sm border border-neutral-200 transition-transform hover:scale-110 ${value === color ? 'ring-2 ring-neutral-900 ring-offset-1 z-10' : ''}`}
          style={{ backgroundColor: color }}
          title={color}
        />
      ))}
    </div>
    <div className="flex gap-2">
      <input 
        type="color" 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-10 h-8 rounded cursor-pointer border border-neutral-200 p-0.5"
      />
      <input 
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 h-8 px-2 border border-neutral-200 rounded text-[10px] font-mono uppercase"
        placeholder="#000000"
      />
    </div>
  </div>
);

export const Sidebar: React.FC = () => {
  const theme = useStore((state) => state.theme);
  const setTheme = useStore((state) => state.setTheme);
  const isSidebarOpen = useStore((state) => state.isSidebarOpen);

  const handleExport = (format: string) => {
    const { markdown, title } = useStore.getState();
    
    if (format === 'pdf') {
      window.print();
    } else if (format === 'html') {
      // In a real app, we'd render the full Marp HTML here
      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title || 'presentation'}.md`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      alert(`Exporting to ${format} is coming soon!`);
    }
  };

  const handleSaveProject = () => {
    const { markdown, theme, title } = useStore.getState();
    const metadata = {
      version: '1.1',
      title,
      theme,
      timestamp: new Date().toISOString()
    };
    
    // Save as a readable Markdown file with metadata in a hidden comment
    const fileContent = `${markdown}\n\n<!-- marpflow-metadata: ${JSON.stringify(metadata)} -->`;
    
    const blob = new Blob([fileContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'presentation'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenProject = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        
        // 1. Try to parse as the new .md format with metadata comment
        const metadataMatch = content.match(/<!-- marpflow-metadata: (.*) -->/);
        if (metadataMatch) {
          try {
            const metadata = JSON.parse(metadataMatch[1]);
            const markdown = content.replace(/<!-- marpflow-metadata: .* -->/, '').trim();
            useStore.getState().loadProject(markdown, metadata.theme, metadata.title);
            return;
          } catch (err) {
            console.error('Error parsing metadata comment:', err);
          }
        }

        // 2. Try to parse as the old .marpflow (JSON) format
        try {
          const data = JSON.parse(content);
          if (data.markdown && data.theme) {
            useStore.getState().loadProject(data.markdown, data.theme, data.title);
            return;
          }
        } catch (err) {
          // Not JSON, that's fine
        }

        // 3. Fallback: load as plain markdown
        const titleFromFilename = file.name.replace(/\.md$/, '');
        useStore.getState().loadProject(content, useStore.getState().theme, titleFromFilename);
        
      } catch (err) {
        console.error('Error opening file:', err);
        alert('Failed to open file.');
      }
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <motion.div
          initial={{ x: 300 }}
          animate={{ x: 0 }}
          exit={{ x: 300 }}
          className="w-80 bg-white border-l border-neutral-200 h-full overflow-y-auto p-6 flex flex-col gap-8 no-print"
        >
          <div className="flex items-center gap-2 text-neutral-900 font-semibold">
            <Settings size={20} />
            <h2>Settings</h2>
          </div>

          <section className="space-y-6">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-400 uppercase tracking-wider">
              <Palette size={14} />
              <span>Colors</span>
            </div>
            
            <ColorPicker 
              label="Primary Color" 
              value={theme.primaryColor} 
              onChange={(val) => setTheme({ primaryColor: val })} 
            />
            
            <ColorPicker 
              label="Text Color" 
              value={theme.textColor} 
              onChange={(val) => setTheme({ textColor: val })} 
            />
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-400 uppercase tracking-wider">
              <Type size={14} />
              <span>Typography</span>
            </div>
            <select 
              className="w-full p-2 border border-neutral-200 rounded text-sm bg-white"
              value={theme.fontFamily}
              onChange={(e) => setTheme({ fontFamily: e.target.value })}
            >
              <option value="Inter">Inter (Sans)</option>
              <option value="Roboto">Roboto (Clean Sans)</option>
              <option value="Montserrat">Montserrat (Modern Sans)</option>
              <option value="Outfit">Outfit (Geometric Sans)</option>
              <option value="Space Grotesk">Space Grotesk (Tech Sans)</option>
              <option value="Oswald">Oswald (Condensed Sans)</option>
              <option value="Playfair Display">Playfair Display (Elegant Serif)</option>
              <option value="Lora">Lora (Classic Serif)</option>
              <option value="Merriweather">Merriweather (Readable Serif)</option>
              <option value="Georgia">Georgia (System Serif)</option>
              <option value="JetBrains Mono">JetBrains Mono (Code)</option>
              <option value="Dancing Script">Dancing Script (Handwriting)</option>
            </select>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-400 uppercase tracking-wider">
              <FileJson size={14} />
              <span>Project</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 border border-neutral-200 p-2.5 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors"
              >
                <FolderOpen size={16} />
                Open
              </button>
              <button 
                onClick={handleSaveProject}
                className="flex items-center justify-center gap-2 border border-neutral-200 p-2.5 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors"
              >
                <Save size={16} />
                Save
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleOpenProject} 
                accept=".md,.marpflow,application/json,text/markdown" 
                className="hidden" 
              />
            </div>
          </section>

          <section className="space-y-4 mt-auto">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-400 uppercase tracking-wider">
              <Download size={14} />
              <span>Export</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <button 
                onClick={() => handleExport('pdf')}
                className="flex items-center justify-center gap-2 bg-neutral-900 text-white p-3 rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors"
              >
                Download PDF
              </button>
              <button 
                onClick={() => handleExport('html')}
                className="flex items-center justify-center gap-2 border border-neutral-200 p-3 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors"
              >
                Download HTML
              </button>
            </div>
          </section>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
