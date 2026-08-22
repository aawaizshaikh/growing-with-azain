import "dotenv/config";
import sharp from "sharp";

/*
===============================================================================
AZAIN — EXISTING R2 GALLERY THUMBNAIL BACKFILL
===============================================================================

ONE-TIME MIGRATION ONLY

Existing:
    D1 → original R2 URL

Creates:
    same R2 folder → thumbs → same filename

Example:

    /media/memories/abc/photo.webp
                         ↓
    /media/memories/abc/thumbs/photo.webp

D1 is NOT changed.
Original R2 files are NOT changed.
Videos are NOT changed.

Future uploads are already handled by storageService.js.
===============================================================================
*/


/* ============================================================================
   EXISTING WORKERS
============================================================================ */

const API_WORKER_URL =
  "https://azain-api-worker.aaawaizshaikh.workers.dev";

const MEDIA_WORKER_URL =
  (
    process.env.VITE_MEDIA_WORKER_URL ||
    process.env.MEDIA_WORKER_URL ||
    ""
  ).replace(/\/+$/, "");

const MEDIA_API_KEY =
  (
    process.env.VITE_MEDIA_API_KEY ||
    process.env.MEDIA_API_KEY ||
    ""
  ).trim();


/* ============================================================================
   THUMBNAIL SETTINGS
============================================================================ */

const MAX_DIMENSION = 320;
const WEBP_QUALITY = 78;


/* ============================================================================
   VALIDATION
============================================================================ */

if (!MEDIA_WORKER_URL) {
  throw new Error(
    "VITE_MEDIA_WORKER_URL / MEDIA_WORKER_URL is missing."
  );
}

if (!MEDIA_API_KEY) {
  throw new Error(
    "VITE_MEDIA_API_KEY / MEDIA_API_KEY is missing."
  );
}


/* ============================================================================
   GALLERY DATA SOURCES
============================================================================

These are the same four sources used by Gallery.jsx.

============================================================================ */

const SOURCES = [
  {
    name: "timeline",
    endpoint: "/timeline",
    fields: [
      "cover_image",
      "gallery_images",
    ],
  },

  {
    name: "milestones",
    endpoint: "/milestones",
    fields: [
      "cover_image",
      "gallery",
    ],
  },

  {
    name: "favorite_songs",
    endpoint: "/favorite-songs",
    fields: [
      "cover_image",
      "gallery_images",
    ],
  },

  {
    name: "family_memories",
    endpoint: "/family-memories",
    fields: [
      "media_url",
    ],
  },
];


/* ============================================================================
   STATS
============================================================================ */

const stats = {
  rowsRead: 0,
  referencesFound: 0,
  imagesFound: 0,
  videosSkipped: 0,
  alreadyExists: 0,
  created: 0,
  failed: 0,
};


/* ============================================================================
   HELPERS
============================================================================ */

function isR2Url(
  value
) {
  return (
    typeof value === "string" &&
    value.trim() &&
    value.includes("/media/")
  );
}


function isVideo(
  key
) {
  return /\.(mp4|webm|mov|m4v|avi|mkv)$/i.test(
    key
  );
}


function isImage(
  key
) {
  return /\.(jpg|jpeg|png|webp|gif|avif|bmp|tif|tiff)$/i.test(
    key
  );
}


/* ============================================================================
   EXTRACT R2 KEY
============================================================================ */

function getR2Key(
  publicUrl
) {
  const url =
    new URL(
      publicUrl
    );

  const marker =
    "/media/";

  const index =
    url.pathname.indexOf(
      marker
    );

  if (
    index === -1
  ) {
    throw new Error(
      `Invalid Media Worker URL: ${publicUrl}`
    );
  }

  return decodeURIComponent(
    url.pathname.substring(
      index +
        marker.length
    )
  );
}


/* ============================================================================
   BUILD MEDIA WORKER URL
============================================================================ */

function mediaUrl(
  key
) {
  return (
    `${MEDIA_WORKER_URL}/media/` +
    key
      .split("/")
      .map(
        encodeURIComponent
      )
      .join("/")
  );
}


/* ============================================================================
   BUILD THUMBNAIL KEY
============================================================================ */

function thumbnailKey(
  originalKey
) {
  const slash =
    originalKey.lastIndexOf(
      "/"
    );

  if (
    slash === -1
  ) {
    return `thumbs/${originalKey}`;
  }

  const directory =
    originalKey.substring(
      0,
      slash
    );

  const filename =
    originalKey.substring(
      slash + 1
    );

  return `${directory}/thumbs/${filename}`;
}


/* ============================================================================
   FETCH GALLERY SOURCE
============================================================================ */

async function getRows(
  source
) {
  const response =
    await fetch(
      `${API_WORKER_URL}${source.endpoint}`
    );

  if (!response.ok) {
    throw new Error(
      `${source.name}: API returned HTTP ${response.status}`
    );
  }

  const data =
    await response.json();

  if (
    !Array.isArray(data)
  ) {
    throw new Error(
      `${source.name}: API did not return an array.`
    );
  }

  return data;
}


/* ============================================================================
   EXTRACT MEDIA VALUES
============================================================================ */

function extractValues(
  value
) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return [];
  }

  if (
    Array.isArray(value)
  ) {
    return value
      .filter(
        (item) =>
          typeof item === "string"
      )
      .map(
        (item) =>
          item.trim()
      )
      .filter(Boolean);
  }

  if (
    typeof value !== "string"
  ) {
    return [];
  }

  const trimmed =
    value.trim();

  /*
  Gallery arrays are stored as JSON.
  */
  if (
    trimmed.startsWith("[")
  ) {
    try {
      const parsed =
        JSON.parse(
          trimmed
        );

      if (
        Array.isArray(parsed)
      ) {
        return parsed
          .filter(
            (item) =>
              typeof item === "string"
          )
          .map(
            (item) =>
              item.trim()
          )
          .filter(Boolean);
      }
    } catch {
      /*
      If it isn't valid JSON,
      continue as a normal URL.
      */
    }
  }

  return [
    trimmed,
  ];
}


/* ============================================================================
   AUTH HEADERS
============================================================================ */

function authHeaders(
  extra = {}
) {
  return {
    Authorization:
      `Bearer ${MEDIA_API_KEY}`,

    ...extra,
  };
}


/* ============================================================================
   CHECK THUMBNAIL
============================================================================ */

async function exists(
  url
) {
  const response =
    await fetch(
      url,
      {
        method:
          "HEAD",
      }
    );

  return response.ok;
}


/* ============================================================================
   DOWNLOAD ORIGINAL
============================================================================ */

async function download(
  url
) {
  const response =
    await fetch(
      url
    );

  if (!response.ok) {
    throw new Error(
      `Original GET failed: HTTP ${response.status}`
    );
  }

  return Buffer.from(
    await response.arrayBuffer()
  );
}


/* ============================================================================
   CREATE THUMBNAIL
============================================================================ */

async function createThumbnail(
  original
) {
  return sharp(
    original
  )
    .rotate()
    .resize({
      width:
        MAX_DIMENSION,

      height:
        MAX_DIMENSION,

      fit:
        "inside",

      withoutEnlargement:
        true,
    })
    .webp({
      quality:
        WEBP_QUALITY,
    })
    .toBuffer();
}


/* ============================================================================
   UPLOAD THUMBNAIL
============================================================================ */

async function upload(
  url,
  buffer
) {
  const response =
    await fetch(
      url,
      {
        method:
          "PUT",

        headers:
          authHeaders({
            "Content-Type":
              "image/webp",

            "Cache-Control":
              "public, max-age=31536000, immutable",
          }),

        body:
          buffer,
      }
    );

  if (!response.ok) {
    const body =
      await response
        .text()
        .catch(
          () => ""
        );

    throw new Error(
      `Thumbnail PUT failed: HTTP ${response.status}${
        body
          ? ` — ${body}`
          : ""
      }`
    );
  }
}


/* ============================================================================
   PROCESS ONE IMAGE
============================================================================ */

async function processImage(
  publicUrl,
  sourceName,
  rowId,
  field
) {
  stats.referencesFound++;

  if (
    !isR2Url(
      publicUrl
    )
  ) {
    return;
  }

  const originalKey =
    getR2Key(
      publicUrl
    );

  /*
  Never process thumbnails again.
  */
  if (
    originalKey.includes(
      "/thumbs/"
    )
  ) {
    return;
  }

  /*
  Videos remain completely unchanged.
  */
  if (
    isVideo(
      originalKey
    )
  ) {
    stats.videosSkipped++;
    return;
  }

  /*
  Only image files are processed.
  */
  if (
    !isImage(
      originalKey
    )
  ) {
    return;
  }

  stats.imagesFound++;

  const targetKey =
    thumbnailKey(
      originalKey
    );

  const targetUrl =
    mediaUrl(
      targetKey
    );

  /*
  Already created?
  */
  if (
    await exists(
      targetUrl
    )
  ) {
    stats.alreadyExists++;

    console.log(
      `EXISTS  ${targetKey}`
    );

    return;
  }

  console.log(
    `CREATE  ${sourceName} / ${rowId} / ${field}`
  );

  try {
    /*
    Download original.
    */
    const original =
      await download(
        mediaUrl(
          originalKey
        )
      );

    /*
    Generate thumbnail.
    */
    const thumbnail =
      await createThumbnail(
        original
      );

    /*
    Upload thumbnail.
    */
    await upload(
      targetUrl,
      thumbnail
    );

    /*
    Verify.
    */
    if (
      !(await exists(
        targetUrl
      ))
    ) {
      throw new Error(
        "Thumbnail upload could not be verified."
      );
    }

    stats.created++;

    console.log(
      `OK      ${targetKey}`
    );
  } catch (
    error
  ) {
    stats.failed++;

    console.error(
      `FAILED  ${targetKey}`
    );

    console.error(
      `        ${error.message}`
    );
  }
}


/* ============================================================================
   MAIN
============================================================================ */

async function main() {
  console.log("");
  console.log(
    "=============================================================="
  );
  console.log(
    " AZAIN — EXISTING R2 THUMBNAIL BACKFILL"
  );
  console.log(
    "=============================================================="
  );
  console.log("");
  console.log(
    "D1: READ ONLY"
  );
  console.log(
    "R2: THUMBNAILS ONLY"
  );
  console.log(
    "ORIGINALS: UNTOUCHED"
  );
  console.log(
    "VIDEOS: UNTOUCHED"
  );
  console.log("");

  for (
    const source of SOURCES
  ) {
    console.log(
      `Reading ${source.name}...`
    );

    const rows =
      await getRows(
        source
      );

    stats.rowsRead +=
      rows.length;

    console.log(
      `  ${rows.length} row(s)`
    );

    for (
      const row of rows
    ) {
      for (
        const field of
          source.fields
      ) {
        const values =
          extractValues(
            row[field]
          );

        for (
          const value of
            values
        ) {
          await processImage(
            value,
            source.name,
            row.id,
            field
          );
        }
      }
    }
  }

  console.log("");
  console.log(
    "=============================================================="
  );
  console.log(
    " BACKFILL COMPLETE"
  );
  console.log(
    "=============================================================="
  );
  console.log("");

  console.log(
    `Rows read          : ${stats.rowsRead}`
  );

  console.log(
    `Media references   : ${stats.referencesFound}`
  );

  console.log(
    `Images found       : ${stats.imagesFound}`
  );

  console.log(
    `Videos skipped     : ${stats.videosSkipped}`
  );

  console.log(
    `Already existed    : ${stats.alreadyExists}`
  );

  console.log(
    `Created            : ${stats.created}`
  );

  console.log(
    `Failed             : ${stats.failed}`
  );

  console.log("");

  if (
    stats.failed > 0
  ) {
    console.log(
      "⚠️ Some thumbnails failed."
    );

    process.exitCode =
      1;

    return;
  }

  console.log(
    "✅ Existing image thumbnails are complete."
  );
}


main().catch(
  (error) => {
    console.error("");
    console.error(
      "BACKFILL FAILED"
    );
    console.error("");
    console.error(
      error
    );

    process.exitCode =
      1;
  }
);