import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import AdminLayout from "../../components/admin/AdminLayout";
import MemoryCard from "../../components/admin/MemoryCard";

import {
  getMilestones,
  deleteMilestone,
} from "../../services/milestoneService";

export default function MilestoneManager() {
  const navigate = useNavigate();

  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadMilestones();
  }, []);

  async function loadMilestones() {
    try {
      setLoading(true);

      const data = await getMilestones();

      setMilestones(data || []);
    } catch (err) {
      console.error(err);
      alert("Unable to load milestones.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(milestone) {
    const confirmed = window.confirm(
      `Delete "${milestone.title}"?`
    );

    if (!confirmed) return;

    try {
      await deleteMilestone(milestone.id);

      setMilestones((prev) =>
        prev.filter((m) => m.id !== milestone.id)
      );

      alert("Milestone Deleted");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  }

  function handleEdit(milestone) {
    navigate(`/admin/milestones/edit/${milestone.id}`);
  }

  const filtered = milestones.filter((milestone) => {
    const q = search.toLowerCase();

    return (
      milestone.title?.toLowerCase().includes(q) ||
      milestone.category?.toLowerCase().includes(q) ||
      milestone.description?.toLowerCase().includes(q)
    );
  });

  return (
    <AdminLayout>

      <div className="flex justify-between items-center mb-10">

        <div>

          <h1
            className="text-6xl"
            style={{
              fontFamily: "Baloo 2",
              color: "#5A5148",
            }}
          >
            Milestones
          </h1>

          <p className="text-gray-500 mt-2">
            {filtered.length} Milestones
          </p>

        </div>

        <button
          onClick={() => navigate("/admin/milestones/new")}
          className="bg-[#8FAE7A] text-white rounded-full px-8 py-4 font-semibold"
        >
          + Add Milestone
        </button>

      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search..."
        className="w-full rounded-2xl border px-5 py-4 mb-10"
      />

      {loading ? (

        <div className="text-center py-24">
          Loading...
        </div>

      ) : (

        <div className="grid lg:grid-cols-2 gap-8">

          {filtered.map((milestone) => (

            <MemoryCard
              key={milestone.id}
              memory={milestone}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />

          ))}

        </div>

      )}

    </AdminLayout>
  );
}