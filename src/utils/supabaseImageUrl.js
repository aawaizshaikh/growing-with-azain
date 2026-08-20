/*
|--------------------------------------------------------------------------
| SUPABASE IMAGE DELIVERY HELPERS
|--------------------------------------------------------------------------
|
| GLOBAL IMAGE DELIVERY SYSTEM
|
| These helpers control HOW images are delivered from Supabase Storage.
|
| They DO NOT:
|
| - modify the stored original
| - rename the stored original
| - delete the stored original
| - change the database
| - change page layout
| - change image placement
| - change React behavior
|
| They only generate an optimized Supabase Image Transformation URL.
|
|--------------------------------------------------------------------------
|
| GLOBAL FLOW
|
| Stored image
|      ↓
| getSupabaseImageUrl()
|      ↓
| Supabase Image Transformation
|      ↓
| appropriately sized image
|      ↓
| browser
|
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| CORE IMAGE TRANSFORMATION
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


  const trimmedSource =
    source.trim();


  /*
  |--------------------------------------------------------------------------
  | Only transform public Supabase Storage object URLs.
  |--------------------------------------------------------------------------
  |
  | Local/static images:
  |     unchanged
  |
  | External images:
  |     unchanged
  |
  | Videos:
  |     unchanged
  |
  | Supabase images:
  |     transformed
  |
  |--------------------------------------------------------------------------
  */

  if (
    !trimmedSource.includes(
      "/storage/v1/object/public/"
    )
  ) {
    return trimmedSource;
  }


  /*
  |--------------------------------------------------------------------------
  | Protect videos
  |--------------------------------------------------------------------------
  |
  | This global system is IMAGE ONLY.
  |
  | A video URL must never accidentally be sent through:
  |
  | /render/image/public/
  |
  |--------------------------------------------------------------------------
  */

  const lowerSource =
    trimmedSource.toLowerCase();


  if (
    lowerSource.endsWith(
      ".mp4"
    ) ||
    lowerSource.endsWith(
      ".mov"
    ) ||
    lowerSource.endsWith(
      ".m4v"
    ) ||
    lowerSource.endsWith(
      ".webm"
    ) ||
    lowerSource.endsWith(
      ".avi"
    ) ||
    lowerSource.endsWith(
      ".mkv"
    )
  ) {
    return trimmedSource;
  }


  /*
  |--------------------------------------------------------------------------
  | Build transformed URL
  |--------------------------------------------------------------------------
  */

  try {
    const url =
      new URL(
        trimmedSource
      );


    /*
    |--------------------------------------------------------------------------
    | Convert:
    |
    | /storage/v1/object/public/
    |
    | into:
    |
    | /storage/v1/render/image/public/
    |--------------------------------------------------------------------------
    */

    url.pathname =
      url.pathname.replace(
        "/storage/v1/object/public/",
        "/storage/v1/render/image/public/"
      );


    /*
    |--------------------------------------------------------------------------
    | WIDTH
    |--------------------------------------------------------------------------
    */

    if (width) {
      url.searchParams.set(
        "width",
        String(width)
      );
    }


    /*
    |--------------------------------------------------------------------------
    | HEIGHT
    |--------------------------------------------------------------------------
    */

    if (height) {
      url.searchParams.set(
        "height",
        String(height)
      );
    }


    /*
    |--------------------------------------------------------------------------
    | RESIZE MODE
    |--------------------------------------------------------------------------
    */

    if (resize) {
      url.searchParams.set(
        "resize",
        resize
      );
    }


    /*
    |--------------------------------------------------------------------------
    | QUALITY
    |--------------------------------------------------------------------------
    */

    if (quality) {
      url.searchParams.set(
        "quality",
        String(quality)
      );
    }


    return url.toString();

  } catch {
    /*
    |--------------------------------------------------------------------------
    | Fail-safe behavior
    |--------------------------------------------------------------------------
    |
    | If an unusual URL cannot be parsed, return the original URL rather
    | than breaking the page.
    |--------------------------------------------------------------------------
    */

    return trimmedSource;
  }
}


/*
|--------------------------------------------------------------------------
| GALLERY THUMBNAIL
|--------------------------------------------------------------------------
|
| Primary thumbnail helper for Gallery-style displays.
|
| Existing Gallery components that already use:
|
|     getGalleryThumbnailUrl()
|
| continue working.
|
|--------------------------------------------------------------------------
*/

export function getGalleryThumbnailUrl(
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
| GALLERY IMAGE
|--------------------------------------------------------------------------
|
| Kept as a separate named helper for compatibility with existing
| components that already use getGalleryImageUrl().
|
| It intentionally uses the same global Gallery thumbnail behavior.
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
| The existing Galaxy behavior is preserved:
|
| 240 × 240
| quality 70
| cover
|
| We are not visually changing the Galaxy.
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
| The stored original is still not requested directly.
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
| Useful for future components without creating another transformation
| implementation.
|
| The caller can optionally provide a specific width/height.
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