import { supabase } from "../lib/supabase";

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
| Upload optimized WebP to Supabase
|
| WebP:
|
| Already optimized
|        ↓
| Uploaded unchanged
|
| VIDEO:
|
| Existing video upload behavior remains unchanged for now.
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
|
| Example:
|
| original:
|     baby-first-birthday.jpg
|
| result:
|     1720000000000-a8k2mz91-baby-first-birthday.webp
|
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
|
| URL.createObjectURL() allows us to decode the selected file locally
| in the browser without uploading the original file first.
|
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
|
| This function:
|
| 1. Checks whether the file is a supported JPG/JPEG/PNG image.
| 2. Decodes the image.
| 3. Never enlarges a smaller image.
| 4. Limits the longest dimension to 2400px.
| 5. Preserves transparency.
| 6. Converts the result to WebP.
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
  |
  | IMPORTANT:
  |
  | Smaller images are NEVER enlarged.
  |
  | Example:
  |
  | 6000 × 4000
  |     ↓
  | 2400 × 1600
  |
  | 1200 × 800
  |     ↓
  | 1200 × 800
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
  |
  | Transparent PNGs remain transparent because we do not paint a
  | background onto the canvas.
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
| Upload Single File
|--------------------------------------------------------------------------
|
| THIS IS THE CENTRAL ENTRY POINT.
|
| Existing Admin components do not need to know whether the uploaded
| file is JPG, PNG, WebP or video.
|
| They continue calling uploadFile().
|
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
  | IMAGE
  |--------------------------------------------------------------------------
  |
  | JPG/JPEG/PNG images are automatically converted to WebP.
  |
  | Existing WebP files are kept unchanged.
  |
  | Videos continue through the existing upload path unchanged for now.
  |
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
  |
  | Optimized images already have a generated .webp filename.
  |
  | Existing WebP files retain their original filename.
  |
  | Videos and other non-image files retain their existing extension
  | behavior.
  |
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

  const filePath =
    `${folder}/${filename}`;


  /*
  |--------------------------------------------------------------------------
  | Upload to Supabase
  |--------------------------------------------------------------------------
  |
  | One-year cache is safe because filenames are unique.
  |
  | If an image is replaced later, the new upload receives a new filename,
  | so the browser/CDN will never be forced to serve stale content under
  | the same URL.
  |--------------------------------------------------------------------------
  */

  const {
    error,
  } =
    await supabase.storage
      .from(bucket)
      .upload(
        filePath,
        fileToUpload,
        {
          cacheControl:
            "31536000",

          contentType:
            fileToUpload.type ||
            undefined,

          upsert: true,
        }
      );


  if (error) {
    throw error;
  }


  /*
  |--------------------------------------------------------------------------
  | Return the same kind of public URL the existing application expects
  |--------------------------------------------------------------------------
  */

  const {
    data,
  } =
    supabase.storage
      .from(bucket)
      .getPublicUrl(
        filePath
      );


  return data.publicUrl;
}


/*
|--------------------------------------------------------------------------
| Upload Multiple Files
|--------------------------------------------------------------------------
|
| Existing multi-image Admin flows continue to use this function.
|
| Each individual file goes through uploadFile(), meaning each one gets
| the same global optimization.
|
| Images continue through the existing WebP optimizer.
|
| Videos continue through the existing upload behavior.
|
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
| Existing deletion behavior is preserved.
|
| IMPORTANT:
|
| This function does not automatically delete an original file simply
| because an optimized version exists.
|
| That is intentional.
|
| Existing originals will remain available until any future migration
| has been fully verified.
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


  try {
    const marker =
      `/storage/v1/object/public/${bucket}/`;


    const path =
      publicUrl.split(
        marker
      )[1];


    if (!path) {
      return;
    }


    await supabase.storage
      .from(bucket)
      .remove([
        path,
      ]);

  } catch (err) {
    console.error(
      err
    );
  }
}


/*
|--------------------------------------------------------------------------
| Delete Multiple Files
|--------------------------------------------------------------------------
|
| Existing behavior preserved.
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