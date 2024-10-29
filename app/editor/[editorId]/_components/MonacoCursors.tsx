// app/editor/[editorId]/_components/MonacoCursors.tsx
"use client";

import { useEffect, useMemo, useRef } from "react";
import { useSelf } from "@liveblocks/react/suspense";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";
import { editor } from "monaco-editor";

interface UserInfo {
  name: string;
  picture?: string;
  cursorColor?: string;
}

type AwarenessUser = {
  name: string;
  picture?: string;
  cursorColor: string;
};

type UserAwareness = {
  user: AwarenessUser;
};

type AwarenessList = [number, { user: AwarenessUser }][];

interface MonacoCursorsProps {
  yProvider: LiveblocksYjsProvider;
  editorInstance: editor.IStandaloneCodeEditor;
}

export function MonacoCursors({ yProvider }: MonacoCursorsProps) {
  const styleRef = useRef<HTMLStyleElement | null>(null);
  const userInfo = useSelf((me) => ({
    name: me.info.name,
    picture: me.info.picture,
    cursorColor: "#" + Math.floor(Math.random()*16777215).toString(16)
  }));

  useEffect(() => {
    if (!yProvider || !userInfo) return;

    const localUser: AwarenessUser = {
      name: userInfo.name,
      picture: userInfo.picture,
      cursorColor: userInfo.cursorColor
    };

    yProvider.awareness.setLocalStateField("user", localUser);

    function updateStyles() {
      const awarenessStates = Array.from(yProvider.awareness.getStates()) as AwarenessList;
      const styles = generateStyles(awarenessStates);
      
      if (styleRef.current) {
        styleRef.current.innerHTML = styles;
      }
    }

    yProvider.awareness.on("change", updateStyles);
    updateStyles();

    return () => {
      yProvider.awareness.off("change", updateStyles);
    };
  }, [yProvider, userInfo]);

  const generateStyles = (awarenessUsers: AwarenessList): string => {
    let cursorStyles = `
      .yRemoteSelection {
        background-color: var(--user-color);
        opacity: 0.5;
      }
      .yRemoteSelectionHead {
        position: absolute;
        border-left: 2px solid var(--user-color);
        border-top: 2px solid var(--user-color);
        border-bottom: 2px solid var(--user-color);
        height: 100%;
        box-sizing: border-box;
      }
      .yRemoteSelectionHead::after {
        position: absolute;
        content: attr(data-user-name);
        background: var(--user-color);
        color: white;
        padding: 2px 6px;
        font-size: 12px;
        font-family: sans-serif;
        line-height: 1;
        white-space: nowrap;
        border-radius: 3px;
        top: -1.4em;
        left: -2px;
        user-select: none;
        pointer-events: none;
      }
    `;

    for (const [clientId, client] of awarenessUsers) {
      if (client?.user) {
        cursorStyles += `
          .yRemoteSelection-${clientId}, 
          .yRemoteSelectionHead-${clientId} {
            --user-color: ${client.user.cursorColor};
          }
          
          .yRemoteSelectionHead-${clientId}::after {
            content: "${client.user.name}";
          }
        `;
      }
    }

    return cursorStyles;
  };

  // Create style element on mount
  useEffect(() => {
    styleRef.current = document.createElement('style');
    document.head.appendChild(styleRef.current);

    return () => {
      if (styleRef.current) {
        document.head.removeChild(styleRef.current);
      }
    };
  }, []);

  return null;
}