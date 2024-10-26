import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const languageImages = {
    javascript: "/placeholders/1.svg",
    typescript: "/placeholders/2.svg",
    python: "/placeholders/3.svg",
    java: "/placeholders/4.svg",
    cpp: "/placeholders/5.svg",
    html: "/placeholders/6.svg",
    css: "/placeholders/7.svg",
    // Add more languages as needed
    default: "/placeholders/7.svg"  // Default fallback image
};

export const create = mutation({
    args: {
        orgId: v.string(),
        title: v.string(),
        language: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthorized");
        }

        const imageUrl = languageImages[args.language as keyof typeof languageImages] || languageImages.default;
        
        const document = await ctx.db.insert("codeDocuments", {
            title: args.title,
            orgId: args.orgId,
            authorId: identity.subject,
            authorName: identity.name!,
            language: args.language,
            imageUrl,
            lastModified: Date.now(),
            content: "// Start coding here...",
        });

        return document;
    },
});

export const remove = mutation({
    args: {
        id: v.id("codeDocuments"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthorized");
        }

        const existingDocument = await ctx.db.get(args.id);
        
        if (!existingDocument) {
            throw new Error("Not found");
        }

        // Optional: Check if user is the author
        if (existingDocument.authorId !== identity.subject) {
            throw new Error("Unauthorized");
        }

        await ctx.db.delete(args.id);
    },
});

export const update = mutation({
    args: {
        id: v.id("codeDocuments"),
        title: v.string(),
        language: v.optional(v.string()),
        content: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthorized");
        }

        const existingDocument = await ctx.db.get(args.id);
        
        if (!existingDocument) {
            throw new Error("Not found");
        }

        // Optional: Check if user is the author
        if (existingDocument.authorId !== identity.subject) {
            throw new Error("Unauthorized");
        }

        const title = args.title.trim();
        if (!title) {
            throw new Error("Title is required");
        }

        if (title.length > 60) {
            throw new Error("Title cannot be longer than 60 characters");
        }

        const updateData: any = {
            title,
            lastModified: Date.now(),
        };

        if (args.language !== undefined) {
            updateData.language = args.language;
            updateData.imageUrl = languageImages[args.language as keyof typeof languageImages] || languageImages.default;
        }

        if (args.content !== undefined) {
            updateData.content = args.content;
        }

        const document = await ctx.db.patch(args.id, updateData);
        return document;
    },
});

export const updateContent = mutation({
    args: {
        id: v.id("codeDocuments"),
        content: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthorized");
        }

        const existingDocument = await ctx.db.get(args.id);
        
        if (!existingDocument) {
            throw new Error("Not found");
        }

        const document = await ctx.db.patch(args.id, {
            content: args.content,
            lastModified: Date.now(),
        });

        return document;
    },
});

export const get = query({
    args: {
        id: v.id("codeDocuments"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthorized");
        }

        const document = await ctx.db.get(args.id);
        
        if (!document) {
            throw new Error("Not found");
        }

        return document;
    },
});

export const getByOrgId = query({
    args: {
        orgId: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthorized");
        }

        const documents = await ctx.db
            .query("codeDocuments")
            .withIndex("by_org", (q) => q.eq("orgId", args.orgId))
            .order("desc")
            .collect();

        return documents;
    },
});