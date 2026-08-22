import { useEffect, useState } from "react";
import FileUploader from "./FileUploader";
import HighlightsInput from "./HighlightsInput";

export default function FavoriteSongForm({
  onSubmit,
  initialData = null,
  submitText = "Save Favourite Song",
}) {
  const [form, setForm] = useState({
    title: "",
    artist: "",
    month: "",
    age: "",
    slug: "",
    story: "",
    videoUrl: "",
    displayOrder: 0,
    favorite: false,
    published: true,
  });

  const [coverImage, setCoverImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [highlights, setHighlights] = useState([]);

  const [existingCover, setExistingCover] = useState([]);
  const [existingGallery, setExistingGallery] = useState([]);

  // Existing media removed by the Admin
  const [removedCover, setRemovedCover] = useState(null);
  const [removedGallery, setRemovedGallery] = useState([]);

  useEffect(() => {
    if (!initialData) return;

    setForm({
      title: initialData.title || "",
      artist: initialData.artist || "",
      month: initialData.month || "",
      age: initialData.age || "",
      slug: initialData.slug || "",
      story: initialData.story || "",
      videoUrl: initialData.video_url || "",
      displayOrder: initialData.display_order || 0,
      favorite: initialData.favorite || false,
      published: initialData.published ?? true,
    });

    setHighlights(initialData.highlights || []);

    setExistingCover(
      initialData.cover_image
        ? [initialData.cover_image]
        : []
    );

    setExistingGallery(
      initialData.gallery_images || []
    );

    // Reset removed media when loading a different song
    setRemovedCover(null);
    setRemovedGallery([]);
  }, [initialData]);

  function handleChange(e) {
    const { name, value, checked, type } = e.target;

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
              .replace(/[^a-z0-9]+/g, "-")
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
      className="bg-white rounded-[30px] shadow-xl p-10"
    >
      <h2
        className="text-3xl mb-8"
        style={{ fontFamily: "Baloo 2" }}
      >
        Favourite Song Details
      </h2>

      <div className="grid md:grid-cols-2 gap-6">

        <div>
          <label className="block mb-2 font-semibold">
            Song Title
          </label>

          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-3"
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">
            Artist
          </label>

          <input
            name="artist"
            value={form.artist}
            onChange={handleChange}
            className="w-full border rounded-xl px-4 py-3"
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">
            Month
          </label>

          <input
            name="month"
            value={form.month}
            onChange={handleChange}
            placeholder="Example: January 2026"
            className="w-full border rounded-xl px-4 py-3"
          />
        </div>

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

      <div className="mt-6">

        <label className="block mb-2 font-semibold">
          Slug
        </label>

        <input
          value={form.slug}
          readOnly
          className="w-full border rounded-xl px-4 py-3 bg-gray-100"
        />

      </div>

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

      <div className="mt-6">

        <label className="block mb-2 font-semibold">
          Display Order
        </label>

        <input
          type="number"
          name="displayOrder"
          value={form.displayOrder}
          onChange={handleChange}
          className="w-full border rounded-xl px-4 py-3"
        />

      </div>

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

      <HighlightsInput
        initialHighlights={highlights}
        onChange={setHighlights}
      />

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

      <button
        type="submit"
        className="mt-10 w-full bg-[#8FAE7A] hover:bg-[#789961] text-white py-4 rounded-xl text-lg font-semibold"
      >
        {submitText}
      </button>

    </form>
  );
}