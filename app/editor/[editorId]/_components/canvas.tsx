// app/editor/[editorId]/_components/canvas.tsx

"use client";

import Info from "./info";
import { Participants } from "./participants";
import { Editor } from "./editor";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface CanvasProps {
  documentId: string;
}

export const Canvas = ({ documentId }: CanvasProps) => {
  const document = useQuery(api.codeDocument.get, { 
    id: documentId as Id<"codeDocuments"> 
  });

  if (!document) return null;

  return (
    <main className="h-full w-full relative bg-neutral-800 touch-none">
      <Info documentId={documentId} />
      <Participants />
      <div className="h-full w-full pt-14">
        <Editor 
          documentId={documentId}
          defaultValue={document.content}
          defaultLanguage={document.language}
        />
      </div>
    </main>
  );
};