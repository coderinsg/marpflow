import React from 'react';
import { useStore } from '../store/useStore';
import { 
  Heading1, 
  Bold, 
  List, 
  Image as ImageIcon, 
  Layout, 
  PlusSquare, 
  Type,
  Square
} from 'lucide-react';

export const Toolbar: React.FC = () => {
  const insertText = (text: string) => {
    const editorView = useStore.getState().editorView;
    if (!editorView) return;

    const { state } = editorView;
    const { from, to } = state.selection.main;
    
    editorView.dispatch({
      changes: { from, to, insert: text },
      selection: { anchor: from + text.length },
      scrollIntoView: true
    });
    
    editorView.focus();
  };

  const tools = [
    { 
      label: 'Header', 
      icon: <Heading1 size={16} />, 
      action: () => insertText('\n# Title\n') 
    },
    { 
      label: 'Bold', 
      icon: <Bold size={16} />, 
      action: () => insertText('**text**') 
    },
    { 
      label: 'List', 
      icon: <List size={16} />, 
      action: () => insertText('\n- item\n') 
    },
    { 
      label: 'Image', 
      icon: <ImageIcon size={16} />, 
      action: () => insertText('\n![width:300px](https://picsum.photos/800/600)\n') 
    },
    { 
      label: 'Background', 
      icon: <Layout size={16} />, 
      action: () => insertText('\n![bg](https://picsum.photos/1920/1080)\n') 
    },
    { 
      label: 'Invert', 
      icon: <Square size={16} className="fill-current" />, 
      action: () => insertText('\n<!-- _class: invert -->\n') 
    },
    { 
      label: 'New Slide', 
      icon: <PlusSquare size={16} />, 
      action: () => insertText('\n---\n') 
    },
  ];

  return (
    <div className="h-10 border-b border-neutral-200 bg-neutral-50 flex items-center px-4 gap-1 overflow-x-auto no-scrollbar shrink-0">
      {tools.map((tool) => (
        <button
          key={tool.label}
          onClick={tool.action}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-neutral-600 hover:bg-white hover:text-neutral-900 hover:shadow-sm rounded-md transition-all text-xs font-medium whitespace-nowrap border border-transparent hover:border-neutral-200"
          title={tool.label}
        >
          {tool.icon}
          <span className="hidden sm:inline">{tool.label}</span>
        </button>
      ))}
    </div>
  );
};
