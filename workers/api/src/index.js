const ARRAY_FIELDS = {
  timeline: ["gallery_images", "highlights"],
  milestones: ["gallery", "highlights"],
  favorite_songs: ["gallery_images", "highlights"],
};

const BOOLEAN_FIELDS = {
  timeline: ["favorite", "published"],
  milestones: ["favorite", "published"],
  favorite_songs: ["favorite"],
  family_memories: ["published"],
  letters: ["published"],
};

const FAMILY_MEMBER_KEYS = [
  "dada",
  "dadi",
  "nana",
  "nani",
  "mumma",
  "papa",
  "chachu",
  "mamu",
  "yaaya",
  "ansha",
];

const FAMILY_MEDIA_TYPES = [
  "photo",
  "video",
];

const TIMELINE_FIELDS = [
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
  "book",
  "book_type",
  "memory_type",
];

const MILESTONE_FIELDS = [
  "id",
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
];

const FAVORITE_SONG_FIELDS = [
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
];

const FAMILY_MEMORY_FIELDS = [
  "id",
  "member_key",
  "media_type",
  "media_url",
  "caption",
  "display_order",
  "published",
];

const LETTER_FIELDS = [
  "slot_key",
  "title",
  "slug",
  "letter_content",
  "date",
  "age",
  "signature",
  "published",
  "display_order",
];


/* ============================================================================
   RESPONSE
============================================================================ */

function jsonResponse(data, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods":
        "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization",
    },
  });
}


/* ============================================================================
   ARRAY CONVERSION
============================================================================ */

function parseArray(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return [];
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      return Array.isArray(parsed)
        ? parsed
        : [];
    } catch {
      return [];
    }
  }

  return [];
}


function prepareDatabaseValue(
  table,
  field,
  value
) {
  if (
    ARRAY_FIELDS[table]?.includes(field)
  ) {
    return Array.isArray(value)
      ? JSON.stringify(value)
      : value ?? "[]";
  }

  if (
    BOOLEAN_FIELDS[table]?.includes(field)
  ) {
    return Boolean(value) ? 1 : 0;
  }

  return value ?? null;
}


/* ============================================================================
   ROW NORMALIZATION

   D1/SQLite returns booleans as 0/1 and stores former PostgreSQL arrays as
   JSON text. Convert them back into the same shapes expected by React.
============================================================================ */

function normalizeRow(
  table,
  row
) {
  if (!row) {
    return null;
  }

  const result = {
    ...row,
  };

  for (
    const field of ARRAY_FIELDS[table] || []
  ) {
    result[field] =
      parseArray(result[field]);
  }

  for (
    const field of BOOLEAN_FIELDS[table] || []
  ) {
    result[field] =
      Boolean(result[field]);
  }

  return result;
}


function normalizeRows(
  table,
  rows
) {
  return (rows || []).map(
    (row) =>
      normalizeRow(table, row)
  );
}


/* ============================================================================
   GENERIC DATABASE HELPERS
============================================================================ */

async function selectAll(
  env,
  table,
  orderBy
) {
  let sql =
    `SELECT * FROM ${table}`;

  if (orderBy) {
    sql += ` ORDER BY ${orderBy}`;
  }

  const { results } =
    await env.DB
      .prepare(sql)
      .all();

  return normalizeRows(
    table,
    results
  );
}


async function selectById(
  env,
  table,
  id
) {
  const result =
    await env.DB
      .prepare(
        `SELECT * FROM ${table} WHERE id = ? LIMIT 1`
      )
      .bind(id)
      .first();

  return normalizeRow(
    table,
    result
  );
}


async function selectByField(
  env,
  table,
  field,
  value
) {
  const result =
    await env.DB
      .prepare(
        `SELECT * FROM ${table} WHERE ${field} = ? LIMIT 1`
      )
      .bind(value)
      .first();

  return normalizeRow(
    table,
    result
  );
}


async function insertRow(
  env,
  table,
  payload,
  allowedFields
) {
  const fields =
    allowedFields.filter(
      (field) =>
        Object.prototype.hasOwnProperty.call(
          payload,
          field
        )
    );

  if (!fields.length) {
    throw new Error(
      `No valid fields supplied for ${table}.`
    );
  }

  const values =
    fields.map(
      (field) =>
        prepareDatabaseValue(
          table,
          field,
          payload[field]
        )
    );

  const placeholders =
    fields
      .map(() => "?")
      .join(", ");

  const result =
    await env.DB
      .prepare(`
        INSERT INTO ${table}
        (${fields.join(", ")})
        VALUES (${placeholders})
        RETURNING *
      `)
      .bind(...values)
      .first();

  return normalizeRow(
    table,
    result
  );
}


async function updateRow(
  env,
  table,
  id,
  payload,
  allowedFields,
  extraFields = []
) {
  const fields =
    allowedFields.filter(
      (field) =>
        Object.prototype.hasOwnProperty.call(
          payload,
          field
        )
    );

  for (
    const field of extraFields
  ) {
    if (
      Object.prototype.hasOwnProperty.call(
        payload,
        field
      ) &&
      !fields.includes(field)
    ) {
      fields.push(field);
    }
  }

  if (!fields.length) {
    throw new Error(
      `No valid fields supplied for ${table}.`
    );
  }

  const values =
    fields.map(
      (field) =>
        prepareDatabaseValue(
          table,
          field,
          payload[field]
        )
    );

  const assignments =
    fields
      .map(
        (field) =>
          `${field} = ?`
      )
      .join(", ");

  const result =
    await env.DB
      .prepare(`
        UPDATE ${table}
        SET ${assignments}
        WHERE id = ?
        RETURNING *
      `)
      .bind(
        ...values,
        id
      )
      .first();

  return normalizeRow(
    table,
    result
  );
}


async function deleteRow(
  env,
  table,
  id
) {
  const result =
    await env.DB
      .prepare(`
        DELETE FROM ${table}
        WHERE id = ?
        RETURNING id
      `)
      .bind(id)
      .first();

  return Boolean(result);
}


/* ============================================================================
   FAMILY MEMORY VALIDATION
============================================================================ */

function normalizeMemberKey(
  memberKey
) {
  return String(
    memberKey || ""
  )
    .trim()
    .toLowerCase();
}


function validateMemberKey(
  memberKey
) {
  const normalized =
    normalizeMemberKey(
      memberKey
    );

  if (
    !FAMILY_MEMBER_KEYS.includes(
      normalized
    )
  ) {
    throw new Error(
      "Invalid family member."
    );
  }

  return normalized;
}


function normalizeMediaType(
  mediaType
) {
  const normalized =
    String(
      mediaType || ""
    )
    .trim()
    .toLowerCase();

  if (
    !FAMILY_MEDIA_TYPES.includes(
      normalized
    )
  ) {
    throw new Error(
      "Invalid family memory media type."
    );
  }

  return normalized;
}


function normalizeFamilyMemory(
  memory
) {
  if (!memory) {
    return null;
  }

  return {
    ...memory,

    member_key:
      normalizeMemberKey(
        memory.member_key
      ),

    media_type:
      memory.media_type ===
      "video"
        ? "video"
        : "photo",

    media_url:
      memory.media_url || "",

    caption:
      memory.caption || "",

    display_order:
      Number.isFinite(
        Number(
          memory.display_order
        )
      )
        ? Number(
            memory.display_order
          )
        : 0,

    published:
      Boolean(
        memory.published
      ),
  };
}


/* ============================================================================
   MAIN WORKER
============================================================================ */

/* ============================================================================
   ADMIN AUTHENTICATION
============================================================================ */

const AUTH_TOKEN_TTL = 60 * 60 * 24 * 7; // 7 days

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

  const bytes = Uint8Array.from(
    binary,
    (char) => char.charCodeAt(0)
  );

  return new TextDecoder().decode(bytes);
}

async function createAuthToken(
  env,
  email
) {
  const payload = {
    email,
    exp:
      Math.floor(Date.now() / 1000) +
      AUTH_TOKEN_TTL,
  };

  const encodedPayload =
    base64UrlEncode(
      JSON.stringify(payload)
    );

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
      ["sign"]
    );

  const signature =
    await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(
        encodedPayload
      )
    );

  const encodedSignature =
    base64UrlEncode(
      new Uint8Array(signature)
    );

  return `${encodedPayload}.${encodedSignature}`;
}

async function verifyAuthToken(
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

    return await crypto.subtle.verify(
      "HMAC",
      key,
      signature,
      new TextEncoder().encode(
        encodedPayload
      )
    );
  } catch {
    return false;
  }
}

export default {
  async fetch(
    request,
    env
  ) {
    const url =
      new URL(request.url);

    const method =
      request.method;


    /* ========================================================================
       CORS
    ======================================================================== */

    if (
      method === "OPTIONS"
    ) {
      return new Response(
        null,
        {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin":
              "*",
            "Access-Control-Allow-Methods":
              "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers":
              "Content-Type, Authorization",
          },
        }
      );
    }


    try {
      /* ======================================================================
         ADMIN LOGIN
      ====================================================================== */

      if (
        method === "POST" &&
        url.pathname === "/auth/login"
      ) {
        const credentials =
          await request.json();

        if (
          credentials?.email !==
            env.ADMIN_EMAIL ||
          credentials?.password !==
            env.ADMIN_PASSWORD
        ) {
          return jsonResponse(
            {
              error:
                "Invalid email or password.",
            },
            401
          );
        }

        const token =
          await createAuthToken(
            env,
            credentials.email
          );

        return jsonResponse({
          success: true,
          token,
        });
      }


      /* ======================================================================
         ADMIN AUTHENTICATION

         Public GET requests remain public.

         All POST / PUT / DELETE requests require authentication,
         except POST /auth/login handled above.

         GET requests using include_unpublished=true require authentication.
      ====================================================================== */

      const includeUnpublished =
        url.searchParams.get(
          "include_unpublished"
        ) === "true";

      const requiresAuthentication =
        method === "POST" ||
        method === "PUT" ||
        method === "DELETE" ||
        (
          method === "GET" &&
          includeUnpublished
        );

      if (
        requiresAuthentication
      ) {
        const authenticated =
          await verifyAuthToken(
            request,
            env
          );

        if (!authenticated) {
          return jsonResponse(
            {
              error:
                "Unauthorized.",
            },
            401
          );
        }
      }


      /* ======================================================================
         HEALTH
      ====================================================================== */

      if (
        method === "GET" &&
        url.pathname === "/health"
      ) {
        const [
          timeline,
          milestones,
          favoriteSongs,
          familyMemories,
          letters,
        ] = await Promise.all([
          env.DB
            .prepare(
              "SELECT COUNT(*) AS count FROM timeline"
            )
            .first(),

          env.DB
            .prepare(
              "SELECT COUNT(*) AS count FROM milestones"
            )
            .first(),

          env.DB
            .prepare(
              "SELECT COUNT(*) AS count FROM favorite_songs"
            )
            .first(),

          env.DB
            .prepare(
              "SELECT COUNT(*) AS count FROM family_memories"
            )
            .first(),

          env.DB
            .prepare(
              "SELECT COUNT(*) AS count FROM letters"
            )
            .first(),
        ]);

        return jsonResponse({
          success: true,
          database: "connected",

          counts: {
            timeline:
              timeline.count,

            milestones:
              milestones.count,

            favorite_songs:
              favoriteSongs.count,

            family_memories:
              familyMemories.count,

            letters:
              letters.count,
          },
        });
      }


      /* ======================================================================
         TIMELINE
      ====================================================================== */

      if (
        url.pathname === "/timeline"
      ) {
        if (
          method === "GET"
        ) {
          const data =
            await selectAll(
              env,
              "timeline",
              "date DESC"
            );

          return jsonResponse(
            data
          );
        }

        if (
          method === "POST"
        ) {
          const payload =
            await request.json();

          const data =
            await insertRow(
              env,
              "timeline",
              payload,
              TIMELINE_FIELDS
            );

          return jsonResponse(
            data,
            201
          );
        }
      }


      if (
        url.pathname.startsWith(
          "/timeline/slug/"
        ) &&
        method === "GET"
      ) {
        const slug =
          decodeURIComponent(
            url.pathname.substring(
              "/timeline/slug/".length
            )
          );

        const data =
          await selectByField(
            env,
            "timeline",
            "slug",
            slug
          );

        if (!data) {
          return jsonResponse(
            {
              error:
                "Timeline memory not found.",
            },
            404
          );
        }

        return jsonResponse(
          data
        );
      }


      if (
        url.pathname.startsWith(
          "/timeline/"
        )
      ) {
        const id =
          decodeURIComponent(
            url.pathname.substring(
              "/timeline/".length
            )
          );

        if (
          method === "GET"
        ) {
          const data =
            await selectById(
              env,
              "timeline",
              id
            );

          if (!data) {
            return jsonResponse(
              {
                error:
                  "Timeline memory not found.",
              },
              404
            );
          }

          return jsonResponse(
            data
          );
        }

        if (
          method === "PUT"
        ) {
          const payload =
            await request.json();

          const data =
            await updateRow(
              env,
              "timeline",
              id,
              payload,
              TIMELINE_FIELDS
            );

          if (!data) {
            return jsonResponse(
              {
                error:
                  "Timeline memory not found.",
              },
              404
            );
          }

          return jsonResponse(
            data
          );
        }

        if (
          method === "DELETE"
        ) {
          const deleted =
            await deleteRow(
              env,
              "timeline",
              id
            );

          if (!deleted) {
            return jsonResponse(
              {
                error:
                  "Timeline memory not found.",
              },
              404
            );
          }

          return jsonResponse({
            success: true,
          });
        }
      }


      /* ======================================================================
         MILESTONES
      ====================================================================== */

      if (
        url.pathname ===
          "/milestones"
      ) {
        if (
          method === "GET"
        ) {
          const data =
            await selectAll(
              env,
              "milestones",
              "date DESC"
            );

          return jsonResponse(
            data
          );
        }

        if (
          method === "POST"
        ) {
          const payload =
            await request.json();

          const data =
            await insertRow(
              env,
              "milestones",
              payload,
              MILESTONE_FIELDS
            );

          return jsonResponse(
            data,
            201
          );
        }
      }


      if (
        url.pathname.startsWith(
          "/milestones/"
        )
      ) {
        const id =
          decodeURIComponent(
            url.pathname.substring(
              "/milestones/".length
            )
          );

        if (
          method === "GET"
        ) {
          const data =
            await selectById(
              env,
              "milestones",
              id
            );

          if (!data) {
            return jsonResponse(
              {
                error:
                  "Milestone not found.",
              },
              404
            );
          }

          return jsonResponse(
            data
          );
        }

        if (
          method === "PUT"
        ) {
          const payload =
            await request.json();

          const data =
            await updateRow(
              env,
              "milestones",
              id,
              payload,
              MILESTONE_FIELDS
            );

          if (!data) {
            return jsonResponse(
              {
                error:
                  "Milestone not found.",
              },
              404
            );
          }

          return jsonResponse(
            data
          );
        }

        if (
          method === "DELETE"
        ) {
          const deleted =
            await deleteRow(
              env,
              "milestones",
              id
            );

          if (!deleted) {
            return jsonResponse(
              {
                error:
                  "Milestone not found.",
              },
              404
            );
          }

          return jsonResponse({
            success: true,
          });
        }
      }


      /* ======================================================================
         FAVORITE SONGS
      ====================================================================== */

      if (
        url.pathname ===
          "/favorite-songs"
      ) {
        if (
          method === "GET"
        ) {
          const data =
            await selectAll(
              env,
              "favorite_songs",
              "display_order ASC"
            );

          return jsonResponse(
            data
          );
        }

        if (
          method === "POST"
        ) {
          const payload =
            await request.json();

          const data =
            await insertRow(
              env,
              "favorite_songs",
              payload,
              FAVORITE_SONG_FIELDS
            );

          return jsonResponse(
            data,
            201
          );
        }
      }


      if (
        url.pathname.startsWith(
          "/favorite-songs/slug/"
        ) &&
        method === "GET"
      ) {
        const slug =
          decodeURIComponent(
            url.pathname.substring(
              "/favorite-songs/slug/".length
            )
          );

        const data =
          await selectByField(
            env,
            "favorite_songs",
            "slug",
            slug
          );

        if (!data) {
          return jsonResponse(
            {
              error:
                "Favorite song not found.",
            },
            404
          );
        }

        return jsonResponse(
          data
        );
      }


      if (
        url.pathname.startsWith(
          "/favorite-songs/"
        )
      ) {
        const id =
          decodeURIComponent(
            url.pathname.substring(
              "/favorite-songs/".length
            )
          );

        if (
          method === "GET"
        ) {
          const data =
            await selectById(
              env,
              "favorite_songs",
              id
            );

          if (!data) {
            return jsonResponse(
              {
                error:
                  "Favorite song not found.",
              },
              404
            );
          }

          return jsonResponse(
            data
          );
        }

        if (
          method === "PUT"
        ) {
          const payload =
            await request.json();

          const data =
            await updateRow(
              env,
              "favorite_songs",
              id,
              payload,
              FAVORITE_SONG_FIELDS
            );

          if (!data) {
            return jsonResponse(
              {
                error:
                  "Favorite song not found.",
              },
              404
            );
          }

          return jsonResponse(
            data
          );
        }

        if (
          method === "DELETE"
        ) {
          const deleted =
            await deleteRow(
              env,
              "favorite_songs",
              id
            );

          if (!deleted) {
            return jsonResponse(
              {
                error:
                  "Favorite song not found.",
              },
              404
            );
          }

          return jsonResponse({
            success: true,
          });
        }
      }


      /* ======================================================================
         FAMILY MEMORIES — PUBLISHED TOGGLE

         This MUST be checked before /family-memories/:id so that the
         special /published endpoint is never treated as an ID.
      ====================================================================== */

      if (
        url.pathname.match(
          /^\/family-memories\/[^/]+\/published$/
        ) &&
        method === "PUT"
      ) {
        const id =
          decodeURIComponent(
            url.pathname
              .substring(
                "/family-memories/"
                  .length
              )
              .replace(
                /\/published$/,
                ""
              )
          );

        const payload =
          await request.json();

        const data =
          await updateRow(
            env,
            "family_memories",
            id,
            {
              published:
                Boolean(
                  payload?.published
                ),
            },
            ["published"]
          );

        if (!data) {
          return jsonResponse(
            {
              error:
                "Family memory not found.",
            },
            404
          );
        }

        return jsonResponse(
          normalizeFamilyMemory(
            data
          )
        );
      }


      /* ======================================================================
         FAMILY MEMORIES — COLLECTION
      ====================================================================== */

      if (
        url.pathname ===
          "/family-memories"
      ) {
        if (
          method === "GET"
        ) {
          const memberKey =
            url.searchParams.get(
              "member_key"
            );

          const includeUnpublished =
            url.searchParams.get(
              "include_unpublished"
            ) === "true";

          let sql = `
            SELECT *
            FROM family_memories
          `;

          const params = [];

          if (memberKey) {
            const normalized =
              validateMemberKey(
                memberKey
              );

            sql +=
              " WHERE member_key = ?";

            params.push(
              normalized
            );

            if (
              !includeUnpublished
            ) {
              sql +=
                " AND published = 1";
            }
          } else if (
            !includeUnpublished
          ) {
            sql +=
              " WHERE published = 1";
          }

          sql += `
            ORDER BY
              member_key ASC,
              display_order ASC,
              created_at ASC
          `;

          const result =
            await env.DB
              .prepare(sql)
              .bind(...params)
              .all();

          const data =
            normalizeRows(
              "family_memories",
              result.results
            ).map(
              normalizeFamilyMemory
            );

          return jsonResponse(
            data
          );
        }


        if (
          method === "POST"
        ) {
          const memory =
            await request.json();

          if (!memory) {
            return jsonResponse(
              {
                error:
                  "Family memory data is required.",
              },
              400
            );
          }

          const memberKey =
            validateMemberKey(
              memory.member_key
            );

          const mediaType =
            normalizeMediaType(
              memory.media_type
            );

          if (
            !memory.media_url
          ) {
            return jsonResponse(
              {
                error:
                  "Family memory media URL is required.",
              },
              400
            );
          }

          const payload = {
            id:
              memory.id ||
              crypto.randomUUID(),

            member_key:
              memberKey,

            media_type:
              mediaType,

            media_url:
              memory.media_url,

            caption:
              memory.caption
                ? String(
                    memory.caption
                  ).trim()
                : "",

            display_order:
              Number(
                memory.display_order
              ) || 1,

            published:
              memory.published ??
              true,
          };

          const data =
            await insertRow(
              env,
              "family_memories",
              payload,
              FAMILY_MEMORY_FIELDS
            );

          return jsonResponse(
            normalizeFamilyMemory(
              data
            ),
            201
          );
        }
      }
            /* ======================================================================
         FAMILY MEMORIES — SINGLE RECORD
      ====================================================================== */

      if (
        url.pathname.startsWith(
          "/family-memories/"
        )
      ) {
        const id =
          decodeURIComponent(
            url.pathname.substring(
              "/family-memories/".length
            )
          );

        if (
          method === "GET"
        ) {
          const data =
            await selectById(
              env,
              "family_memories",
              id
            );

          if (!data) {
            return jsonResponse(
              {
                error:
                  "Family memory not found.",
              },
              404
            );
          }

          return jsonResponse(
            normalizeFamilyMemory(
              data
            )
          );
        }


        if (
          method === "PUT"
        ) {
          const memory =
            await request.json();

          if (!memory) {
            return jsonResponse(
              {
                error:
                  "Family memory data is required.",
              },
              400
            );
          }

          const memberKey =
            validateMemberKey(
              memory.member_key
            );

          const mediaType =
            normalizeMediaType(
              memory.media_type
            );

          if (
            !memory.media_url
          ) {
            return jsonResponse(
              {
                error:
                  "Family memory media URL is required.",
              },
              400
            );
          }

          const payload = {
            member_key:
              memberKey,

            media_type:
              mediaType,

            media_url:
              memory.media_url,

            caption:
              memory.caption
                ? String(
                    memory.caption
                  ).trim()
                : "",

            display_order:
              Number(
                memory.display_order
              ) || 1,

            published:
              memory.published ??
              true,
          };

          const data =
            await updateRow(
              env,
              "family_memories",
              id,
              payload,
              FAMILY_MEMORY_FIELDS
            );

          if (!data) {
            return jsonResponse(
              {
                error:
                  "Family memory not found.",
              },
              404
            );
          }

          return jsonResponse(
            normalizeFamilyMemory(
              data
            )
          );
        }


        if (
          method === "DELETE"
        ) {
          const deleted =
            await deleteRow(
              env,
              "family_memories",
              id
            );

          if (!deleted) {
            return jsonResponse(
              {
                error:
                  "Family memory not found.",
              },
              404
            );
          }

          return jsonResponse({
            success: true,
          });
        }
      }


      /* ======================================================================
         LETTERS — PUBLISHED TOGGLE

         Checked before /letters/:id.
      ====================================================================== */

      if (
        url.pathname.match(
          /^\/letters\/[^/]+\/published$/
        ) &&
        method === "PUT"
      ) {
        const id =
          decodeURIComponent(
            url.pathname
              .substring(
                "/letters/"
                  .length
              )
              .replace(
                /\/published$/,
                ""
              )
          );

        const payload =
          await request.json();

        const data =
          await updateRow(
            env,
            "letters",
            id,
            {
              published:
                Boolean(
                  payload?.published
                ),

              updated_at:
                new Date().toISOString(),
            },
            [
              "published",
              "updated_at",
            ]
          );

        if (!data) {
          return jsonResponse(
            {
              error:
                "Letter not found.",
            },
            404
          );
        }

        return jsonResponse(
          data
        );
      }


      /* ======================================================================
         LETTERS — COLLECTION
      ====================================================================== */

      if (
        url.pathname ===
          "/letters"
      ) {
        if (
          method === "GET"
        ) {
          const includeUnpublished =
            url.searchParams.get(
              "include_unpublished"
            ) === "true";

          let sql = `
            SELECT *
            FROM letters
          `;

          if (
            !includeUnpublished
          ) {
            sql +=
              " WHERE published = 1";
          }

          sql += `
            ORDER BY
              display_order ASC,
              created_at ASC
          `;

          const result =
            await env.DB
              .prepare(sql)
              .all();

          const data =
            normalizeRows(
              "letters",
              result.results
            );

          return jsonResponse(
            data
          );
        }


        if (
          method === "POST"
        ) {
          const letter =
            await request.json();

          if (!letter) {
            return jsonResponse(
              {
                error:
                  "Letter data is required.",
              },
              400
            );
          }

          const payload = {
            slot_key:
              letter.slot_key,

            title:
              letter.title,

            slug:
              letter.slug,

            letter_content:
              letter.letter_content ||
              "",

            date:
              letter.date ||
              null,

            age:
              letter.age ||
              null,

            signature:
              letter.signature ||
              null,

            published:
              Boolean(
                letter.published
              ),

            display_order:
              Number(
                letter.display_order
              ) || 0,
          };

          const data =
            await insertRow(
              env,
              "letters",
              payload,
              LETTER_FIELDS
            );

          return jsonResponse(
            data,
            201
          );
        }
      }


      /* ======================================================================
         LETTERS — SLUG
      ====================================================================== */

      if (
        url.pathname.startsWith(
          "/letters/slug/"
        ) &&
        method === "GET"
      ) {
        const slug =
          decodeURIComponent(
            url.pathname.substring(
              "/letters/slug/".length
            )
          );

        const data =
          await selectByField(
            env,
            "letters",
            "slug",
            slug
          );

        if (
          !data ||
          !data.published
        ) {
          return jsonResponse(
            {
              error:
                "Published letter not found.",
            },
            404
          );
        }

        return jsonResponse(
          data
        );
      }


      /* ======================================================================
         LETTERS — SINGLE RECORD
      ====================================================================== */

      if (
        url.pathname.startsWith(
          "/letters/"
        )
      ) {
        const id =
          decodeURIComponent(
            url.pathname.substring(
              "/letters/".length
            )
          );

        if (
          method === "GET"
        ) {
          const data =
            await selectById(
              env,
              "letters",
              id
            );

          if (!data) {
            return jsonResponse(
              {
                error:
                  "Letter not found.",
              },
              404
            );
          }

          return jsonResponse(
            data
          );
        }


        if (
          method === "PUT"
        ) {
          const letter =
            await request.json();

          if (!letter) {
            return jsonResponse(
              {
                error:
                  "Letter data is required.",
              },
              400
            );
          }

          const payload = {
            slot_key:
              letter.slot_key,

            title:
              letter.title,

            slug:
              letter.slug,

            letter_content:
              letter.letter_content ||
              "",

            date:
              letter.date ||
              null,

            age:
              letter.age ||
              null,

            signature:
              letter.signature ||
              null,

            published:
              Boolean(
                letter.published
              ),

            display_order:
              Number(
                letter.display_order
              ) || 0,

            updated_at:
              new Date().toISOString(),
          };

          const data =
            await updateRow(
              env,
              "letters",
              id,
              payload,
              LETTER_FIELDS,
              ["updated_at"]
            );

          if (!data) {
            return jsonResponse(
              {
                error:
                  "Letter not found.",
              },
              404
            );
          }

          return jsonResponse(
            data
          );
        }


        if (
          method === "DELETE"
        ) {
          const deleted =
            await deleteRow(
              env,
              "letters",
              id
            );

          if (!deleted) {
            return jsonResponse(
              {
                error:
                  "Letter not found.",
              },
              404
            );
          }

          return jsonResponse({
            success: true,
          });
        }
      }


      /* ======================================================================
         UNKNOWN ROUTE
      ====================================================================== */

      return jsonResponse(
        {
          error:
            "Route not found.",
        },
        404
      );

    } catch (error) {
      console.error(
        "AZAIN D1 API error:",
        error
      );

      return jsonResponse(
        {
          error:
            error?.message ||
            "Internal server error.",
        },
        500
      );
    }
  },
};