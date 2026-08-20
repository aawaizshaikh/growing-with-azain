/*
|--------------------------------------------------------------------------
| EXISTING SUPABASE IMAGE → WEBP MIGRATION
|--------------------------------------------------------------------------
|
| GLOBAL ONE-TIME MIGRATION
|
| PURPOSE
|
| Convert existing raster images referenced by the application:
|
|   JPG
|   JPEG
|   PNG
|
| into:
|
|   WebP
|
| The migration:
|
|   1. Reads image references from the database.
|   2. Extracts the exact Supabase bucket + storage path.
|   3. Downloads the original image.
|   4. Converts it with Sharp.
|   5. Resizes to maximum 2400px.
|   6. Converts to WebP.
|   7. Uploads the WebP beside the original.
|   8. Verifies the WebP exists.
|   9. Updates the database reference.
|  10. Verifies the database reference.
|
| IMPORTANT:
|
| Original JPG/JPEG/PNG files are NOT deleted by this script.
|
| Videos are NEVER processed.
|
|--------------------------------------------------------------------------
| REQUIRED ENVIRONMENT VARIABLES
|--------------------------------------------------------------------------
|
| VITE_SUPABASE_URL
| SUPABASE_SERVICE_ROLE_KEY
|
| SUPABASE_SERVICE_ROLE_KEY must remain local/private.
|
|--------------------------------------------------------------------------
*/

import { createClient } from "@supabase/supabase-js";
import { loadEnv } from "vite";
import sharp from "sharp";

/*
|--------------------------------------------------------------------------
| ENVIRONMENT
|--------------------------------------------------------------------------
*/

const rootDir = process.cwd();

const env = loadEnv(
  "production",
  rootDir,
  ""
);

const SUPABASE_URL =
  env.VITE_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL;

const SUPABASE_SERVICE_ROLE_KEY =
  env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  console.error(
    "\n❌ Missing VITE_SUPABASE_URL.\n"
  );

  process.exit(1);
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "\n❌ Missing SUPABASE_SERVICE_ROLE_KEY.\n"
  );

  process.exit(1);
}

/*
|--------------------------------------------------------------------------
| SUPABASE ADMIN CLIENT
|--------------------------------------------------------------------------
*/

const supabase =
  createClient(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

/*
|--------------------------------------------------------------------------
| MIGRATION SETTINGS
|--------------------------------------------------------------------------
*/

const MAX_IMAGE_DIMENSION = 2400;

const WEBP_QUALITY = 84;

/*
|--------------------------------------------------------------------------
| CONCURRENCY
|--------------------------------------------------------------------------
|
| Keep this deliberately modest.
|
| We don't want hundreds of simultaneous downloads/uploads.
|--------------------------------------------------------------------------
*/

const CONCURRENCY = 3;

/*
|--------------------------------------------------------------------------
| IMAGE EXTENSIONS
|--------------------------------------------------------------------------
*/

const IMAGE_EXTENSIONS =
  new Set([
    ".jpg",
    ".jpeg",
    ".png",
  ]);

/*
|--------------------------------------------------------------------------
| DATABASE IMAGE SOURCES
|--------------------------------------------------------------------------
*/

const DATABASE_SOURCES = [
  {
    table: "timeline",

    columns: [
      "id",
      "cover_image",
      "gallery_images",
    ],
  },

  {
    table: "milestones",

    columns: [
      "id",
      "cover_image",
      "gallery",
    ],
  },

  {
    table: "favorite_songs",

    columns: [
      "id",
      "cover_image",
      "gallery_images",
    ],
  },

  {
    table: "timeline_books",

    columns: [
      "id",
      "cover_image",
    ],
  },

  {
    table: "family_memories",

    columns: [
      "id",
      "media_url",
      "media_type",
    ],
  },
];

/*
|--------------------------------------------------------------------------
| STATISTICS
|--------------------------------------------------------------------------
*/

const stats = {
  databaseReferences: 0,

  referencedImages: 0,

  processed: 0,

  converted: 0,

  alreadyWebp: 0,

  uploaded: 0,

  uploadVerified: 0,

  referencesUpdated: 0,

  referencesVerified: 0,

  skippedVideos: 0,

  skippedUnsupported: 0,

  failed: 0,

  originalBytes: 0,

  webpBytes: 0,
};

/*
|--------------------------------------------------------------------------
| DATABASE REFERENCE MAP
|--------------------------------------------------------------------------
|
| URL
|   ↓
| references[]
|
| Multiple database records can point to the same image.
|--------------------------------------------------------------------------
*/

const referenceMap =
  new Map();

/*
|--------------------------------------------------------------------------
| FILE PATH HELPERS
|--------------------------------------------------------------------------
*/

function getExtension(
  value
) {
  if (
    typeof value !==
    "string"
  ) {
    return "";
  }

  const clean =
    value
      .split("?")[0]
      .split("#")[0];

  const lastDot =
    clean.lastIndexOf(".");

  if (
    lastDot === -1
  ) {
    return "";
  }

  return clean
    .slice(lastDot)
    .toLowerCase();
}

function getWebpPath(
  path
) {
  return path.replace(
    /\.(jpg|jpeg|png)$/i,
    ".webp"
  );
}

/*
|--------------------------------------------------------------------------
| Parse Supabase public Storage URL
|--------------------------------------------------------------------------
|
| Expected:
|
| https://PROJECT.supabase.co/storage/v1/object/public/BUCKET/PATH
|
|--------------------------------------------------------------------------
*/

function parseSupabasePublicUrl(
  value
) {
  if (
    typeof value !==
      "string" ||
    !value.trim()
  ) {
    return null;
  }

  try {
    const url =
      new URL(
        value.trim()
      );

    const marker =
      "/storage/v1/object/public/";

    const markerIndex =
      url.pathname.indexOf(
        marker
      );

    if (
      markerIndex === -1
    ) {
      return null;
    }

    const storagePath =
      decodeURIComponent(
        url.pathname.slice(
          markerIndex +
            marker.length
        )
      );

    const slashIndex =
      storagePath.indexOf(
        "/"
      );

    if (
      slashIndex === -1
    ) {
      return null;
    }

    const bucket =
      storagePath.slice(
        0,
        slashIndex
      );

    const path =
      storagePath.slice(
        slashIndex + 1
      );

    if (
      !bucket ||
      !path
    ) {
      return null;
    }

    return {
      bucket,
      path,
    };

  } catch {
    return null;
  }
}

/*
|--------------------------------------------------------------------------
| Build public URL
|--------------------------------------------------------------------------
*/

function getPublicUrl(
  bucket,
  path
) {
  return (
    `${SUPABASE_URL}` +
    `/storage/v1/object/public/` +
    `${bucket}/${path}`
  );
}

/*
|--------------------------------------------------------------------------
| FORMAT BYTES
|--------------------------------------------------------------------------
*/

function formatBytes(
  bytes
) {
  if (
    !Number.isFinite(
      bytes
    ) ||
    bytes <= 0
  ) {
    return "0 B";
  }

  const units = [
    "B",
    "KB",
    "MB",
    "GB",
  ];

  let value = bytes;

  let index = 0;

  while (
    value >= 1024 &&
    index <
      units.length - 1
  ) {
    value /= 1024;

    index++;
  }

  return (
    `${value.toFixed(2)} ` +
    units[index]
  );
}

/*
|--------------------------------------------------------------------------
| ADD DATABASE REFERENCE
|--------------------------------------------------------------------------
*/

function addReference(
  url,
  reference
) {
  if (
    typeof url !==
      "string" ||
    !url.trim()
  ) {
    return;
  }

  const cleanUrl =
    url.trim();

  const parsed =
    parseSupabasePublicUrl(
      cleanUrl
    );

  /*
  --------------------------------------------------
  Ignore local/static/external URLs.
  --------------------------------------------------
  */

  if (!parsed) {
    return;
  }

  const extension =
    getExtension(
      parsed.path
    );

  /*
  --------------------------------------------------
  Ignore WebP.
  --------------------------------------------------
  */

  if (
    extension ===
    ".webp"
  ) {
    stats.alreadyWebp++;

    return;
  }

  /*
  --------------------------------------------------
  Ignore unsupported formats.
  --------------------------------------------------
  */

  if (
    !IMAGE_EXTENSIONS.has(
      extension
    )
  ) {
    stats.skippedUnsupported++;

    return;
  }

  if (
    !referenceMap.has(
      cleanUrl
    )
  ) {
    referenceMap.set(
      cleanUrl,
      []
    );
  }

  referenceMap
    .get(cleanUrl)
    .push({
      ...reference,

      bucket:
        parsed.bucket,

      path:
        parsed.path,
    });

  stats.databaseReferences++;
}

/*
|--------------------------------------------------------------------------
| LOAD DATABASE REFERENCES
|--------------------------------------------------------------------------
*/

async function loadDatabaseReferences() {
  console.log(
    "\nLoading database image references..."
  );

  for (
    const source of
      DATABASE_SOURCES
  ) {
    console.log(
      `  Reading ${source.table}...`
    );

    const {
      data,
      error,
    } =
      await supabase
        .from(
          source.table
        )
        .select(
          source.columns.join(
            ","
          )
        );

    if (error) {
      throw new Error(
        `Failed reading ${source.table}: ${error.message}`
      );
    }

    for (
      const row of
        data || []
    ) {
      /*
      ------------------------------------------------
      TIMELINE
      ------------------------------------------------
      */

      if (
        source.table ===
        "timeline"
      ) {
        addReference(
          row.cover_image,
          {
            table:
              "timeline",

            id: row.id,

            field:
              "cover_image",
          }
        );

        if (
          Array.isArray(
            row.gallery_images
          )
        ) {
          row.gallery_images.forEach(
            (
              url,
              index
            ) => {
              addReference(
                url,
                {
                  table:
                    "timeline",

                  id: row.id,

                  field:
                    "gallery_images",

                  index,
                }
              );
            }
          );
        }
      }

      /*
      ------------------------------------------------
      MILESTONES
      ------------------------------------------------
      */

      if (
        source.table ===
        "milestones"
      ) {
        addReference(
          row.cover_image,
          {
            table:
              "milestones",

            id: row.id,

            field:
              "cover_image",
          }
        );

        if (
          Array.isArray(
            row.gallery
          )
        ) {
          row.gallery.forEach(
            (
              url,
              index
            ) => {
              addReference(
                url,
                {
                  table:
                    "milestones",

                  id: row.id,

                  field:
                    "gallery",

                  index,
                }
              );
            }
          );
        }
      }

      /*
      ------------------------------------------------
      FAVORITE SONGS
      ------------------------------------------------
      */

      if (
        source.table ===
        "favorite_songs"
      ) {
        addReference(
          row.cover_image,
          {
            table:
              "favorite_songs",

            id: row.id,

            field:
              "cover_image",
          }
        );

        if (
          Array.isArray(
            row.gallery_images
          )
        ) {
          row.gallery_images.forEach(
            (
              url,
              index
            ) => {
              addReference(
                url,
                {
                  table:
                    "favorite_songs",

                  id: row.id,

                  field:
                    "gallery_images",

                  index,
                }
              );
            }
          );
        }
      }

      /*
      ------------------------------------------------
      TIMELINE BOOKS
      ------------------------------------------------
      */

      if (
        source.table ===
        "timeline_books"
      ) {
        addReference(
          row.cover_image,
          {
            table:
              "timeline_books",

            id: row.id,

            field:
              "cover_image",
          }
        );
      }

      /*
      ------------------------------------------------
      FAMILY MEMORIES / MY PEOPLE
      ------------------------------------------------
      */

      if (
        source.table ===
        "family_memories"
      ) {
        const mediaType =
          typeof row.media_type ===
          "string"
            ? row.media_type.toLowerCase()
            : "";

        /*
        Videos are deliberately untouched.
        */

        if (
          mediaType.includes(
            "video"
          )
        ) {
          stats.skippedVideos++;

          continue;
        }

        addReference(
          row.media_url,
          {
            table:
              "family_memories",

            id: row.id,

            field:
              "media_url",
          }
        );
      }
    }
  }

  console.log(
    `Database image references found: ${referenceMap.size}`
  );

  console.log(
    `Database reference entries: ${stats.databaseReferences}`
  );
}

/*
|--------------------------------------------------------------------------
| VERIFY STORAGE FILE
|--------------------------------------------------------------------------
|
| We use the Storage API directly.
|
| No public.objects query.
|--------------------------------------------------------------------------
*/

async function storageFileExists(
  bucket,
  path
) {
  const lastSlash =
    path.lastIndexOf("/");

  const folder =
    lastSlash >= 0
      ? path.slice(
          0,
          lastSlash
        )
      : "";

  const filename =
    lastSlash >= 0
      ? path.slice(
          lastSlash + 1
        )
      : path;

  const {
    data,
    error,
  } =
    await supabase.storage
      .from(bucket)
      .list(
        folder,
        {
          search:
            filename,

          limit:
            100,
        }
      );

  if (error) {
    throw new Error(
      `Unable to verify Storage file ${bucket}/${path}: ${error.message}`
    );
  }

  return Boolean(
    (data || []).find(
      (file) =>
        file.name ===
        filename
    )
  );
}

/*
|--------------------------------------------------------------------------
| UPDATE DATABASE TEXT REFERENCE
|--------------------------------------------------------------------------
*/

async function updateTextReference(
  reference,
  oldUrl,
  newUrl
) {
  const {
    table,
    id,
    field,
  } = reference;

  const {
    data,
    error,
  } =
    await supabase
      .from(table)
      .select(field)
      .eq(
        "id",
        id
      )
      .single();

  if (error) {
    throw error;
  }

  /*
  Another process/run may already have updated it.
  */

  if (
    data?.[field] !==
    oldUrl
  ) {
    return false;
  }

  const {
    error:
      updateError,
  } =
    await supabase
      .from(table)
      .update({
        [field]:
          newUrl,
      })
      .eq(
        "id",
        id
      );

  if (updateError) {
    throw updateError;
  }

  return true;
}

/*
|--------------------------------------------------------------------------
| UPDATE DATABASE ARRAY REFERENCE
|--------------------------------------------------------------------------
*/

async function updateArrayReference(
  reference,
  oldUrl,
  newUrl
) {
  const {
    table,
    id,
    field,
  } = reference;

  const {
    data,
    error,
  } =
    await supabase
      .from(table)
      .select(field)
      .eq(
        "id",
        id
      )
      .single();

  if (error) {
    throw error;
  }

  const currentArray =
    Array.isArray(
      data?.[field]
    )
      ? data[field]
      : [];

  let changed =
    false;

  const newArray =
    currentArray.map(
      (url) => {
        if (
          url ===
          oldUrl
        ) {
          changed =
            true;

          return newUrl;
        }

        return url;
      }
    );

  if (!changed) {
    return false;
  }

  const {
    error:
      updateError,
  } =
    await supabase
      .from(table)
      .update({
        [field]:
          newArray,
      })
      .eq(
        "id",
        id
      );

  if (updateError) {
    throw updateError;
  }

  return true;
}

/*
|--------------------------------------------------------------------------
| UPDATE DATABASE REFERENCE
|--------------------------------------------------------------------------
*/

async function updateReference(
  reference,
  oldUrl,
  newUrl
) {
  if (
    reference.field ===
      "cover_image" ||
    reference.field ===
      "media_url"
  ) {
    return updateTextReference(
      reference,
      oldUrl,
      newUrl
    );
  }

  if (
    reference.field ===
      "gallery_images" ||
    reference.field ===
      "gallery"
  ) {
    return updateArrayReference(
      reference,
      oldUrl,
      newUrl
    );
  }

  throw new Error(
    `Unsupported field: ${reference.table}.${reference.field}`
  );
}

/*
|--------------------------------------------------------------------------
| VERIFY DATABASE REFERENCE
|--------------------------------------------------------------------------
*/

async function verifyDatabaseReference(
  reference,
  newUrl
) {
  const {
    table,
    id,
    field,
  } = reference;

  const {
    data,
    error,
  } =
    await supabase
      .from(table)
      .select(field)
      .eq(
        "id",
        id
      )
      .single();

  if (error) {
    throw error;
  }

  if (
    field ===
      "cover_image" ||
    field ===
      "media_url"
  ) {
    return (
      data?.[field] ===
      newUrl
    );
  }

  if (
    field ===
      "gallery_images" ||
    field ===
      "gallery"
  ) {
    return (
      Array.isArray(
        data?.[field]
      ) &&
      data[field].includes(
        newUrl
      )
    );
  }

  return false;
}

/*
|--------------------------------------------------------------------------
| PROCESS ONE IMAGE
|--------------------------------------------------------------------------
*/

async function processImage(
  oldUrl,
  references,
  index,
  total
) {
  const firstReference =
    references[0];

  const bucket =
    firstReference.bucket;

  const sourcePath =
    firstReference.path;

  const extension =
    getExtension(
      sourcePath
    );

  if (
    !IMAGE_EXTENSIONS.has(
      extension
    )
  ) {
    return;
  }

  stats.processed++;

  const webpPath =
    getWebpPath(
      sourcePath
    );

  const newUrl =
    getPublicUrl(
      bucket,
      webpPath
    );

  console.log(
    `\n[${index}/${total}] ${bucket}/${sourcePath}`
  );

  console.log(
    `   Database references: ${references.length}`
  );

  /*
  |--------------------------------------------------------------------------
  | STEP 1 — Check if WebP already exists
  |--------------------------------------------------------------------------
  */

  const existingWebp =
    await storageFileExists(
      bucket,
      webpPath
    );

  if (
    existingWebp
  ) {
    console.log(
      `   ✓ WebP already exists`
    );
  } else {
    /*
    |--------------------------------------------------------------------------
    | STEP 2 — Download original
    |--------------------------------------------------------------------------
    */

    const {
      data:
        originalFile,
      error:
        downloadError,
    } =
      await supabase.storage
        .from(bucket)
        .download(
          sourcePath
        );

    if (
      downloadError
    ) {
      throw new Error(
        `Download failed: ${downloadError.message}`
      );
    }

    if (
      !originalFile
    ) {
      throw new Error(
        "Supabase returned no file."
      );
    }

    const originalBuffer =
      Buffer.from(
        await originalFile.arrayBuffer()
      );

    const originalBytes =
      originalBuffer.length;

    /*
    |--------------------------------------------------------------------------
    | STEP 3 — Sharp conversion
    |--------------------------------------------------------------------------
    */

    const webpBuffer =
      await sharp(
        originalBuffer
      )
        .rotate()
        .resize({
          width:
            MAX_IMAGE_DIMENSION,

          height:
            MAX_IMAGE_DIMENSION,

          fit:
            "inside",

          withoutEnlargement:
            true,
        })
        .webp({
          quality:
            WEBP_QUALITY,

          effort:
            4,
        })
        .toBuffer();

    const webpBytes =
      webpBuffer.length;

    stats.originalBytes +=
      originalBytes;

    stats.webpBytes +=
      webpBytes;

    /*
    |--------------------------------------------------------------------------
    | STEP 4 — Upload WebP
    |--------------------------------------------------------------------------
    */

    const {
      error:
        uploadError,
    } =
      await supabase.storage
        .from(bucket)
        .upload(
          webpPath,
          webpBuffer,
          {
            contentType:
              "image/webp",

            cacheControl:
              "31536000",

            upsert:
              false,
          }
        );

    if (
      uploadError
    ) {
      /*
      If another run created it, we can continue.
      Otherwise this is a genuine failure.
      */

      if (
        uploadError.message
          ?.toLowerCase()
          .includes(
            "already exists"
          )
      ) {
        console.log(
          "   WebP already appeared; continuing."
        );
      } else {
        throw new Error(
          `Upload failed: ${uploadError.message}`
        );
      }
    } else {
      stats.uploaded++;

      stats.converted++;

      console.log(
        `   Original: ${formatBytes(
          originalBytes
        )}`
      );

      console.log(
        `   WebP:     ${formatBytes(
          webpBytes
        )}`
      );

      if (
        originalBytes >
        0
      ) {
        const reduction =
          (
            1 -
            webpBytes /
              originalBytes
          ) *
          100;

        console.log(
          `   Reduction: ${reduction.toFixed(
            1
          )}%`
        );
      }
    }
  }

  /*
  |--------------------------------------------------------------------------
  | STEP 5 — Verify WebP exists
  |--------------------------------------------------------------------------
  */

  const verified =
    await storageFileExists(
      bucket,
      webpPath
    );

  if (!verified) {
    throw new Error(
      `WebP verification failed: ${bucket}/${webpPath}`
    );
  }

  stats.uploadVerified++;

  console.log(
    "   ✓ WebP verified"
  );

  /*
  |--------------------------------------------------------------------------
  | STEP 6 — Update DB references
  |--------------------------------------------------------------------------
  */

  for (
    const reference of
      references
  ) {
    const updated =
      await updateReference(
        reference,
        oldUrl,
        newUrl
      );

    if (updated) {
      stats.referencesUpdated++;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | STEP 7 — Verify DB references
  |--------------------------------------------------------------------------
  */

  for (
    const reference of
      references
  ) {
    const verifiedReference =
      await verifyDatabaseReference(
        reference,
        newUrl
      );

    if (
      !verifiedReference
    ) {
      throw new Error(
        `Database verification failed: ${reference.table}.${reference.field} (${reference.id})`
      );
    }

    stats.referencesVerified++;
  }

  console.log(
    "   ✓ Database references updated and verified"
  );
}

/*
|--------------------------------------------------------------------------
| WORKER
|--------------------------------------------------------------------------
*/

async function worker(
  entries,
  workerIndex
) {
  for (
    let i =
      workerIndex;

    i <
      entries.length;

    i +=
      CONCURRENCY
  ) {
    const [
      oldUrl,
      references,
    ] =
      entries[i];

    try {
      await processImage(
        oldUrl,
        references,
        i + 1,
        entries.length
      );
    } catch (
      error
    ) {
      stats.failed++;

      console.error(
        `\n❌ FAILED IMAGE`
      );

      console.error(
        oldUrl
      );

      console.error(
        error.message ||
          error
      );
    }
  }
}

/*
|--------------------------------------------------------------------------
| MAIN
|--------------------------------------------------------------------------
*/

async function main() {
  console.log(
    "\n============================================================"
  );

  console.log(
    " GLOBAL EXISTING IMAGE → WEBP MIGRATION"
  );

  console.log(
    "============================================================\n"
  );

  console.log(
    `Maximum dimension: ${MAX_IMAGE_DIMENSION}px`
  );

  console.log(
    `WebP quality: ${WEBP_QUALITY}`
  );

  console.log(
    `Concurrency: ${CONCURRENCY}`
  );

  console.log(
    "\nOriginal JPG/JPEG/PNG files WILL NOT be deleted.\n"
  );

  /*
  |--------------------------------------------------------------------------
  | STEP 1
  |--------------------------------------------------------------------------
  */

  await loadDatabaseReferences();

  const entries =
    Array.from(
      referenceMap.entries()
    );

  stats.referencedImages =
    entries.length;

  console.log(
    `\nImages requiring migration: ${entries.length}`
  );

  console.log(
    `Videos skipped: ${stats.skippedVideos}`
  );

  console.log(
    `Unsupported references skipped: ${stats.skippedUnsupported}`
  );

  if (
    entries.length ===
    0
  ) {
    console.log(
      "\nNothing to migrate."
    );

    return;
  }

  /*
  |--------------------------------------------------------------------------
  | STEP 2 — Workers
  |--------------------------------------------------------------------------
  */

  const startTime =
    Date.now();

  const workerCount =
    Math.min(
      CONCURRENCY,
      entries.length
    );

  await Promise.all(
    Array.from(
      {
        length:
          workerCount,
      },
      (
        _,
        workerIndex
      ) =>
        worker(
          entries,
          workerIndex
        )
    )
  );

  /*
  |--------------------------------------------------------------------------
  | SUMMARY
  |--------------------------------------------------------------------------
  */

  const elapsed =
    (
      Date.now() -
      startTime
    ) /
    1000;

  const savedBytes =
    Math.max(
      0,
      stats.originalBytes -
        stats.webpBytes
    );

  const reduction =
    stats.originalBytes >
    0
      ? (
          savedBytes /
          stats.originalBytes
        ) *
        100
      : 0;

  console.log(
    "\n============================================================"
  );

  console.log(
    " MIGRATION COMPLETE"
  );

  console.log(
    "============================================================\n"
  );

  console.log(
    `Database image references:     ${stats.databaseReferences}`
  );

  console.log(
    `Unique images processed:       ${stats.processed}`
  );

  console.log(
    `Images converted:              ${stats.converted}`
  );

  console.log(
    `WebP already existed:          ${stats.alreadyWebp}`
  );

  console.log(
    `WebP uploads:                  ${stats.uploaded}`
  );

  console.log(
    `WebP uploads verified:         ${stats.uploadVerified}`
  );

  console.log(
    `DB references updated:         ${stats.referencesUpdated}`
  );

  console.log(
    `DB references verified:        ${stats.referencesVerified}`
  );

  console.log(
    `Videos skipped:                ${stats.skippedVideos}`
  );

  console.log(
    `Failed images:                 ${stats.failed}`
  );

  console.log(
    `\nOriginal image data:          ${formatBytes(
      stats.originalBytes
    )}`
  );

  console.log(
    `Optimized WebP data:           ${formatBytes(
      stats.webpBytes
    )}`
  );

  console.log(
    `Potential storage reduction:   ${formatBytes(
      savedBytes
    )}`
  );

  console.log(
    `Overall reduction:             ${reduction.toFixed(
      1
    )}%`
  );

  console.log(
    `\nTime taken:                   ${elapsed.toFixed(
      1
    )} seconds`
  );

  console.log(
    "\nIMPORTANT:"
  );

  console.log(
    "Original JPG/JPEG/PNG files have NOT been deleted."
  );

  console.log(
    "Verify the website and Supabase before cleanup."
  );

  console.log(
    "\n============================================================\n"
  );

  if (
    stats.failed >
    0
  ) {
    process.exit(2);
  }
}

/*
|--------------------------------------------------------------------------
| EXECUTE
|--------------------------------------------------------------------------
*/

main().catch(
  (error) => {
    console.error(
      "\n❌ Migration failed completely.\n"
    );

    console.error(
      error
    );

    process.exit(1);
  }
);