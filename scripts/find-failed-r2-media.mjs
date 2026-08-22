/*
|--------------------------------------------------------------------------
| FIND FAILED R2 MEDIA
|--------------------------------------------------------------------------
|
| PURPOSE
|
| Compare every media reference currently stored in the AZAIN database
| against the corresponding object in R2.
|
| This script:
|
| - DOES NOT upload anything
| - DOES NOT delete anything
| - DOES NOT modify the database
|
| It only identifies media references whose intended R2 object is missing.
|
| Output:
|
| scripts/failed-r2-media.json
|
|--------------------------------------------------------------------------
*/

import { createClient } from "@supabase/supabase-js";
import { loadEnv } from "vite";
import fs from "node:fs/promises";

/*
|--------------------------------------------------------------------------
| ENVIRONMENT
|--------------------------------------------------------------------------
*/

const env = loadEnv(
  "production",
  process.cwd(),
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

if (!SUPABASE_URL) {
  console.error(
    "❌ Missing VITE_SUPABASE_URL"
  );
  process.exit(1);
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "❌ Missing SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}

if (!MEDIA_WORKER_URL) {
  console.error(
    "❌ Missing MEDIA_WORKER_URL"
  );
  process.exit(1);
}

/*
|--------------------------------------------------------------------------
| SUPABASE
|--------------------------------------------------------------------------
*/

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

const WORKER_BASE_URL =
  MEDIA_WORKER_URL.replace(
    /\/+$/,
    ""
  );

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
| HELPERS
|--------------------------------------------------------------------------
*/

function sanitizeSegment(value) {
  return (
    String(value || "")
      .trim()
      .toLowerCase()
      .replace(
        /[^a-z0-9-_]+/g,
        "-"
      )
      .replace(
        /^-+|-+$/g,
        ""
      ) ||
    "unknown"
  );
}

function getExtensionFromUrl(source) {
  try {
    const url = new URL(source);

    const filename =
      url.pathname
        .split("/")
        .pop() || "";

    const match =
      filename.match(
        /\.([a-z0-9]+)$/i
      );

    return match
      ? match[1].toLowerCase()
      : "bin";
  } catch {
    return "bin";
  }
}

function parseSupabaseStorageUrl(source) {
  if (
    typeof source !== "string" ||
    !source.trim()
  ) {
    return null;
  }

  try {
    const url = new URL(
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
        index + marker.length
      );

    const slash =
      remainder.indexOf("/");

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

    if (!bucket || !path) {
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
| BUILD R2 PATH
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
    getExtensionFromUrl(source);

  const rowId =
    sanitizeSegment(row.id);

  if (type === "memory") {
    const slug =
      sanitizeSegment(
        row.slug ||
        row.folder_name ||
        row.title
      );

    if (role === "cover") {
      return `media/memories/${slug}/cover.${extension}`;
    }

    return `media/memories/${slug}/gallery/${rowId}-${index}.${extension}`;
  }

  if (type === "milestone") {
    const slug =
      sanitizeSegment(
        row.slug ||
        row.title
      );

    if (role === "cover") {
      return `media/milestones/${slug}/cover.${extension}`;
    }

    return `media/milestones/${slug}/gallery/${rowId}-${index}.${extension}`;
  }

  if (type === "song") {
    const slug =
      sanitizeSegment(
        row.slug ||
        row.title
      );

    if (role === "cover") {
      return `media/songs/${slug}/cover.${extension}`;
    }

    return `media/songs/${slug}/gallery/${rowId}-${index}.${extension}`;
  }

  if (type === "timeline-book") {
    if (role === "cover") {
      return `media/timeline-books/${rowId}/cover.${extension}`;
    }

    return `media/timeline-books/${rowId}/gallery/${rowId}-${index}.${extension}`;
  }

  if (type === "family") {
    const memberKey =
      sanitizeSegment(
        row.member_key
      );

    return `media/family/${memberKey}/gallery/${rowId}.${extension}`;
  }

  throw new Error(
    `Unsupported media type: ${type}`
  );
}

/*
|--------------------------------------------------------------------------
| COLLECT MEDIA REFERENCES
|--------------------------------------------------------------------------
*/

function collectReferences(
  type,
  row
) {
  const references = [];

  if (type === "memory") {
    if (
      typeof row.cover_image ===
        "string" &&
      row.cover_image.trim()
    ) {
      references.push({
        source: row.cover_image,
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
        (source, index) => {
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

  if (type === "milestone") {
    if (
      typeof row.cover_image ===
        "string" &&
      row.cover_image.trim()
    ) {
      references.push({
        source: row.cover_image,
        role: "cover",
        index: 0,
        field: "cover_image",
      });
    }

    const gallery =
      Array.isArray(row.gallery)
        ? row.gallery
        : Array.isArray(
            row.gallery_images
          )
          ? row.gallery_images
          : [];

    gallery.forEach(
      (source, index) => {
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

  if (type === "song") {
    if (
      typeof row.cover_image ===
        "string" &&
      row.cover_image.trim()
    ) {
      references.push({
        source: row.cover_image,
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
        (source, index) => {
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

    if (
      typeof row.video_url ===
        "string" &&
      row.video_url.trim()
    ) {
      references.push({
        source: row.video_url,
        role: "gallery",
        index:
          Array.isArray(
            row.gallery_images
          )
            ? row.gallery_images.length
            : 0,
        field: "video_url",
      });
    }
  }

  if (type === "timeline-book") {
    if (
      typeof row.cover_image ===
        "string" &&
      row.cover_image.trim()
    ) {
      references.push({
        source: row.cover_image,
        role: "cover",
        index: 0,
        field: "cover_image",
      });
    }
  }

  if (type === "family") {
    if (
      typeof row.media_url ===
        "string" &&
      row.media_url.trim()
    ) {
      references.push({
        source: row.media_url,
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
| CHECK R2
|--------------------------------------------------------------------------
*/

async function checkR2Object(
  key
) {
  const url =
    `${WORKER_BASE_URL}/media/${key}`;

  try {
    const response =
      await fetch(
        url,
        {
          method: "HEAD",
        }
      );

    return response.ok;
  } catch {
    return false;
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
    "AZAIN R2 FAILED MEDIA CHECK"
  );

  console.log(
    "============================================================\n"
  );

  const failed = [];

  let totalReferences = 0;

  for (
    const sourceDefinition of
      DATABASE_SOURCES
  ) {
    console.log(
      `Checking ${sourceDefinition.table}...`
    );

    const {
      data,
      error,
    } =
      await supabase
        .from(
          sourceDefinition.table
        )
        .select("*");

    if (error) {
      throw new Error(
        `Failed to read ${sourceDefinition.table}: ${error.message}`
      );
    }

    const rows =
      data || [];

    for (
      const row of rows
    ) {
      const references =
        collectReferences(
          sourceDefinition.type,
          row
        );

      for (
        const reference of
          references
      ) {
        const parsed =
          parseSupabaseStorageUrl(
            reference.source
          );

        if (!parsed) {
          continue;
        }

        totalReferences++;

        const r2Key =
          buildR2Path(
            sourceDefinition.type,
            row,
            reference.role,
            reference.index,
            reference.source
          );

        const exists =
          await checkR2Object(
            r2Key
          );

        if (exists) {
          continue;
        }

        const filename =
          parsed.path
            .split("/")
            .pop() || "";

        failed.push({
          number:
            failed.length + 1,

          table:
            sourceDefinition.table,

          type:
            sourceDefinition.type,

          memoryId:
            row.id,

          memoryName:
            row.title ||
            row.name ||
            row.slug ||
            row.folder_name ||
            row.member_key ||
            "Unknown",

          field:
            reference.field,

          role:
            reference.role,

          index:
            reference.index,

          filename,

          originalBucket:
            parsed.bucket,

          originalPath:
            parsed.path,

          originalUrl:
            reference.source,

          r2Path:
            r2Key,

          r2Url:
            `${WORKER_BASE_URL}/media/${r2Key}`,
        });

        console.log(
          `❌ MISSING: ${r2Key}`
        );
      }
    }
  }

  /*
   * Save JSON report.
   */

  const outputPath =
    "scripts/failed-r2-media.json";

  await fs.writeFile(
    outputPath,
    JSON.stringify(
      {
        generatedAt:
          new Date().toISOString(),

        totalReferences,

        failedCount:
          failed.length,

        failed,
      },
      null,
      2
    ),
    "utf8"
  );

  /*
   * Console summary.
   */

  console.log(
    "\n============================================================"
  );

  console.log(
    "R2 VERIFICATION RESULT"
  );

  console.log(
    "============================================================"
  );

  console.log(
    `Total media references checked: ${totalReferences}`
  );

  console.log(
    `Missing from R2:                ${failed.length}`
  );

  console.log(
    `Confirmed in R2:                ${totalReferences - failed.length}`
  );

  console.log(
    "============================================================"
  );

  console.log(
    `\nReport saved to: ${outputPath}`
  );

  if (
    failed.length === 0
  ) {
    console.log(
      "\n✅ ALL MEDIA EXISTS IN R2."
    );
  } else {
    console.log(
      `\n❌ ${failed.length} MEDIA FILE(S) ARE MISSING FROM R2.`
    );
  }
}

main()
  .catch(
    (error) => {
      console.error(
        "\n❌ Verification failed:"
      );

      console.error(
        error?.stack ||
          error?.message ||
          String(error)
      );

      process.exit(1);
    }
  );