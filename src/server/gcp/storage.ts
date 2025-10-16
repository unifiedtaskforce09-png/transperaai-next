import "server-only";
import { Storage, type GetSignedUrlConfig } from "@google-cloud/storage";
import { env } from "@/env.js";

type SignedUrlAction = "read" | "write";

interface SignedUrlOptions {
  expiresInSeconds?: number;
  contentType?: string;
  bucketName?: string;
}

let storageSingleton: Storage | null = null;

export function getStorage(): Storage {
  if (storageSingleton) return storageSingleton;

  const { GCP_PROJECT_ID, GCP_CLIENT_EMAIL, GCP_PRIVATE_KEY } = env;
  if (!GCP_PROJECT_ID || !GCP_CLIENT_EMAIL || !GCP_PRIVATE_KEY) {
    throw new Error(
      "GCP credentials are not configured. Set GCP_PROJECT_ID, GCP_CLIENT_EMAIL, and GCP_PRIVATE_KEY.",
    );
  }

  const privateKey = GCP_PRIVATE_KEY.replace(/\\n/g, "\n");

  storageSingleton = new Storage({
    projectId: GCP_PROJECT_ID,
    credentials: {
      client_email: GCP_CLIENT_EMAIL,
      private_key: privateKey,
    },
  });
  return storageSingleton;
}

export function getBucket(bucketName?: string) {
  const resolvedBucket = bucketName ?? env.GCS_BUCKET_NAME;
  if (!resolvedBucket) {
    throw new Error(
      "GCS bucket name is not configured. Provide bucketName or set GCS_BUCKET_NAME.",
    );
  }
  return getStorage().bucket(resolvedBucket);
}

export async function getSignedUrl(
  objectName: string,
  action: SignedUrlAction,
  options: SignedUrlOptions = {},
): Promise<string> {
  const bucket = getBucket(options.bucketName);
  const file = bucket.file(objectName);
  const expiresInMs = (options.expiresInSeconds ?? 15 * 60) * 1000;
  const expires = new Date(Date.now() + expiresInMs);

  const config: GetSignedUrlConfig & { contentType?: string } = {
    version: "v4",
    action: action === "read" ? "read" : "write",
    expires,
  };

  if (action === "write") {
    // For v4 signed PUT uploads, contentType must be set on the signature
    config.contentType = options.contentType ?? "application/octet-stream";
  }

  const [url] = await file.getSignedUrl(config);
  return url;
}

export async function uploadBuffer(
  objectName: string,
  data: Buffer,
  contentType?: string,
  bucketName?: string,
): Promise<void> {
  const bucket = getBucket(bucketName);
  const file = bucket.file(objectName);
  await file.save(data, { resumable: false, contentType });
}

export async function deleteObject(
  objectName: string,
  bucketName?: string,
): Promise<void> {
  const bucket = getBucket(bucketName);
  await bucket.file(objectName).delete({ ignoreNotFound: true });
}

export function getPublicUrl(objectName: string, bucketName?: string): string {
  const b = bucketName ?? env.GCS_BUCKET_NAME;
  return `https://storage.googleapis.com/${b}/${encodeURIComponent(objectName)}`;
}


