import { useState } from "react";

export default function MemoryForm({ onSubmit }) {
  const [form, setForm] = useState({
    title: "",
    slug: "",
    date: "",
    age: "",
    category: "Milestone",
    description: "",
    story: "",
    favorite: false,
    published: true,
  });

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
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

    if (onSubmit) {
      onSubmit(form);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-[30px] shadow-lg p-10"
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
          Category
        </label>

        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="w-full border rounded-xl px-4 py-3"
        >
          <option>Birth</option>
          <option>Milestone</option>
          <option>Family</option>
          <option>Travel</option>
          <option>Festival</option>
          <option>Celebration</option>
          <option>Photo</option>
          <option>Other</option>
        </select>

      </div>

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
        className="mt-10 bg-[#8FAE7A] hover:bg-[#799962] text-white px-8 py-4 rounded-full font-semibold"
      >
        Save Memory
      </button>

    </form>
  );
}