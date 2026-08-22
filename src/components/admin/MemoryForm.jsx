import { useEffect, useState } from "react";
import FileUploader from "./FileUploader";
import HighlightsInput from "./HighlightsInput";

export default function MemoryForm({
  onSubmit,
  initialData = null,
  submitText = "Save Memory",
}) {
  const [form, setForm] = useState({
    title: "",
    slug: "",
    date: "",
    age: "",

    // Book Chapter
    category: "newborn",

    // Memory Type
    memory_type: "memory",

    description: "",
    story: "",

    favorite: false,
    published: true,
  });

  const [coverImage, setCoverImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [highlights, setHighlights] = useState([]);

  const [existingCover, setExistingCover] =
    useState([]);

  const [existingGallery, setExistingGallery] =
    useState([]);

  // Existing media removed by the Admin
  const [removedCover, setRemovedCover] =
    useState(null);

  const [removedGallery, setRemovedGallery] =
    useState([]);

  useEffect(() => {
    if (!initialData) return;

    setForm({
      title: initialData.title || "",
      slug: initialData.slug || "",

      date: initialData.date || "",
      age: initialData.age || "",

      category:
        initialData.category || "newborn",

      memory_type:
        initialData.memory_type || "memory",

      description:
        initialData.description || "",

      story:
        initialData.story || "",

      favorite:
        initialData.favorite || false,

      published:
        initialData.published ?? true,
    });

    setHighlights(
      initialData.highlights || []
    );

    setExistingCover(
      initialData.cover_image
        ? [initialData.cover_image]
        : []
    );

    setExistingGallery(
      initialData.gallery_images ||
        initialData.gallery ||
        []
    );

    // Reset removed media when loading a different record
    setRemovedCover(null);
    setRemovedGallery([]);
  }, [initialData]);

  function handleChange(e) {
    const {
      name,
      value,
      checked,
      type,
    } = e.target;

    setForm((prev) => ({
      ...prev,

      [name]:
        type === "checkbox"
          ? checked
          : value,

      ...(name === "title"
        ? {
            slug: value
              .toLowerCase()
              .replace(
                /[^a-z0-9]+/g,
                "-"
              )
              .replace(/^-|-$/g, ""),
          }
        : {}),
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    onSubmit({
      ...form,

      coverImage,

      galleryImages,

      existingCover,

      existingGallery,

      removedCover,

      removedGallery,

      highlights,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-3xl shadow-xl p-10"
    >
      <h2
        className="text-3xl mb-8"
        style={{
          fontFamily: "Baloo 2",
        }}
      >
        Memory Details
      </h2>

      <div className="grid md:grid-cols-2 gap-6">

        {/* Title */}

        <div>

          <label className="block mb-2 font-semibold">
            Title
          </label>

          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-3"
          />

        </div>

        {/* Slug */}

        <div>

          <label className="block mb-2 font-semibold">
            Slug
          </label>

          <input
            value={form.slug}
            readOnly
            className="w-full border rounded-xl px-4 py-3 bg-gray-100"
          />

        </div>

        {/* Date */}

        <div>

          <label className="block mb-2 font-semibold">
            Date
          </label>

          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-3"
          />

        </div>

        {/* Age */}

        <div>

          <label className="block mb-2 font-semibold">
            Age
          </label>

          <input
            name="age"
            value={form.age}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-3"
          />

        </div>

      </div>

      {/* ======================================
          CHAPTER
      ====================================== */}

      <div className="mt-6">

        <label className="block mb-2 font-semibold">
          Chapter
        </label>

        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="w-full border rounded-xl px-4 py-3"
        >
          <option value="newborn">Newborn</option>
          <option value="infant">Infant</option>
          <option value="toddler">Toddler</option>
          <option value="preschool">Preschool</option>
          <option value="school">School Years</option>
          <option value="teen">Teen Years</option>
        </select>

      </div>

      {/* ======================================
          MEMORY TYPE
      ====================================== */}

      <div className="mt-6">

        <label className="block mb-2 font-semibold">
          Memory Type
        </label>

        <select
          name="memory_type"
          value={form.memory_type}
          onChange={handleChange}
          className="w-full border rounded-xl px-4 py-3"
        >
          <option value="memory">Memory</option>
          <option value="milestone">Milestone</option>
          <option value="letter">Letter</option>
          <option value="video">Video</option>
        </select>

      </div>

      {/* ======================================
          DESCRIPTION
      ====================================== */}

      <div className="mt-6">

        <label className="block mb-2 font-semibold">
          Description
        </label>

        <textarea
          rows={3}
          name="description"
          value={form.description}
          onChange={handleChange}
          className="w-full border rounded-xl px-4 py-3"
        />

      </div>

      {/* ======================================
          STORY
      ====================================== */}

      <div className="mt-6">

        <label className="block mb-2 font-semibold">
          Story
        </label>

        <textarea
          rows={8}
          name="story"
          value={form.story}
          onChange={handleChange}
          className="w-full border rounded-xl px-4 py-3"
        />

      </div>

      {/* ======================================
          IMAGES
      ====================================== */}

      <FileUploader
        label="Cover Image"
        multiple={false}
        existingFiles={existingCover}
        onChange={setCoverImage}
        onExistingRemove={setRemovedCover}
      />

      <FileUploader
        label="Gallery Images & Videos"
        multiple={true}
        accept="image/*,video/*,.mp4,.mov,.m4v,.webm,.ogg"
        existingFiles={existingGallery}
        onChange={setGalleryImages}
        onExistingRemove={(removedFile) =>
          setRemovedGallery((prev) => [
            ...prev,
            removedFile,
          ])
        }
      />

      {/* ======================================
          HIGHLIGHTS
      ====================================== */}

      <HighlightsInput
        initialHighlights={highlights}
        onChange={setHighlights}
      />

      {/* ======================================
          SETTINGS
      ====================================== */}

      <div className="flex gap-10 mt-8">

        <label className="flex items-center gap-2">

          <input
            type="checkbox"
            name="favorite"
            checked={form.favorite}
            onChange={handleChange}
          />

          Favourite

        </label>

        <label className="flex items-center gap-2">

          <input
            type="checkbox"
            name="published"
            checked={form.published}
            onChange={handleChange}
          />

          Published

        </label>

      </div>

      {/* ======================================
          SUBMIT
      ====================================== */}

      <button
        type="submit"
        className="
          mt-10
          w-full
          bg-[#8FAE7A]
          hover:bg-[#789961]
          text-white
          py-4
          rounded-xl
          text-lg
          font-semibold
          transition
        "
      >
        {submitText}
      </button>

    </form>
  );
}