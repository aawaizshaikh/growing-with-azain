import { createClient } from "@supabase/supabase-js";
import { loadEnvFile } from "node:process";

/*
============================================================
DELETE REMAINING JPEG IMAGES
============================================================

PURPOSE
-------
Delete the remaining JPEG images from the `timeline` bucket.

These JPEG files have already been manually reviewed and
approved for deletion.

They will be re-uploaded through the Admin Panel, where the
global WebP converter will convert them to WebP.

THIS SCRIPT WILL:

    DELETE .jpg files
    DELETE .jpeg files

THIS SCRIPT WILL NOT:

    Delete WebP files
    Delete PNG files
    Delete videos
    Delete database rows
    Delete anything outside the timeline bucket

============================================================
*/


/*
============================================================
LOAD ENVIRONMENT
============================================================
*/

try {
  loadEnvFile(".env");
} catch {
  /*
   * Ignore this if environment variables are already loaded.
   */
}


/*
============================================================
SUPABASE CONFIGURATION
============================================================
*/

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL;

const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const BUCKET = "timeline";


/*
============================================================
VALIDATE CONFIGURATION
============================================================
*/

if (!SUPABASE_URL) {
  console.error(
    "\n❌ Missing SUPABASE_URL or VITE_SUPABASE_URL.\n"
  );

  process.exit(1);
}


if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "\n❌ Missing SUPABASE_SERVICE_ROLE_KEY.\n"
  );

  console.error(
    "Add the service-role key to your .env file."
  );

  process.exit(1);
}


/*
============================================================
SUPABASE CLIENT
============================================================
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


/*
============================================================
HELPER
============================================================
*/

function isJpeg(file) {
  const name =
    String(file?.name || "").toLowerCase();

  return (
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg")
  );
}


/*
============================================================
RECURSIVELY SCAN STORAGE
============================================================

Supabase Storage's normal client API lists one folder level
at a time.

We therefore recursively walk through all folders inside
the timeline bucket.

============================================================
*/

async function scanFolder(prefix = "") {

  const results = [];

  let offset = 0;

  const LIMIT = 1000;


  while (true) {

    const {
      data,
      error,
    } = await supabase
      .storage
      .from(BUCKET)
      .list(
        prefix,
        {
          limit: LIMIT,
          offset,
          sortBy: {
            column: "name",
            order: "asc",
          },
        }
      );


    if (error) {

      throw new Error(
        `Failed to scan "${prefix || "/"}": ${error.message}`
      );

    }


    if (!data || data.length === 0) {
      break;
    }


    for (const item of data) {

      /*
      ------------------------------------------------------
      FOLDER

      Supabase Storage folders normally have no id.
      ------------------------------------------------------
      */

      if (!item.id) {

        const folderName =
          item.name;


        const childPrefix =
          prefix
            ? `${prefix}/${folderName}`
            : folderName;


        const children =
          await scanFolder(
            childPrefix
          );


        results.push(
          ...children
        );


        continue;
      }


      /*
      ------------------------------------------------------
      FILE
      ------------------------------------------------------
      */

      if (isJpeg(item)) {

        const fullPath =
          prefix
            ? `${prefix}/${item.name}`
            : item.name;


        results.push({
          ...item,
          path: fullPath,
        });

      }

    }


    /*
    ------------------------------------------------------
    PAGINATION

    If fewer than LIMIT were returned, this folder has
    no more entries.
    ------------------------------------------------------
    */

    if (data.length < LIMIT) {
      break;
    }


    offset += LIMIT;

  }


  return results;
}


/*
============================================================
DELETE JPEG FILES
============================================================
*/

async function deleteJpegs(files) {

  if (!files.length) {

    console.log(
      "\n✅ No JPEG files remain in the timeline bucket.\n"
    );

    return {
      deleted: 0,
      failed: 0,
    };

  }


  console.log(
    `\nFound ${files.length} JPEG files.\n`
  );


  let totalBytes = 0;


  files.forEach(
    (file, index) => {

      const size =
        Number(
          file.metadata?.size || 0
        );


      totalBytes += size;


      console.log(
        `${String(index + 1).padStart(2, " ")}. ${file.path}`
      );


      console.log(
        `    ${(
          size /
          1024 /
          1024
        ).toFixed(2)} MB`
      );

    }
  );


  console.log(
    "\n------------------------------------------------------------"
  );


  console.log(
    `JPEG files found: ${files.length}`
  );


  console.log(
    `Total JPEG size: ${(
      totalBytes /
      1024 /
      1024
    ).toFixed(2)} MB`
  );


  console.log(
    "------------------------------------------------------------\n"
  );


  /*
  ==========================================================
  DELETE IN BATCHES
  ==========================================================
  */

  const BATCH_SIZE = 100;

  let deleted = 0;
  let failed = 0;


  for (
    let i = 0;
    i < files.length;
    i += BATCH_SIZE
  ) {

    const batch =
      files.slice(
        i,
        i + BATCH_SIZE
      );


    const paths =
      batch.map(
        (file) =>
          file.path
      );


    console.log(
      `Deleting ${paths.length} file(s)...`
    );


    const {
      data,
      error,
    } = await supabase
      .storage
      .from(BUCKET)
      .remove(paths);


    if (error) {

      console.error(
        `❌ Batch failed: ${error.message}`
      );


      failed += paths.length;

      continue;

    }


    const removedCount =
      data?.length || 0;


    deleted += removedCount;


    if (data) {

      data.forEach(
        (file) => {

          console.log(
            `✓ Deleted: ${BUCKET}/${file.name}`
          );

        }
      );

    }

  }


  return {
    deleted,
    failed,
  };
}


/*
============================================================
MAIN
============================================================
*/

async function main() {

  console.log(
    "\n============================================================"
  );

  console.log(
    " SUPABASE JPEG CLEANUP"
  );

  console.log(
    "============================================================\n"
  );


  console.log(
    `Bucket: ${BUCKET}`
  );


  console.log(
    "Searching Storage recursively for .jpg / .jpeg files...\n"
  );


  try {

    const files =
      await scanFolder();


    if (!files.length) {

      console.log(
        "============================================================"
      );

      console.log(
        " NO JPEG FILES FOUND"
      );

      console.log(
        "============================================================\n"
      );

      return;

    }


    const result =
      await deleteJpegs(files);


    /*
    ========================================================
    VERIFY
    ========================================================
    */

    console.log(
      "\n------------------------------------------------------------"
    );

    console.log(
      "Verifying Storage..."
    );


    const remaining =
      await scanFolder();


    console.log(
      "\n============================================================"
    );

    console.log(
      " CLEANUP SUMMARY"
    );

    console.log(
      "============================================================\n"
    );


    console.log(
      `JPEG files found:       ${files.length}`
    );


    console.log(
      `Deleted:                ${result.deleted}`
    );


    console.log(
      `Failed deletions:       ${result.failed}`
    );


    console.log(
      `JPEG files remaining:   ${remaining.length}`
    );


    console.log(
      "\n============================================================"
    );


    if (
      result.failed === 0 &&
      remaining.length === 0
    ) {

      console.log(
        " CLEANUP COMPLETE"
      );


      console.log(
        "============================================================\n"
      );


      console.log(
        "✅ All JPEG files were deleted."
      );


      console.log(
        "✅ WebP files were not touched."
      );


      console.log(
        "✅ PNG files were not touched."
      );


      console.log(
        "✅ Videos were not touched."
      );


      console.log(
        "✅ Database records were not modified."
      );


      console.log("");

    } else {

      console.log(
        "⚠ CLEANUP FINISHED WITH ITEMS TO CHECK"
      );


      console.log(
        "============================================================\n"
      );

    }

  } catch (error) {

    console.error(
      "\n❌ CLEANUP ERROR\n"
    );


    console.error(
      error.message
    );


    console.error("");

    process.exit(1);

  }

}


main();