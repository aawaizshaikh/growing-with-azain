import { supabase } from "../lib/supabase";

/*
|--------------------------------------------------------------------------
| Upload Single File
|--------------------------------------------------------------------------
*/

export async function uploadFile(
  file,
  folder,
  bucket = "timeline"
) {
  if (!file) return null;

  const extension = file.name.split(".").pop();

  const filename =
    `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 10)}.${extension}`;

  const filePath = `${folder}/${filename}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return data.publicUrl;
}

/*
|--------------------------------------------------------------------------
| Upload Multiple Files
|--------------------------------------------------------------------------
*/

export async function uploadMultiple(
  files,
  folder,
  bucket = "timeline"
) {
  if (!files || files.length === 0) return [];

  const uploaded = [];

  for (const file of files) {
    const url = await uploadFile(
      file,
      `${folder}/gallery`,
      bucket
    );

    uploaded.push(url);
  }

  return uploaded;
}

/*
|--------------------------------------------------------------------------
| Delete File
|--------------------------------------------------------------------------
*/

export async function deleteFile(
  publicUrl,
  bucket = "timeline"
) {
  if (!publicUrl) return;

  try {
    const marker = `/storage/v1/object/public/${bucket}/`;

    const path = publicUrl.split(marker)[1];

    if (!path) return;

    await supabase.storage
      .from(bucket)
      .remove([path]);
  } catch (err) {
    console.error(err);
  }
}

/*
|--------------------------------------------------------------------------
| Delete Multiple Files
|--------------------------------------------------------------------------
*/

export async function deleteMultiple(
  urls,
  bucket = "timeline"
) {
  if (!urls?.length) return;

  for (const url of urls) {
    await deleteFile(url, bucket);
  }
}