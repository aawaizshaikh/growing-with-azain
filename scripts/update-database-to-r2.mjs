/*
|--------------------------------------------------------------------------
| AZAIN DATABASE → R2 URL UPDATE
|--------------------------------------------------------------------------
|
| PURPOSE
|
| Update existing AZAIN database media references from Supabase
| Storage URLs to the corresponding Cloudflare R2 Worker URLs.
|
| IMPORTANT
|
| - ONLY updates files that are confirmed to exist in R2.
| - Missing R2 files remain unchanged.
| - Supabase Storage originals are NOT deleted.
| - This script does NOT upload anything.
| - This script does NOT delete anything.
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
| WORKER
|--------------------------------------------------------------------------
*/

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
| STATISTICS
|--------------------------------------------------------------------------
*/

const stats = {
  rowsRead: 0,
  referencesFound: 0,
  alreadyR2: 0,
  updated: 0,
  skippedMissingR2: 0,
  failed: 0,
};

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function sanitizeSegment(
  value
) {
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

function getExtensionFromUrl(
  source
) {
  try {
    const url =
      new URL(source);

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

/*
|--------------------------------------------------------------------------
| CHECK WHETHER URL IS ALREADY R2
|--------------------------------------------------------------------------
*/

function isR2Url(
  source
) {
  if (
    typeof source !==
      "string"
  ) {
    return false;
  }

  return source.startsWith(
    `${WORKER_BASE_URL}/media/`
  );
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
    getExtensionFromUrl(
      source
    );

  const rowId =
    sanitizeSegment(
      row.id
    );

  /*
   * MEMORY
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
        `media/memories/${slug}/cover.${extension}`
      );
    }

    return (
      `media/memories/${slug}/gallery/${rowId}-${index}.${extension}`
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
        `media/milestones/${slug}/cover.${extension}`
      );
    }

    return (
      `media/milestones/${slug}/gallery/${rowId}-${index}.${extension}`
    );
  }

  /*
   * SONG
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
        `media/songs/${slug}/cover.${extension}`
      );
    }

    return (
      `media/songs/${slug}/gallery/${rowId}-${index}.${extension}`
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
        `media/timeline-books/${rowId}/cover.${extension}`
      );
    }

    return (
      `media/timeline-books/${rowId}/gallery/${rowId}-${index}.${extension}`
    );
  }

  /*
   * FAMILY
   */

  if (
    type === "family"
  ) {
    const memberKey =
      sanitizeSegment(
        row.member_key
      );

    return (
      `media/family/${memberKey}/gallery/${rowId}.${extension}`
    );
  }

  throw new Error(
    `Unsupported media type: ${type}`
  );
}

/*
|--------------------------------------------------------------------------
| PARSE SUPABASE URL
|--------------------------------------------------------------------------
*/

function isSupabaseStorageUrl(
  source
) {
  if (
    typeof source !==
      "string"
  ) {
    return false;
  }

  return source.includes(
    "/storage/v1/object/public/"
  );
}

/*
|--------------------------------------------------------------------------
| CHECK R2 OBJECT
|--------------------------------------------------------------------------
*/

async function checkR2Object(
  r2Key
) {
  const url =
    `${WORKER_BASE_URL}/media/${r2Key}`;

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
| UPDATE ONE VALUE
|--------------------------------------------------------------------------
*/

async function updateValue(
  table,
  rowId,
  field,
  oldValue,
  newValue
) {
  const {
    error,
  } =
    await supabase
      .from(table)
      .update({
        [field]:
          newValue,
      })
      .eq(
        "id",
        rowId
      );

  if (error) {
    throw new Error(
      `${table} update failed: ${error.message}`
    );
  }
}

/*
|--------------------------------------------------------------------------
| UPDATE ARRAY FIELD
|--------------------------------------------------------------------------
*/

async function updateArrayField(
  table,
  rowId,
  field,
  originalArray,
  referenceIndex,
  newValue
) {
  const updatedArray =
    [...originalArray];

  updatedArray[
    referenceIndex
  ] = newValue;

  const {
    error,
  } =
    await supabase
      .from(table)
      .update({
        [field]:
          updatedArray,
      })
      .eq(
        "id",
        rowId
      );

  if (error) {
    throw new Error(
      `${table} update failed: ${error.message}`
    );
  }
}

/*
|--------------------------------------------------------------------------
| PROCESS MEMORY
|--------------------------------------------------------------------------
*/

async function processMemory(
  row
) {
  /*
   * COVER
   */

  if (
    typeof row.cover_image ===
      "string" &&
    row.cover_image.trim()
  ) {
    stats.referencesFound++;

    if (
      isR2Url(
        row.cover_image
      )
    ) {
      stats.alreadyR2++;
    } else if (
      isSupabaseStorageUrl(
        row.cover_image
      )
    ) {
      const r2Key =
        buildR2Path(
          "memory",
          row,
          "cover",
          0,
          row.cover_image
        );

      const exists =
        await checkR2Object(
          r2Key
        );

      if (!exists) {
        stats.skippedMissingR2++;

        console.log(
          `⚠️ Missing R2 → ${row.title || row.slug || row.id} / cover`
        );
      } else {
        const r2Url =
          `${WORKER_BASE_URL}/media/${r2Key}`;

        await updateValue(
          "timeline",
          row.id,
          "cover_image",
          row.cover_image,
          r2Url
        );

        stats.updated++;

        console.log(
          `✓ R2 cover → ${row.title || row.slug || row.id}`
        );
      }
    }
  }

  /*
   * GALLERY
   */

  if (
    Array.isArray(
      row.gallery_images
    )
  ) {
    const updatedGallery =
      [...row.gallery_images];

    let changed =
      false;

    for (
      let index = 0;
      index <
      row.gallery_images.length;
      index++
    ) {
      const source =
        row.gallery_images[
          index
        ];

      if (
        typeof source !==
          "string" ||
        !source.trim()
      ) {
        continue;
      }

      stats.referencesFound++;

      if (
        isR2Url(source)
      ) {
        stats.alreadyR2++;
        continue;
      }

      if (
        !isSupabaseStorageUrl(
          source
        )
      ) {
        continue;
      }

      const r2Key =
        buildR2Path(
          "memory",
          row,
          "gallery",
          index,
          source
        );

      const exists =
        await checkR2Object(
          r2Key
        );

      if (!exists) {
        stats.skippedMissingR2++;

        console.log(
          `⚠️ Missing R2 → ${row.title || row.slug || row.id} / gallery ${index}`
        );

        continue;
      }

      updatedGallery[
        index
      ] =
        `${WORKER_BASE_URL}/media/${r2Key}`;

      changed =
        true;

      stats.updated++;

      console.log(
        `✓ R2 gallery → ${row.title || row.slug || row.id} / ${index}`
      );
    }

    if (
      changed
    ) {
      await updateValue(
        "timeline",
        row.id,
        "gallery_images",
        row.gallery_images,
        updatedGallery
      );
    }
  }
}

/*
|--------------------------------------------------------------------------
| PROCESS MILESTONE
|--------------------------------------------------------------------------
*/

async function processMilestone(
  row
) {
  /*
   * COVER
   */

  if (
    typeof row.cover_image ===
      "string" &&
    row.cover_image.trim()
  ) {
    stats.referencesFound++;

    if (
      isR2Url(
        row.cover_image
      )
    ) {
      stats.alreadyR2++;
    } else if (
      isSupabaseStorageUrl(
        row.cover_image
      )
    ) {
      const r2Key =
        buildR2Path(
          "milestone",
          row,
          "cover",
          0,
          row.cover_image
        );

      if (
        await checkR2Object(
          r2Key
        )
      ) {
        await updateValue(
          "milestones",
          row.id,
          "cover_image",
          row.cover_image,
          `${WORKER_BASE_URL}/media/${r2Key}`
        );

        stats.updated++;
      } else {
        stats.skippedMissingR2++;
      }
    }
  }

  /*
   * GALLERY
   */

  const galleryField =
    Array.isArray(
      row.gallery
    )
      ? "gallery"
      : Array.isArray(
          row.gallery_images
        )
        ? "gallery_images"
        : null;

  if (
    !galleryField
  ) {
    return;
  }

  const originalGallery =
    row[galleryField];

  const updatedGallery =
    [...originalGallery];

  let changed =
    false;

  for (
    let index = 0;
    index <
    originalGallery.length;
    index++
  ) {
    const source =
      originalGallery[
        index
      ];

    if (
      typeof source !==
        "string" ||
      !source.trim()
    ) {
      continue;
    }

    stats.referencesFound++;

    if (
      isR2Url(source)
    ) {
      stats.alreadyR2++;
      continue;
    }

    if (
      !isSupabaseStorageUrl(
        source
      )
    ) {
      continue;
    }

    const r2Key =
      buildR2Path(
        "milestone",
        row,
        "gallery",
        index,
        source
      );

    if (
      await checkR2Object(
        r2Key
      )
    ) {
      updatedGallery[
        index
      ] =
        `${WORKER_BASE_URL}/media/${r2Key}`;

      changed =
        true;

      stats.updated++;
    } else {
      stats.skippedMissingR2++;
    }
  }

  if (
    changed
  ) {
    await updateValue(
      "milestones",
      row.id,
      galleryField,
      originalGallery,
      updatedGallery
    );
  }
}

/*
|--------------------------------------------------------------------------
| PROCESS SONG
|--------------------------------------------------------------------------
*/

async function processSong(
  row
) {
  /*
   * COVER
   */

  if (
    typeof row.cover_image ===
      "string" &&
    row.cover_image.trim()
  ) {
    stats.referencesFound++;

    if (
      isR2Url(
        row.cover_image
      )
    ) {
      stats.alreadyR2++;
    } else if (
      isSupabaseStorageUrl(
        row.cover_image
      )
    ) {
      const r2Key =
        buildR2Path(
          "song",
          row,
          "cover",
          0,
          row.cover_image
        );

      if (
        await checkR2Object(
          r2Key
        )
      ) {
        await updateValue(
          "favorite_songs",
          row.id,
          "cover_image",
          row.cover_image,
          `${WORKER_BASE_URL}/media/${r2Key}`
        );

        stats.updated++;
      } else {
        stats.skippedMissingR2++;
      }
    }
  }

  /*
   * GALLERY
   */

  if (
    Array.isArray(
      row.gallery_images
    )
  ) {
    const originalGallery =
      row.gallery_images;

    const updatedGallery =
      [...originalGallery];

    let changed =
      false;

    for (
      let index = 0;
      index <
      originalGallery.length;
      index++
    ) {
      const source =
        originalGallery[
          index
        ];

      if (
        typeof source !==
          "string" ||
        !source.trim()
      ) {
        continue;
      }

      stats.referencesFound++;

      if (
        isR2Url(source)
      ) {
        stats.alreadyR2++;
        continue;
      }

      if (
        !isSupabaseStorageUrl(
          source
        )
      ) {
        continue;
      }

      const r2Key =
        buildR2Path(
          "song",
          row,
          "gallery",
          index,
          source
        );

      if (
        await checkR2Object(
          r2Key
        )
      ) {
        updatedGallery[
          index
        ] =
          `${WORKER_BASE_URL}/media/${r2Key}`;

        changed =
          true;

        stats.updated++;
      } else {
        stats.skippedMissingR2++;
      }
    }

    if (
      changed
    ) {
      await updateValue(
        "favorite_songs",
        row.id,
        "gallery_images",
        originalGallery,
        updatedGallery
      );
    }
  }

  /*
   * VIDEO
   */

  if (
    typeof row.video_url ===
      "string" &&
    row.video_url.trim()
  ) {
    stats.referencesFound++;

    if (
      isR2Url(
        row.video_url
      )
    ) {
      stats.alreadyR2++;
    } else if (
      isSupabaseStorageUrl(
        row.video_url
      )
    ) {
      const galleryLength =
        Array.isArray(
          row.gallery_images
        )
          ? row.gallery_images.length
          : 0;

      const r2Key =
        buildR2Path(
          "song",
          row,
          "gallery",
          galleryLength,
          row.video_url
        );

      if (
        await checkR2Object(
          r2Key
        )
      ) {
        await updateValue(
          "favorite_songs",
          row.id,
          "video_url",
          row.video_url,
          `${WORKER_BASE_URL}/media/${r2Key}`
        );

        stats.updated++;
      } else {
        stats.skippedMissingR2++;
      }
    }
  }
}

/*
|--------------------------------------------------------------------------
| PROCESS TIMELINE BOOK
|--------------------------------------------------------------------------
*/

async function processTimelineBook(
  row
) {
  if (
    typeof row.cover_image !==
      "string" ||
    !row.cover_image.trim()
  ) {
    return;
  }

  stats.referencesFound++;

  if (
    isR2Url(
      row.cover_image
    )
  ) {
    stats.alreadyR2++;
    return;
  }

  if (
    !isSupabaseStorageUrl(
      row.cover_image
    )
  ) {
    return;
  }

  const r2Key =
    buildR2Path(
      "timeline-book",
      row,
      "cover",
      0,
      row.cover_image
    );

  if (
    await checkR2Object(
      r2Key
    )
  ) {
    await updateValue(
      "timeline_books",
      row.id,
      "cover_image",
      row.cover_image,
      `${WORKER_BASE_URL}/media/${r2Key}`
    );

    stats.updated++;
  } else {
    stats.skippedMissingR2++;
  }
}

/*
|--------------------------------------------------------------------------
| PROCESS FAMILY MEMORY
|--------------------------------------------------------------------------
*/

async function processFamily(
  row
) {
  if (
    typeof row.media_url !==
      "string" ||
    !row.media_url.trim()
  ) {
    return;
  }

  stats.referencesFound++;

  if (
    isR2Url(
      row.media_url
    )
  ) {
    stats.alreadyR2++;
    return;
  }

  if (
    !isSupabaseStorageUrl(
      row.media_url
    )
  ) {
    return;
  }

  const r2Key =
    buildR2Path(
      "family",
      row,
      "gallery",
      0,
      row.media_url
    );

  if (
    await checkR2Object(
      r2Key
    )
  ) {
    await updateValue(
      "family_memories",
      row.id,
      "media_url",
      row.media_url,
      `${WORKER_BASE_URL}/media/${r2Key}`
    );

    stats.updated++;
  } else {
    stats.skippedMissingR2++;
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
    "AZAIN DATABASE → R2 URL UPDATE"
  );

  console.log(
    "============================================================"
  );

  console.log(
    `Worker: ${WORKER_BASE_URL}`
  );

  console.log(
    "Only verified R2 objects will be changed."
  );

  console.log(
    "Missing files will remain unchanged."
  );

  console.log(
    "Supabase Storage files will NOT be deleted."
  );

  console.log(
    "============================================================\n"
  );

  for (
    const source of
      DATABASE_SOURCES
  ) {
    console.log(
      `Checking ${source.table}...`
    );

    const {
      data,
      error,
    } =
      await supabase
        .from(source.table)
        .select("*");

    if (error) {
      throw new Error(
        `Unable to read ${source.table}: ${error.message}`
      );
    }

    const rows =
      data || [];

    stats.rowsRead +=
      rows.length;

    for (
      const row of rows
    ) {
      try {
        if (
          source.type ===
          "memory"
        ) {
          await processMemory(
            row
          );
        }

        if (
          source.type ===
          "milestone"
        ) {
          await processMilestone(
            row
          );
        }

        if (
          source.type ===
          "song"
        ) {
          await processSong(
            row
          );
        }

        if (
          source.type ===
          "timeline-book"
        ) {
          await processTimelineBook(
            row
          );
        }

        if (
          source.type ===
          "family"
        ) {
          await processFamily(
            row
          );
        }
      } catch (error) {
        stats.failed++;

        console.error(
          `❌ Failed ${source.table}/${row.id}:`,
          error?.message ||
            String(error)
        );
      }
    }
  }

  console.log(
    "\n============================================================"
  );

  console.log(
    "DATABASE UPDATE COMPLETE"
  );

  console.log(
    "============================================================"
  );

  console.log(
    `Rows read:             ${stats.rowsRead}`
  );

  console.log(
    `Media references:      ${stats.referencesFound}`
  );

  console.log(
    `Already R2:            ${stats.alreadyR2}`
  );

  console.log(
    `Changed to R2:        ${stats.updated}`
  );

  console.log(
    `Missing R2 / skipped: ${stats.skippedMissingR2}`
  );

  console.log(
    `Failed updates:       ${stats.failed}`
  );

  console.log(
    "============================================================"
  );

  console.log(
    "\nSupabase originals were NOT deleted."
  );
}

main()
  .catch(
    (error) => {
      console.error(
        "\n❌ Database update failed:"
      );

      console.error(
        error?.stack ||
          error?.message ||
          String(error)
      );

      process.exit(1);
    }
  );