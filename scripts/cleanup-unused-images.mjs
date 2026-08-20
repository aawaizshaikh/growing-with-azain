/*
|--------------------------------------------------------------------------
| SUPABASE IMAGE STORAGE CLEANUP
|--------------------------------------------------------------------------
|
| PURPOSE
|
| This is a SEPARATE cleanup process from migrate-images.mjs.
|
| It identifies:
|
|   1. Storage images no longer referenced by the database.
|   2. Original JPG/JPEG/PNG files whose WebP replacement is now
|      referenced by the database.
|
| IMPORTANT
|
| DEFAULT MODE = DRY RUN
|
| Nothing is deleted unless this script is explicitly run with:
|
|   node scripts/cleanup-unused-images.mjs --delete
|
| Videos are NEVER deleted by this script.
|
| Non-image files are NEVER deleted by this script.
|
|--------------------------------------------------------------------------
*/

import { createClient } from "@supabase/supabase-js";
import { loadEnv } from "vite";

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
| CLEANUP MODE
|--------------------------------------------------------------------------
*/

const DELETE_ENABLED =
  process.argv.includes("--delete");

/*
|--------------------------------------------------------------------------
| SETTINGS
|--------------------------------------------------------------------------
*/

const IMAGE_EXTENSIONS =
  new Set([
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
  ]);

const ORIGINAL_EXTENSIONS =
  new Set([
    ".jpg",
    ".jpeg",
    ".png",
  ]);

const VIDEO_EXTENSIONS =
  new Set([
    ".mp4",
    ".mov",
    ".webm",
    ".m4v",
    ".avi",
    ".mkv",
  ]);

/*
|--------------------------------------------------------------------------
| DATABASE SOURCES
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
| BUCKETS
|--------------------------------------------------------------------------
*/

const BUCKETS = [
  "timeline",
  "milestones",
  "favorite_songs",
  "timeline_books",
  "family_memories",
];

/*
|--------------------------------------------------------------------------
| STATISTICS
|--------------------------------------------------------------------------
*/

const stats = {
  databaseReferences: 0,
  referencedImages: 0,
  storageImages: 0,
  orphanedImages: 0,
  originalCandidates: 0,
  totalCandidates: 0,
  deleted: 0,
  failed: 0,
  protectedVideos: 0,
  unverified: 0,
};

/*
|--------------------------------------------------------------------------
| REFERENCED STORAGE FILES
|--------------------------------------------------------------------------
*/

const referencedFiles =
  new Map();

/*
|--------------------------------------------------------------------------
| CLEANUP CANDIDATES
|--------------------------------------------------------------------------
*/

const orphanedCandidates = [];

const originalCandidates = [];

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function getExtension(value) {
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


function addReferencedFile(
  bucket,
  path
) {
  if (
    !bucket ||
    !path
  ) {
    return;
  }

  if (
    !referencedFiles.has(
      bucket
    )
  ) {
    referencedFiles.set(
      bucket,
      new Set()
    );
  }

  referencedFiles
    .get(bucket)
    .add(path);
}


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
| REGISTER DATABASE REFERENCE
|--------------------------------------------------------------------------
*/

function registerReference(
  value
) {
  if (
    typeof value !==
      "string" ||
    !value.trim()
  ) {
    return;
  }

  const parsed =
    parseSupabasePublicUrl(
      value
    );

  if (!parsed) {
    return;
  }

  const extension =
    getExtension(
      parsed.path
    );

  if (
    !IMAGE_EXTENSIONS.has(
      extension
    )
  ) {
    return;
  }

  addReferencedFile(
    parsed.bucket,
    parsed.path
  );

  stats.databaseReferences++;
}


/*
|--------------------------------------------------------------------------
| LOAD DATABASE REFERENCES
|--------------------------------------------------------------------------
*/

async function loadDatabaseReferences() {

  console.log(
    "\nLoading database references..."
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

      if (
        source.table ===
        "timeline"
      ) {

        registerReference(
          row.cover_image
        );

        if (
          Array.isArray(
            row.gallery_images
          )
        ) {

          row.gallery_images.forEach(
            registerReference
          );

        }
      }


      if (
        source.table ===
        "milestones"
      ) {

        registerReference(
          row.cover_image
        );

        if (
          Array.isArray(
            row.gallery
          )
        ) {

          row.gallery.forEach(
            registerReference
          );

        }
      }


      if (
        source.table ===
        "favorite_songs"
      ) {

        registerReference(
          row.cover_image
        );

        if (
          Array.isArray(
            row.gallery_images
          )
        ) {

          row.gallery_images.forEach(
            registerReference
          );

        }
      }


      if (
        source.table ===
        "timeline_books"
      ) {

        registerReference(
          row.cover_image
        );

      }


      if (
        source.table ===
        "family_memories"
      ) {

        const mediaType =
          typeof row.media_type ===
          "string"
            ? row.media_type.toLowerCase()
            : "";

        if (
          mediaType.includes(
            "video"
          )
        ) {
          continue;
        }

        registerReference(
          row.media_url
        );
      }
    }
  }

  for (
    const [
      _bucket,
      paths
    ] of referencedFiles
  ) {

    stats.referencedImages +=
      paths.size;

  }

  console.log(
    `Database image references: ${stats.referencedImages}`
  );
}


/*
|--------------------------------------------------------------------------
| STORAGE LISTING
|--------------------------------------------------------------------------
*/

async function listAllFiles(
  bucket,
  folder = ""
) {

  const results = [];

  let offset = 0;

  const PAGE_SIZE = 1000;

  while (true) {

    const {
      data,
      error,
    } =
      await supabase.storage
        .from(bucket)
        .list(
          folder,
          {
            limit:
              PAGE_SIZE,

            offset,

            sortBy: {
              column:
                "name",

              order:
                "asc",
            },
          }
        );

    if (error) {
      throw new Error(
        `Unable to list ${bucket}/${folder}: ${error.message}`
      );
    }

    const entries =
      data || [];

    if (
      entries.length ===
      0
    ) {
      break;
    }

    for (
      const entry of
      entries
    ) {

      const name =
        entry.name;

      if (!name) {
        continue;
      }

      const path =
        folder
          ? `${folder}/${name}`
          : name;

      const isFolder =
        !entry.metadata;

      if (isFolder) {

        const nested =
          await listAllFiles(
            bucket,
            path
          );

        results.push(
          ...nested
        );

      } else {

        results.push(
          {
            name,
            path,
            metadata:
              entry.metadata,
          }
        );

      }
    }

    if (
      entries.length <
      PAGE_SIZE
    ) {
      break;
    }

    offset +=
      PAGE_SIZE;
  }

  return results;
}


/*
|--------------------------------------------------------------------------
| STORAGE EXISTENCE CHECK
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

  const MAX_ATTEMPTS = 3;

  for (
    let attempt = 1;
    attempt <= MAX_ATTEMPTS;
    attempt++
  ) {

    try {

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

      if (!error) {

        return Boolean(
          (data || []).find(
            (file) =>
              file.name ===
              filename
          )
        );

      }

      const message =
        error.message ||
        String(error);

      const isTemporary =
        /5\d\d|timeout|timed out|gateway|network|fetch/i.test(
          message
        );

      if (
        !isTemporary
      ) {

        console.warn(
          `\n⚠️ Unable to verify ${bucket}/${path}: ${message}`
        );

        return null;
      }

      console.warn(
        `\n⚠️ Temporary Storage error checking ${bucket}/${path} (attempt ${attempt}/${MAX_ATTEMPTS})`
      );

      if (
        attempt <
        MAX_ATTEMPTS
      ) {

        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              1000 * attempt
            )
        );

      }

    } catch (error) {

      const message =
        error?.message ||
        String(error);

      console.warn(
        `\n⚠️ Storage verification error for ${bucket}/${path} (attempt ${attempt}/${MAX_ATTEMPTS}): ${message}`
      );

      if (
        attempt <
        MAX_ATTEMPTS
      ) {

        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              1000 * attempt
            )
        );

      }
    }
  }

  stats.unverified++;

  console.warn(
    `\n⚠️ UNVERIFIED — leaving candidate untouched: ${bucket}/${path}`
  );

  return null;
}


/*
|--------------------------------------------------------------------------
| SCAN STORAGE
|--------------------------------------------------------------------------
*/

async function scanStorage() {

  console.log(
    "\nScanning Supabase Storage..."
  );

  for (
    const bucket of
    BUCKETS
  ) {

    console.log(
      `\n  Bucket: ${bucket}`
    );

    const files =
      await listAllFiles(
        bucket
      );

    console.log(
      `  Files found: ${files.length}`
    );

    for (
      const file of
      files
    ) {

      const extension =
        getExtension(
          file.path
        );

      if (
        !IMAGE_EXTENSIONS.has(
          extension
        )
      ) {

        if (
          VIDEO_EXTENSIONS.has(
            extension
          )
        ) {

          stats.protectedVideos++;

        }

        continue;
      }

      stats.storageImages++;

      const referenced =
        referencedFiles
          .get(bucket)
          ?.has(file.path) ||
        false;

      if (referenced) {
        continue;
      }

      orphanedCandidates.push(
        {
          bucket,
          path:
            file.path,
          reason:
            "Not referenced by database",
          size:
            file.metadata?.size ||
            0,
        }
      );
    }
  }


  /*
  --------------------------------------------------
  ORIGINAL FILE DETECTION
  --------------------------------------------------
  */

  for (
    const [
      bucket,
      paths
    ] of referencedFiles
  ) {

    for (
      const referencedPath of
      paths
    ) {

      if (
        getExtension(
          referencedPath
        ) !==
        ".webp"
      ) {
        continue;
      }

      const basePath =
        referencedPath.replace(
          /\.webp$/i,
          ""
        );

      for (
        const extension of
        ORIGINAL_EXTENSIONS
      ) {

        const candidatePath =
          `${basePath}${extension}`;

        const exists =
          await storageFileExists(
            bucket,
            candidatePath
          );

        if (
          exists ===
          null
        ) {
          continue;
        }

        if (!exists) {
          continue;
        }

        originalCandidates.push(
          {
            bucket,
            path:
              candidatePath,
            reason:
              `Original raster for referenced ${referencedPath}`,
          }
        );
      }
    }
  }


  /*
  --------------------------------------------------
  REMOVE DUPLICATES
  --------------------------------------------------
  */

  const uniqueOrphans =
    uniqueCandidates(
      orphanedCandidates
    );

  const uniqueOriginals =
    uniqueCandidates(
      originalCandidates
    );

  orphanedCandidates.length =
    0;

  orphanedCandidates.push(
    ...uniqueOrphans
  );

  originalCandidates.length =
    0;

  originalCandidates.push(
    ...uniqueOriginals
  );

  stats.orphanedImages =
    orphanedCandidates.length;

  stats.originalCandidates =
    originalCandidates.length;

  stats.totalCandidates =
    stats.orphanedImages +
    stats.originalCandidates;
}


/*
|--------------------------------------------------------------------------
| UNIQUE CANDIDATES
|--------------------------------------------------------------------------
*/

function uniqueCandidates(
  candidates
) {

  const seen =
    new Set();

  const result = [];

  for (
    const candidate of
    candidates
  ) {

    const key =
      `${candidate.bucket}/${candidate.path}`;

    if (
      seen.has(key)
    ) {
      continue;
    }

    seen.add(key);

    result.push(
      candidate
    );
  }

  return result;
}


/*
|--------------------------------------------------------------------------
| PRINT CANDIDATES
|--------------------------------------------------------------------------
*/

function printCandidates(
  title,
  candidates
) {

  console.log(
    `\n============================================================`
  );

  console.log(
    ` ${title}`
  );

  console.log(
    `============================================================\n`
  );

  if (
    candidates.length ===
    0
  ) {

    console.log(
      "None found."
    );

    return;
  }

  for (
    const candidate of
    candidates
  ) {

    console.log(
      `  ${candidate.bucket}/${candidate.path}`
    );

    console.log(
      `     Reason: ${candidate.reason}`
    );
  }

  console.log(
    `\nTotal: ${candidates.length}`
  );
}


/*
|--------------------------------------------------------------------------
| DELETE FILES
|--------------------------------------------------------------------------
*/

async function deleteCandidates(
  candidates
) {

  if (
    candidates.length ===
    0
  ) {
    return;
  }

  if (
    !DELETE_ENABLED
  ) {
    return;
  }

  console.log(
    "\n============================================================"
  );

  console.log(
    " STARTING DELETION"
  );

  console.log(
    "============================================================\n"
  );

  for (
    const candidate of
    candidates
  ) {

    try {

      /*
      ------------------------------------------------
      Final database reference safety check.
      ------------------------------------------------
      */

      const isReferenced =
        referencedFiles
          .get(candidate.bucket)
          ?.has(candidate.path) ||
        false;

      if (
        isReferenced
      ) {

        console.log(
          `\n⚠️ SKIPPED — still referenced: ${candidate.bucket}/${candidate.path}`
        );

        continue;
      }

      /*
      ------------------------------------------------
      Videos are never deleted.
      ------------------------------------------------
      */

      const extension =
        getExtension(
          candidate.path
        );

      if (
        VIDEO_EXTENSIONS.has(
          extension
        )
      ) {

        console.log(
          `\n⚠️ SKIPPED VIDEO: ${candidate.bucket}/${candidate.path}`
        );

        continue;
      }

      const {
        error
      } =
        await supabase.storage
          .from(
            candidate.bucket
          )
          .remove([
            candidate.path
          ]);

      if (error) {

        throw new Error(
          error.message
        );

      }

      stats.deleted++;

      console.log(
        `\n✓ Deleted: ${candidate.bucket}/${candidate.path}`
      );

    } catch (
      error
    ) {

      stats.failed++;

      console.error(
        `\n❌ Failed deleting ${candidate.bucket}/${candidate.path}`
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
    " SUPABASE IMAGE STORAGE CLEANUP"
  );

  console.log(
    "============================================================\n"
  );


  if (
    DELETE_ENABLED
  ) {

    console.log(
      "⚠️  DELETE MODE ENABLED"
    );

    console.log(
      "Files identified as safe candidates WILL be deleted.\n"
    );

  } else {

    console.log(
      "🔎 DRY RUN MODE"
    );

    console.log(
      "NO FILES WILL BE DELETED.\n"
    );
  }


  /*
  |--------------------------------------------------------------------------
  | STEP 1 — DATABASE
  |--------------------------------------------------------------------------
  */

  await loadDatabaseReferences();


  /*
  |--------------------------------------------------------------------------
  | STEP 2 — STORAGE
  |--------------------------------------------------------------------------
  */

  await scanStorage();


  /*
  |--------------------------------------------------------------------------
  | STEP 3 — SHOW CANDIDATES
  |--------------------------------------------------------------------------
  */

  printCandidates(
    "ORPHANED IMAGES",
    orphanedCandidates
  );

  printCandidates(
    "ORIGINAL JPG/JPEG/PNG FILES",
    originalCandidates
  );


  /*
  |--------------------------------------------------------------------------
  | STEP 4 — ACTUAL DELETION
  |--------------------------------------------------------------------------
  |
  | THIS IS THE IMPORTANT FIX.
  |
  | The previous version detected --delete correctly but
  | never called deleteCandidates().
  |--------------------------------------------------------------------------
  */

  await deleteCandidates([
    ...orphanedCandidates,
    ...originalCandidates,
  ]);


  /*
  |--------------------------------------------------------------------------
  | SUMMARY
  |--------------------------------------------------------------------------
  */

  console.log(
    "\n============================================================"
  );

  console.log(
    " CLEANUP SUMMARY"
  );

  console.log(
    "============================================================\n"
  );

  console.log(
    `Database referenced images:     ${stats.referencedImages}`
  );

  console.log(
    `Storage images found:           ${stats.storageImages}`
  );

  console.log(
    `Orphaned images:                ${stats.orphanedImages}`
  );

  console.log(
    `Original raster candidates:     ${stats.originalCandidates}`
  );

  console.log(
    `Total deletion candidates:      ${stats.totalCandidates}`
  );

  console.log(
    `Protected videos:               ${stats.protectedVideos}`
  );

  console.log(
    `Unverified Storage checks:      ${stats.unverified}`
  );

  console.log(
    `Deleted:                        ${stats.deleted}`
  );

  console.log(
    `Failed deletions:               ${stats.failed}`
  );


  /*
  |--------------------------------------------------------------------------
  | COMPLETION MESSAGE
  |--------------------------------------------------------------------------
  */

  if (
    !DELETE_ENABLED
  ) {

    console.log(
      "\n============================================================"
    );

    console.log(
      " DRY RUN COMPLETE"
    );

    console.log(
      "============================================================\n"
    );

    console.log(
      "NO FILES WERE DELETED."
    );

    console.log(
      "\nIf everything looks correct, run:"
    );

    console.log(
      "node scripts/cleanup-unused-images.mjs --delete"
    );

    console.log(
      "\n"
    );

  } else {

    console.log(
      "\n============================================================"
    );

    console.log(
      " CLEANUP COMPLETE"
    );

    console.log(
      "============================================================\n"
    );

  }
}


/*
|--------------------------------------------------------------------------
| RUN
|--------------------------------------------------------------------------
*/

main().catch(
  (error) => {

    console.error(
      "\n❌ Cleanup failed.\n"
    );

    console.error(
      error
    );

    process.exit(1);
  }
);