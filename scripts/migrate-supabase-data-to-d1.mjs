import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

/*
===============================================================================
AZAIN — SUPABASE DATABASE → CLOUDFLARE D1 DATA MIGRATION
===============================================================================

IMPORTANT:

This script ONLY READS from Supabase.

It does NOT:
- update Supabase
- delete Supabase data
- modify R2
- modify the application
- modify authentication

It reads the five existing Supabase tables and generates a SQLite/D1
INSERT script.

Tables:

- timeline
- milestones
- favorite_songs
- family_memories
- letters

===============================================================================
*/

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL;

const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  throw new Error(
    "VITE_SUPABASE_URL is missing from .env"
  );
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    "SUPABASE_SERVICE_ROLE_KEY is missing from .env"
  );
}

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

const TABLES = [
  {
    name: "timeline",
    columns: [
      "id",
      "title",
      "slug",
      "description",
      "story",
      "date",
      "age",
      "category",
      "cover_image",
      "gallery_images",
      "highlights",
      "favorite",
      "published",
      "folder_name",
      "created_at",
      "updated_at",
      "book",
      "book_type",
      "memory_type",
    ],
  },

  {
    name: "milestones",
    columns: [
      "id",
      "created_at",
      "title",
      "slug",
      "date",
      "age",
      "category",
      "description",
      "story",
      "cover_image",
      "gallery",
      "highlights",
      "favorite",
      "published",
    ],
  },

  {
    name: "favorite_songs",
    columns: [
      "id",
      "title",
      "artist",
      "month",
      "age",
      "slug",
      "category",
      "cover_image",
      "gallery_images",
      "video_url",
      "story",
      "highlights",
      "display_order",
      "favorite",
      "created_at",
    ],
  },

  {
    name: "family_memories",
    columns: [
      "id",
      "member_key",
      "media_type",
      "media_url",
      "caption",
      "display_order",
      "published",
      "created_at",
      "updated_at",
    ],
  },

  {
    name: "letters",
    columns: [
      "id",
      "slot_key",
      "title",
      "slug",
      "letter_content",
      "date",
      "age",
      "signature",
      "published",
      "display_order",
      "created_at",
      "updated_at",
    ],
  },
];

/*
===============================================================================
SQL HELPERS
===============================================================================
*/

function sqlString(value) {
  if (value === null || value === undefined) {
    return "NULL";
  }

  return `'${String(value).replaceAll("'", "''")}'`;
}

function sqlBoolean(value) {
  if (value === null || value === undefined) {
    return "NULL";
  }

  return value ? "1" : "0";
}

function sqlInteger(value) {
  if (value === null || value === undefined) {
    return "NULL";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "NULL";
  }

  return String(Math.trunc(number));
}

function sqlValue(value, column) {
  /*
  PostgreSQL arrays become JSON text in D1.
  */

  if (
    column === "gallery_images" ||
    column === "gallery" ||
    column === "highlights"
  ) {
    if (value === null || value === undefined) {
      return "NULL";
    }

    return sqlString(
      JSON.stringify(value)
    );
  }

  /*
  PostgreSQL booleans become SQLite integers.
  */

  if (
    column === "favorite" ||
    column === "published"
  ) {
    return sqlBoolean(value);
  }

  /*
  Numeric fields.
  */

  if (
    column === "display_order" ||
    column === "id" &&
    false
  ) {
    return sqlInteger(value);
  }

  return sqlString(value);
}

/*
===============================================================================
FETCH TABLE
===============================================================================
*/

async function fetchTable(
  tableName,
  columns
) {
  console.log(
    `Reading Supabase table: ${tableName}`
  );

  const {
    data,
    error,
  } = await supabase
    .from(tableName)
    .select(columns.join(","));

  if (error) {
    throw new Error(
      `Failed reading ${tableName}: ${error.message}`
    );
  }

  console.log(
    `  ${data.length} rows read`
  );

  return data || [];
}

/*
===============================================================================
GENERATE INSERT STATEMENTS
===============================================================================
*/

function generateTableSql(
  tableName,
  columns,
  rows
) {
  if (!rows.length) {
    return [
      `-- ${tableName}: 0 rows`,
      "",
    ].join("\n");
  }

  const lines = [];

  lines.push(
    `-- ============================================================================`
  );

  lines.push(
    `-- ${tableName}: ${rows.length} rows`
  );

  lines.push(
    `-- ============================================================================`
  );

  lines.push("");

  /*
  Delete is intentionally NOT used.

  The D1 database is currently empty, and we want this script to be safe
  against accidental destruction of existing D1 data.
  */

  for (const row of rows) {
    const values = columns.map(
      (column) =>
        sqlValue(
          row[column],
          column
        )
    );

    lines.push(
      `INSERT OR IGNORE INTO ${tableName} (${columns.join(", ")}) VALUES (${values.join(", ")});`
    );
  }

  lines.push("");

  return lines.join("\n");
}

/*
===============================================================================
MAIN
===============================================================================
*/

async function main() {
  console.log("");
  console.log(
    "============================================================"
  );
  console.log(
    "AZAIN — SUPABASE → D1 DATA EXPORT"
  );
  console.log(
    "============================================================"
  );
  console.log("");

  const allSql = [];

  allSql.push(
    "-- AZAIN D1 DATA IMPORT",
    "-- Generated from the current Supabase database.",
    "--",
    "-- IMPORTANT:",
    "-- This file contains data only.",
    "-- Schema is created by 0001_initial_schema.sql.",
    "",
    "PRAGMA foreign_keys = OFF;",
    ""
  );

  let totalRows = 0;

  for (const table of TABLES) {
    const rows = await fetchTable(
      table.name,
      table.columns
    );

    totalRows += rows.length;

    allSql.push(
      generateTableSql(
        table.name,
        table.columns,
        rows
      )
    );
  }

  allSql.push(
    "PRAGMA foreign_keys = ON;",
    ""
  );

  const outputPath =
    path.resolve(
      "migrations",
      "0002_data_import.sql"
    );

  fs.writeFileSync(
    outputPath,
    allSql.join("\n"),
    "utf8"
  );

  console.log("");
  console.log(
    "============================================================"
  );
  console.log(
    "EXPORT COMPLETE"
  );
  console.log(
    "============================================================"
  );
  console.log("");
  console.log(
    `Total rows exported: ${totalRows}`
  );
  console.log(
    `SQL file: ${outputPath}`
  );
  console.log("");
}

main().catch((error) => {
  console.error("");
  console.error(
    "============================================================"
  );
  console.error(
    "MIGRATION EXPORT FAILED"
  );
  console.error(
    "============================================================"
  );
  console.error("");
  console.error(error);
  console.error("");

  process.exit(1);
});