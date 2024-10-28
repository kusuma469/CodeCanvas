"use client";

import * as Y from "yjs";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";
import { useRoom, useUpdateMyPresence } from "@liveblocks/react/suspense";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./CollaborativeEditor.module.css";
import { Editor } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import { MonacoBinding } from "y-monaco";
import { Awareness } from "y-protocols/awareness";
import { Cursors } from "./Cursors";
import { Toolbar } from "./Toolbar";

interface CollaborativeEditorProps {
  documentId: string;
  defaultValue?: string;
  defaultLanguage?: string;
}

export function CollaborativeEditor({
  documentId,
  defaultValue = "",
  defaultLanguage = "typescript"
}: CollaborativeEditorProps) {
  const room = useRoom();
  const updatePresence = useUpdateMyPresence();
  const providerRef = useRef<LiveblocksYjsProvider | null>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const yDocRef = useRef<Y.Doc | null>(null);
  const bindingRef = useRef<MonacoBinding | null>(null);
  const awarenessRef = useRef<Awareness | null>(null);

  // Initialize editor
  const handleOnMount = useCallback((editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
    
    // Initialize Yjs document
    yDocRef.current = new Y.Doc();
    const yText = yDocRef.current.getText("monaco");

    if (yText.toString() === "") {
      yText.insert(0, defaultValue);
    }

    // Create and configure awareness
    awarenessRef.current = new Awareness(yDocRef.current);
    providerRef.current = new LiveblocksYjsProvider(room, yDocRef.current);

    // Initialize presence
    updatePresence({
      codeSelection: null,
      codeLanguage: defaultLanguage,
      cursorAwareness: {
        name: room.getSelf()?.info?.name || "Anonymous",
        color: '#' + Math.floor(Math.random()*16777215).toString(16),
        id: room.getSelf()?.id || "anonymous",
        picture: room.getSelf()?.info?.picture,
      }
    });

    // Attach Yjs to Monaco
    bindingRef.current = new MonacoBinding(
      yText,
      editor.getModel() as editor.ITextModel,
      new Set([editor]),
      awarenessRef.current
    );

    // Update presence when selection changes
    editor.onDidChangeCursorSelection((e) => {
      updatePresence({
        codeSelection: {
          start: e.selection.startLineNumber,
          end: e.selection.endLineNumber,
        },
      });
    });
  }, [room, defaultValue, defaultLanguage, updatePresence]);

  // Cleanup
  useEffect(() => {
    return () => {
      bindingRef.current?.destroy();
      awarenessRef.current?.destroy();
      providerRef.current?.destroy();
      yDocRef.current?.destroy();

      bindingRef.current = null;
      awarenessRef.current = null;
      providerRef.current = null;
      yDocRef.current = null;
      editorRef.current = null;
    };
  }, []);

  return (
    <div className={styles.container}>
      {providerRef.current && <Cursors yProvider={providerRef.current} />}
      <div className={styles.editorHeader}>
        <div>{editorRef.current && <Toolbar editor={editorRef.current} />}</div>
      </div>
      <div className={styles.editorContainer}>
        <Editor
          onMount={handleOnMount}
          height="100%"
          width="100%"
          theme="vs-dark"
          defaultLanguage={defaultLanguage}
          defaultValue={defaultValue}
          options={{
            tabSize: 2,
            padding: { top: 20 },
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: 'on',
            formatOnPaste: true,
            formatOnType: true,
            automaticLayout: true,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            quickSuggestions: true,
            renderLineHighlight: "all",
            suggestOnTriggerCharacters: true,
          }}
        />
      </div>
    </div>
  );
}