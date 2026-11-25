import crypto from "crypto";
import { supabase } from "../../lib/supabase";

/**
 * Generates a storage key using server-controlled values only.
 * We deliberately do NOT put the original filename in the storage path.
 */
export function createStoragePath(userId: string, extension: string): string {
  const randomName = crypto.randomBytes(24).toString("hex");
  return `uploads/${userId}/${randomName}${extension}`;
}

export async function findDuplicateProjectAsset(
  projectId: string,
  mediaHash: string,
) {
  const { data, error } = await supabase
    .from("project_assets")
    .select("id")
    .eq("media_hash", mediaHash)
    .eq("project_id", projectId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createProject(params: {
  userId: string;
  status?: string;
}): Promise<string> {
  const { data, error } = await supabase
    .from("projects")
    .insert({
      user_id: params.userId,
      status: params.status ?? "processing",
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

export async function uploadToStorage(
  storagePath: string,
  body: Buffer,
  contentType: string,
): Promise<void> {
  const { error } = await supabase.storage
    .from("media-bucket")
    .upload(storagePath, body, {
      contentType,
      // Prevent accidental replacement if a generated path is ever reused.
      upsert: false,
    });

  if (error) throw error;
}

export async function createProjectAsset(params: {
  projectId: string;
  mediaHash: string;
  storagePath: string;
}): Promise<string> {
  const { data, error } = await supabase
    .from("project_assets")
    .insert({
      project_id: params.projectId,
      media_hash: params.mediaHash,
      source_url: params.storagePath,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

/** Roll back storage when the database insert fails after the upload succeeds. */
export async function removeFromStorage(storagePath: string): Promise<void> {
  await supabase.storage.from("media-bucket").remove([storagePath]);
}
