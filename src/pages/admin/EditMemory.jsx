import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import AdminLayout from "../../components/admin/AdminLayout";
import MemoryForm from "../../components/admin/MemoryForm";

import {
  getTimelineMemory,
  updateTimelineMemory,
} from "../../services/timelineService";

import {
  uploadFile,
  uploadMultiple,
} from "../../services/storageService";

export default function EditMemory() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [memory, setMemory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadMemory();
  }, []);

  async function loadMemory() {
    try {
      const data = await getTimelineMemory(id);
      setMemory(data);
    } catch (err) {
      console.error(err);
      alert("Failed to load memory.");
      navigate("/admin/timeline");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(formData) {
    if (saving) return;

    try {
      setSaving(true);

      const folderName =
        memory.folder_name ||
        formData.slug ||
        formData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");

      let coverImage = memory.cover_image;
      let galleryImages = memory.gallery_images || [];

      /*
      ==============================
      Upload Cover
      ==============================
      */

      if (formData.coverImage) {
        coverImage = await uploadFile(
          formData.coverImage,
          folderName
        );
      }

      /*
      ==============================
      Upload Gallery
      ==============================
      */

      if (
        formData.galleryImages &&
        formData.galleryImages.length > 0
      ) {
        const uploaded =
          await uploadMultiple(
            formData.galleryImages,
            folderName
          );

        galleryImages = [
          ...galleryImages,
          ...uploaded,
        ];
      }

      /*
      ==============================
      Update Database
      ==============================
      */

      await updateTimelineMemory(id, {
        title: formData.title,

        slug: formData.slug,

        date: formData.date,

        age: formData.age,

        // Chapter
        category: formData.category,

        // Memory Type
        memory_type: formData.memory_type,

        description: formData.description,

        story: formData.story,

        cover_image: coverImage,

        gallery_images: galleryImages,

        highlights: formData.highlights,

        favorite: formData.favorite,

        published: formData.published,

        folder_name: folderName,
      });

      alert("Memory updated successfully!");

      navigate("/admin/timeline");
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
        <div className="p-10">
          Loading Memory...
        </div>
      </AdminLayout>
    );
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
          Edit Memory
        </h1>

        <p className="text-gray-500 mb-10">
          Update your timeline memory.
        </p>

        {saving && (
          <div className="mb-6 rounded-xl bg-[#EEF7E8] p-4 text-[#5A5148] font-semibold">
            Saving changes...
          </div>
        )}

        <MemoryForm
          initialData={memory}
          onSubmit={handleUpdate}
          submitText="Save Changes"
        />

      </div>

    </AdminLayout>
  );
}