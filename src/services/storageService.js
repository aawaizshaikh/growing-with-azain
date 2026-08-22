/*
|--------------------------------------------------------------------------
| GLOBAL IMAGE UPLOAD OPTIMIZATION + R2 THUMBNAILS
|--------------------------------------------------------------------------
|
| This is the CENTRAL media-upload layer for the application.
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
| Upload original optimized WebP to Cloudflare R2
|        ↓
| Generate 320px gallery thumbnail
|        ↓
| Upload thumbnail to R2 /thumbs/
|
| WebP:
|
|        ↓
| Uploaded unchanged as original
|        ↓
| 320px gallery thumbnail generated
|
| VIDEO:
|
|        ↓
| Uploaded unchanged to Cloudflare R2
|
|--------------------------------------------------------------------------
| IMPORTANT
|--------------------------------------------------------------------------
|
| This file does NOT change:
|
| - database structure
| - Admin forms
| - routing
| - page design
| - image placement
| - video behavior
| - video optimization
| - existing R2 folder structure
|
| The URL returned by uploadFile() is ALWAYS the ORIGINAL R2 URL.
|
| The thumbnail is an additional R2 object and is NOT stored in D1.
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
| Original WebP quality
|--------------------------------------------------------------------------
|
| Existing behavior preserved.
|
|--------------------------------------------------------------------------
*/

const WEBP_QUALITY = 0.84;


/*
|--------------------------------------------------------------------------
| Gallery thumbnail settings
|--------------------------------------------------------------------------
|
| The thumbnail is deliberately small because it is used only for:
|
| - Gallery
| - Memory Galaxy
| - Gallery cards
| - Other small image previews
|
| The original image remains untouched and is used for:
|
| - Lightbox
| - Detail view
| - Full-size viewing
|
|--------------------------------------------------------------------------
*/

const THUMBNAIL_MAX_DIMENSION = 320;

const THUMBNAIL_WEBP_QUALITY = 0.78;


/*
|--------------------------------------------------------------------------
| Supported raster image formats
|--------------------------------------------------------------------------
|
| Existing upload behavior:
|
| JPG / JPEG / PNG
|        ↓
| optimized to WebP
|
| WebP:
|        ↓
| uploaded unchanged
|
| SVG is intentionally excluded.
|
|--------------------------------------------------------------------------
*/

const RASTER_IMAGE_TYPES =
  new Set([
    "image/jpeg",
    "image/jpg",
    "image/png",
  ]);


/*
|--------------------------------------------------------------------------
| Supported image types for thumbnails
|--------------------------------------------------------------------------
|
| WebP is included ONLY for thumbnail generation.
|
| This does NOT change the existing original WebP upload behavior.
|
|--------------------------------------------------------------------------
*/

const THUMBNAIL_IMAGE_TYPES =
  new Set([
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
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
| Create thumbnail filename
|--------------------------------------------------------------------------
|
| The thumbnail uses the SAME filename as the original.
|
| Example:
|
| original:
|   123-photo.webp
|
| thumbnail:
|   thumbs/123-photo.webp
|
|--------------------------------------------------------------------------
*/

function createThumbnailFileName(
  originalFileName
) {
  const baseName =
    originalFileName
      ?.split("/")
      .pop() ||
    "image.webp";

  return baseName;
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
  canvas,
  quality = WEBP_QUALITY
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
        quality
      );
    }
  );
}


/*
|--------------------------------------------------------------------------
| Optimize Image
|--------------------------------------------------------------------------
|
| EXISTING ORIGINAL IMAGE PIPELINE.
|
| JPG / JPEG / PNG:
|   → resize if required
|   → WebP
|
| WebP:
|   → untouched
|
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
  | Only JPG/JPEG/PNG images enter the ORIGINAL optimizer.
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
      canvas,
      WEBP_QUALITY
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
| Create Gallery Thumbnail
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| This function NEVER modifies the original uploaded file.
|
| It creates a completely separate 320px WebP object.
|
|--------------------------------------------------------------------------
*/

async function createGalleryThumbnail(
  file
) {
  if (!file) {
    return null;
  }


  /*
  |--------------------------------------------------------------------------
  | Only supported image formats receive thumbnails.
  |--------------------------------------------------------------------------
  |
  | Videos are intentionally skipped.
  |
  |--------------------------------------------------------------------------
  */

  if (
    !THUMBNAIL_IMAGE_TYPES.has(
      file.type
    )
  ) {
    return null;
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


  if (
    !originalWidth ||
    !originalHeight
  ) {
    return null;
  }


  /*
  |--------------------------------------------------------------------------
  | Preserve aspect ratio
  |--------------------------------------------------------------------------
  |
  | The longest side becomes 320px maximum.
  |
  | No cropping.
  | No distortion.
  |
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
      THUMBNAIL_MAX_DIMENSION /
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
  | Create thumbnail canvas
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


  const context =
    canvas.getContext(
      "2d",
      {
        alpha: true,
      }
    );


  if (!context) {
    throw new Error(
      "The browser could not create the gallery thumbnail."
    );
  }


  /*
  |--------------------------------------------------------------------------
  | High-quality thumbnail resizing
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
  | Convert thumbnail to WebP
  |--------------------------------------------------------------------------
  */

  const thumbnailBlob =
    await canvasToWebP(
      canvas,
      THUMBNAIL_WEBP_QUALITY
    );


  /*
  |--------------------------------------------------------------------------
  | Create thumbnail File
  |--------------------------------------------------------------------------
  |
  | Same filename as the original.
  |
  |--------------------------------------------------------------------------
  */

  return new File(
    [
      thumbnailBlob,
    ],
    createThumbnailFileName(
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
| Upload object to R2
|--------------------------------------------------------------------------
|
| Shared internal helper.
|
| This keeps the original upload logic and thumbnail upload logic
| consistent without changing the public API.
|
|--------------------------------------------------------------------------
*/

async function uploadObjectToR2(
  file,
  filePath
) {
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
            file?.type ||
            "application/octet-stream",
        },

        body:
          file,
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


  return buildR2UploadUrl(
    filePath
  );
}


/*
|--------------------------------------------------------------------------
| Verify R2 object
|--------------------------------------------------------------------------
*/

async function verifyR2Object(
  filePath
) {
  const verifyResponse =
    await fetch(
      buildR2UploadUrl(
        filePath
      ),
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
  |
  | EXISTING behavior preserved.
  |
  |--------------------------------------------------------------------------
  */

  const isRasterImage =
    RASTER_IMAGE_TYPES.has(
      file.type
    );


  const isImageForThumbnail =
    THUMBNAIL_IMAGE_TYPES.has(
      file.type
    );


  /*
  |--------------------------------------------------------------------------
  | Optimize original image
  |--------------------------------------------------------------------------
  */

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
  | Upload ORIGINAL to R2
  |--------------------------------------------------------------------------
  */

  const r2Url =
    await uploadObjectToR2(
      fileToUpload,
      filePath
    );


  /*
  |--------------------------------------------------------------------------
  | Verify ORIGINAL upload
  |--------------------------------------------------------------------------
  */

  await verifyR2Object(
    filePath
  );


  /*
  |--------------------------------------------------------------------------
  | Generate + upload GALLERY THUMBNAIL
  |--------------------------------------------------------------------------
  |
  | Only images receive thumbnails.
  |
  | Videos are completely unchanged.
  |
  |--------------------------------------------------------------------------
  */

  if (
    isImageForThumbnail
  ) {
    try {
      const thumbnail =
        await createGalleryThumbnail(
          fileToUpload
        );


      if (thumbnail) {
        const thumbnailPath =
          `${r2Folder}/thumbs/${filename}`;


        await uploadObjectToR2(
          thumbnail,
          thumbnailPath
        );


        await verifyR2Object(
          thumbnailPath
        );
      }
    } catch (thumbnailError) {
      /*
      |--------------------------------------------------------------------------
      | IMPORTANT SAFETY BEHAVIOR
      |--------------------------------------------------------------------------
      |
      | The ORIGINAL upload has already succeeded.
      |
      | Do not delete or invalidate the original because thumbnail creation
      | failed.
      |
      | Log the thumbnail failure so it can be generated later by the
      | dedicated R2 thumbnail-generation script.
      |
      |--------------------------------------------------------------------------
      */

      console.error(
        "R2 gallery thumbnail generation/upload failed:",
        thumbnailError
      );
    }
  }


  /*
  |--------------------------------------------------------------------------
  | Return ORIGINAL R2 public Worker URL
  |--------------------------------------------------------------------------
  |
  | D1 continues storing this URL.
  |
  | The thumbnail URL is NEVER returned.
  |
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
| All application media is stored in Cloudflare R2.
|
| R2 objects are deleted through the Cloudflare Media Worker.
|
| IMAGE:
|
|   original
|      +
|   gallery thumbnail
|
| VIDEO:
|
|   video only
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


      /*
      |--------------------------------------------------------------------------
      | Delete ORIGINAL
      |--------------------------------------------------------------------------
      */

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


      /*
      |--------------------------------------------------------------------------
      | Delete associated gallery thumbnail
      |--------------------------------------------------------------------------
      |
      | Only image originals have thumbnails.
      |
      | Video deletion remains unchanged.
      |
      |--------------------------------------------------------------------------
      */

      const lowerPath =
        filePath.toLowerCase();


      const isImageFile =
        lowerPath.endsWith(
          ".webp"
        ) ||
        lowerPath.endsWith(
          ".jpg"
        ) ||
        lowerPath.endsWith(
          ".jpeg"
        ) ||
        lowerPath.endsWith(
          ".png"
        );


      if (
        isImageFile
      ) {
        const lastSlash =
          filePath.lastIndexOf(
            "/"
          );


        if (
          lastSlash !== -1
        ) {
          const directory =
            filePath.substring(
              0,
              lastSlash
            );

          const fileName =
            filePath.substring(
              lastSlash + 1
            );


          const thumbnailPath =
            `${directory}/thumbs/${fileName}`;


          try {
            const thumbnailDeleteResponse =
              await fetch(
                buildR2UploadUrl(
                  thumbnailPath
                ),
                {
                  method:
                    "DELETE",

                  headers: {
                    Authorization:
                      `Bearer ${MEDIA_API_KEY}`,
                  },
                }
              );


            /*
            |--------------------------------------------------------------------------
            | Missing thumbnail must NOT break deletion.
            |--------------------------------------------------------------------------
            |
            | Older images may not have thumbnails yet.
            |
            | The original has already been successfully deleted.
            |
            |--------------------------------------------------------------------------
            */

            if (
              !thumbnailDeleteResponse.ok &&
              thumbnailDeleteResponse.status !==
                404
            ) {
              console.warn(
                `R2 thumbnail delete returned ${thumbnailDeleteResponse.status}: ${thumbnailPath}`
              );
            }
          } catch (
            thumbnailDeleteError
          ) {
            /*
            |--------------------------------------------------------------------------
            | Thumbnail deletion failure must not reverse successful
            | original deletion.
            |--------------------------------------------------------------------------
            */

            console.warn(
              "R2 thumbnail delete failed:",
              thumbnailDeleteError
            );
          }
        }
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
  | Legacy URLs are intentionally ignored.
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