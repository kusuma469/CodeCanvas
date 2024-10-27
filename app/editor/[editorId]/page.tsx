// app/editor/[editorId]/page.tsx

import { Canvas } from "./_components/canvas";
import { Room } from "@/components/room";
import { Loading } from "./_components/loading";

interface EditorPageProps {
  params: {
    editorId: string;  // This matches the folder name [editorId]
  };
}

const EditorPage = ({ params }: EditorPageProps) => {
  console.log("[EditorPage] Editor ID:", params.editorId);
  
  return (
    <div className="h-screen w-screen">
      <Room 
        roomId={params.editorId}  // Using editorId from params
        fallback={<Loading />}
        type="code"
      >
        <Canvas documentId={params.editorId} />  {/* Also use editorId here */}
      </Room>
    </div>
  );
};

export default EditorPage;