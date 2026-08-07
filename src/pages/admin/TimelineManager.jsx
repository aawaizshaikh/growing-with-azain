import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import AdminLayout from "../../components/admin/AdminLayout";
import MemoryCard from "../../components/admin/MemoryCard";

import {
  getTimelineMemories,
  deleteTimelineMemory,
} from "../../services/timelineService";

export default function TimelineManager() {
  const navigate = useNavigate();

  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadMemories();
  }, []);

  async function loadMemories() {
    try {
      setLoading(true);

      const data = await getTimelineMemories();

      setMemories(data || []);
    } catch (err) {
      console.error(err);
      alert("Unable to load memories.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(memory) {
    const confirmed = window.confirm(
      `Delete "${memory.title}"?`
    );

    if (!confirmed) return;

    try {
      await deleteTimelineMemory(memory.id);

      setMemories((prev) =>
        prev.filter((m) => m.id !== memory.id)
      );

      alert("Memory Deleted");

    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  }

  function handleEdit(memory) {
    navigate(`/admin/timeline/edit/${memory.id}`);
  }

  const filtered = memories.filter((memory) => {
    const q = search.toLowerCase();

    return (
      memory.title?.toLowerCase().includes(q) ||
      memory.category?.toLowerCase().includes(q) ||
      memory.description?.toLowerCase().includes(q)
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
            Timeline
          </h1>

          <p className="text-gray-500 mt-2">
            {filtered.length} Memories
          </p>

        </div>

        <button
          onClick={() => navigate("/admin/timeline/new")}
          className="bg-[#8FAE7A] text-white rounded-full px-8 py-4 font-semibold"
        >
          + Add Memory
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

          {filtered.map((memory) => (

            <MemoryCard
              key={memory.id}
              memory={memory}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />

          ))}

        </div>

      )}

    </AdminLayout>
  );
}