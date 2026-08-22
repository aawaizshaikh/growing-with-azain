/**
 * AZAIN — FAST VIDEO INVENTORY
 *
 * READ-ONLY
 *
 * This version does NOT download videos.
 * It only reads Supabase Storage file metadata.
 *
 * It is intended to quickly establish:
 * - how many videos exist
 * - where they are
 * - their extensions
 * - their current storage sizes
 *
 * No videos are modified.
 * No database records are modified.
 * No files are deleted.
 */

import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

/* --------------------------------------------------------------------------
   Configuration
   -------------------------------------------------------------------------- */

const BUCKET = "timeline";

const VIDEO_EXTENSIONS = new Set([
  ".mp4",
  ".mov",
  ".m4v",
  ".webm",
  ".ogg",
  ".ogv",
]);

const ROOT_DIR = process.cwd();

const OUTPUT_JSON = path.join(
  ROOT_DIR,
  "scripts",
  "video-inventory.json"
);

const OUTPUT_CSV = path.join(
  ROOT_DIR,
  "scripts",
  "video-inventory.csv"
);

/* --------------------------------------------------------------------------
   Environment
   -------------------------------------------------------------------------- */

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL;

const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  throw new Error(
    "Missing SUPABASE_URL or VITE_SUPABASE_URL in .env"
  );
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    "Missing SUPABASE_SERVICE_ROLE_KEY in .env"
  );
}

/* --------------------------------------------------------------------------
   Supabase
   -------------------------------------------------------------------------- */

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

/* --------------------------------------------------------------------------
   Helpers
   -------------------------------------------------------------------------- */

function isVideoFile(filePath) {
  return VIDEO_EXTENSIONS.has(
    path.extname(filePath).toLowerCase()
  );
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) {
    return "0 B";
  }

  const units = [
    "B",
    "KB",
    "MB",
    "GB",
    "TB",
  ];

  let value = bytes;
  let unitIndex = 0;

  while (
    value >= 1024 &&
    unitIndex < units.length - 1
  ) {
    value /= 1024;
    unitIndex++;
  }

  return `${value.toFixed(2)} ${units[unitIndex]}`;
}

function csvEscape(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  const stringValue = String(value);

  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n")
  ) {
    return `"${stringValue.replaceAll(
      '"',
      '""'
    )}"`;
  }

  return stringValue;
}

/* --------------------------------------------------------------------------
   Recursive Storage listing
   -------------------------------------------------------------------------- */

async function listAllFiles(prefix = "") {
  const results = [];

  let offset = 0;

  const limit = 100;

  while (true) {
    const {
      data,
      error,
    } = await supabase.storage
      .from(BUCKET)
      .list(prefix, {
        limit,
        offset,
        sortBy: {
          column: "name",
          order: "asc",
        },
      });

    if (error) {
      throw new Error(
        `Failed to list "${BUCKET}/${prefix}": ${error.message}`
      );
    }

    if (
      !data ||
      data.length === 0
    ) {
      break;
    }

    for (const item of data) {
      const itemPath =
        prefix
          ? `${prefix}/${item.name}`
          : item.name;

      /*
       * Folders generally do not contain file metadata such as size.
       */
      const isFolder =
        !item.metadata ||
        typeof item.metadata.size ===
          "undefined";

      if (isFolder) {
        const nestedFiles =
          await listAllFiles(
            itemPath
          );

        results.push(
          ...nestedFiles
        );
      } else {
        results.push({
          path: itemPath,

          filename: item.name,

          extension:
            path
              .extname(itemPath)
              .toLowerCase(),

          size_bytes:
            Number(
              item.metadata.size
            ) || 0,

          mimetype:
            item.metadata.mimetype ||
            null,

          created_at:
            item.created_at ||
            null,

          updated_at:
            item.updated_at ||
            null,
        });
      }
    }

    if (
      data.length < limit
    ) {
      break;
    }

    offset += limit;
  }

  return results;
}

/* --------------------------------------------------------------------------
   Main
   -------------------------------------------------------------------------- */

async function main() {
  console.log("");
  console.log(
    "========================================"
  );
  console.log(
    " AZAIN FAST VIDEO INVENTORY"
  );
  console.log(
    " READ-ONLY"
  );
  console.log(
    "========================================"
  );
  console.log("");

  console.log(
    `Bucket: ${BUCKET}`
  );

  console.log(
    "Reading Storage metadata only..."
  );

  console.log("");

  const allFiles =
    await listAllFiles();

  const videos =
    allFiles.filter(
      (file) =>
        isVideoFile(
          file.path
        )
    );

  const totalSizeBytes =
    videos.reduce(
      (sum, video) =>
        sum +
        video.size_bytes,
      0
    );

  const extensionCounts = {};

  for (
    const video of videos
  ) {
    const extension =
      video.extension ||
      "unknown";

    extensionCounts[
      extension
    ] =
      (
        extensionCounts[
          extension
        ] || 0
      ) + 1;
  }

  const sortedLargest = [
    ...videos,
  ]
    .sort(
      (a, b) =>
        b.size_bytes -
        a.size_bytes
    );

  const sortedSmallest = [
    ...videos,
  ]
    .sort(
      (a, b) =>
        a.size_bytes -
        b.size_bytes
    );

  const inventory = {
    generated_at:
      new Date().toISOString(),

    bucket:
      BUCKET,

    read_only:
      true,

    metadata_only:
      true,

    summary: {
      total_files_discovered:
        allFiles.length,

      total_videos:
        videos.length,

      total_size_bytes:
        totalSizeBytes,

      total_size_mb:
        Number(
          (
            totalSizeBytes /
            (1024 * 1024)
          ).toFixed(2)
        ),

      total_size_gb:
        Number(
          (
            totalSizeBytes /
            (1024 *
              1024 *
              1024)
          ).toFixed(3)
        ),

      average_video_size_mb:
        videos.length > 0
          ? Number(
              (
                totalSizeBytes /
                videos.length /
                (1024 * 1024)
              ).toFixed(2)
            )
          : 0,
    },

    extensions:
      extensionCounts,

    videos,
  };

  await fs.writeFile(
    OUTPUT_JSON,
    JSON.stringify(
      inventory,
      null,
      2
    ),
    "utf8"
  );

  const headers = [
    "path",
    "filename",
    "extension",
    "size_bytes",
    "size_mb",
    "mimetype",
    "created_at",
    "updated_at",
  ];

  const csvLines = [
    headers.join(","),
  ];

  for (
    const video of videos
  ) {
    csvLines.push(
      headers
        .map(
          (header) => {
            let value =
              video[header];

            if (
              header ===
              "size_mb"
            ) {
              value =
                (
                  video.size_bytes /
                  (1024 * 1024)
                ).toFixed(2);
            }

            return csvEscape(
              value
            );
          }
        )
        .join(",")
    );
  }

  await fs.writeFile(
    OUTPUT_CSV,
    csvLines.join("\n"),
    "utf8"
  );

  console.log(
    `Files discovered: ${allFiles.length}`
  );

  console.log(
    `Video files discovered: ${videos.length}`
  );

  console.log("");

  console.log(
    `Total video storage: ${formatBytes(
      totalSizeBytes
    )}`
  );

  console.log(
    `Average video size: ${
      inventory.summary
        .average_video_size_mb
    } MB`
  );

  console.log("");

  console.log(
    "Extensions:"
  );

  for (
    const [
      extension,
      count,
    ] of Object.entries(
      extensionCounts
    )
  ) {
    console.log(
      `  ${extension}: ${count}`
    );
  }

  console.log("");

  console.log(
    "10 largest videos:"
  );

  sortedLargest
    .slice(0, 10)
    .forEach(
      (video, index) => {
        console.log(
          `  ${index + 1}. ${formatBytes(
            video.size_bytes
          )} | ${video.path}`
        );
      }
    );

  console.log("");

  console.log(
    "10 smallest videos:"
  );

  sortedSmallest
    .slice(0, 10)
    .forEach(
      (video, index) => {
        console.log(
          `  ${index + 1}. ${formatBytes(
            video.size_bytes
          )} | ${video.path}`
        );
      }
    );

  console.log("");

  console.log(
    "Reports created:"
  );

  console.log(
    `  ${OUTPUT_JSON}`
  );

  console.log(
    `  ${OUTPUT_CSV}`
  );

  console.log("");

  console.log(
    "No videos were downloaded."
  );

  console.log(
    "No Storage objects were modified."
  );

  console.log(
    "No database records were modified."
  );

  console.log("");
}

main().catch(
  (error) => {
    console.error("");
    console.error(
      "VIDEO INVENTORY FAILED"
    );
    console.error("");

    console.error(
      error instanceof Error
        ? error.message
        : error
    );

    console.error("");

    process.exit(1);
  }
);