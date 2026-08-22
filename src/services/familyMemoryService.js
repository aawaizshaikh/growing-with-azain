const API_BASE_URL =
  "https://azain-api-worker.aaawaizshaikh.workers.dev";

/*
===============================================================================
FAMILY MEMORY SERVICE
===============================================================================

Cloudflare API:

    /family-memories

Family member identity is NOT stored here.

The family member itself remains hardcoded in:

    src/data/familyMembers.js

This service manages only the memories.

Expected database fields:

    id
    member_key
    media_type
    media_url
    caption
    display_order
    published

Supported media types:

    photo
    video

===============================================================================
*/

const TABLE_NAME = "family-memories";

/*
===============================================================================
ADMIN AUTH
===============================================================================
*/

function getAdminAuthHeaders() {
  const token = localStorage.getItem(
    "azain_admin_token"
  );

  if (!token) {
    throw new Error(
      "Admin authentication token is missing. Please log in again."
    );
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

/*
===============================================================================
VALID MEMBER KEYS
===============================================================================

These are intentionally kept here as a defensive database-layer validation.

They must remain synchronized with familyMembers.js.

===============================================================================
*/

const VALID_MEMBER_KEYS = [
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

/*
===============================================================================
VALID MEDIA TYPES
===============================================================================
*/

const VALID_MEDIA_TYPES = [
  "photo",
  "video",
];

/*
===============================================================================
VALIDATE MEMBER KEY
===============================================================================
*/

function normalizeMemberKey(
  memberKey
) {
  if (!memberKey) {
    return "";
  }

  return String(memberKey)
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
    !VALID_MEMBER_KEYS.includes(
      normalized
    )
  ) {
    throw new Error(
      "Invalid family member."
    );
  }

  return normalized;
}

/*
===============================================================================
NORMALIZE MEDIA TYPE
===============================================================================
*/

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
    !VALID_MEDIA_TYPES.includes(
      normalized
    )
  ) {
    throw new Error(
      "Invalid family memory media type."
    );
  }

  return normalized;
}

/*
===============================================================================
NORMALIZE MEMORY
===============================================================================

Keeps the data returned to React consistent.

===============================================================================
*/

function normalizeMemory(
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

/*
===============================================================================
GET PUBLIC FAMILY MEMORIES
===============================================================================

Used by:

    FamilyMemberMemories.jsx

IMPORTANT:

Only published memories are returned.

The member filter is mandatory.

Example:

    getFamilyMemories("dada")

results in:

    family_memories
        WHERE member_key = "dada"
        AND published = true

===============================================================================
*/

export async function getFamilyMemories(
  memberKey
) {
  const normalizedMemberKey =
    validateMemberKey(
      memberKey
    );

  const response =
    await fetch(
      `${API_BASE_URL}/${TABLE_NAME}?member_key=${encodeURIComponent(
        normalizedMemberKey
      )}`
    );

  if (!response.ok) {
    const errorData =
      await response
        .json()
        .catch(
          () => null
        );

    const error =
      new Error(
        errorData?.error ||
          "Failed to fetch family memories."
      );

    console.error(
      "getFamilyMemories error:",
      error
    );

    throw error;
  }

  const data =
    await response.json();

  return (
    data || []
  ).map(
    normalizeMemory
  );
}

/*
===============================================================================
GET ALL FAMILY MEMORIES — ADMIN
===============================================================================

Unlike the public function, this returns BOTH:

    published
    unpublished

memories.

The admin therefore has access to drafts.

Optional:

    getAllFamilyMemories()

    getAllFamilyMemories({
      includeUnpublished: false
    })

===============================================================================
*/

export async function getAllFamilyMemories(
  options = {}
) {
  const {
    includeUnpublished = true,
  } = options;

  const query =
    includeUnpublished
      ? "?include_unpublished=true"
      : "?include_unpublished=false";

  const response =
    await fetch(
      `${API_BASE_URL}/${TABLE_NAME}${query}`,
      {
        headers: includeUnpublished
          ? {
              ...getAdminAuthHeaders(),
            }
          : {},
      }
    );

  if (!response.ok) {
    const errorData =
      await response
        .json()
        .catch(
          () => null
        );

    const error =
      new Error(
        errorData?.error ||
          "Failed to fetch all family memories."
      );

    console.error(
      "getAllFamilyMemories error:",
      error
    );

    throw error;
  }

  const data =
    await response.json();

  return (
    data || []
  ).map(
    normalizeMemory
  );
}

/*
===============================================================================
GET ONE FAMILY MEMORY
===============================================================================

Used by the Edit Family Memory page.

===============================================================================
*/

export async function getFamilyMemoryById(
  id
) {
  if (!id) {
    throw new Error(
      "Family memory ID is required."
    );
  }

  const response =
    await fetch(
      `${API_BASE_URL}/${TABLE_NAME}/${encodeURIComponent(
        id
      )}`
    );

  if (!response.ok) {
    const errorData =
      await response
        .json()
        .catch(
          () => null
        );

    const error =
      new Error(
        errorData?.error ||
          "Failed to fetch family memory."
      );

    console.error(
      "getFamilyMemoryById error:",
      error
    );

    throw error;
  }

  const data =
    await response.json();

  return normalizeMemory(
    data
  );
}

/*
===============================================================================
CREATE FAMILY MEMORY
===============================================================================

Used by:

    NewFamilyMemory.jsx

===============================================================================
*/

export async function createFamilyMemory(
  memory
) {
  if (!memory) {
    throw new Error(
      "Family memory data is required."
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

  if (!memory.media_url) {
    throw new Error(
      "Family memory media URL is required."
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

  const response =
    await fetch(
      `${API_BASE_URL}/${TABLE_NAME}`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          ...getAdminAuthHeaders(),
        },

        body:
          JSON.stringify(
            payload
          ),
      }
    );

  if (!response.ok) {
    const errorData =
      await response
        .json()
        .catch(
          () => null
        );

    const error =
      new Error(
        errorData?.error ||
          "Failed to create family memory."
      );

    console.error(
      "createFamilyMemory error:",
      error
    );

    throw error;
  }

  const data =
    await response.json();

  return normalizeMemory(
    data
  );
}

/*
===============================================================================
UPDATE FAMILY MEMORY
===============================================================================

Used by:

    EditFamilyMemory.jsx

===============================================================================
*/

export async function updateFamilyMemory(
  id,
  memory
) {
  if (!id) {
    throw new Error(
      "Family memory ID is required."
    );
  }

  if (!memory) {
    throw new Error(
      "Family memory data is required."
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

  if (!memory.media_url) {
    throw new Error(
      "Family memory media URL is required."
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

  const response =
    await fetch(
      `${API_BASE_URL}/${TABLE_NAME}/${encodeURIComponent(
        id
      )}`,
      {
        method: "PUT",

        headers: {
          "Content-Type":
            "application/json",

          ...getAdminAuthHeaders(),
        },

        body:
          JSON.stringify(
            payload
          ),
      }
    );

  if (!response.ok) {
    const errorData =
      await response
        .json()
        .catch(
          () => null
        );

    const error =
      new Error(
        errorData?.error ||
          "Failed to update family memory."
      );

    console.error(
      "updateFamilyMemory error:",
      error
    );

    throw error;
  }

  const data =
    await response.json();

  return normalizeMemory(
    data
  );
}

/*
===============================================================================
DELETE FAMILY MEMORY
===============================================================================

This removes the DATABASE RECORD.

The media file itself is not automatically deleted from Storage here because
the existing project's storage-service contract has not been established as a
generic delete API.

That prevents us from inventing a Storage deletion convention that could
accidentally delete the wrong object.

===============================================================================
*/

export async function deleteFamilyMemory(
  id
) {
  if (!id) {
    throw new Error(
      "Family memory ID is required."
    );
  }

  const response =
    await fetch(
      `${API_BASE_URL}/${TABLE_NAME}/${encodeURIComponent(
        id
      )}`,
      {
        method: "DELETE",

        headers: {
          ...getAdminAuthHeaders(),
        },
      }
    );

  if (!response.ok) {
    const errorData =
      await response
        .json()
        .catch(
          () => null
        );

    const error =
      new Error(
        errorData?.error ||
          "Failed to delete family memory."
      );

    console.error(
      "deleteFamilyMemory error:",
      error
    );

    throw error;
  }

  return true;
}

/*
===============================================================================
PUBLISHED TOGGLE
===============================================================================

Convenience function for the admin.

===============================================================================
*/

export async function setFamilyMemoryPublished(
  id,
  published
) {
  if (!id) {
    throw new Error(
      "Family memory ID is required."
    );
  }

  const response =
    await fetch(
      `${API_BASE_URL}/${TABLE_NAME}/${encodeURIComponent(
        id
      )}/published`,
      {
        method: "PUT",

        headers: {
          "Content-Type":
            "application/json",

          ...getAdminAuthHeaders(),
        },

        body:
          JSON.stringify({
            published:
              Boolean(
                published
              ),
          }),
      }
    );

  if (!response.ok) {
    const errorData =
      await response
        .json()
        .catch(
          () => null
        );

    const error =
      new Error(
        errorData?.error ||
          "Failed to update family memory published status."
      );

    console.error(
      "setFamilyMemoryPublished error:",
      error
    );

    throw error;
  }

  const data =
    await response.json();

  return normalizeMemory(
    data
  );
}

/*
===============================================================================
FILTER VALID FAMILY MEMORIES
===============================================================================

Used by the public child page as a final defensive validation layer.

It removes malformed records so one bad database row cannot break the visual
memory scene.

===============================================================================
*/

export function filterValidFamilyMemories(
  memories
) {
  if (
    !Array.isArray(
      memories
    )
  ) {
    return [];
  }

  return memories
    .map(
      normalizeMemory
    )
    .filter(
      (memory) => {
        if (!memory) {
          return false;
        }

        if (!memory.id) {
          return false;
        }

        if (
          !VALID_MEMBER_KEYS.includes(
            memory.member_key
          )
        ) {
          return false;
        }

        if (
          !VALID_MEDIA_TYPES.includes(
            memory.media_type
          )
        ) {
          return false;
        }

        if (
          !memory.media_url
        ) {
          return false;
        }

        return true;
      }
    );
}

/*
===============================================================================
GET MEDIA TYPE
===============================================================================

Used by the public child page.

===============================================================================
*/

export function getFamilyMemoryMediaType(
  memory
) {
  if (!memory) {
    return "photo";
  }

  if (
    memory.media_type ===
    "video"
  ) {
    return "video";
  }

  return "photo";
}

/*
===============================================================================
EXPORT VALID MEMBER KEYS
===============================================================================

Useful if another admin component needs the fixed keys without importing the
family data file.

===============================================================================
*/

export const familyMemoryMemberKeys = [
  ...VALID_MEMBER_KEYS,
];

export default {
  getFamilyMemories,
  getAllFamilyMemories,
  getFamilyMemoryById,
  createFamilyMemory,
  updateFamilyMemory,
  deleteFamilyMemory,
  setFamilyMemoryPublished,
  filterValidFamilyMemories,
  getFamilyMemoryMediaType,
};