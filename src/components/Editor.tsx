import React, { useMemo, memo, useCallback, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { useStore } from '../store/useStore';
import { EditorView } from '@codemirror/view';

export const Editor: React.FC = memo(() => {
  const content = useStore((state) => state.markdown);
  const setMarkdown = useStore((state) => state.setMarkdown);
  const setEditorView = useStore((state) => state.setEditorView);
  
  // Track whether we've already registered the editor view
  const editorViewRegistered = useRef(false);

  const extensions = useMemo(() => [markdown()], []);

  // ✅ Fix 1: Use setMarkdown directly from the store selector above,
  // and add a local check to prevent redundant updates
  const handleChange = useCallback((value: string) => {
    if (value !== content) {
      setMarkdown(value);
    }
  }, [setMarkdown, content]);

  // ✅ Fix 2: Guard with a ref so setEditorView is only called once,
  // preventing repeated store updates on every render cycle
  const handleCreateEditor = useCallback((view: EditorView) => {
    if (!editorViewRegistered.current) {
      editorViewRegistered.current = true;
      setEditorView(view);
    }
  }, [setEditorView]);

  return (
    <div className="h-full w-full border-r border-neutral-200">
      <CodeMirror
        value={content}
        height="100%"
        theme="light"
        extensions={extensions}
        onChange={handleChange}
        onCreateEditor={handleCreateEditor}
        className="h-full text-sm"
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          highlightActiveLine: true,
        }}
      />
    </div>
  );
});

Editor.displayName = 'Editor';