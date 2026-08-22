/**
 * AZAIN MEDIA WORKER
 * ==================
 *
 * Cloudflare Worker → private R2 bucket
 *
 * R2 binding:
 *   MEDIA → azain-media
 *
 * Supported endpoints:
 *
 *   GET     /media/<path>
 *   HEAD    /media/<path>
 *   PUT     /media/<path>
 *   DELETE  /media/<path>
 *   OPTIONS /media/<path>
 *
 * PUT and DELETE require:
 *
 *   Authorization: Bearer <SUPABASE_ACCESS_TOKEN>
 *
 * The Supabase access token is validated by Supabase Auth.
 *
 * IMPORTANT:
 * - No R2 credentials are exposed to the browser.
 * - The R2 bucket remains private.
 * - GET/HEAD are available for media delivery.
 * - PUT/DELETE are protected.
 */

const MEDIA_PREFIX = "/media/";

const ALLOWED_METHODS = [
  "GET",
  "HEAD",
  "PUT",
  "DELETE",
  "OPTIONS",
];

const MAX_PATH_LENGTH = 1024;

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);

      /*
       * ------------------------------------------------------------
       * CORS
       * ------------------------------------------------------------
       */

      const origin =
        request.headers.get("Origin");

      const corsHeaders =
        buildCorsHeaders(origin);

      if (
        request.method ===
        "OPTIONS"
      ) {
        return new Response(
          null,
          {
            status: 204,
            headers:
              corsHeaders,
          }
        );
      }

      /*
       * ------------------------------------------------------------
       * METHOD CHECK
       * ------------------------------------------------------------
       */

      if (
        !ALLOWED_METHODS.includes(
          request.method
        )
      ) {
        return jsonResponse(
          {
            error:
              "Method Not Allowed",
          },
          405,
          {
            ...corsHeaders,
            Allow:
              ALLOWED_METHODS.join(
                ", "
              ),
          }
        );
      }

      /*
       * ------------------------------------------------------------
       * PATH
       * ------------------------------------------------------------
       */

      if (
        !url.pathname.startsWith(
          MEDIA_PREFIX
        )
      ) {
        return jsonResponse(
          {
            error:
              "Not Found",
          },
          404,
          corsHeaders
        );
      }

      let key =
        decodeURIComponent(
          url.pathname.slice(
            MEDIA_PREFIX.length
          )
        );

      /*
       * Normalize the object key.
       */

      key =
        normalizeObjectKey(
          key
        );

      if (!key) {
        return jsonResponse(
          {
            error:
              "Media path is required",
          },
          400,
          corsHeaders
        );
      }

      if (
        key.length >
        MAX_PATH_LENGTH
      ) {
        return jsonResponse(
          {
            error:
              "Media path is too long",
          },
          414,
          corsHeaders
        );
      }

      /*
       * ------------------------------------------------------------
       * R2 BINDING CHECK
       * ------------------------------------------------------------
       */

      if (!env.MEDIA) {
        console.error(
          "R2 binding MEDIA is not available."
        );

        return jsonResponse(
          {
            error:
              "R2 storage binding is not configured",
          },
          500,
          corsHeaders
        );
      }

      /*
       * ------------------------------------------------------------
       * GET
       * ------------------------------------------------------------
       *
       * Retrieves an object from R2.
       *
       * Range requests are passed through so videos can seek/stream.
       */

      if (
        request.method ===
        "GET"
      ) {
        return await handleGet(
          request,
          env.MEDIA,
          key,
          corsHeaders
        );
      }

      /*
       * ------------------------------------------------------------
       * HEAD
       * ------------------------------------------------------------
       */

      if (
        request.method ===
        "HEAD"
      ) {
        return await handleHead(
          env.MEDIA,
          key,
          corsHeaders
        );
      }

      /*
       * ------------------------------------------------------------
       * WRITE AUTHENTICATION
       * ------------------------------------------------------------
       *
       * PUT and DELETE are protected by the existing Supabase
       * authenticated session.
       *
       * The browser sends the Supabase access token.
       *
       * The Worker validates that token against Supabase Auth.
       *
       * The old MEDIA_API_KEY is also accepted temporarily so that
       * existing infrastructure tests continue to work while the
       * frontend authentication transition is completed.
       */

      if (
        request.method ===
          "PUT" ||
        request.method ===
          "DELETE"
      ) {
        const authorized =
          await isAuthorized(
            request,
            env
          );

        if (!authorized) {
          return jsonResponse(
            {
              error:
                "Unauthorized",
            },
            401,
            {
              ...corsHeaders,
              "WWW-Authenticate":
                "Bearer",
            }
          );
        }
      }

      /*
       * ------------------------------------------------------------
       * PUT
       * ------------------------------------------------------------
       */

      if (
        request.method ===
        "PUT"
      ) {
        return await handlePut(
          request,
          env.MEDIA,
          key,
          corsHeaders
        );
      }

      /*
       * ------------------------------------------------------------
       * DELETE
       * ------------------------------------------------------------
       */

      if (
        request.method ===
        "DELETE"
      ) {
        return await handleDelete(
          env.MEDIA,
          key,
          corsHeaders
        );
      }

      /*
       * ------------------------------------------------------------
       * FALLBACK
       * ------------------------------------------------------------
       */

      return jsonResponse(
        {
          error:
            "Method Not Allowed",
        },
        405,
        {
          ...corsHeaders,
          Allow:
            ALLOWED_METHODS.join(
              ", "
            ),
        }
      );
    } catch (error) {
      console.error(
        "AZAIN Media Worker error:",
        error
      );

      return jsonResponse(
        {
          error:
            "Internal Server Error",
        },
        500,
        {
          "Access-Control-Allow-Origin":
            "*",

          "Access-Control-Allow-Methods":
            ALLOWED_METHODS.join(
              ", "
            ),

          "Access-Control-Allow-Headers":
            "Authorization, Content-Type, Range, If-None-Match, If-Modified-Since",
        }
      );
    }
  },
};


/**
 * ================================================================
 * GET
 * ================================================================
 */

async function handleGet(
  request,
  bucket,
  key,
  corsHeaders
) {
  const object =
    await bucket.get(
      key,
      {
        onlyIf:
          request.headers,

        range:
          request.headers,
      }
    );

  if (!object) {
    return jsonResponse(
      {
        error:
          "Media not found",
      },
      404,
      corsHeaders
    );
  }

  /*
   * If R2 returns no body because a conditional request failed,
   * return 304/412 appropriately.
   */

  if (!object.body) {
    const status =
      object.httpEtag
        ? 304
        : 412;

    return new Response(
      null,
      {
        status,
        headers: {
          ...corsHeaders,
          ETag:
            object.httpEtag ||
            "",
        },
      }
    );
  }

  const headers =
    buildObjectHeaders(
      object,
      corsHeaders
    );

  return new Response(
    object.body,
    {
      status: 200,
      headers,
    }
  );
}


/**
 * ================================================================
 * HEAD
 * ================================================================
 */

async function handleHead(
  bucket,
  key,
  corsHeaders
) {
  const object =
    await bucket.head(
      key
    );

  if (!object) {
    return jsonResponse(
      {
        error:
          "Media not found",
      },
      404,
      corsHeaders
    );
  }

  const headers =
    buildObjectHeaders(
      object,
      corsHeaders
    );

  return new Response(
    null,
    {
      status: 200,
      headers,
    }
  );
}


/**
 * ================================================================
 * PUT
 * ================================================================
 */

async function handlePut(
  request,
  bucket,
  key,
  corsHeaders
) {
  const contentType =
    request.headers.get(
      "Content-Type"
    ) ||
    "application/octet-stream";

  const contentLength =
    request.headers.get(
      "Content-Length"
    );

  const cacheControl =
    request.headers.get(
      "Cache-Control"
    );

  const contentDisposition =
    request.headers.get(
      "Content-Disposition"
    );

  const httpMetadata = {
    contentType,
  };

  if (cacheControl) {
    httpMetadata.cacheControl =
      cacheControl;
  }

  if (contentDisposition) {
    httpMetadata.contentDisposition =
      contentDisposition;
  }

  /*
   * Do not buffer the file in Worker memory.
   *
   * request.body is passed directly to R2.
   * This is particularly important for video uploads.
   */

  const uploadedObject =
    await bucket.put(
      key,
      request.body,
      {
        httpMetadata,
      }
    );

  /*
   * R2 returns an object with an ETag after successful upload.
   */

  return jsonResponse(
    {
      success: true,

      key,

      etag:
        uploadedObject?.httpEtag ||
        null,

      contentType,

      contentLength:
        contentLength
          ? Number(
              contentLength
            )
          : null,
    },
    201,
    {
      ...corsHeaders,

      ETag:
        uploadedObject?.httpEtag ||
        "",
    }
  );
}


/**
 * ================================================================
 * DELETE
 * ================================================================
 */

async function handleDelete(
  bucket,
  key,
  corsHeaders
) {
  await bucket.delete(
    key
  );

  return jsonResponse(
    {
      success: true,

      key,

      deleted: true,
    },
    200,
    corsHeaders
  );
}


/**
 * ================================================================
 * AUTHORIZATION
 * ================================================================
 *
 * PRIMARY AUTHENTICATION:
 *
 *   Supabase access token
 *
 * The browser already has this token because the user is logged
 * into the existing AZAIN Supabase application.
 *
 * The Worker validates the token by calling:
 *
 *   Supabase Auth /user
 *
 * with:
 *
 *   Authorization: Bearer <access token>
 *   apikey: <Supabase publishable key>
 *
 * The existing MEDIA_API_KEY is retained as a temporary fallback
 * so the infrastructure can still be tested with the existing
 * PowerShell method while we complete the frontend transition.
 */

async function isAuthorized(
  request,
  env
) {
  const authorization =
    request.headers.get(
      "Authorization"
    );

  if (!authorization) {
    return false;
  }

  const prefix =
    "Bearer ";

  if (
    !authorization.startsWith(
      prefix
    )
  ) {
    return false;
  }

  const suppliedToken =
    authorization
      .slice(
        prefix.length
      )
      .trim();

  if (!suppliedToken) {
    return false;
  }


  /*
   * ------------------------------------------------------------
   * TEMPORARY LEGACY MEDIA_API_KEY SUPPORT
   * ------------------------------------------------------------
   *
   * This keeps the existing PowerShell infrastructure test working.
   *
   * It can be removed after the frontend has been successfully
   * tested with Supabase authentication.
   */

  if (
    env.MEDIA_API_KEY
  ) {
    const expectedKey =
      String(
        env.MEDIA_API_KEY
      ).trim();

    if (
      expectedKey &&
      timingSafeEqual(
        suppliedToken,
        expectedKey
      )
    ) {
      return true;
    }
  }


  /*
   * ------------------------------------------------------------
   * SUPABASE AUTHENTICATION
   * ------------------------------------------------------------
   */

  if (
    !env.SUPABASE_URL ||
    !env.SUPABASE_PUBLISHABLE_KEY
  ) {
    console.error(
      "SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY Worker variable is not configured."
    );

    return false;
  }

  try {
    const response =
      await fetch(
        `${String(
          env.SUPABASE_URL
        ).replace(
          /\/+$/,
          ""
        )}/auth/v1/user`,
        {
          method:
            "GET",

          headers: {
            Authorization:
              `Bearer ${suppliedToken}`,

            apikey:
              String(
                env.SUPABASE_PUBLISHABLE_KEY
              ),
          },
        }
      );

    if (
      !response.ok
    ) {
      return false;
    }

    const user =
      await response.json();

    /*
     * A valid Supabase access token must resolve to a user.
     */

    return Boolean(
      user?.id
    );
  } catch (error) {
    console.error(
      "Supabase token validation failed:",
      error
    );

    return false;
  }
}


/**
 * ================================================================
 * CONSTANT-TIME STRING COMPARISON
 * ================================================================
 */

function timingSafeEqual(
  a,
  b
) {
  const encoder =
    new TextEncoder();

  const aBytes =
    encoder.encode(a);

  const bBytes =
    encoder.encode(b);

  if (
    aBytes.length !==
    bBytes.length
  ) {
    return false;
  }

  let result = 0;

  for (
    let i = 0;
    i < aBytes.length;
    i++
  ) {
    result |=
      aBytes[i] ^
      bBytes[i];
  }

  return result === 0;
}


/**
 * ================================================================
 * OBJECT HEADERS
 * ================================================================
 */

function buildObjectHeaders(
  object,
  corsHeaders
) {
  const headers = {
    ...corsHeaders,
  };

  if (
    object.httpEtag
  ) {
    headers.ETag =
      object.httpEtag;
  }

  if (
    object.httpMetadata
      ?.contentType
  ) {
    headers[
      "Content-Type"
    ] =
      object.httpMetadata
        .contentType;
  }

  if (
    object.httpMetadata
      ?.contentLength
  ) {
    headers[
      "Content-Length"
    ] =
      String(
        object.httpMetadata
          .contentLength
      );
  }

  if (
    object.httpMetadata
      ?.cacheControl
  ) {
    headers[
      "Cache-Control"
    ] =
      object.httpMetadata
        .cacheControl;
  } else {
  headers[
    "Cache-Control"
  ] =
    "public, max-age=31536000, immutable";
}

  if (
    object.httpMetadata
      ?.contentDisposition
  ) {
    headers[
      "Content-Disposition"
    ] =
      object.httpMetadata
        .contentDisposition;
  }

  if (
    object.httpMetadata
      ?.contentEncoding
  ) {
    headers[
      "Content-Encoding"
    ] =
      object.httpMetadata
        .contentEncoding;
  }

  if (
    object.httpMetadata
      ?.contentLanguage
  ) {
    headers[
      "Content-Language"
    ] =
      object.httpMetadata
        .contentLanguage;
  }

  return headers;
}


/**
 * ================================================================
 * CORS
 * ================================================================
 *
 * The Worker handles CORS itself because the browser talks to
 * the Worker rather than directly to the private R2 bucket.
 */

function buildCorsHeaders(
  origin
) {
  /*
   * During this infrastructure-testing phase we allow browser
   * requests from any origin.
   *
   * Before connecting the production AZAIN frontend, this will
   * be restricted to the actual AZAIN application origin.
   */

  const allowOrigin =
    origin || "*";

  return {
    "Access-Control-Allow-Origin":
      allowOrigin,

    "Access-Control-Allow-Methods":
      "GET, HEAD, PUT, DELETE, OPTIONS",

    "Access-Control-Allow-Headers":
      "Authorization, Content-Type, Range, If-None-Match, If-Modified-Since",

    "Access-Control-Expose-Headers":
      "ETag, Content-Length, Content-Type, Content-Range, Accept-Ranges",

    "Access-Control-Max-Age":
      "86400",

    Vary:
      "Origin",
  };
}


/**
 * ================================================================
 * JSON RESPONSE
 * ================================================================
 */

function jsonResponse(
  data,
  status = 200,
  extraHeaders = {}
) {
  return new Response(
    JSON.stringify(data),
    {
      status,

      headers: {
        "Content-Type":
          "application/json; charset=utf-8",

        ...extraHeaders,
      },
    }
  );
}


/**
 * ================================================================
 * OBJECT KEY NORMALIZATION
 * ================================================================
 */

function normalizeObjectKey(
  key
) {
  /*
   * Remove leading slashes.
   */

  key =
    key.replace(
      /^\/+/,
      ""
    );

  /*
   * Reject null bytes.
   */

  if (
    key.includes(
      "\0"
    )
  ) {
    return "";
  }

  /*
   * Normalize repeated slashes.
   */

  key =
    key.replace(
      /\/+/g,
      "/"
    );

  /*
   * Prevent path traversal.
   */

  const parts =
    key.split(
      "/"
    );

  if (
    parts.some(
      (part) =>
        part ===
          ".." ||
        part ===
          "."
    )
  ) {
    return "";
  }

  return key;
}