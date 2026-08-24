import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const ROOT = process.cwd();
const DATABASE = "azain-db";

const MANIFEST_PATH = path.join(
  ROOT,
  "src",
  "data",
  "r2MediaManifest.js"
);

function run(command) {
  try {
    return execSync(command, {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  } catch (error) {
    console.error(
      error.stderr || error.message
    );
    process.exit(1);
  }
}

function sqlEscape(value) {
  return String(value ?? "").replace(
    /'/g,
    "''"
  );
}

function loadManifest() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    throw new Error(
      `Missing manifest: ${MANIFEST_PATH}`
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

function replaceExactUrls(value, manifest) {
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

  /*
   * Replace ONLY exact mappings that already exist
   * in the migration manifest.
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
   * Anything still containing supabase.co means
   * there was no confirmed mapping.
   */
  const remaining =
    result.match(
      /https?:\/\/[^"'\\\s]+supabase\.co[^"'\\\s]*/g
    ) || [];

  return {
    value: result,
    replacements,
    unmapped: [
      ...new Set(remaining),
    ],
  };
}

function replaceGallery(value, manifest) {
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
   * Gallery fields are JSON arrays.
   */
  try {
    const parsed = JSON.parse(value);

    if (Array.isArray(parsed)) {
      let replacements = 0;
      const unmapped = [];

      const newArray = parsed.map(
        (item) => {
          const result =
            replaceExactUrls(
              item,
              manifest
            );

          replacements +=
            result.replacements;

          unmapped.push(
            ...result.unmapped
          );

          return result.value;
        }
      );

      return {
        value: JSON.stringify(
          newArray
        ),
        replacements,
        unmapped: [
          ...new Set(unmapped),
        ],
      };
    }
  } catch {
    // Fall through and treat it as text.
  }

  return replaceExactUrls(
    value,
    manifest
  );
}

function getD1Rows() {
  const query = `
SELECT
  'timeline' AS table_name,
  id,
  title,
  cover_image,
  gallery_images AS gallery
FROM timeline
WHERE cover_image LIKE '%supabase.co%'
   OR gallery_images LIKE '%supabase.co%'

UNION ALL

SELECT
  'milestones' AS table_name,
  id,
  title,
  cover_image,
  gallery AS gallery
FROM milestones
WHERE cover_image LIKE '%supabase.co%'
   OR gallery LIKE '%supabase.co%';
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
    throw new Error(
      `Unable to parse D1 response:\n${output}`
    );
  }

  return (
    response?.[0]?.results ||
    response?.results ||
    []
  );
}

function updateTimeline(
  id,
  title,
  cover,
  gallery
) {
  const sql = `
UPDATE timeline
SET
  cover_image = '${sqlEscape(cover)}',
  gallery_images = '${sqlEscape(gallery)}',
  updated_at = CURRENT_TIMESTAMP
WHERE id = ${Number(id)}
  AND title = '${sqlEscape(title)}'
  AND (
    cover_image LIKE '%supabase.co%'
    OR gallery_images LIKE '%supabase.co%'
  );
`;

  run(
    `npx wrangler d1 execute ${DATABASE} ` +
      `--remote --command ` +
      `"${sql
        .replace(/\n/g, " ")
        .replace(/"/g, '\\"')}"`
  );
}

function updateMilestone(
  id,
  title,
  cover,
  gallery
) {
  const sql = `
UPDATE milestones
SET
  cover_image = '${sqlEscape(cover)}',
  gallery = '${sqlEscape(gallery)}',
  updated_at = CURRENT_TIMESTAMP
WHERE id = ${Number(id)}
  AND title = '${sqlEscape(title)}'
  AND (
    cover_image LIKE '%supabase.co%'
    OR gallery LIKE '%supabase.co%'
  );
`;

  run(
    `npx wrangler d1 execute ${DATABASE} ` +
      `--remote --command ` +
      `"${sql
        .replace(/\n/g, " ")
        .replace(/"/g, '\\"')}"`
  );
}

console.log("\n");
console.log("=".repeat(70));
console.log(
  " AZAIN — REPLACE REMAINING SUPABASE MEDIA WITH R2"
);
console.log("=".repeat(70));

console.log(
  "\nSAFETY:"
);

console.log(
  "Only records that CURRENTLY contain supabase.co are eligible."
);

console.log(
  "Records already using R2 will NOT be touched."
);

console.log(
  "Only exact mappings from r2MediaManifest.js will be used."
);

console.log(
  "No R2 objects will be deleted."
);

console.log(
  "No Supabase objects will be deleted."
);

console.log(
  "No other D1 fields will be changed."
);

const manifest = loadManifest();

console.log(
  `\nLoaded ${Object.keys(manifest).length} manifest mappings.`
);

const rows = getD1Rows();

console.log(
  `\nAffected D1 records found: ${rows.length}`
);

const timelineCount =
  rows.filter(
    (row) =>
      row.table_name === "timeline"
  ).length;

const milestoneCount =
  rows.filter(
    (row) =>
      row.table_name === "milestones"
  ).length;

console.log(
  `Timeline records : ${timelineCount}`
);

console.log(
  `Milestone records: ${milestoneCount}`
);

if (
  timelineCount !== 15 ||
  milestoneCount !== 1
) {
  console.error(
    "\n❌ SAFETY STOP"
  );

  console.error(
    "Expected exactly 15 Timeline + 1 Milestone affected records."
  );

  console.error(
    `Found ${timelineCount} Timeline + ${milestoneCount} Milestone.`
  );

  console.error(
    "Nothing has been changed."
  );

  process.exit(1);
}

let updated = 0;
let replacements = 0;
let unmapped = 0;

for (const row of rows) {
  console.log("\n");
  console.log("-".repeat(70));

  console.log(
    `${row.table_name} | ID ${row.id} | ${row.title}`
  );

  const coverResult =
    replaceExactUrls(
      row.cover_image,
      manifest
    );

  const galleryResult =
    replaceGallery(
      row.gallery,
      manifest
    );

  const allUnmapped = [
    ...new Set([
      ...coverResult.unmapped,
      ...galleryResult.unmapped,
    ]),
  ];

  if (allUnmapped.length > 0) {
    console.error(
      "\n❌ NO UPDATE — unmapped Supabase URL found:"
    );

    for (const url of allUnmapped) {
      console.error(`  ${url}`);
    }

    unmapped +=
      allUnmapped.length;

    continue;
  }

  const changed =
    coverResult.value !==
      row.cover_image ||
    galleryResult.value !==
      row.gallery;

  if (!changed) {
    console.log(
      "No replacement required."
    );

    continue;
  }

  const rowReplacements =
    coverResult.replacements +
    galleryResult.replacements;

  console.log(
    `Replacing ${rowReplacements} Supabase URL(s).`
  );

  if (
    row.table_name === "timeline"
  ) {
    updateTimeline(
      row.id,
      row.title,
      coverResult.value,
      galleryResult.value
    );
  } else if (
    row.table_name === "milestones"
  ) {
    updateMilestone(
      row.id,
      row.title,
      coverResult.value,
      galleryResult.value
    );
  }

  updated++;
  replacements +=
    rowReplacements;

  console.log(
    "✅ Updated."
  );
}

console.log("\n");
console.log("=".repeat(70));
console.log(
  " FINAL RESULT"
);
console.log("=".repeat(70));

console.log(
  `Affected records found : ${rows.length}`
);

console.log(
  `Records updated        : ${updated}`
);

console.log(
  `R2 URL replacements     : ${replacements}`
);

console.log(
  `Unmapped URLs           : ${unmapped}`
);

if (unmapped > 0) {
  console.log(
    "\n❌ NOT ALL MEDIA COULD BE MAPPED."
  );

  console.log(
    "Do NOT delete Supabase yet."
  );
} else {
  console.log(
    "\n✅ ALL 16 AFFECTED RECORDS PROCESSED."
  );

  console.log(
    "Only records that contained Supabase URLs were eligible."
  );

  console.log(
    "Existing R2 records were left untouched."
  );
}

console.log("\n");