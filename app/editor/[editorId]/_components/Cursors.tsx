import { useEffect, useMemo, useState } from "react";
import { useSelf } from "@liveblocks/react/suspense";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";
import { AwarenessList, UserAwareness } from "@/liveblocks.config"; // Updated import path

type Props = {
  yProvider: LiveblocksYjsProvider;
};

export function Cursors({ yProvider }: Props) {
  const userInfo = useSelf((me) => ({
    name: me.info?.name || "Anonymous",
    color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
    id: me.id || "anonymous",
    picture: me.info?.picture
  }));

  const [awarenessUsers, setAwarenessUsers] = useState<AwarenessList>([]);

  useEffect(() => {
    if (!yProvider?.awareness) return;

    const localUser: UserAwareness["user"] = userInfo;
    yProvider.awareness.setLocalStateField("user", localUser);

    function updateUsers() {
      const states = Array.from(yProvider.awareness.getStates().entries());
      setAwarenessUsers(states as AwarenessList);
    }

    yProvider.awareness.on("change", updateUsers);
    updateUsers();

    return () => {
      yProvider.awareness.off("change", updateUsers);
    };
  }, [yProvider, userInfo]);

  const styleSheet = useMemo(() => {
    let styles = "";

    awarenessUsers.forEach(([clientId, client]: [number, UserAwareness]) => {
      if (client?.user) {
        styles += `
          .yRemoteSelection-${clientId}, 
          .yRemoteSelectionHead-${clientId} {
            --user-color: ${client.user.color};
          }
          
          .yRemoteSelectionHead-${clientId}::after {
            content: "${client.user.name}";
            position: absolute;
            top: -1.4em;
            left: 0;
            background-color: ${client.user.color};
            color: white;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 12px;
            white-space: nowrap;
          }

          .yRemoteSelection-${clientId} {
            background-color: ${client.user.color}33;
          }
        `;
      }
    });

    return { __html: styles };
  }, [awarenessUsers]);

  return <style dangerouslySetInnerHTML={styleSheet} />;
}