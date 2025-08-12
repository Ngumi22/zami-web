// @/app/api/uploadthing/core.ts (or wherever your router is located)

import { getCurrentUser } from "@/data/users";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

import { requireRateLimit } from "@/lib/ratelimit";

class RateLimitError extends Error {
  constructor(message = "Too many requests. Please slow down.") {
    super(message);
    this.name = "RateLimitError";
  }
}

class BlockedIpError extends Error {
  constructor(message = "Access denied.") {
    super(message);
    this.name = "BlockedIpError";
  }
}

const f = createUploadthing();

const auth = async (req: Request) => {
  try {
    const { currentUser } = await getCurrentUser();
    return currentUser;
  } catch {
    return null;
  }
};

export const ourFileRouter = {
  imageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 4,
    },
  })
    .middleware(async ({ req }) => {
      try {
        const user = await auth(req);
        if (!user) throw new UploadThingError("Unauthorized");

        await requireRateLimit({
          windowSec: 60, // 1 minute window
          max: 10, //10 uploads per minute
          identifier: user.id,
        });

        return { userId: user.id };
      } catch (error) {
        if (
          error instanceof RateLimitError ||
          error instanceof BlockedIpError
        ) {
          throw new UploadThingError(error.message);
        }
        if (error instanceof UploadThingError) {
          throw error;
        }
        throw new UploadThingError("An unexpected error occurred.");
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file name", file.name);
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
