"use client";

import { RenameModal } from "@/components/modals/rename-modal";
import { CodeRenameModal } from "@/components/modals/code-rename-modal";
import { useEffect, useState } from "react";

export const ModalProvider = () => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return null;
    }

    return (
        <>
            <RenameModal />
            <CodeRenameModal />
        </>
    );
};