const API_BASE_URL =
  "https://azain-api-worker.aaawaizshaikh.workers.dev";

/* ===========================================================================
   ADMIN AUTH TOKEN
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

/* ===========================================================================

   GET ALL MEMORIES

=========================================================================== */

export async function getTimelineMemories() {
  const response = await fetch(
    `${API_BASE_URL}/timeline`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch timeline memories."
    );
  }

  return (await response.json()) || [];
}

/* ===========================================================================

   GET SINGLE MEMORY

=========================================================================== */

export async function getTimelineMemory(id) {
  const response = await fetch(
    `${API_BASE_URL}/timeline/${encodeURIComponent(id)}`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch timeline memory."
    );
  }

  return await response.json();
}

/* ===========================================================================

   GET MEMORY BY SLUG

=========================================================================== */

export async function getTimelineMemoryBySlug(
  slug
) {
  const response = await fetch(
    `${API_BASE_URL}/timeline/slug/${encodeURIComponent(slug)}`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch timeline memory by slug."
    );
  }

  return await response.json();
}

/* ===========================================================================

   CREATE MEMORY

=========================================================================== */

export async function createTimelineMemory(
  memory
) {
  const payload = {
    ...memory,
    id:
      memory.id ||
      crypto.randomUUID(),
  };

  const response = await fetch(
    `${API_BASE_URL}/timeline`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAdminAuthHeaders(),
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to create timeline memory."
    );
  }

  return await response.json();
}

/* ===========================================================================

   UPDATE MEMORY

=========================================================================== */

export async function updateTimelineMemory(
  id,
  memory
) {
  const response = await fetch(
    `${API_BASE_URL}/timeline/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAdminAuthHeaders(),
      },
      body: JSON.stringify(memory),
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to update timeline memory."
    );
  }

  return await response.json();
}

/* ===========================================================================

   DELETE MEMORY

=========================================================================== */

export async function deleteTimelineMemory(
  id
) {
  const response = await fetch(
    `${API_BASE_URL}/timeline/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      headers: {
        ...getAdminAuthHeaders(),
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to delete timeline memory."
    );
  }

  return true;
}