import { useState } from "react";
import { useNavigate } from "react-router-dom";

import AdminLayout from "../../components/admin/AdminLayout";
import MemoryForm from "../../components/admin/MemoryForm";

import { createTimelineMemory } from "../../services/timelineService";
import {
  uploadFile,
  uploadMultiple,
} from "../../services/storageService";

export default function NewMemory() {
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

      /*
      ------------------------------------
      Upload Cover
      ------------------------------------
      */

      if (formData.coverImage) {
        coverImageUrl = await uploadFile(
          formData.coverImage,
          folderName
        );
      }

      /*
      ------------------------------------
      Upload Gallery
      ------------------------------------
      */

      if (
        formData.galleryImages &&
        formData.galleryImages.length > 0
      ) {
        galleryUrls = await uploadMultiple(
          formData.galleryImages,
          folderName
        );
      }

      /*
      ------------------------------------
      Save Database
      ------------------------------------
      */

      await createTimelineMemory({
        title: formData.title,
        slug: folderName,

        description: formData.description,
        story: formData.story,

        date: formData.date,
        age: formData.age,

        category: formData.category,

        cover_image: coverImageUrl,

        gallery_images: galleryUrls,

        highlights: formData.highlights,

        favorite: formData.favorite,

        published: formData.published,

        folder_name: folderName,
      });

      alert("Memory created successfully!");

      navigate("/admin/timeline");

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
          onClick={() => navigate("/admin/timeline")}
          className="mb-8 text-[#8FAE7A] font-semibold hover:underline"
        >
          ← Back to Timeline
        </button>

        <h1
          className="text-6xl mb-2"
          style={{
            fontFamily: "Baloo 2",
            color: "#5A5148",
          }}
        >
          Add New Memory
        </h1>

        <p className="text-gray-500 mb-10">
          Create a new timeline memory.
        </p>

        {saving && (
          <div className="mb-6 rounded-xl bg-[#EEF7E8] p-4 text-[#5A5148] font-semibold">
            Uploading images...
          </div>
        )}

        <MemoryForm
          onSubmit={handleSave}
          submitText="Create Memory"
        />

      </div>
    </AdminLayout>
  );
}