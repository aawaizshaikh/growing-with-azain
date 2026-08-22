const API_BASE_URL =
  "https://azain-api-worker.aaawaizshaikh.workers.dev";

/* ===========================================================================

   ADMIN AUTH

=========================================================================== */

function getAdminAuthHeaders() {
  const token = localStorage.getItem(
    "azain_admin_token"
  );

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}


// ============================================================================
// GET PUBLISHED LETTERS
//
// Used by the public /letters page.
//
// Only published letters are returned.
// ============================================================================

export async function getPublishedLetters() {
  const response =
    await fetch(
      `${API_BASE_URL}/letters?published=true`
    );

  if (!response.ok) {
    const errorData =
      await response
        .json()
        .catch(
          () => null
        );

    throw new Error(
      errorData?.error ||
        "Failed to fetch published letters."
    );
  }

  return (
    await response.json()
  ) || [];
}


// ============================================================================
// GET ALL LETTERS
//
// Used by the Admin Letters Manager.
//
// Unlike getPublishedLetters(), this returns drafts as well.
// ============================================================================

export async function getLetters() {
  const response =
    await fetch(
      `${API_BASE_URL}/letters`,
      {
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

    throw new Error(
      errorData?.error ||
        "Failed to fetch letters."
    );
  }

  return (
    await response.json()
  ) || [];
}


// ============================================================================
// GET LETTER BY ID
//
// Used by:
// /admin/letters/edit/:id
// ============================================================================

export async function getLetterById(id) {
  if (!id) {
    throw new Error(
      "Letter ID is required."
    );
  }

  const response =
    await fetch(
      `${API_BASE_URL}/letters/${encodeURIComponent(
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

    throw new Error(
      errorData?.error ||
        "Letter not found."
    );
  }

  const data =
    await response.json();

  if (!data) {
    throw new Error(
      "Letter not found."
    );
  }

  return data;
}


// ============================================================================
// GET LETTER BY SLUG
//
// Used by the public:
// /letters/:slug
//
// Only published letters are accessible publicly.
// ============================================================================

export async function getLetterBySlug(slug) {
  if (!slug) {
    throw new Error(
      "Letter slug is required."
    );
  }

  const response =
    await fetch(
      `${API_BASE_URL}/letters/slug/${encodeURIComponent(
        slug
      )}`
    );

  if (!response.ok) {
    const errorData =
      await response
        .json()
        .catch(
          () => null
        );

    throw new Error(
      errorData?.error ||
        "Published letter not found."
    );
  }

  const data =
    await response.json();

  if (!data) {
    throw new Error(
      "Published letter not found."
    );
  }

  return data;
}


// ============================================================================
// CREATE LETTER
//
// Used by:
// /admin/letters/new
// ============================================================================

export async function createLetter(letter) {
  if (!letter) {
    throw new Error(
      "Letter data is required."
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
      letter.letter_content || "",

    date:
      letter.date || null,

    age:
      letter.age || null,

    signature:
      letter.signature || null,

    published:
      Boolean(
        letter.published
      ),

    display_order:
      Number(
        letter.display_order
      ) || 0,
  };

  const response =
    await fetch(
      `${API_BASE_URL}/letters`,
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

    throw new Error(
      errorData?.error ||
        "Failed to create letter."
    );
  }

  return await response.json();
}


// ============================================================================
// UPDATE LETTER
//
// Used by:
// /admin/letters/edit/:id
// ============================================================================

export async function updateLetter(
  id,
  letter
) {
  if (!id) {
    throw new Error(
      "Letter ID is required."
    );
  }

  if (!letter) {
    throw new Error(
      "Letter data is required."
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
      letter.letter_content || "",

    date:
      letter.date || null,

    age:
      letter.age || null,

    signature:
      letter.signature || null,

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

  const response =
    await fetch(
      `${API_BASE_URL}/letters/${encodeURIComponent(
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

    throw new Error(
      errorData?.error ||
        "Failed to update letter."
    );
  }

  return await response.json();
}


// ============================================================================
// DELETE LETTER
//
// Used by:
// Admin Letters Manager
// Admin Edit Letter
// ============================================================================

export async function deleteLetter(id) {
  if (!id) {
    throw new Error(
      "Letter ID is required."
    );
  }

  const response =
    await fetch(
      `${API_BASE_URL}/letters/${encodeURIComponent(
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

    throw new Error(
      errorData?.error ||
        "Failed to delete letter."
    );
  }

  return true;
}


// ============================================================================
// TOGGLE PUBLISHED
//
// Used by the Letters Manager.
// ============================================================================

export async function toggleLetterPublished(
  id,
  published
) {
  if (!id) {
    throw new Error(
      "Letter ID is required."
    );
  }

  const response =
    await fetch(
      `${API_BASE_URL}/letters/${encodeURIComponent(
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

    throw new Error(
      errorData?.error ||
        "Failed to update letter published status."
    );
  }

  return await response.json();
}