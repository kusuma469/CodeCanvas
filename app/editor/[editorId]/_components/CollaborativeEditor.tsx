"use client";

import * as Y from "yjs";
import { yCollab } from "y-codemirror.next";
import { EditorView } from "@codemirror/view";
import { Extension, EditorState } from "@codemirror/state";
import { javascript } from "@codemirror/lang-javascript";
import { useCallback, useEffect, useState } from "react";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";
import { useRoom, useSelf } from "@liveblocks/react/suspense";
import {
  lineNumbers,
  highlightActiveLineGutter,
  highlightSpecialChars,
  drawSelection,
  dropCursor,
  rectangularSelection,
  crosshairCursor,
  highlightActiveLine,
  keymap,
} from "@codemirror/view";
import {
  defaultKeymap,
  history,
  historyKeymap,
} from "@codemirror/commands";
import {
  foldGutter,
  indentOnInput,
  syntaxHighlighting,
  defaultHighlightStyle,
  bracketMatching,
  foldKeymap,
} from "@codemirror/language";
import { closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";
import styles from "./CollaborativeEditor.module.css";
import { Avatars } from "./Avatars";
import { Toolbar } from "./Toolbar";

interface UserInfo {
  name: string;
  picture?: string;
  color?: string;
}

interface CollaborativeEditorProps {
  documentId: string;
  defaultValue?: string;
  defaultLanguage: string;
}

const basicSetup: Extension = [
  lineNumbers(),
  highlightActiveLineGutter(),
  highlightSpecialChars(),
  history(),
  foldGutter(),
  drawSelection(),
  dropCursor(),
  EditorState.allowMultipleSelections.of(true),
  indentOnInput(),
  syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
  bracketMatching(),
  closeBrackets(),
  rectangularSelection(),
  crosshairCursor(),
  highlightActiveLine(),
  keymap.of([
    ...defaultKeymap,
    ...historyKeymap,
    ...foldKeymap,
    ...closeBracketsKeymap,
  ]),
];

export const CollaborativeEditor: React.FC<CollaborativeEditorProps> = ({
  documentId,
  defaultValue,
  defaultLanguage,
}) => {
  const room = useRoom();
  const [element, setElement] = useState<HTMLElement>();
  const [yUndoManager, setYUndoManager] = useState<Y.UndoManager>();

  const userInfo = useSelf((me) => me.info) as UserInfo;

  const ref = useCallback((node: HTMLElement | null) => {
    if (!node) return;
    setElement(node);
  }, []);

  useEffect(() => {
    let provider: LiveblocksYjsProvider;
    let ydoc: Y.Doc;
    let view: EditorView;

    if (!element || !room || !userInfo) {
      return;
    }

    try {
      // Create Yjs provider and document
      ydoc = new Y.Doc();
      provider = new LiveblocksYjsProvider(room as any, ydoc);
      const ytext = ydoc.getText("codemirror");
      
      // Set initial content if provided
      if (defaultValue && ytext.toString() === '') {
        ytext.insert(0, defaultValue);
      }
      
      const undoManager = new Y.UndoManager(ytext);
      setYUndoManager(undoManager);

      // Attach user info to Yjs
      provider.awareness.setLocalStateField("user", {
        name: userInfo.name,
        color: userInfo.color || "#000000",
        colorLight: (userInfo.color || "#000000") + "80",
      });

      // Set up CodeMirror and extensions
      const state = EditorState.create({
        doc: ytext.toString(),
        extensions: [
          basicSetup,
          javascript(), // You might want to make this dynamic based on defaultLanguage
          yCollab(ytext, provider.awareness, { undoManager }),
        ],
      });

      // Attach CodeMirror to element
      view = new EditorView({
        state,
        parent: element,
      });
    } catch (error) {
      console.error("Error initializing editor:", error);
    }

    return () => {
      view?.destroy();
      provider?.destroy();
      ydoc?.destroy();
    };
  }, [element, room, userInfo, defaultValue, defaultLanguage]);

  return (
    <div className={styles.container}>
      <div className={styles.editorHeader}>
        <div>
          {yUndoManager ? <Toolbar yUndoManager={yUndoManager} /> : null}
        </div>
        <Avatars />
      </div>
      <div className={styles.editorContainer} ref={ref}></div>
    </div>
  );
};