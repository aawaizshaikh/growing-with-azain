import { useState } from "react";
import { useNavigate } from "react-router-dom";

import AdminLayout from "../../components/admin/AdminLayout";
import FavoriteSongForm from "../../components/admin/FavoriteSongForm";

import { createFavoriteSong } from "../../services/favoriteSongService";

import {
  uploadFile,
  uploadMultiple,
} from "../../services/storageService";

export default function NewFavoriteSong() {
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);

  async function handleSave(formData) {
    if (saving) return;

    try {
      setSaving(true);

      const folderName =
        formData.slug ||
        formData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");

      let coverImageUrl = "";
      let galleryUrls = [];

      /* ===========================
         Upload Cover Image
      ============================ */

      if (formData.coverImage) {
        coverImageUrl = await uploadFile(
          formData.coverImage,
          folderName
        );
      }

      /* ===========================
         Upload Gallery Images
      ============================ */

      if (
        formData.galleryImages &&
        formData.galleryImages.length > 0
      ) {
        galleryUrls = await uploadMultiple(
          formData.galleryImages,
          folderName
        );
      }

      /* ===========================
         Save Song
      ============================ */

      await createFavoriteSong({
        title: formData.title,
        artist: formData.artist,
        month: formData.month,
        age: formData.age,

        slug: folderName,

        category: "Favourite Song",

        cover_image: coverImageUrl,

        gallery_images: galleryUrls,

        video_url: formData.videoUrl,

        story: formData.story,

        highlights: formData.highlights,

        display_order: Number(
          formData.displayOrder || 0
        ),

        favorite: formData.favorite,
      });

      alert("Favourite Song created successfully!");

      navigate("/admin/songs");

    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setSaving(false);
    }
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
          Add Favourite Song
        </h1>

        <p className="text-gray-500 mb-10">
          Create a new favourite song.
        </p>

        {saving && (
          <div className="mb-6 rounded-xl bg-[#EEF7E8] p-4 text-[#5A5148] font-semibold">
            Uploading images...
          </div>
        )}

        <FavoriteSongForm
          onSubmit={handleSave}
          submitText="Create Favourite Song"
        />

      </div>

    </AdminLayout>
  );
}