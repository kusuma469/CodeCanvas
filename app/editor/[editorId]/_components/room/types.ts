// app/editor/_components/room/types.ts

import { LiveMap, LiveObject, LiveList } from "@liveblocks/client";
import { Layer, Color } from "@/types/canvas";

// Base types that match the existing Liveblocks setup
export type BasePresence = {
  cursor: { x: number; y: number } | null;
  selection: string[];
  pencilDraft: [x: number, y: number, pressure: number][] | null;
  pencilColor: Color | null;
};

// Extended types for code editor
export type CodePresence = BasePresence & {
  codeSelection: {
    start: number;
    end: number;
  } | null;
  codeLanguage: string | null;
};

export type BaseStorage = {
  layers: LiveMap<string, LiveObject<Layer>>;
  layerIds: LiveList<string>;
};

export type CodeStorage = BaseStorage & {
  codeContent: LiveObject<{
    content: string;
    language: string;
  }>;
};

export type UserMeta = {
  id?: string;
  info?: {
    name?: string;
    picture?: string;
  };
};