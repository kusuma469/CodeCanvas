// app/api/liveblocks-auth/route.ts

import { currentUser } from "@clerk/nextjs/server";
import { Liveblocks } from "@liveblocks/node";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { auth } from "@clerk/nextjs/server";
import { Id } from "@/convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const liveblocks = new Liveblocks({
    secret: "sk_dev_GnaS38MSf9nXPg357zRjdhysHuzA1bYfREw2uXNkFl4buMC9I9uTkNw8-LHHWqce",
});

export async function POST(request: Request) {
    try {
        const authorization = await auth();
        const user = await currentUser();

        if (!authorization || !user) {
            return new Response("Unauthorized", { status: 403 });
        }

        const { room } = await request.json();

        // Try to get document
        const document = await convex.query(api.codeDocument.get, {
            id: room as Id<"codeDocuments">
        });

        if (!document || document.orgId !== authorization.orgId) {
            return new Response("Unauthorized", { status: 403 });
        }

        const userInfo = {
            name: user.firstName || "Teammate",
            picture: user.imageUrl,
        };

        const session = liveblocks.prepareSession(
            user.id,
            { userInfo }
        );

        session.allow(room, session.FULL_ACCESS);

        const { status, body } = await session.authorize();
        return new Response(body, { status });

    } catch (error) {
        console.error("Auth error:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}