import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import AdminLayout from "../../components/admin/AdminLayout";
import MemoryForm from "../../components/admin/MemoryForm";

import {
  getMilestone,
  updateMilestone,
} from "../../services/milestoneService";

import {
  uploadFile,
  uploadMultiple,
  deleteFile,
} from "../../services/storageService";

export default function EditMilestone() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [milestone, setMilestone] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadMilestone();
  }, []);

  async function loadMilestone() {
    try {
      const data = await getMilestone(id);
      setMilestone(data);
    } catch (err) {
      console.error(err);
      alert("Failed to load milestone.");
      navigate("/admin/milestones");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(formData) {
    try {
      setSaving(true);

      let coverImage = milestone.cover_image || "";
      let gallery =
        milestone.gallery ||
        milestone.gallery_images ||
        [];

      let newCoverImage = null;

      if (formData.coverImage) {
        newCoverImage = await uploadFile(
          formData.coverImage,
          formData.slug ||
            milestone.slug ||
            "milestones"
        );

        coverImage = newCoverImage;
      }

      if (
        formData.galleryImages &&
        formData.galleryImages.length > 0
      ) {
        const uploaded = await uploadMultiple(
          formData.galleryImages,
          formData.slug ||
            milestone.slug ||
            "milestones"
        );

        gallery = [
          ...gallery,
          ...uploaded,
        ];
      }

      /*
      ============================================================
      DELETE OLD R2 COVER AFTER NEW COVER UPLOAD
      ============================================================
      */

      if (
        newCoverImage &&
        milestone.cover_image &&
        milestone.cover_image !== newCoverImage
      ) {
        try {
          await deleteFile(
            milestone.cover_image,
            "timeline"
          );
        } catch (deleteError) {
          /*
          --------------------------------------------------------
          Roll back the newly uploaded cover if the old cover
          could not be deleted.
          --------------------------------------------------------
          */

          try {
            await deleteFile(
              newCoverImage,
              "timeline"
            );
          } catch (rollbackError) {
            console.error(
              "Failed to rollback new cover:",
              rollbackError
            );
          }

          throw deleteError;
        }
      }

      /*
      ============================================================
      DELETE EXISTING COVER REMOVED BY ADMIN
      ============================================================
      */

      if (
        formData.removedCover &&
        formData.removedCover === milestone.cover_image &&
        !newCoverImage
      ) {
        await deleteFile(
          formData.removedCover,
          "timeline"
        );

        coverImage = "";
      }

      /*
      ============================================================
      DELETE EXISTING GALLERY MEDIA REMOVED BY ADMIN
      ============================================================
      */

      if (
        formData.removedGallery &&
        formData.removedGallery.length > 0
      ) {
        for (const removedFile of formData.removedGallery) {
          await deleteFile(
            removedFile,
            "timeline"
          );
        }

        gallery = gallery.filter(
          (url) =>
            !formData.removedGallery.includes(url)
        );
      }

      await updateMilestone(id, {
        title: formData.title,
        slug: formData.slug,
        date: formData.date,
        age: formData.age,
        category: formData.category,
        description: formData.description,
        story: formData.story,

        cover_image: coverImage,

        gallery: gallery,

        highlights: formData.highlights,
        favorite: formData.favorite,
        published: formData.published,
      });

      alert("Milestone updated successfully!");

      navigate("/admin/milestones");
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
          Loading Milestone...
        </div>
      </AdminLayout>
    );
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
          Edit Milestone
        </h1>

        <p className="text-gray-500 mb-10">
          Update your milestone.
        </p>

        {saving && (
          <div className="mb-6 rounded-xl bg-[#EEF7E8] p-4">
            Saving changes...
          </div>
        )}

        <MemoryForm
          initialData={milestone}
          onSubmit={handleUpdate}
          submitText="Update Milestone"
        />

      </div>
    </AdminLayout>
  );
}