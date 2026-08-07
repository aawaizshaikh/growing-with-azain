import { useState } from "react";
import { useNavigate } from "react-router-dom";

import AdminLayout from "../../components/admin/AdminLayout";
import MemoryForm from "../../components/admin/MemoryForm";

import {
  createMilestone,
} from "../../services/milestoneService";

import {
  uploadFile,
  uploadMultiple,
} from "../../services/storageService";

export default function NewMilestone() {
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);

  async function handleCreate(formData) {
    try {
      setSaving(true);

      let coverImage = "";

      if (formData.coverImage) {
        coverImage = await uploadFile(
          formData.coverImage,
          "milestones"
        );
      }

      let gallery = [];

      if (formData.galleryImages.length) {
        gallery = await uploadMultiple(
          formData.galleryImages,
          "milestones"
        );
      }

      await createMilestone({
        title: formData.title,
        slug: formData.slug,
        date: formData.date,
        age: formData.age,
        category: formData.category,
        description: formData.description,
        story: formData.story,
        cover_image: coverImage,
        gallery,
        highlights: formData.highlights,
        favorite: formData.favorite,
        published: formData.published,
      });

      alert("Milestone Created!");

      navigate("/admin/milestones");

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
          onClick={() => navigate("/admin/milestones")}
          className="mb-8 text-[#8FAE7A] font-semibold hover:underline"
        >
          ← Back to Milestones
        </button>

        <h1
          className="text-6xl mb-2"
          style={{
            fontFamily: "Baloo 2",
            color: "#5A5148",
          }}
        >
          New Milestone
        </h1>

        <p className="text-gray-500 mb-10">
          Create a new milestone.
        </p>

        {saving && (
          <div className="mb-6 rounded-xl bg-[#EEF7E8] p-4">
            Uploading...
          </div>
        )}

        <MemoryForm
          onSubmit={handleCreate}
          submitText="Create Milestone"
        />

      </div>

    </AdminLayout>
  );
}