// liveblocks.config.ts

import {
  createClient,
  LiveList,
  LiveMap,
  LiveObject,
} from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";
import { Layer, Color } from "./types/canvas";

export const client = createClient({
  throttle: 16,
  authEndpoint: "/api/liveblocks-auth",
});

declare global {
  interface Liveblocks {
    // Combined Presence type for both whiteboard and code editor
    Presence: {
      cursor: { x: number; y: number } | null;
      selection: string[];
      pencilDraft: [x: number, y: number, pressure: number][] | null;
      pencilColor: Color | null;
      // Code editor specific presence
      codeSelection?: {
        start: number;
        end: number;
      } | null;
      codeLanguage?: string | null;
    };

    // Combined Storage type for both whiteboard and code editor
    Storage: {
      layers: LiveMap<string, LiveObject<Layer>>;
      layerIds: LiveList<string>;
      // Code editor specific storage
      codeContent?: LiveObject<{
        content: string;
        language: string;
      }>;
    };

    UserMeta: {
      id?: string;
      info?: {
        name?: string;
        picture?: string;
      };
    };

    // Added code editor specific events
    RoomEvent: {
      type: "CODE_CHANGE" | "LANGUAGE_CHANGE";
      content?: string;
      language?: string;
    };

    ThreadMetadata: {};

    RoomInfo: {};
  }
}

export const {
  RoomProvider,
  useRoom,
  useMyPresence,
  useUpdateMyPresence,
  useSelf,
  useOthers,
  useStorage,
  useMutation,
  useHistory,
  useCanUndo,
  useCanRedo,
} = createRoomContext(client);

export type { Room } from "@liveblocks/client";