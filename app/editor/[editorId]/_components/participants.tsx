// app/editor/[editorId]/_components/participants.tsx

"use client";

import { connectionIdToColor } from "@/lib/utils";
import { UserAvatar } from "./user-avatar";
import { useOthers, useSelf } from "@liveblocks/react/suspense";

interface Presence {
  cursor: { x: number; y: number } | null;
  selection: string[];
}

type OthersUser = {
  connectionId: number;
  presence: Presence | null;
  info: {
    name?: string;
    picture?: string;
  } | null;
};

const MAX_SHOWN_OTHER_USERS = 3;

export const Participants = () => {
  const others = useOthers();
  const currentUser = useSelf();
  const hasMoreUsers = others.length > MAX_SHOWN_OTHER_USERS;

  return (
    <div className="absolute h-12 top-2 right-2 bg-neutral-800 rounded-md p-3 flex items-center shadow-md">
      <div className="flex gap-x-2">
        {others.slice(0, MAX_SHOWN_OTHER_USERS).map(({ connectionId, info }) => {
          return (
            <UserAvatar
              borderColor={connectionIdToColor(connectionId)}
              key={connectionId}
              src={info?.picture}
              name={info?.name}
              fallback={info?.name?.[0] || "T"}
            />
          );
        })}

        {currentUser && (
          <UserAvatar
            borderColor={connectionIdToColor(currentUser.connectionId)}
            src={currentUser.info?.picture}
            name={`${currentUser.info?.name} (You)`}
            fallback={currentUser.info?.name?.[0]}
          />
        )}

        {hasMoreUsers && (
          <UserAvatar
            name={`${others.length - MAX_SHOWN_OTHER_USERS} more`}
            fallback={`+${others.length - MAX_SHOWN_OTHER_USERS}`}
          />
        )}
      </div>
    </div>
  );
};

export const ParticipantsSkeleton = () => {
  return (
    <div className="absolute h-12 top-2 right-2 bg-neutral-800 rounded-md p-3 flex items-center shadow-md animate-shimmer bg-gradient-to-r from-neutral-700 via-neutral-600 to-neutral-700 bg-[length:200%_100%] w-[110px]" />
  );
};