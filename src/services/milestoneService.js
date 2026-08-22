const API_BASE_URL =
  "https://azain-api-worker.aaawaizshaikh.workers.dev";

/* ---------------- ADMIN AUTH ---------------- */

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

/* ---------------- GET ALL ---------------- */

export async function getMilestones() {
  const response = await fetch(
    `${API_BASE_URL}/milestones`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch milestones."
    );
  }

  return await response.json();
}

/* ---------------- GET ONE ---------------- */

export async function getMilestone(id) {
  const response = await fetch(
    `${API_BASE_URL}/milestones/${encodeURIComponent(id)}`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch milestone."
    );
  }

  return await response.json();
}

/* ---------------- CREATE ---------------- */

export async function createMilestone(
  milestone
) {
  const payload = {
    ...milestone,
    id:
      milestone.id ||
      crypto.randomUUID(),
  };

  const response = await fetch(
    `${API_BASE_URL}/milestones`,
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
    const errorData =
      await response
        .json()
        .catch(() => null);

    throw new Error(
      errorData?.error ||
        "Failed to create milestone."
    );
  }

  return await response.json();
}

/* ---------------- UPDATE ---------------- */

export async function updateMilestone(
  id,
  milestone
) {
  const response = await fetch(
    `${API_BASE_URL}/milestones/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAdminAuthHeaders(),
      },
      body: JSON.stringify(milestone),
    }
  );

  if (!response.ok) {
    const errorData =
      await response
        .json()
        .catch(() => null);

    throw new Error(
      errorData?.error ||
        "Failed to update milestone."
    );
  }

  return await response.json();
}

/* ---------------- DELETE ---------------- */

export async function deleteMilestone(
  id
) {
  const response = await fetch(
    `${API_BASE_URL}/milestones/${encodeURIComponent(id)}`,
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
        .catch(() => null);

    throw new Error(
      errorData?.error ||
        "Failed to delete milestone."
    );
  }

  return true;
}