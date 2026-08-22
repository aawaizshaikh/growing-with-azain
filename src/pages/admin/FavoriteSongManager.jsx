import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import AdminLayout from "../../components/admin/AdminLayout";
import MemoryCard from "../../components/admin/MemoryCard";

import {
  getFavoriteSongs,
  deleteFavoriteSong,
} from "../../services/favoriteSongService";

import {
  deleteFile,
} from "../../services/storageService";

export default function FavoriteSongManager() {
  const navigate = useNavigate();

  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadSongs();
  }, []);

  async function loadSongs() {
    try {
      setLoading(true);

      const data = await getFavoriteSongs();

      setSongs(data || []);
    } catch (err) {
      console.error(err);
      alert("Unable to load favourite songs.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(song) {
    const confirmed = window.confirm(
      `Delete "${song.title}"?`
    );

    if (!confirmed) return;

    try {
      /*
      ============================================================
      COLLECT ALL R2 MEDIA BELONGING TO THIS SONG
      ============================================================
      */

      const mediaToDelete = [];

      if (song.cover_image) {
        mediaToDelete.push(song.cover_image);
      }

      if (
        Array.isArray(song.gallery_images)
      ) {
        mediaToDelete.push(
          ...song.gallery_images
        );
      }

      /*
      ============================================================
      DELETE ALL R2 MEDIA FIRST
      ============================================================
      */

      for (const mediaUrl of mediaToDelete) {
        await deleteFile(
          mediaUrl,
          "timeline"
        );
      }

      /*
      ============================================================
      DELETE D1 RECORD ONLY AFTER R2 DELETION SUCCEEDS
      ============================================================
      */

      await deleteFavoriteSong(song.id);

      /*
      ============================================================
      UPDATE ADMIN UI
      ============================================================
      */

      setSongs((prev) =>
        prev.filter((s) => s.id !== song.id)
      );

      alert("Favourite Song Deleted");
    } catch (err) {
      console.error(err);

      /*
      ------------------------------------------------------------
      IMPORTANT:
      If R2 deletion fails, execution never reaches
      deleteFavoriteSong(), so the D1 record remains intact.
      ------------------------------------------------------------
      */

      alert(
        err.message ||
        "Failed to delete Favourite Song."
      );
    }
  }

  function handleEdit(song) {
    navigate(`/admin/songs/edit/${song.id}`);
  }

  const filtered = songs.filter((song) => {
    const q = search.toLowerCase();

    return (
      song.title?.toLowerCase().includes(q) ||
      song.artist?.toLowerCase().includes(q) ||
      song.category?.toLowerCase().includes(q) ||
      song.story?.toLowerCase().includes(q)
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
            Favourite Songs
          </h1>

          <p className="text-gray-500 mt-2">
            {filtered.length} Songs
          </p>

        </div>

        <button
          onClick={() => navigate("/admin/songs/new")}
          className="bg-[#8FAE7A] text-white rounded-full px-8 py-4 font-semibold"
        >
          + Add Song
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

          {filtered.map((song) => (

            <MemoryCard
              key={song.id}
              memory={song}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />

          ))}

        </div>

      )}

    </AdminLayout>
  );
}