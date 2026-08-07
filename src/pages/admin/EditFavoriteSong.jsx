import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import AdminLayout from "../../components/admin/AdminLayout";
import FavoriteSongForm from "../../components/admin/FavoriteSongForm";

import {
  getFavoriteSong,
  updateFavoriteSong,
} from "../../services/favoriteSongService";

import {
  uploadFile,
  uploadMultiple,
} from "../../services/storageService";

export default function EditFavoriteSong() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSong();
  }, []);

  async function loadSong() {
    try {
      const data = await getFavoriteSong(id);
      setSong(data);
    } catch (err) {
      console.error(err);
      alert("Failed to load favourite song.");
      navigate("/admin/songs");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(formData) {
    if (saving) return;

    try {
      setSaving(true);

      const folderName =
        song.folder_name ||
        formData.slug ||
        formData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");

      let coverImage = song.cover_image;
      let galleryImages = song.gallery_images || [];

      // Upload new cover image
      if (formData.coverImage) {
        coverImage = await uploadFile(
          formData.coverImage,
          folderName
        );
      }

      // Upload new gallery images
      if (
        formData.galleryImages &&
        formData.galleryImages.length > 0
      ) {
        const uploaded = await uploadMultiple(
          formData.galleryImages,
          folderName
        );

        galleryImages = [
          ...galleryImages,
          ...uploaded,
        ];
      }

      await updateFavoriteSong(id, {
        title: formData.title,
        artist: formData.artist,
        month: formData.month,
        age: formData.age,

        slug: formData.slug,

        category: "Favourite Song",

        story: formData.story,

        cover_image: coverImage,

        gallery_images: galleryImages,

        video_url: formData.videoUrl,

        highlights: formData.highlights,

        display_order: Number(
          formData.displayOrder || 0
        ),

        favorite: formData.favorite,

        published: formData.published,

        folder_name: folderName,
      });

      alert("Favourite Song updated successfully!");

      navigate("/admin/songs");

    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-20 text-3xl">
          Loading Favourite Song...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">

        <button
          onClick={() => navigate("/admin/songs")}
          className="mb-8 text-[#8FAE7A] font-semibold hover:underline"
        >
          ← Back to Favourite Songs
        </button>

        <h1
          className="text-6xl mb-2"
          style={{
            fontFamily: "Baloo 2",
            color: "#5A5148",
          }}
        >
          Edit Favourite Song
        </h1>

        <p className="text-gray-500 mb-10">
          Update your favourite song.
        </p>

        {saving && (
          <div className="mb-6 rounded-xl bg-[#EEF7E8] p-4">
            Saving changes...
          </div>
        )}

        <FavoriteSongForm
          initialData={song}
          onSubmit={handleUpdate}
          submitText="Save Changes"
        />

      </div>
    </AdminLayout>
  );
}