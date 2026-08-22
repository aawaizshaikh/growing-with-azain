import { execFileSync } from "node:child_process";

const DB_NAME = "azain-db";

console.log("AZAIN — D1 MEDIA REFERENCE CHECK");
console.log("================================");
console.log("");
console.log("READ-ONLY CHECK");
console.log("No database changes will be made.");
console.log("");

const tables = [
  {
    name: "timeline",
    columns: ["cover_image", "gallery_images"],
  },
  {
    name: "milestones",
    columns: ["cover_image", "gallery"],
  },
  {
    name: "favorite_songs",
    columns: ["cover_image", "gallery_images", "video_url"],
  },
  {
    name: "family_memories",
    columns: ["media_url"],
  },
];

function runD1(sql) {
  const output = execFileSync(
    "cmd.exe",
    [
      "/c",
      "npx",
      "wrangler",
      "d1",
      "execute",
      DB_NAME,
      "--remote",
      "--command",
      sql,
      "--json",
    ],
    {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "inherit"],
    }
  );

  return JSON.parse(output);
}

for (const table of tables) {
  const conditions = table.columns
    .map((column) => `${column} LIKE '%supabase.co%'`)
    .join(" OR ");

  console.log(`Checking ${table.name}...`);

  const result = runD1(
    `SELECT * FROM ${table.name} WHERE ${conditions};`
  );

  const rows =
    result?.[0]?.results ||
    result?.results ||
    [];

  console.log(`  ${rows.length} affected row(s)`);

  for (const row of rows) {
    console.log(`  ID: ${row.id}`);
    console.log(`  Title: ${row.title || "(no title)"}`);

    for (const column of table.columns) {
      if (
        typeof row[column] === "string" &&
        row[column].includes("supabase.co")
      ) {
        console.log(`  ${column}: contains Supabase URL`);
      }
    }

    console.log("");
  }
}

console.log("================================");
console.log("CHECK COMPLETE");
console.log("NO DATABASE CHANGES WERE MADE.");