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
 *   Authorization: Bearer <AZAIN_ADMIN_TOKEN>
 *
 * The AZAIN admin token is issued by the API Worker and
 * validated locally using AUTH_SECRET.
 * No external authentication provider is used.
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

  const uploadedObject =
    await bucket.put(
      key,
      request.body,
      {
        httpMetadata,
      }
    );

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
 * AZAIN ADMIN TOKEN AUTHENTICATION
 *
 * The API Worker issues the admin token after successful login.
 *
 * Token format:
 *
 *   <base64url(payload)>.<base64url(HMAC-SHA256 signature)>
 *
 * Payload:
 *
 *   {
 *     email: "...",
 *     exp: 1234567890
 *   }
 *
 * The Media Worker verifies the exact same token format using
 * AUTH_SECRET and ADMIN_EMAIL.
 *
 * No external authentication provider is used.
 */

function base64UrlEncode(value) {
  const bytes =
    typeof value === "string"
      ? new TextEncoder().encode(value)
      : value;

  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecode(value) {
  const padded =
    value
      .replace(/-/g, "+")
      .replace(/_/g, "/") +
    "=".repeat(
      (4 - (value.length % 4)) % 4
    );

  const binary = atob(padded);

  const bytes =
    Uint8Array.from(
      binary,
      (char) =>
        char.charCodeAt(0)
    );

  return new TextDecoder().decode(bytes);
}

async function isAuthorized(
  request,
  env
) {
  const authorization =
    request.headers.get(
      "Authorization"
    );

  if (
    !authorization ||
    !authorization.startsWith(
      "Bearer "
    )
  ) {
    return false;
  }

  const token =
    authorization.substring(
      "Bearer ".length
    );

  const parts =
    token.split(".");

  if (parts.length !== 2) {
    return false;
  }

  const [
    encodedPayload,
    encodedSignature,
  ] = parts;

  try {
    const payload =
      JSON.parse(
        base64UrlDecode(
          encodedPayload
        )
      );

    if (
      !payload.email ||
      !payload.exp ||
      payload.exp <
        Math.floor(
          Date.now() / 1000
        )
    ) {
      return false;
    }

    if (
      payload.email !==
      env.ADMIN_EMAIL
    ) {
      return false;
    }

    const key =
      await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(
          env.AUTH_SECRET
        ),
        {
          name: "HMAC",
          hash: "SHA-256",
        },
        false,
        ["verify"]
      );

    const paddedSignature =
      encodedSignature
        .replace(/-/g, "+")
        .replace(/_/g, "/") +
      "=".repeat(
        (4 -
          (encodedSignature.length %
            4)) %
          4
      );

    const binarySignature =
      atob(
        paddedSignature
      );

    const signature =
      Uint8Array.from(
        binarySignature,
        (char) =>
          char.charCodeAt(0)
      );

    const valid =
      await crypto.subtle.verify(
        "HMAC",
        key,
        signature,
        new TextEncoder().encode(
          encodedPayload
        )
      );

    return valid;
  } catch {
    return false;
  }
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