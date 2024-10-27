// app/editor/[editorId]/_components/user-avatar.tsx

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Hint } from "@/components/hint";

interface UserAvatarProps {
    src?: string;
    name?: string;
    fallback?: string;
    borderColor?: string;
}

export const UserAvatar = ({
    src,
    name,
    fallback,
    borderColor
}: UserAvatarProps) => {
    return (
        <Hint label={name || "Teammate"} side="bottom" sideOffset={10}>
            <Avatar 
                className="h-8 w-8 border-2"
                style={{ borderColor: borderColor }}
            >
                <AvatarImage src={src} />
                <AvatarFallback className="text-xs font-semibold">
                    {fallback}
                </AvatarFallback>
            </Avatar>
        </Hint>
    );
};