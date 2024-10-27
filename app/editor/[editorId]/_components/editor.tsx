// app/editor/[editorId]/_components/editor.tsx

"use client";

import * as Y from "yjs";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";
import { useCallback, useEffect, useState } from "react";
import { Editor as MonacoEditor } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import { MonacoBinding } from "y-monaco";
import { Awareness } from "y-protocols/awareness";
import { useRoom } from "@liveblocks/react/suspense";

interface EditorProps {
  documentId: string;
  defaultValue?: string;
  defaultLanguage?: string;
}

export const Editor = ({
  documentId,
  defaultValue = " ",
  defaultLanguage = "typescript"
}: EditorProps) => {
  const room = useRoom();
  const [provider, setProvider] = useState<LiveblocksYjsProvider>();
  const [editorRef, setEditorRef] = useState<editor.IStandaloneCodeEditor>();

  useEffect(() => {
    let yDoc: Y.Doc | undefined;
    let yProvider: LiveblocksYjsProvider | undefined;
    let binding: MonacoBinding | undefined;
    let awarenessProtocol: Awareness | undefined;

    const setupProvider = async () => {
      if (!editorRef || !room) return;

      const model = editorRef.getModel();
      if (!model) return;

      try {
        // Initialize Yjs document
        yDoc = new Y.Doc();
        const yText = yDoc.getText("monaco");

        if (yText.toString() === "") {
          yText.insert(0, defaultValue);
        }

        // Create and configure awareness
        awarenessProtocol = new Awareness(yDoc);
        awarenessProtocol.setLocalState({
          user: {
            name: room.getSelf()?.info?.name,
            color: '#' + Math.floor(Math.random()*16777215).toString(16),
          }
        });

        // Create Liveblocks provider
        yProvider = new LiveblocksYjsProvider(room as any, yDoc);
        setProvider(yProvider);

        // Create Monaco binding with proper type casting
        binding = new MonacoBinding(
          yText,
          model,
          new Set([editorRef]),
          awarenessProtocol
        );

      } catch (error) {
        console.error("Error setting up collaborative editor:", error);
      }
    };

    setupProvider();

    return () => {
      binding?.destroy();
      awarenessProtocol?.destroy();
      yProvider?.destroy();
      yDoc?.destroy();
    };
  }, [editorRef, room, defaultValue]);

  const handleEditorDidMount = useCallback((editor: editor.IStandaloneCodeEditor) => {
    setEditorRef(editor);
  }, []);

  return (
    <div className="h-full w-full">
      <MonacoEditor
        height="100vh"
        defaultLanguage={defaultLanguage}
        defaultValue={defaultValue}
        theme="vs-dark"
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          tabSize: 2,
          padding: { top: 20 },
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
  );
};