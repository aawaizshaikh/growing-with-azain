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

/* ===========================================================================

   GET ALL SONGS

=========================================================================== */

export async function getFavoriteSongs() {
  const response = await fetch(
    `${API_BASE_URL}/favorite-songs`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch favorite songs."
    );
  }

  return (await response.json()) || [];
}

/* ===========================================================================

   GET SINGLE SONG

=========================================================================== */

export async function getFavoriteSong(id) {
  const response = await fetch(
    `${API_BASE_URL}/favorite-songs/${encodeURIComponent(id)}`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch favorite song."
    );
  }

  return await response.json();
}

/* ===========================================================================

   GET SONG BY SLUG

=========================================================================== */

export async function getFavoriteSongBySlug(
  slug
) {
  const response = await fetch(
    `${API_BASE_URL}/favorite-songs/slug/${encodeURIComponent(slug)}`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch favorite song by slug."
    );
  }

  return await response.json();
}

/* ===========================================================================

   CREATE SONG

=========================================================================== */

export async function createFavoriteSong(
  song
) {
  const payload = {
    ...song,
    id:
      song.id ||
      crypto.randomUUID(),
  };

  const response = await fetch(
    `${API_BASE_URL}/favorite-songs`,
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
      "Failed to create favorite song."
    );
  }

  return await response.json();
}

/* ===========================================================================

   UPDATE SONG

=========================================================================== */

export async function updateFavoriteSong(
  id,
  song
) {
  const response = await fetch(
    `${API_BASE_URL}/favorite-songs/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAdminAuthHeaders(),
      },
      body: JSON.stringify(song),
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to update favorite song."
    );
  }

  return await response.json();
}

/* ===========================================================================

   DELETE SONG

=========================================================================== */

export async function deleteFavoriteSong(
  id
) {
  const response = await fetch(
    `${API_BASE_URL}/favorite-songs/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      headers: {
        ...getAdminAuthHeaders(),
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to delete favorite song."
    );
  }

  return true;
}