import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const ROOT = process.cwd();

const MANIFEST_PATH = path.join(
  ROOT,
  "src",
  "data",
  "r2MediaManifest.js"
);

const DATABASE = "azain-db";

/*
 * IMPORTANT:
 * These are the ONLY records this script is allowed to modify.
 *
 * 15 Timeline records + 1 Milestone record
 * identified from the previous D1 investigation.
 *
 * DO NOT add other IDs unless we deliberately identify
 * another affected record.
 */
const TARGETS = {
  timeline: [
    // IDs will be discovered from the titles below.
    // The script verifies the title before updating.
  ],

  milestones: [
    // ID will be discovered from the title below.
  ],
};

/*
 * The exact affected records identified during the previous
 * investigation.
 *
 * The script will ONLY operate on records whose:
 *   table + title
 *
 * match this list.
 *
 * This gives us an additional safety layer against accidentally
 * modifying a different record.
 */
const TARGET_TITLES = {
  timeline: [
    "Visit to Zoo",
    "Home Coming",
    "One Month Of You",
    "Our Little Explorer Takes Off",
    "Fun times...",
  ],

  milestones: [
    "First Step",
  ],
};

function run(command) {
  try {
    return execSync(command, {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (error) {
    console.error(
      error.stderr || error.message
    );

    process.exit(1);
  }
}

function loadManifest() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    throw new Error(
      `Manifest not found:\n${MANIFEST_PATH}`
    );
  }

  const source = fs.readFileSync(
    MANIFEST_PATH,
    "utf8"
  );

  const start = source.indexOf("{");
  const end = source.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error(
      "Could not read r2MediaManifest.js"
    );
  }

  return JSON.parse(
    source.slice(start, end + 1)
  );
}

function sqlEscape(value) {
  return String(value ?? "").replace(
    /'/g,
    "''"
  );
}

function replaceUrls(value, manifest) {
  if (
    typeof value !== "string" ||
    !value.includes("supabase.co")
  ) {
    return {
      value,
      replacements: 0,
      unmapped: [],
    };
  }

  let result = value;
  let replacements = 0;
  const unmapped = [];

  /*
   * First replace every exact manifest mapping.
   */
  for (const [oldUrl, newUrl] of Object.entries(
    manifest
  )) {
    if (result.includes(oldUrl)) {
      result = result.split(oldUrl).join(newUrl);

      replacements++;
    }
  }

  /*
   * After replacement, check whether any Supabase URL
   * is still present.
   */
  const remainingMatches =
    result.match(
      /https?:\/\/[^"'\\\s]+supabase\.co[^"'\\\s]*/g
    ) || [];

  for (const url of remainingMatches) {
    if (!unmapped.includes(url)) {
      unmapped.push(url);
    }
  }

  return {
    value: result,
    replacements,
    unmapped,
  };
}

function replaceJsonMedia(value, manifest) {
  if (
    typeof value !== "string" ||
    !value.includes("supabase.co")
  ) {
    return {
      value,
      replacements: 0,
      unmapped: [],
    };
  }

  /*
   * Gallery fields are normally JSON arrays.
   */
  try {
    const parsed = JSON.parse(value);

    if (Array.isArray(parsed)) {
      let totalReplacements = 0;
      const allUnmapped = [];

      const replaced = parsed.map((item) => {
        const result = replaceUrls(
          item,
          manifest
        );

        totalReplacements +=
          result.replacements;

        for (const url of result.unmapped) {
          if (!allUnmapped.includes(url)) {
            allUnmapped.push(url);
          }
        }

        return result.value;
      });

      return {
        value: JSON.stringify(replaced),
        replacements: totalReplacements,
        unmapped: allUnmapped,
      };
    }
  } catch {
    /*
     * If the field isn't valid JSON, treat it as
     * a normal string.
     */
  }

  return replaceUrls(
    value,
    manifest
  );
}

function getTargetTitleSet(table) {
  return new Set(
    TARGET_TITLES[table] || []
  );
}

console.log("\n");
console.log("=".repeat(70));
console.log(
  " AZAIN — RESTRICTED D1 SUPABASE → R2 REPLACEMENT"
);
console.log("=".repeat(70));

console.log("\n");
console.log(
  "⚠️ SAFETY MODE:"
);

console.log(
  "ONLY previously identified affected records will be modified."
);

console.log(
  "All other Timeline and Milestone records are excluded."
);

console.log("\n");

const manifest = loadManifest();

console.log(
  `Loaded ${Object.keys(manifest).length} R2 mappings.`
);

console.log("\n");
console.log(
  "Allowed Timeline titles:"
);

for (const title of TARGET_TITLES.timeline) {
  console.log(`  • ${title}`);
}

console.log("\n");
console.log(
  "Allowed Milestone titles:"
);

for (const title of TARGET_TITLES.milestones) {
  console.log(`  • ${title}`);
}

console.log("\n");
console.log(
  "Fetching ONLY the explicitly allowed records..."
);

const timelineTitles = TARGET_TITLES.timeline
  .map((title) => `'${sqlEscape(title)}'`)
  .join(",");

const milestoneTitles =
  TARGET_TITLES.milestones
    .map((title) => `'${sqlEscape(title)}'`)
    .join(",");

const query = `
SELECT
  'timeline' AS table_name,
  id,
  title,
  cover_image,
  gallery_images AS gallery
FROM timeline
WHERE title IN (${timelineTitles})

UNION ALL

SELECT
  'milestones' AS table_name,
  id,
  title,
  cover_image,
  gallery AS gallery
FROM milestones
WHERE title IN (${milestoneTitles});
`;

const command =
  `npx wrangler d1 execute ${DATABASE} ` +
  `--remote --json --command ` +
  `"${query
    .replace(/\n/g, " ")
    .replace(/"/g, '\\"')}"`;

const output = run(command);

let response;

try {
  response = JSON.parse(output);
} catch {
  console.error(
    "\nCould not parse Wrangler response:"
  );

  console.error(output);

  process.exit(1);
}

const rows =
  response?.[0]?.results ||
  response?.results ||
  [];

console.log(
  `\nRecords returned: ${rows.length}`
);

let updatedRecords = 0;
let totalReplacements = 0;
let totalUnmapped = 0;

for (const row of rows) {
  const table = row.table_name;
  const id = row.id;
  const title = row.title;

  /*
   * HARD SAFETY CHECK:
   * The returned title must explicitly belong
   * to our approved target list.
   */
  const allowedTitles =
    getTargetTitleSet(table);

  if (!allowedTitles.has(title)) {
    console.log(
      `\n⛔ SKIPPED UNAUTHORIZED RECORD`
    );

    console.log(
      `${table} ID ${id}: ${title}`
    );

    continue;
  }

  console.log("\n");
  console.log("-".repeat(70));

  console.log(
    `TARGET: ${table} | ID ${id} | ${title}`
  );

  const coverResult = replaceUrls(
    row.cover_image,
    manifest
  );

  const galleryResult =
    replaceJsonMedia(
      row.gallery,
      manifest
    );

  const newCover =
    coverResult.value;

  const newGallery =
    galleryResult.value;

  const recordReplacements =
    coverResult.replacements +
    galleryResult.replacements;

  const recordUnmapped = [
    ...coverResult.unmapped,
    ...galleryResult.unmapped,
  ];

  if (recordUnmapped.length > 0) {
    console.log(
      "\n❌ UNMAPPED URL FOUND"
    );

    for (const url of recordUnmapped) {
      console.log(`  ${url}`);
    }

    console.log(
      "\nTHIS RECORD WILL NOT BE UPDATED."
    );

    totalUnmapped +=
      recordUnmapped.length;

    continue;
  }

  if (
    newCover === row.cover_image &&
    newGallery === row.gallery
  ) {
    console.log(
      "\nℹ️ No Supabase URL requiring replacement in this target record."
    );

    continue;
  }

  /*
   * Show exactly what is going to change.
   */
  console.log(
    `\nR2 replacements in this record: ${recordReplacements}`
  );

  if (
    newCover !== row.cover_image
  ) {
    console.log(
      "\nCover image:"
    );

    console.log(
      `OLD: ${row.cover_image}`
    );

    console.log(
      `NEW: ${newCover}`
    );
  }

  if (
    newGallery !== row.gallery
  ) {
    console.log(
      "\nGallery:"
    );

    console.log(
      "OLD gallery contained Supabase URL(s)."
    );

    console.log(
      "NEW gallery contains the mapped R2 URL(s)."
    );
  }

  let updateSql;

  if (table === "timeline") {
    updateSql = `
UPDATE timeline
SET
  cover_image = '${sqlEscape(newCover)}',
  gallery_images = '${sqlEscape(newGallery)}',
  updated_at = CURRENT_TIMESTAMP
WHERE id = ${Number(id)}
  AND title = '${sqlEscape(title)}';
`;
  } else if (table === "milestones") {
    updateSql = `
UPDATE milestones
SET
  cover_image = '${sqlEscape(newCover)}',
  gallery = '${sqlEscape(newGallery)}',
  updated_at = CURRENT_TIMESTAMP
WHERE id = ${Number(id)}
  AND title = '${sqlEscape(title)}';
`;
  } else {
    console.log(
      "\n⛔ Unknown table. Record skipped."
    );

    continue;
  }

  /*
   * Extra protection:
   *
   * The UPDATE itself requires both ID and TITLE.
   *
   * Therefore even if a wrong ID somehow appeared,
   * it cannot update a different record with another title.
   */
  run(
    `npx wrangler d1 execute ${DATABASE} ` +
      `--remote --command ` +
      `"${updateSql
        .replace(/\n/g, " ")
        .replace(/"/g, '\\"')}"`
  );

  console.log(
    "\n✅ RECORD UPDATED"
  );

  updatedRecords++;
  totalReplacements +=
    recordReplacements;
}

console.log("\n");
console.log("=".repeat(70));
console.log(
  " RESTRICTED REPLACEMENT COMPLETE"
);
console.log("=".repeat(70));

console.log(
  `Approved Timeline titles : ${TARGET_TITLES.timeline.length}`
);

console.log(
  `Approved Milestone titles: ${TARGET_TITLES.milestones.length}`
);

console.log(
  `Records updated          : ${updatedRecords}`
);

console.log(
  `R2 URL replacements       : ${totalReplacements}`
);

console.log(
  `Unmapped URLs             : ${totalUnmapped}`
);

console.log("\n");

if (totalUnmapped > 0) {
  console.log(
    "❌ SOME TARGET MEDIA COULD NOT BE MAPPED."
  );

  console.log(
    "Those records were NOT updated."
  );

  console.log(
    "Do NOT delete Supabase yet."
  );
} else {
  console.log(
    "✅ ONLY THE APPROVED AFFECTED RECORDS WERE PROCESSED."
  );

  console.log(
    "No other Timeline or Milestone records were targeted."
  );
}

console.log("\n");