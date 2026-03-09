import React, { useMemo } from 'react';
import { X, LayoutTemplate, Columns, Image, Quote, List, BarChart, Users, Coffee, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Marp } from '@marp-team/marp-core';
import { useStore } from '../store/useStore';

const SlideThumbnail: React.FC<{ id: string, snippet: string }> = ({ id, snippet }) => {
  const theme = useStore((state) => state.theme);
  
  const { html, css } = useMemo(() => {
    const marp = new Marp({
      container: false,
      html: true,
      inlineSVG: true,
    });
    
    // Clean up snippet: remove leading/trailing --- to avoid empty slides in the thumbnail
    const cleanSnippet = snippet.trim().replace(/^---/, '').replace(/---$/, '');

    const fullMarkdown = `---
marp: true
theme: default
backgroundColor: ${theme.backgroundColor}
color: ${theme.textColor}
---
${cleanSnippet}`;

    const result = marp.render(fullMarkdown);
    
    // Marp renders all slides. We only want the first one for the thumbnail.
    const parser = new DOMParser();
    const doc = parser.parseFromString(result.html, 'text/html');
    let firstSlideHtml = doc.body.firstElementChild?.outerHTML || '';

    // Fix broken images in SVG by adding referrerpolicy
    firstSlideHtml = firstSlideHtml.replace(/<image /g, '<image referrerpolicy="no-referrer" ');

    // Scope the CSS to this specific thumbnail ID more robustly
    const scopedCss = result.css.split('}').map(chunk => {
      if (!chunk.trim() || chunk.includes('@import')) return chunk;
      const parts = chunk.split('{');
      if (parts.length !== 2) return chunk;
      const selectors = parts[0].split(',').map(s => `.thumb-${id} ${s.trim()}`).join(', ');
      return `${selectors} { ${parts[1]} }`;
    }).join('\n');

    const customStyle = `
      .thumb-${id} svg.marpit {
        width: 100% !important;
        height: 100% !important;
        display: block;
      }
      .thumb-${id} section {
        background-color: ${theme.backgroundColor} !important;
        color: ${theme.textColor} !important;
        font-family: "${theme.fontFamily}", sans-serif !important;
        font-size: 24px !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: center !important;
      }
      .thumb-${id} h1 { font-size: 50px !important; margin-bottom: 20px !important; line-height: 1.2 !important; }
      .thumb-${id} h2 { font-size: 40px !important; margin-bottom: 15px !important; }
      .thumb-${id} h3 { font-size: 30px !important; margin-bottom: 10px !important; }
      .thumb-${id} p, .thumb-${id} li { font-size: 20px !important; line-height: 1.4 !important; }
      
      .thumb-${id} h1, .thumb-${id} h2, .thumb-${id} h3, .thumb-${id} strong {
        color: ${theme.primaryColor} !important;
      }
      /* Hide pagination in thumbnails */
      .thumb-${id} section::after {
        display: none !important;
      }
      /* Ensure images in grid/flex layouts are visible */
      .thumb-${id} img {
        max-width: 100%;
        height: auto;
      }
    `;
    
    return { html: firstSlideHtml, css: scopedCss + customStyle };
  }, [id, snippet, theme]);

  return (
    <div className="w-full aspect-video bg-white rounded-lg border border-neutral-200 overflow-hidden relative group-hover:border-neutral-900 transition-colors shadow-sm">
      <style>{css}</style>
      <div 
        className={`thumb-${id} h-full w-full pointer-events-none`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <div className="absolute inset-0 bg-neutral-900/0 group-hover:bg-neutral-900/5 transition-colors" />
    </div>
  );
};

const TEMPLATES = [
  {
    id: 'project-presentation',
    name: 'Project Presentation',
    snippet: '---\n# Project\n# **Presentation**\n\n![bg right:40%](https://picsum.photos/seed/project/800/600)\n---',
    description: 'Title slide with a large side image'
  },
  {
    id: 'welcome-company',
    name: 'Welcome to Company',
    snippet: '---\n### BUSINESS SUBTITLE HERE\n# Welcome\n# **To my Company**\n\n![bg right:40%](https://picsum.photos/seed/office/800/600)\n\n- Point one\n- Point two\n---',
    description: 'Welcome slide with bullets and image'
  },
  {
    id: 'company-services',
    name: 'Company Services',
    snippet: '---\n# Our Best\n# **Company Services**\n\n<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; text-align: center;">\n<div>\n<img src="https://picsum.photos/seed/biz1/200" style="border-radius: 50%; width: 100px;"/>\n<h3>Business</h3>\n<p>Description</p>\n</div>\n<div>\n<img src="https://picsum.photos/seed/biz2/200" style="border-radius: 50%; width: 100px;"/>\n<h3>Corporate</h3>\n<p>Description</p>\n</div>\n<div>\n<img src="https://picsum.photos/seed/biz3/200" style="border-radius: 50%; width: 100px;"/>\n<h3>Marketing</h3>\n<p>Description</p>\n</div>\n</div>\n---',
    description: '3-column services layout'
  },
  {
    id: 'future-project',
    name: 'Future Project',
    snippet: '---\n# Company\n# **Future Project**\n\n<div style="display: flex; flex-direction: column; gap: 1rem;">\n<div style="background: rgba(0,0,0,0.05); padding: 1rem; border-radius: 10px; display: flex; align-items: center; gap: 1rem;">\n<div style="background: #8b5cf6; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">01</div>\n<div><b>Title</b><br/>Description</div>\n</div>\n<div style="background: rgba(0,0,0,0.05); padding: 1rem; border-radius: 10px; display: flex; align-items: center; gap: 1rem;">\n<div style="background: #8b5cf6; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">02</div>\n<div><b>Title</b><br/>Description</div>\n</div>\n<div style="background: rgba(0,0,0,0.05); padding: 1rem; border-radius: 10px; display: flex; align-items: center; gap: 1rem;">\n<div style="background: #8b5cf6; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">03</div>\n<div><b>Title</b><br/>Description</div>\n</div>\n</div>\n---',
    description: 'Vertical steps layout'
  },
  {
    id: 'business-gallery',
    name: 'Business Gallery',
    snippet: '---\n# Our Business\n# **Gallery**\n\n<div style="display: grid; grid-template-columns: repeat(2, 1fr); grid-template-rows: repeat(2, 1fr); gap: 1rem; height: 300px;">\n<div style="grid-row: span 2;"><img src="https://picsum.photos/seed/gal1/400/600" style="width: 100%; height: 100%; object-fit: cover; border-radius: 10px;"/></div>\n<div><img src="https://picsum.photos/seed/gal2/400/300" style="width: 100%; height: 100%; object-fit: cover; border-radius: 10px;"/></div>\n<div><img src="https://picsum.photos/seed/gal3/400/300" style="width: 100%; height: 100%; object-fit: cover; border-radius: 10px;"/></div>\n</div>\n---',
    description: 'Grid gallery layout'
  },
  {
    id: 'company-plan',
    name: 'Company Plan & Target',
    snippet: '---\n# Company\n# **Plan & Target**\n\n![bg right:40%](https://picsum.photos/seed/plan/800/600)\n\n- Target One\n- Target Two\n- Target Three\n---',
    description: 'Plan and target slide'
  },
  {
    id: 'team-members',
    name: 'Team Members',
    snippet: '---\n# Meet Our\n# **Team Member**\n\n<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; text-align: center;">\n<div><img src="https://picsum.photos/seed/p1/200" style="border-radius: 50%; width: 80px;"/><h5>Name</h5><p style="font-size: 0.6em;">Position</p></div>\n<div><img src="https://picsum.photos/seed/p2/200" style="border-radius: 50%; width: 80px;"/><h5>Name</h5><p style="font-size: 0.6em;">Position</p></div>\n<div><img src="https://picsum.photos/seed/p3/200" style="border-radius: 50%; width: 80px;"/><h5>Name</h5><p style="font-size: 0.6em;">Position</p></div>\n<div><img src="https://picsum.photos/seed/p4/200" style="border-radius: 50%; width: 80px;"/><h5>Name</h5><p style="font-size: 0.6em;">Position</p></div>\n</div>\n---',
    description: '4-column team layout'
  },
  {
    id: 'break-time',
    name: 'Break Time',
    snippet: '---\n<!-- _class: invert -->\n# **Break Time**\n### BUSINESS TITLE HERE\n---',
    description: 'Section transition slide'
  },
  {
    id: 'chart-infographic',
    name: 'Chart Infographic',
    snippet: '---\n# Our Chart\n# **Infographic**\n\n<div style="display: flex; align-items: flex-end; gap: 1rem; height: 200px; padding-bottom: 2rem;">\n<div style="background: #8b5cf6; width: 30px; height: 40%;"></div>\n<div style="background: #8b5cf6; width: 30px; height: 70%;"></div>\n<div style="background: #8b5cf6; width: 30px; height: 50%;"></div>\n<div style="background: #8b5cf6; width: 30px; height: 90%;"></div>\n<div style="background: #8b5cf6; width: 30px; height: 60%;"></div>\n</div>\n---',
    description: 'Bar chart infographic'
  }
];

export const LayoutPicker: React.FC = () => {
  const isOpen = useStore((state) => state.isLayoutPickerOpen);
  const setIsOpen = useStore((state) => state.setLayoutPickerOpen);
  
  const insertLayout = (snippet: string) => {
    const { editorView } = useStore.getState();
    if (!editorView) return;

    const { state, dispatch } = editorView;
    const { from, to } = state.selection.main;
    
    dispatch({
      changes: { from, to, insert: `\n${snippet}\n` },
      selection: { anchor: from + snippet.length + 2 }
    });
    
    editorView.focus();
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
          >
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-neutral-900 rounded-xl flex items-center justify-center text-white">
                  <LayoutTemplate size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-neutral-900">Slide Layouts</h2>
                  <p className="text-xs text-neutral-500 font-medium">Select a template to insert into your presentation</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-400 hover:text-neutral-900"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => insertLayout(template.snippet)}
                    className="group flex flex-col items-start p-2 rounded-xl border border-transparent hover:bg-neutral-50 transition-all text-left"
                  >
                    <SlideThumbnail id={template.id} snippet={template.snippet} />
                    <div className="mt-3 px-1">
                      <h3 className="text-sm font-bold text-neutral-900 mb-0.5">{template.name}</h3>
                      <p className="text-[10px] text-neutral-500 leading-relaxed line-clamp-1">{template.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex justify-end shrink-0">
              <button
                onClick={() => setIsOpen(false)}
                className="px-6 py-2 text-sm font-bold text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
