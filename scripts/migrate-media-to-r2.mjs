/*
|--------------------------------------------------------------------------
| AZAIN SUPABASE STORAGE → CLOUDFLARE R2 MIGRATION
|--------------------------------------------------------------------------
|
| PURPOSE
|
| Migrate existing AZAIN media from Supabase Storage to the private
| Cloudflare R2 bucket through the already-tested Cloudflare Worker.
|
| IMPORTANT
|
| 1. Supabase originals are NEVER deleted by this script.
| 2. Database references are NOT changed during DRY RUN.
| 3. Images and videos are both supported.
| 4. Existing WebP files remain WebP.
| 5. JPG/JPEG/PNG files are migrated as-is for this storage migration.
| 6. The existing WebP conversion remains a separate concern.
|
| R2 STRUCTURE
|
| media/
|
|   memories/
|     <memory-slug>/
|       cover.<ext>
|       gallery/
|         <memory-id>-<index>.<ext>
|
|   milestones/
|     <milestone-slug>/
|       cover.<ext>
|       gallery/
|         <milestone-id>-<index>.<ext>
|
|   family/
|     <member-key>/
|       gallery/
|         <memory-id>.<ext>
|
|   songs/
|     <song-slug>/
|       cover.<ext>
|       gallery/
|         <song-id>-<index>.<ext>
|
|   timeline-books/
|     <book-id>/
|       cover.<ext>
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

const MEDIA_WORKER_URL =
  env.MEDIA_WORKER_URL ||
  process.env.MEDIA_WORKER_URL;

const MEDIA_API_KEY =
  env.MEDIA_API_KEY ||
  process.env.MEDIA_API_KEY;

/*
|--------------------------------------------------------------------------
| VALIDATION
|--------------------------------------------------------------------------
*/

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

if (!MEDIA_WORKER_URL) {
  console.error(
    "\n❌ Missing MEDIA_WORKER_URL.\n"
  );

  process.exit(1);
}

if (!MEDIA_API_KEY) {
  console.error(
    "\n❌ Missing MEDIA_API_KEY.\n"
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
| SETTINGS
|--------------------------------------------------------------------------
*/

/*
 * FIRST RUN MUST REMAIN TRUE.
 *
 * This means:
 *
 * - media is inspected
 * - mapping is generated
 * - no R2 upload occurs
 * - no database update occurs
 */

const DRY_RUN = false;

/*
 * Keep concurrency deliberately low.
 */

const CONCURRENCY = 2;

/*
|--------------------------------------------------------------------------
| DATABASE SOURCES
|--------------------------------------------------------------------------
*/

const DATABASE_SOURCES = [
  {
    table: "timeline",
    type: "memory",
  },

  {
    table: "milestones",
    type: "milestone",
  },

  {
    table: "favorite_songs",
    type: "song",
  },

  {
    table: "timeline_books",
    type: "timeline-book",
  },

  {
    table: "family_memories",
    type: "family",
  },
];

/*
|--------------------------------------------------------------------------
| STATISTICS
|--------------------------------------------------------------------------
*/

const stats = {
  rowsRead: 0,

  referencesFound: 0,

  uniqueSources: 0,

  planned: 0,

  uploaded: 0,

  skipped: 0,

  failed: 0,

  databaseUpdated: 0,
};

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function normalizeWorkerUrl() {
  return MEDIA_WORKER_URL.replace(
    /\/+$/,
    ""
  );
}

const WORKER_BASE_URL =
  normalizeWorkerUrl();

function normalizePath(value) {
  return String(
    value || ""
  )
    .replace(
      /^\/+/,
      ""
    )
    .replace(
      /\/+/g,
      "/"
    );
}

function sanitizeSegment(value) {
  return String(
    value || ""
  )
    .trim()
    .toLowerCase()
    .replace(
      /[^a-z0-9-_]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    ) || "unknown";
}

function getExtensionFromUrl(
  source
) {
  try {
    const url =
      new URL(source);

    const pathname =
      url.pathname;

    const filename =
      pathname
        .split("/")
        .pop() || "";

    const match =
      filename.match(
        /\.([a-z0-9]+)$/i
      );

    if (!match) {
      return "bin";
    }

    return match[1]
      .toLowerCase();
  } catch {
    return "bin";
  }
}

function getFilenameFromUrl(
  source
) {
  try {
    const url =
      new URL(source);

    const pathname =
      url.pathname;

    const filename =
      pathname
        .split("/")
        .pop() || "";

    return filename;
  } catch {
    return "";
  }
}

function getContentType(
  source,
  response
) {
  const header =
    response.headers.get(
      "content-type"
    );

  if (
    header &&
    !header
      .toLowerCase()
      .startsWith(
        "text/html"
      )
  ) {
    return header;
  }

  const extension =
    getExtensionFromUrl(
      source
    );

  const types = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    avif: "image/avif",

    mp4: "video/mp4",
    mov: "video/quicktime",
    m4v: "video/x-m4v",
    webm: "video/webm",
    avi: "video/x-msvideo",
    mkv: "video/x-matroska",

    mp3: "audio/mpeg",
    wav: "audio/wav",
    m4a: "audio/mp4",
  };

  return (
    types[extension] ||
    "application/octet-stream"
  );
}

/*
|--------------------------------------------------------------------------
| SUPABASE URL → STORAGE PATH
|--------------------------------------------------------------------------
|
| Existing AZAIN database values are public Supabase Storage URLs.
|
| Example:
|
| https://xxxxx.supabase.co/storage/v1/object/public/timeline/foo.jpg
|
| becomes:
|
| bucket = timeline
| path   = foo.jpg
|--------------------------------------------------------------------------
*/

function parseSupabaseStorageUrl(
  source
) {
  if (
    typeof source !==
      "string" ||
    !source.trim()
  ) {
    return null;
  }

  try {
    const url =
      new URL(
        source.trim()
      );

    const marker =
      "/storage/v1/object/public/";

    const index =
      url.pathname.indexOf(
        marker
      );

    if (index === -1) {
      return null;
    }

    const remainder =
      url.pathname.slice(
        index +
          marker.length
      );

    const slash =
      remainder.indexOf(
        "/"
      );

    if (slash === -1) {
      return null;
    }

    const bucket =
      decodeURIComponent(
        remainder.slice(
          0,
          slash
        )
      );

    const path =
      decodeURIComponent(
        remainder.slice(
          slash + 1
        )
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
| R2 OBJECT PATH
|--------------------------------------------------------------------------
*/

function buildR2Path(
  type,
  row,
  role,
  index,
  source
) {
  const extension =
    getExtensionFromUrl(
      source
    );

  const safeExtension =
    extension || "bin";

  const rowId =
    sanitizeSegment(
      row.id
    );

  /*
   * TIMELINE MEMORY
   */

  if (
    type === "memory"
  ) {
    const slug =
      sanitizeSegment(
        row.slug ||
        row.folder_name ||
        row.title
      );

    if (
      role === "cover"
    ) {
      return (
        `media/memories/${slug}/cover.${safeExtension}`
      );
    }

    return (
      `media/memories/${slug}/gallery/${rowId}-${index}.${safeExtension}`
    );
  }

  /*
   * MILESTONE
   */

  if (
    type === "milestone"
  ) {
    const slug =
      sanitizeSegment(
        row.slug ||
        row.title
      );

    if (
      role === "cover"
    ) {
      return (
        `media/milestones/${slug}/cover.${safeExtension}`
      );
    }

    return (
      `media/milestones/${slug}/gallery/${rowId}-${index}.${safeExtension}`
    );
  }

  /*
   * FAVORITE SONG
   */

  if (
    type === "song"
  ) {
    const slug =
      sanitizeSegment(
        row.slug ||
        row.title
      );

    if (
      role === "cover"
    ) {
      return (
        `media/songs/${slug}/cover.${safeExtension}`
      );
    }

    return (
      `media/songs/${slug}/gallery/${rowId}-${index}.${safeExtension}`
    );
  }

  /*
   * TIMELINE BOOK
   */

  if (
    type === "timeline-book"
  ) {
    if (
      role === "cover"
    ) {
      return (
        `media/timeline-books/${rowId}/cover.${safeExtension}`
      );
    }

    return (
      `media/timeline-books/${rowId}/gallery/${rowId}-${index}.${safeExtension}`
    );
  }

  /*
   * FAMILY MEMORY
   */

  if (
    type === "family"
  ) {
    const memberKey =
      sanitizeSegment(
        row.member_key
      );

    return (
      `media/family/${memberKey}/gallery/${rowId}.${safeExtension}`
    );
  }

  throw new Error(
    `Unsupported media type: ${type}`
  );
}

/*
|--------------------------------------------------------------------------
| PUBLIC R2 URL
|--------------------------------------------------------------------------
*/

function buildR2Url(
  key
) {
  return (
    `${WORKER_BASE_URL}/media/${key}`
  );
}

/*
|--------------------------------------------------------------------------
| FETCH SUPABASE ROWS
|--------------------------------------------------------------------------
*/

async function fetchRows(
  table
) {
  const {
    data,
    error,
  } =
    await supabase
      .from(table)
      .select("*");

  if (error) {
    throw new Error(
      `Unable to read ${table}: ${error.message}`
    );
  }

  return data || [];
}

/*
|--------------------------------------------------------------------------
| EXTRACT MEDIA REFERENCES
|--------------------------------------------------------------------------
*/

function collectReferences(
  type,
  row
) {
  const references = [];

  /*
   * TIMELINE
   */

  if (
    type === "memory"
  ) {
    if (
      typeof row.cover_image ===
        "string" &&
      row.cover_image.trim()
    ) {
      references.push({
        source:
          row.cover_image,
        role: "cover",
        index: 0,
        field: "cover_image",
      });
    }

    if (
      Array.isArray(
        row.gallery_images
      )
    ) {
      row.gallery_images.forEach(
        (
          source,
          index
        ) => {
          if (
            typeof source ===
              "string" &&
            source.trim()
          ) {
            references.push({
              source,
              role: "gallery",
              index,
              field:
                "gallery_images",
            });
          }
        }
      );
    }
  }

  /*
   * MILESTONES
   */

  if (
    type === "milestone"
  ) {
    if (
      typeof row.cover_image ===
        "string" &&
      row.cover_image.trim()
    ) {
      references.push({
        source:
          row.cover_image,
        role: "cover",
        index: 0,
        field: "cover_image",
      });
    }

    const gallery =
      Array.isArray(
        row.gallery
      )
        ? row.gallery
        : Array.isArray(
            row.gallery_images
          )
          ? row.gallery_images
          : [];

    gallery.forEach(
      (
        source,
        index
      ) => {
        if (
          typeof source ===
            "string" &&
          source.trim()
        ) {
          references.push({
            source,
            role: "gallery",
            index,
            field:
              Array.isArray(
                row.gallery
              )
                ? "gallery"
                : "gallery_images",
          });
        }
      }
    );
  }

  /*
   * FAVORITE SONGS
   */

  if (
    type === "song"
  ) {
    if (
      typeof row.cover_image ===
        "string" &&
      row.cover_image.trim()
    ) {
      references.push({
        source:
          row.cover_image,
        role: "cover",
        index: 0,
        field: "cover_image",
      });
    }

    if (
      Array.isArray(
        row.gallery_images
      )
    ) {
      row.gallery_images.forEach(
        (
          source,
          index
        ) => {
          if (
            typeof source ===
              "string" &&
            source.trim()
          ) {
            references.push({
              source,
              role: "gallery",
              index,
              field:
                "gallery_images",
            });
          }
        }
      );
    }

    /*
     * Favorite songs may also have a dedicated
     * video_url.
     *
     * Treat it as media in the same gallery.
     */

    if (
      typeof row.video_url ===
        "string" &&
      row.video_url.trim()
    ) {
      references.push({
        source:
          row.video_url,
        role: "gallery",
        index:
          Array.isArray(
            row.gallery_images
          )
            ? row.gallery_images.length
            : 0,
        field:
          "video_url",
      });
    }
  }

  /*
   * TIMELINE BOOKS
   */

  if (
    type === "timeline-book"
  ) {
    if (
      typeof row.cover_image ===
        "string" &&
      row.cover_image.trim()
    ) {
      references.push({
        source:
          row.cover_image,
        role: "cover",
        index: 0,
        field: "cover_image",
      });
    }
  }

  /*
   * FAMILY MEMORIES
   */

  if (
    type === "family"
  ) {
    if (
      typeof row.media_url ===
        "string" &&
      row.media_url.trim()
    ) {
      references.push({
        source:
          row.media_url,
        role: "gallery",
        index: 0,
        field: "media_url",
      });
    }
  }

  return references;
}

/*
|--------------------------------------------------------------------------
| BUILD MIGRATION PLAN
|--------------------------------------------------------------------------
*/

async function buildPlan() {
  const plan = [];

  for (
    const sourceDefinition of
      DATABASE_SOURCES
  ) {
    console.log(
      `\nReading ${sourceDefinition.table}...`
    );

    const rows =
      await fetchRows(
        sourceDefinition.table
      );

    console.log(
      `Found ${rows.length} rows.`
    );

    stats.rowsRead +=
      rows.length;

    for (
      const row of rows
    ) {
      const references =
        collectReferences(
          sourceDefinition.type,
          row
        );

      stats.referencesFound +=
        references.length;

      for (
        const reference of
          references
      ) {
        const parsed =
          parseSupabaseStorageUrl(
            reference.source
          );

        if (!parsed) {
          console.warn(
            `\n⚠️ Skipping non-Supabase media URL:\n${reference.source}`
          );

          continue;
        }

        const r2Key =
          buildR2Path(
            sourceDefinition.type,
            row,
            reference.role,
            reference.index,
            reference.source
          );

        plan.push({
          table:
            sourceDefinition.table,

          type:
            sourceDefinition.type,

          rowId:
            row.id,

          field:
            reference.field,

          role:
            reference.role,

          index:
            reference.index,

          source:
            reference.source,

          bucket:
            parsed.bucket,

          storagePath:
            parsed.path,

          r2Key,

          r2Url:
            buildR2Url(
              r2Key
            ),

          row,
        });
      }
    }
  }

  return plan;
}

/*
|--------------------------------------------------------------------------
| PRINT PLAN
|--------------------------------------------------------------------------
*/

function printPlan(
  plan
) {
  console.log(
    "\n============================================================"
  );

  console.log(
    "R2 MIGRATION PLAN"
  );

  console.log(
    "============================================================"
  );

  console.log(
    `Rows read:           ${stats.rowsRead}`
  );

  console.log(
    `References found:    ${stats.referencesFound}`
  );

  console.log(
    `Migration entries:   ${plan.length}`
  );

  console.log(
    `DRY RUN:             ${DRY_RUN}`
  );

  console.log(
    "============================================================\n"
  );

  const limit =
    Math.min(
      plan.length,
      100
    );

  for (
    let index = 0;
    index < limit;
    index++
  ) {
    const item =
      plan[index];

    console.log(
      `${index + 1}. [${item.table}]`
    );

    console.log(
      `   Source: ${item.bucket}/${item.storagePath}`
    );

    console.log(
      `   R2:     ${item.r2Key}`
    );

    console.log(
      `   DB:     ${item.field}`
    );

    console.log("");
  }

  if (
    plan.length > limit
  ) {
    console.log(
      `... ${plan.length - limit} more entries not displayed.`
    );
  }
}

/*
|--------------------------------------------------------------------------
| DOWNLOAD SOURCE
|--------------------------------------------------------------------------
*/

async function downloadSource(
  source
) {
  const response =
    await fetch(
      source
    );

  if (
    !response.ok
  ) {
    throw new Error(
      `Source download failed (${response.status})`
    );
  }

  const buffer =
    await response.arrayBuffer();

  const contentType =
    getContentType(
      source,
      response
    );

  return {
    buffer,
    contentType,
  };
}

/*
|--------------------------------------------------------------------------
| CHECK R2 OBJECT
|--------------------------------------------------------------------------
*/

async function r2ObjectExists(
  key
) {
  const url =
    buildR2Url(
      key
    );

  const response =
    await fetch(
      url,
      {
        method: "HEAD",
      }
    );

  return response.ok;
}

/*
|--------------------------------------------------------------------------
| UPLOAD TO R2
|--------------------------------------------------------------------------
*/

async function uploadToR2(
  key,
  buffer,
  contentType
) {
  const url =
    buildR2Url(
      key
    );

  const response =
    await fetch(
      url,
      {
        method: "PUT",

        headers: {
          Authorization:
            `Bearer ${MEDIA_API_KEY}`,

          "Content-Type":
            contentType,

          "Cache-Control":
            "public, max-age=31536000, immutable",
        },

        body:
          Buffer.from(
            buffer
          ),
      }
    );

  const text =
    await response.text();

  if (
    !response.ok
  ) {
    throw new Error(
      `R2 upload failed (${response.status}): ${text}`
    );
  }

  let result;

  try {
    result =
      JSON.parse(
        text
      );
  } catch {
    result = null;
  }

  return result;
}

/*
|--------------------------------------------------------------------------
| PROCESS ONE ITEM
|--------------------------------------------------------------------------
*/

async function processItem(
  item
) {
  console.log(
    `\n→ ${item.table} / ${item.rowId}`
  );

  console.log(
    `  ${item.storagePath}`
  );

  console.log(
    `  → ${item.r2Key}`
  );

  /*
   * DRY RUN
   */

  if (DRY_RUN) {
    stats.planned++;

    return;
  }

  /*
   * Avoid duplicate upload if object already exists.
   */

  const alreadyExists =
    await r2ObjectExists(
      item.r2Key
    );

  if (
    alreadyExists
  ) {
    console.log(
      "  ✓ R2 object already exists"
    );

    stats.skipped++;

    return;
  }

  /*
   * Download original.
   */

  const {
    buffer,
    contentType,
  } =
    await downloadSource(
      item.source
    );

  /*
   * Upload to R2.
   */

  await uploadToR2(
    item.r2Key,
    buffer,
    contentType
  );

  /*
   * Verify upload.
   */

  const verified =
    await r2ObjectExists(
      item.r2Key
    );

  if (!verified) {
    throw new Error(
      `R2 verification failed for ${item.r2Key}`
    );
  }

  console.log(
    "  ✓ Uploaded and verified"
  );

  stats.uploaded++;
}

/*
|--------------------------------------------------------------------------
| CONCURRENCY WORKER
|--------------------------------------------------------------------------
*/

async function runWithConcurrency(
  items
) {
  let cursor = 0;

  async function worker() {
    while (
      true
    ) {
      const index =
        cursor++;

      if (
        index >=
        items.length
      ) {
        return;
      }

      const item =
        items[index];

      try {
        await processItem(
          item
        );
      } catch (error) {
        stats.failed++;

        console.error(
          `\n❌ FAILED: ${item.r2Key}`
        );

        console.error(
          error?.message ||
            String(error)
        );
      }
    }
  }

  const workers =
    Array.from(
      {
        length:
          Math.min(
            CONCURRENCY,
            items.length
          ),
      },
      () => worker()
    );

  await Promise.all(
    workers
  );
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
    "AZAIN MEDIA → R2 MIGRATION"
  );

  console.log(
    "============================================================"
  );

  console.log(
    `Worker: ${WORKER_BASE_URL}`
  );

  console.log(
    `DRY RUN: ${DRY_RUN}`
  );

  console.log(
    "============================================================\n"
  );

  /*
   * Build mapping first.
   */

  const plan =
    await buildPlan();

  stats.uniqueSources =
    new Set(
      plan.map(
        (item) =>
          item.source
      )
    ).size;

  /*
   * Print mapping.
   */

  printPlan(
    plan
  );

  /*
   * Safety check.
   */

  if (
    plan.length === 0
  ) {
    console.log(
      "\n⚠️ No migration entries were found."
    );

    process.exit(0);
  }

  /*
   * Execute.
   */

  await runWithConcurrency(
    plan
  );

  /*
   * Final report.
   */

  console.log(
    "\n============================================================"
  );

  console.log(
    "MIGRATION RESULT"
  );

  console.log(
    "============================================================"
  );

  console.log(
    `Rows read:           ${stats.rowsRead}`
  );

  console.log(
    `References found:    ${stats.referencesFound}`
  );

  console.log(
    `Unique sources:      ${stats.uniqueSources}`
  );

  console.log(
    `Planned:             ${stats.planned}`
  );

  console.log(
    `Uploaded:            ${stats.uploaded}`
  );

  console.log(
    `Skipped:             ${stats.skipped}`
  );

  console.log(
    `Failed:              ${stats.failed}`
  );

  console.log(
    "============================================================"
  );

  if (
    DRY_RUN
  ) {
    console.log(
      "\n⚠️ DRY RUN ONLY."
    );

    console.log(
      "No R2 objects were uploaded."
    );

    console.log(
      "No database references were changed."
    );
  } else {
    console.log(
      "\n✅ R2 migration upload phase completed."
    );

    console.log(
      "Supabase originals were NOT deleted."
    );

    console.log(
      "Database references were NOT changed yet."
    );
  }
}

main()
  .catch(
    (error) => {
      console.error(
        "\n❌ Migration failed:"
      );

      console.error(
        error?.stack ||
          error?.message ||
          String(error)
      );

      process.exit(1);
    }
  );