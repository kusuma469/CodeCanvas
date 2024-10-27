// app/editor/_components/room/code-room.tsx

"use client";

import { ReactNode } from "react";
import { LiveblocksProvider, RoomProvider, ClientSideSuspense } from "@liveblocks/react/suspense";
import { LiveMap, LiveObject, LiveList } from "@liveblocks/client";
import { Layer } from "@/types/canvas";

interface CodeRoomProps {
  children: ReactNode;
  roomId: string;
  fallback: NonNullable<ReactNode> | null;
}

export const CodeRoom = ({ children, roomId, fallback }: CodeRoomProps) => {
  const getInitialPresence = () => ({
    cursor: null,
    selection: [],
    pencilDraft: null,
    pencilColor: null,
    codeSelection: null,
    codeLanguage: "typescript"
  });

  const getInitialStorage = () => ({
    layers: new LiveMap<string, LiveObject<Layer>>(),
    layerIds: new LiveList([]),
    codeContent: new LiveObject({
      content: " ",
      language: "typescript"
    })
  });

  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <RoomProvider
        id={roomId}
        initialPresence={getInitialPresence()}
        initialStorage={getInitialStorage()}
      >
        <ClientSideSuspense fallback={fallback}>
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
};