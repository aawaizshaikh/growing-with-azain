import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const ROOT = process.cwd();

const API_WORKER_URL =
  "https://azain-api-worker.aaawaizshaikh.workers.dev";

const MEDIA_WORKER_URL =
  "https://azain-media-worker.aaawaizshaikh.workers.dev";

const D1_DATABASE = "azain-db";

const results = [];

function pass(name, details = "") {
  results.push({
    name,
    status: "PASS",
    details,
  });
}

function fail(name, details = "") {
  results.push({
    name,
    status: "FAIL",
    details,
  });
}

function warn(name, details = "") {
  results.push({
    name,
    status: "WARN",
    details,
  });
}

function section(title) {
  console.log("\n");
  console.log("=".repeat(70));
  console.log(` ${title}`);
  console.log("=".repeat(70));
}

function run(command) {
  try {
    return execSync(command, {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  } catch (error) {
    return "";
  }
}

function fileExists(relativePath) {
  return fs.existsSync(
    path.join(ROOT, relativePath)
  );
}

/* ============================================================
   1. PROJECT STRUCTURE
============================================================ */

section("PROJECT STRUCTURE");

const requiredFiles = [
  "package.json",
  "wrangler.jsonc",
  "workers/api/wrangler.jsonc",
  "workers/api/src/index.js",
  "workers/media/wrangler.jsonc",
  "workers/media/src/index.js",
  "src/services/storageService.js",
  "src/services/timelineService.js",
  "src/services/milestoneService.js",
  "src/services/favoriteSongService.js",
  "src/services/familyMemoryService.js",
  "src/services/letterService.js",
];

for (const file of requiredFiles) {
  if (fileExists(file)) {
    pass(`File exists: ${file}`);
  } else {
    fail(`Missing file: ${file}`);
  }
}

/* ============================================================
   2. SUPABASE ACTIVE SOURCE REFERENCES
============================================================ */

section("ACTIVE SUPABASE SOURCE CHECK");

const sourceSearch = run(
  'git grep -ni -E "createClient|supabase\\.from|supabase\\.storage|supabase\\.auth|supabase\\.rpc|supabase\\.functions|supabase\\.co|VITE_SUPABASE" -- src workers'
);

if (!sourceSearch) {
  pass(
    "No active Supabase API references found in src/ or workers/"
  );
} else {
  console.log("\nFound source references:\n");
  console.log(sourceSearch);

  fail(
    "Active Supabase references found",
    "Review the lines printed above."
  );
}

/* ============================================================
   3. LEGACY SUPABASE URL REFERENCES
============================================================ */

section("LEGACY SUPABASE URL REFERENCE CHECK");

const legacySearch = run(
  'git grep -ni "supabase.co" -- src workers'
);

if (!legacySearch) {
  pass(
    "No supabase.co references found in src/ or workers/"
  );
} else {
  console.log("\nLegacy references found:\n");
  console.log(legacySearch);

  warn(
    "supabase.co text still exists in source",
    "These may be comments/helper filenames rather than active network calls."
  );
}

/* ============================================================
   4. D1 SCHEMA CHECK
============================================================ */

section("D1 SCHEMA CHECK");

const schemaCommand =
  `npx wrangler d1 execute ${D1_DATABASE} --remote --command ` +
  `"SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"`;

const schemaOutput = run(schemaCommand);

if (!schemaOutput) {
  fail(
    "Unable to query remote D1",
    "Check Wrangler authentication and D1 configuration."
  );
} else {
  const expectedTables = [
    "timeline",
    "milestones",
    "favorite_songs",
    "family_memories",
    "letters",
  ];

  for (const table of expectedTables) {
    if (schemaOutput.includes(table)) {
      pass(`D1 table exists: ${table}`);
    } else {
      fail(`D1 table missing: ${table}`);
    }
  }
}

/* ============================================================
   5. D1 RECORD COUNTS
============================================================ */

section("D1 RECORD COUNTS");

const countCommand =
  `npx wrangler d1 execute ${D1_DATABASE} --remote --command ` +
  `"SELECT ` +
  `(SELECT COUNT(*) FROM timeline) AS timeline_count, ` +
  `(SELECT COUNT(*) FROM milestones) AS milestone_count, ` +
  `(SELECT COUNT(*) FROM favorite_songs) AS favorite_song_count, ` +
  `(SELECT COUNT(*) FROM family_memories) AS family_memory_count, ` +
  `(SELECT COUNT(*) FROM letters) AS letter_count;"`;

const countOutput = run(countCommand);

if (countOutput) {
  console.log(countOutput);
  pass("D1 record count query succeeded");
} else {
  fail("D1 record count query failed");
}

/* ============================================================
   6. D1 SUPABASE MEDIA URL CHECK
============================================================ */

section("D1 SUPABASE MEDIA URL CHECK");

const mediaUrlCommand =
  `npx wrangler d1 execute ${D1_DATABASE} --remote --command ` +
  `"SELECT ` +
  `'timeline' AS table_name, ` +
  `COUNT(*) AS supabase_urls ` +
  `FROM timeline ` +
  `WHERE cover_image LIKE '%supabase.co%' ` +
  `OR gallery_images LIKE '%supabase.co%' ` +
  `UNION ALL ` +
  `SELECT ` +
  `'milestones' AS table_name, ` +
  `COUNT(*) AS supabase_urls ` +
  `FROM milestones ` +
  `WHERE cover_image LIKE '%supabase.co%' ` +
  `OR gallery LIKE '%supabase.co%' ` +
  `UNION ALL ` +
  `SELECT ` +
  `'favorite_songs' AS table_name, ` +
  `COUNT(*) AS supabase_urls ` +
  `FROM favorite_songs ` +
  `WHERE cover_image LIKE '%supabase.co%' ` +
  `OR gallery_images LIKE '%supabase.co%' ` +
  `OR video_url LIKE '%supabase.co%' ` +
  `UNION ALL ` +
  `SELECT ` +
  `'family_memories' AS table_name, ` +
  `COUNT(*) AS supabase_urls ` +
  `FROM family_memories ` +
  `WHERE media_url LIKE '%supabase.co%';"`;

const mediaUrlOutput = run(mediaUrlCommand);

if (!mediaUrlOutput) {
  fail(
    "D1 Supabase media URL check failed"
  );
} else {
  console.log(mediaUrlOutput);

  const numericMatches =
    mediaUrlOutput.match(/\|\s*(\d+)\s*\|/g) || [];

  const counts = numericMatches.map((value) =>
    Number(value.replace(/[^\d]/g, ""))
  );

  const totalSupabaseUrls =
    counts.reduce(
      (total, value) => total + value,
      0
    );

  if (totalSupabaseUrls === 0) {
    pass(
      "No Supabase Storage URLs found in D1 media fields"
    );
  } else {
    fail(
      "Supabase Storage URLs remain in D1",
      `Found ${totalSupabaseUrls} affected records/fields.`
    );
  }
}

/* ============================================================
   7. D1 R2 MEDIA URL CHECK
============================================================ */

section("D1 R2 MEDIA URL CHECK");

const r2UrlCommand =
  `npx wrangler d1 execute ${D1_DATABASE} --remote --command ` +
  `"SELECT ` +
  `'timeline' AS table_name, ` +
  `COUNT(*) AS r2_urls ` +
  `FROM timeline ` +
  `WHERE cover_image LIKE '%workers.dev%' ` +
  `OR gallery_images LIKE '%workers.dev%' ` +
  `UNION ALL ` +
  `SELECT ` +
  `'milestones' AS table_name, ` +
  `COUNT(*) AS r2_urls ` +
  `FROM milestones ` +
  `WHERE cover_image LIKE '%workers.dev%' ` +
  `OR gallery LIKE '%workers.dev%' ` +
  `UNION ALL ` +
  `SELECT ` +
  `'favorite_songs' AS table_name, ` +
  `COUNT(*) AS r2_urls ` +
  `FROM favorite_songs ` +
  `WHERE cover_image LIKE '%workers.dev%' ` +
  `OR gallery_images LIKE '%workers.dev%' ` +
  `OR video_url LIKE '%workers.dev%' ` +
  `UNION ALL ` +
  `SELECT ` +
  `'family_memories' AS table_name, ` +
  `COUNT(*) AS r2_urls ` +
  `FROM family_memories ` +
  `WHERE media_url LIKE '%workers.dev%';"`;

const r2UrlOutput = run(r2UrlCommand);

if (r2UrlOutput) {
  console.log(r2UrlOutput);
  pass("D1 R2 media URL query succeeded");
} else {
  fail("D1 R2 media URL query failed");
}

/* ============================================================
   8. API WORKER CHECK
============================================================ */

section("D1 API WORKER CHECK");

try {
  const response = await fetch(API_WORKER_URL);

  if (response.ok) {
    pass(
      "D1 API Worker is reachable",
      `${response.status} ${response.statusText}`
    );
  } else {
    warn(
      "D1 API Worker responded",
      `${response.status} ${response.statusText}`
    );
  }
} catch (error) {
  fail(
    "D1 API Worker unreachable",
    error.message
  );
}

/* ============================================================
   9. MEDIA WORKER CHECK
============================================================ */

section("R2 MEDIA WORKER CHECK");

try {
  const response = await fetch(
    MEDIA_WORKER_URL
  );

  if (response.ok || response.status === 404) {
    pass(
      "R2 Media Worker is reachable",
      `${response.status} ${response.statusText}`
    );
  } else {
    warn(
      "R2 Media Worker responded",
      `${response.status} ${response.statusText}`
    );
  }
} catch (error) {
  fail(
    "R2 Media Worker unreachable",
    error.message
  );
}

/* ============================================================
   10. WORKER CONFIGURATION
============================================================ */

section("WORKER CONFIGURATION");

const apiWranglerPath = path.join(
  ROOT,
  "workers/api/wrangler.jsonc"
);

const mediaWranglerPath = path.join(
  ROOT,
  "workers/media/wrangler.jsonc"
);

if (fs.existsSync(apiWranglerPath)) {
  const apiConfig = fs.readFileSync(
    apiWranglerPath,
    "utf8"
  );

  if (
    apiConfig.includes('"DB"') &&
    apiConfig.includes("azain-db")
  ) {
    pass(
      "API Worker has D1 binding azain-db"
    );
  } else {
    fail(
      "API Worker D1 binding could not be verified"
    );
  }
}

if (fs.existsSync(mediaWranglerPath)) {
  const mediaConfig = fs.readFileSync(
    mediaWranglerPath,
    "utf8"
  );

  if (
    mediaConfig.includes('"MEDIA"') &&
    mediaConfig.includes("azain-media")
  ) {
    pass(
      "Media Worker has R2 binding azain-media"
    );
  } else {
    fail(
      "Media Worker R2 binding could not be verified"
    );
  }
}

/* ============================================================
   11. FINAL REPORT
============================================================ */

section("FINAL AZAIN MIGRATION AUDIT");

let passCount = 0;
let failCount = 0;
let warnCount = 0;

for (const result of results) {
  const icon =
    result.status === "PASS"
      ? "✅"
      : result.status === "FAIL"
      ? "❌"
      : "⚠️";

  console.log(
    `${icon} ${result.name}`
  );

  if (result.details) {
    console.log(
      `   ${result.details}`
    );
  }

  if (result.status === "PASS") {
    passCount++;
  }

  if (result.status === "FAIL") {
    failCount++;
  }

  if (result.status === "WARN") {
    warnCount++;
  }
}

console.log("\n");
console.log("=".repeat(70));
console.log(" SUMMARY");
console.log("=".repeat(70));

console.log(`PASS : ${passCount}`);
console.log(`WARN : ${warnCount}`);
console.log(`FAIL : ${failCount}`);

console.log("\n");

if (failCount === 0 && warnCount === 0) {
  console.log(
    "✅ ALL AUTOMATED CHECKS PASSED."
  );
  console.log(
    "Supabase deletion can be considered after the remaining manual media/auth tests."
  );
} else if (failCount === 0) {
  console.log(
    "⚠️ AUTOMATED CHECKS COMPLETED WITH WARNINGS."
  );
  console.log(
    "Review warnings before deleting Supabase."
  );
} else {
  console.log(
    "❌ MIGRATION IS NOT YET CLEARED."
  );
  console.log(
    "Do NOT delete the Supabase project."
  );
}

console.log("\n");