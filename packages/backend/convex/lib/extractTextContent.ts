import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { assert } from "convex-helpers";
import type { StorageActionWriter } from "convex/server";
import { Id } from "../_generated/dataModel";

const AI_MODELS = {
    image: google.chat("gemini-2.5-pro"),
    pdf: google.chat("gemini-2.5-pro"),
    html: google.chat("gemini-2.5-pro")
} as const;

const SUPPORTED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif"
] as const;

const SYSTEM_PROMPTS = {
    image: "You turn images into text. If it is a photo of a document, transcribe it. If it is not a document, describe it.",
    pdf: "You transform PDF files into text.",
    html: "You transform content into markdown."
};

export type ExtractTextContentArgs = {
    storageId: Id<"_storage">;
    filename: string;
    bytes?: ArrayBuffer;
    mimeType: string;
}

export async function extractTextContent(
    ctx: { storage: StorageActionWriter },
    args: ExtractTextContentArgs
): Promise<string> {
    const { storageId, filename, mimeType, bytes } = args;

    const url = await ctx.storage.getUrl(storageId);
    assert(url,"Failed to get storage URL");

    if(SUPPORTED_IMAGE_TYPES.some((type) => type === mimeType)) {
        return extractImageText(url);
    }

    if(mimeType.toLowerCase().includes("pdf")) {
        return extractTextFromPDF(filename,url,mimeType);
    }

    if(mimeType.toLowerCase().includes("text")) {
        return extractTextFileContent(ctx,storageId,bytes,mimeType);
    }

    throw new Error(`Unsupported file type: ${mimeType}`);
}

async function extractTextFileContent(ctx: {storage: StorageActionWriter}, storageId: Id<"_storage">, bytes: ArrayBuffer | undefined, mimeType: string): Promise<string> {
    const arraayBuffer = bytes || (await (await ctx.storage.get(storageId))?.arrayBuffer());
    if(!arraayBuffer) {
        throw new Error("Failed to get file content");
    }

    const text = new TextDecoder().decode(arraayBuffer);

    if(mimeType.toLowerCase() !== "text/plain") {
        const result = await generateText({
            model: AI_MODELS.html,
            system: SYSTEM_PROMPTS.html,
            messages: [
                {
                    role: "user",
                    content: [{ type: "text", text},{type: "text", text: "Extract the text and print it in a markdown format without explaining tha you'll do so"}]
                }
            ]
        });
        return result.text;
    }
    return text;
}

async function extractTextFromPDF(filename: string, url: string, mimeType: string): Promise<string> {
    const result = await generateText({
        model: AI_MODELS.pdf,
        system: SYSTEM_PROMPTS.pdf,
        messages: [
            {
                role: "user",
                content: [
                    { type: "file", filename, data: new URL(url), mediaType: mimeType },
                    {
                        type: "text",
                        text: "Extract the text from the PDF and print it without explaining you'll do so."
                    }
                ]
            }
        ]
    });
    return result.text;
}

async function extractImageText(url:string): Promise<string> {
    const result = await generateText({
        model: AI_MODELS.image,
        system: SYSTEM_PROMPTS.image,
        messages: [
            {
                role: "user",
                content: [{ type: "image", image: new URL(url)}]
            }
        ]
    });
    return result.text;
}