/*
|--------------------------------------------------------------------------
| GLOBAL IMAGE UPLOAD OPTIMIZATION
|--------------------------------------------------------------------------
|
| This is the CENTRAL image-upload layer for the application.
|
| Every Admin image upload that reaches uploadFile() is processed here.
|
| IMAGE:
|
| JPG / JPEG / PNG
|        ↓
| Decode in browser
|        ↓
| Resize if larger than 2400px
|        ↓
| Convert to WebP
|        ↓
| Upload optimized WebP to Cloudflare R2
|
| WebP:
|        ↓
| Uploaded unchanged
|
| VIDEO:
|        ↓
| Uploaded unchanged to Cloudflare R2.
|
| IMPORTANT:
|
| This file does NOT change:
|
| - database structure
| - Admin forms
| - routing
| - page design
| - image placement
| - video behavior
|
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| R2 CONFIGURATION
|--------------------------------------------------------------------------
*/

const MEDIA_WORKER_URL =
  import.meta.env.VITE_MEDIA_WORKER_URL ||
  "";

const MEDIA_API_KEY =
  import.meta.env.VITE_MEDIA_API_KEY ||
  "";


/*
|--------------------------------------------------------------------------
| IMAGE SETTINGS
|--------------------------------------------------------------------------
*/

const MAX_IMAGE_DIMENSION = 2400;


/*
|--------------------------------------------------------------------------
| WebP quality.
|
| 0.84 provides a strong balance between:
|
| - visual quality
| - file size
| - photographic detail
|
|--------------------------------------------------------------------------
*/

const WEBP_QUALITY = 0.84;


/*
|--------------------------------------------------------------------------
| Supported raster image formats
|--------------------------------------------------------------------------
|
| SVG is intentionally excluded.
|
| SVG → WebP would rasterize the vector artwork and could change the
| appearance/behavior of existing illustrations.
|
| IMPORTANT:
|
| WebP is intentionally NOT included here.
|
| Existing WebP files are already optimized and should be uploaded
| unchanged rather than being decoded and re-encoded again.
|
|--------------------------------------------------------------------------
*/

const RASTER_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
]);


/*
|--------------------------------------------------------------------------
| Create a safe unique WebP filename
|--------------------------------------------------------------------------
*/

function createOptimizedFileName(
  originalName
) {
  const baseName =
    originalName
      ?.split("/")
      .pop()
      ?.replace(
        /\.[^/.]+$/,
        ""
      )
      ?.replace(
        /[^a-zA-Z0-9-_]+/g,
        "-"
      )
      ?.replace(
        /^-+|-+$/g,
        ""
      ) ||
    "image";

  return `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 10)}-${baseName}.webp`;
}


/*
|--------------------------------------------------------------------------
| Load an image safely
|--------------------------------------------------------------------------
*/

function loadImageFromFile(
  file
) {
  return new Promise(
    (resolve, reject) => {
      const objectUrl =
        URL.createObjectURL(
          file
        );

      const image =
        new Image();

      image.onload = () => {
        URL.revokeObjectURL(
          objectUrl
        );

        resolve(image);
      };

      image.onerror = () => {
        URL.revokeObjectURL(
          objectUrl
        );

        reject(
          new Error(
            `Unable to read image: ${file.name}`
          )
        );
      };

      image.src =
        objectUrl;
    }
  );
}


/*
|--------------------------------------------------------------------------
| Convert Canvas → WebP
|--------------------------------------------------------------------------
*/

function canvasToWebP(
  canvas
) {
  return new Promise(
    (resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(
              new Error(
                "The browser could not create a WebP image."
              )
            );

            return;
          }

          resolve(blob);
        },
        "image/webp",
        WEBP_QUALITY
      );
    }
  );
}


/*
|--------------------------------------------------------------------------
| Optimize Image
|--------------------------------------------------------------------------
*/

async function optimizeImage(
  file
) {
  if (!file) {
    return null;
  }


  /*
  |--------------------------------------------------------------------------
  | Only JPG/JPEG/PNG images enter the optimizer.
  |--------------------------------------------------------------------------
  */

  if (
    !RASTER_IMAGE_TYPES.has(
      file.type
    )
  ) {
    return file;
  }


  /*
  |--------------------------------------------------------------------------
  | Decode image
  |--------------------------------------------------------------------------
  */

  const image =
    await loadImageFromFile(
      file
    );


  const originalWidth =
    image.naturalWidth ||
    image.width;

  const originalHeight =
    image.naturalHeight ||
    image.height;


  /*
  |--------------------------------------------------------------------------
  | Safety fallback
  |--------------------------------------------------------------------------
  */

  if (
    !originalWidth ||
    !originalHeight
  ) {
    return file;
  }


  /*
  |--------------------------------------------------------------------------
  | Calculate resize ratio
  |--------------------------------------------------------------------------
  */

  const longestSide =
    Math.max(
      originalWidth,
      originalHeight
    );

  const scale =
    Math.min(
      1,
      MAX_IMAGE_DIMENSION /
        longestSide
    );


  const width =
    Math.max(
      1,
      Math.round(
        originalWidth *
          scale
      )
    );


  const height =
    Math.max(
      1,
      Math.round(
        originalHeight *
          scale
      )
    );


  /*
  |--------------------------------------------------------------------------
  | Create canvas
  |--------------------------------------------------------------------------
  */

  const canvas =
    document.createElement(
      "canvas"
    );

  canvas.width =
    width;

  canvas.height =
    height;


  /*
  |--------------------------------------------------------------------------
  | Get 2D context
  |--------------------------------------------------------------------------
  */

  const context =
    canvas.getContext(
      "2d",
      {
        alpha: true,
      }
    );


  if (!context) {
    throw new Error(
      "The browser could not create an image processing canvas."
    );
  }


  /*
  |--------------------------------------------------------------------------
  | High-quality resizing
  |--------------------------------------------------------------------------
  */

  context.imageSmoothingEnabled =
    true;

  context.imageSmoothingQuality =
    "high";


  /*
  |--------------------------------------------------------------------------
  | Draw image
  |--------------------------------------------------------------------------
  */

  context.drawImage(
    image,
    0,
    0,
    width,
    height
  );


  /*
  |--------------------------------------------------------------------------
  | Convert to WebP
  |--------------------------------------------------------------------------
  */

  const webpBlob =
    await canvasToWebP(
      canvas
    );


  /*
  |--------------------------------------------------------------------------
  | Return optimized File
  |--------------------------------------------------------------------------
  */

  return new File(
    [
      webpBlob,
    ],
    createOptimizedFileName(
      file.name
    ),
    {
      type: "image/webp",
      lastModified:
        Date.now(),
    }
  );
}


/*
|--------------------------------------------------------------------------
| Build R2 upload URL
|--------------------------------------------------------------------------
*/

function buildR2UploadUrl(
  filePath
) {
  if (!MEDIA_WORKER_URL) {
    throw new Error(
      "VITE_MEDIA_WORKER_URL is not configured."
    );
  }

  return `${MEDIA_WORKER_URL.replace(
    /\/+$/,
    ""
  )}/media/${filePath}`;
}


/*
|--------------------------------------------------------------------------
| Upload Single File
|--------------------------------------------------------------------------
*/

export async function uploadFile(
  file,
  folder,
  bucket = "timeline"
) {
  if (!file) {
    return null;
  }


  /*
  |--------------------------------------------------------------------------
  | R2 authentication configuration
  |--------------------------------------------------------------------------
  */

  if (!MEDIA_API_KEY) {
    throw new Error(
      "VITE_MEDIA_API_KEY is not configured."
    );
  }


  /*
  |--------------------------------------------------------------------------
  | IMAGE
  |--------------------------------------------------------------------------
  */

  const isRasterImage =
    RASTER_IMAGE_TYPES.has(
      file.type
    );


  const fileToUpload =
    isRasterImage
      ? await optimizeImage(
          file
        )
      : file;


  /*
  |--------------------------------------------------------------------------
  | Filename
  |--------------------------------------------------------------------------
  */

  let filename;


  if (
    fileToUpload.type ===
    "image/webp"
  ) {
    filename =
      fileToUpload.name;
  } else {
    const extension =
      fileToUpload.name
        ?.split(".")
        .pop()
        ?.toLowerCase() ||
      "bin";

    filename =
      `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 10)}.${extension}`;
  }


  /*
  |--------------------------------------------------------------------------
  | Existing folder structure is preserved
  |--------------------------------------------------------------------------
  */

  let r2Folder;


  if (
    bucket ===
    "timeline"
  ) {
    r2Folder =
      `media/memories/${folder}`;
  } else if (
    bucket ===
    "milestones"
  ) {
    r2Folder =
      `media/milestones/${folder}`;
  } else if (
    bucket ===
    "favorite_songs"
  ) {
    r2Folder =
      `media/songs/${folder}`;
  } else if (
    bucket ===
    "family_memories"
  ) {
    r2Folder =
      `media/family/${folder}`;
  } else {
    r2Folder =
      `media/${bucket}/${folder}`;
  }


  const filePath =
    `${r2Folder}/${filename}`;


  /*
  |--------------------------------------------------------------------------
  | Upload to Cloudflare R2 through Worker
  |--------------------------------------------------------------------------
  */

  const response =
    await fetch(
      buildR2UploadUrl(
        filePath
      ),
      {
        method:
          "PUT",

        headers: {
          Authorization:
            `Bearer ${MEDIA_API_KEY}`,

          "Content-Type":
            fileToUpload.type ||
            "application/octet-stream",
        },

        body:
          fileToUpload,
      }
    );


  if (!response.ok) {
    let errorMessage =
      `R2 upload failed (${response.status})`;

    try {
      const errorBody =
        await response.text();

      if (errorBody) {
        errorMessage +=
          `: ${errorBody}`;
      }
    } catch {
      // Keep the original error message.
    }

    throw new Error(
      errorMessage
    );
  }


  /*
  |--------------------------------------------------------------------------
  | Verify successful upload
  |--------------------------------------------------------------------------
  */

  const r2Url =
    buildR2UploadUrl(
      filePath
    );

  const verifyResponse =
    await fetch(
      r2Url,
      {
        method:
          "HEAD",
      }
    );


  if (!verifyResponse.ok) {
    throw new Error(
      `R2 upload verification failed (${verifyResponse.status})`
    );
  }


  /*
  |--------------------------------------------------------------------------
  | Return R2 public Worker URL
  |--------------------------------------------------------------------------
  */

  return r2Url;
}


/*
|--------------------------------------------------------------------------
| Upload Multiple Files
|--------------------------------------------------------------------------
*/

export async function uploadMultiple(
  files,
  folder,
  bucket = "timeline"
) {
  if (
    !files ||
    files.length === 0
  ) {
    return [];
  }


  const uploaded = [];


  for (
    const file of files
  ) {
    const url =
      await uploadFile(
        file,
        `${folder}/gallery`,
        bucket
      );

    uploaded.push(
      url
    );
  }


  return uploaded;
}


/*
|--------------------------------------------------------------------------
| Delete File
|--------------------------------------------------------------------------
|
| All application media is now stored in Cloudflare R2.
|
| R2 objects are deleted through the Cloudflare Media Worker.
|
|--------------------------------------------------------------------------
*/

export async function deleteFile(
  publicUrl,
  bucket = "timeline"
) {
  if (!publicUrl) {
    return;
  }


  /*
  |--------------------------------------------------------------------------
  | R2 URL
  |--------------------------------------------------------------------------
  |
  | Expected format:
  |
  | https://azain-media-worker...workers.dev/media/<r2-key>
  |
  |--------------------------------------------------------------------------
  */

  if (
    publicUrl.includes(
      "/media/"
    )
  ) {
    if (!MEDIA_API_KEY) {
      throw new Error(
        "VITE_MEDIA_API_KEY is not configured."
      );
    }

    try {
      const url =
        new URL(
          publicUrl
        );

      const mediaMarker =
        "/media/";

      const markerIndex =
        url.pathname.indexOf(
          mediaMarker
        );

      if (
        markerIndex === -1
      ) {
        return;
      }

      const filePath =
        url.pathname
          .substring(
            markerIndex +
              mediaMarker.length
          )
          .split("/")
          .map(
            (segment) =>
              encodeURIComponent(
                decodeURIComponent(
                  segment
                )
              )
          )
          .join("/");

      if (!filePath) {
        return;
      }

      const deleteUrl =
        buildR2UploadUrl(
          filePath
        );

      const response =
        await fetch(
          deleteUrl,
          {
            method:
              "DELETE",

            headers: {
              Authorization:
                `Bearer ${MEDIA_API_KEY}`,
            },
          }
        );

      if (!response.ok) {
        let errorMessage =
          `R2 delete failed (${response.status})`;

        try {
          const errorBody =
            await response.text();

          if (errorBody) {
            errorMessage +=
              `: ${errorBody}`;
          }
        } catch {
          // Keep the original error message.
        }

        throw new Error(
          errorMessage
        );
      }

    } catch (err) {
      console.error(
        "R2 delete failed:",
        err
      );
      throw err;
    }

    return;
  }


  /*
  |--------------------------------------------------------------------------
  | Unknown / legacy URL
  |--------------------------------------------------------------------------
  |
  | No Supabase Storage deletion is performed here.
  |
  | The remaining 31 missing migration files are being handled separately.
  |
  |--------------------------------------------------------------------------
  */
}


/*
|--------------------------------------------------------------------------
| Delete Multiple Files
|--------------------------------------------------------------------------
*/

export async function deleteMultiple(
  urls,
  bucket = "timeline"
) {
  if (
    !urls?.length
  ) {
    return;
  }


  for (
    const url of urls
  ) {
    await deleteFile(
      url,
      bucket
    );
  }
}