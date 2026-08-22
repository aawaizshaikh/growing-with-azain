/*
|--------------------------------------------------------------------------
| R2 IMAGE DELIVERY HELPERS
|--------------------------------------------------------------------------
|
| GLOBAL IMAGE DELIVERY SYSTEM
|
| Images are now stored in Cloudflare R2 and delivered through the
| Cloudflare Media Worker.
|
| These helpers intentionally DO NOT perform any Supabase Storage
| transformation.
|
| The stored database URL is already the final media URL:
|
|     Cloudflare R2 Worker
|             ↓
|     appropriately optimized WebP
|             ↓
|     browser
|
| IMPORTANT:
|
| - Existing helper names are preserved for compatibility.
| - Existing component imports do not need to change.
| - No image layout is changed.
| - No image dimensions are changed here.
| - No video URL is modified.
| - No Supabase Storage URL is generated.
|
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| CORE IMAGE DELIVERY
|--------------------------------------------------------------------------
|
| R2 does not use the old Supabase:
|
|     /storage/v1/render/image/public/
|
| transformation endpoint.
|
| Images migrated to R2 are already stored as optimized WebP files.
|
| New JPG/JPEG/PNG uploads are also converted to WebP before upload
| by the global upload service.
|
| Therefore the correct behavior is simply:
|
|     source URL → return unchanged
|
|--------------------------------------------------------------------------
*/

export function getSupabaseImageUrl(
  source,
  {
    width,
    height,
    quality = 75,
    resize = "contain",
  } = {}
) {
  /*
  |--------------------------------------------------------------------------
  | Empty / invalid source
  |--------------------------------------------------------------------------
  */

  if (
    typeof source !== "string" ||
    !source.trim()
  ) {
    return source || "";
  }


  /*
  |--------------------------------------------------------------------------
  | R2 MEDIA URL
  |--------------------------------------------------------------------------
  |
  | The source already points to the Cloudflare Media Worker.
  |
  | Do not modify it.
  |
  |--------------------------------------------------------------------------
  */

  return source.trim();
}


/*
|--------------------------------------------------------------------------
| GALLERY THUMBNAIL
|--------------------------------------------------------------------------
|
| Kept as a separate named helper for compatibility with existing
| Gallery components.
|
| R2 images are already optimized during migration/upload.
|
|--------------------------------------------------------------------------
*/

export function getGalleryThumbnailUrl(source) {
  if (
    typeof source !== "string" ||
    !source.trim()
  ) {
    return source || "";
  }

  const value = source.trim();

  /*
   * Only transform URLs served by our R2 Media Worker.
   * Any other URL is returned unchanged.
   */
  if (!value.includes("/media/")) {
    return value;
  }

  try {
    const url = new URL(value);

    const marker = "/media/";
    const markerIndex =
      url.pathname.indexOf(marker);

    if (markerIndex === -1) {
      return value;
    }

    const key =
      url.pathname.substring(
        markerIndex + marker.length
      );

    if (!key) {
      return value;
    }

    const lastSlash =
      key.lastIndexOf("/");

    const directory =
      lastSlash >= 0
        ? key.substring(0, lastSlash)
        : "";

    const filename =
      lastSlash >= 0
        ? key.substring(lastSlash + 1)
        : key;

    if (!filename) {
      return value;
    }

    /*
     * Example:
     *
     * /media/memories/birthday/gallery/photo.webp
     *
     * becomes:
     *
     * /media/memories/birthday/gallery/thumbs/photo.webp
     */
    const thumbnailKey =
      directory
        ? `${directory}/thumbs/${filename}`
        : `thumbs/${filename}`;

    url.pathname =
      `${marker}${thumbnailKey}`;

    return url.toString();
  } catch {
    return value;
  }
}

/*
|--------------------------------------------------------------------------
| GALLERY IMAGE
|--------------------------------------------------------------------------
|
| Kept as a separate named helper for compatibility with existing
| components that already use getGalleryImageUrl().
|
|--------------------------------------------------------------------------
*/

export function getGalleryImageUrl(
  source
) {
  return getGalleryThumbnailUrl(
    source
  );
}


/*
|--------------------------------------------------------------------------
| STANDARD CARD IMAGE
|--------------------------------------------------------------------------
|
| General-purpose image delivery for cards and previews.
|
| The sizing arguments are intentionally retained for API compatibility,
| but R2 currently receives the already-optimized stored image directly.
|
|--------------------------------------------------------------------------
*/

export function getCardImageUrl(
  source
) {
  return getSupabaseImageUrl(
    source,
    {
      width: 600,
      quality: 75,
      resize: "contain",
    }
  );
}


/*
|--------------------------------------------------------------------------
| SMALL IMAGE
|--------------------------------------------------------------------------
|
| Suitable for:
|
| - avatars
| - compact tiles
| - small previews
| - member cards
| - other small image surfaces
|
|--------------------------------------------------------------------------
*/

export function getSmallImageUrl(
  source
) {
  return getSupabaseImageUrl(
    source,
    {
      width: 400,
      height: 400,
      quality: 72,
      resize: "cover",
    }
  );
}


/*
|--------------------------------------------------------------------------
| MEMORY GALAXY
|--------------------------------------------------------------------------
|
| Existing Galaxy behavior remains visually controlled by the component.
|
| The helper no longer performs Supabase Image Transformation because
| R2 does not use that endpoint.
|
|--------------------------------------------------------------------------
*/

export function getGalaxyImageUrl(
  source
) {
  return getSupabaseImageUrl(
    source,
    {
      width: 240,
      height: 240,
      quality: 70,
      resize: "cover",
    }
  );
}


/*
|--------------------------------------------------------------------------
| DETAIL / LARGE IMAGE
|--------------------------------------------------------------------------
|
| Used where a larger image is required, such as:
|
| - memory detail
| - lightbox
| - larger preview
|
| The stored R2 image is returned directly.
|
|--------------------------------------------------------------------------
*/

export function getDetailImageUrl(
  source
) {
  return getSupabaseImageUrl(
    source,
    {
      width: 1800,
      quality: 82,
      resize: "contain",
    }
  );
}


/*
|--------------------------------------------------------------------------
| GENERIC THUMBNAIL HELPER
|--------------------------------------------------------------------------
|
| Kept for compatibility with existing and future components.
|
| R2 currently serves the already-optimized stored image directly.
|
|--------------------------------------------------------------------------
*/

export function getThumbnailImageUrl(
  source,
  {
    width = 600,
    height,
    quality = 75,
    resize = "contain",
  } = {}
) {
  return getSupabaseImageUrl(
    source,
    {
      width,
      height,
      quality,
      resize,
    }
  );
}