import { useState } from "react";
import { useNavigate } from "react-router-dom";

import AdminLayout from "../../components/admin/AdminLayout";

import { createLetter } from "../../services/letterService";


// ============================================================================
// LETTER CATEGORIES
// ============================================================================

const CATEGORIES = [
  {
    value: "little-one",
    label: "To My Little One",
  },
  {
    value: "mommy",
    label: "Letters from Mommy",
  },
  {
    value: "daddy",
    label: "Letters from Daddy",
  },
  {
    value: "family",
    label: "Letters from Family",
  },
  {
    value: "for-you",
    label: "Letters for You",
  },
  {
    value: "birthday",
    label: "Birthday Letters",
  },
  {
    value: "milestone",
    label: "Milestone Letters",
  },
  {
    value: "big-moments",
    label: "Letters for Big Moments",
  },
  {
    value: "open-when",
    label: "Letters to Open When...",
  },
  {
    value: "future",
    label: "Future Letters",
  },
];


// ============================================================================
// SLUG GENERATOR
// ============================================================================

function createSlug(title) {
  return String(title || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}


// ============================================================================
// FORM FIELD
// ============================================================================

function FieldLabel({
  children,
  required = false,
}) {
  return (
    <label
      className="
        block
        mb-2
        text-sm
        font-semibold
        text-[#5F5750]
      "
    >
      {children}

      {required && (
        <span className="ml-1 text-[#B45E5E]">
          *
        </span>
      )}
    </label>
  );
}


// ============================================================================
// MAIN PAGE
// ============================================================================

export default function NewLetter() {

  const navigate =
    useNavigate();


  const [
    saving,
    setSaving,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  const [
    form,
    setForm,
  ] = useState({
    slot_key: "daddy",
    title: "",
    slug: "",
    letter_content: "",
    date: "",
    age: "",
    signature: "",
    published: false,
    display_order: 0,
  });


  // ==========================================================================
  // HANDLE INPUT
  // ==========================================================================

  function handleChange(event) {

    const {
      name,
      value,
      type,
      checked,
    } = event.target;


    setForm(
      (previous) => ({
        ...previous,

        [name]:
          type === "checkbox"
            ? checked
            : value,
      })
    );
  }


  // ==========================================================================
  // TITLE CHANGE
  //
  // Automatically creates the slug while the slug is still empty.
  // ==========================================================================

  function handleTitleChange(event) {

    const title =
      event.target.value;


    setForm(
      (previous) => ({
        ...previous,

        title,

        slug:
          previous.slug
            ? previous.slug
            : createSlug(title),
      })
    );
  }


  // ==========================================================================
  // SUBMIT
  // ==========================================================================

  async function handleSubmit(event) {

    event.preventDefault();

    setError("");


    // ------------------------------------------------------------------------
    // VALIDATION
    // ------------------------------------------------------------------------

    if (!form.slot_key) {
      setError(
        "Please select a letter category."
      );

      return;
    }


    if (!form.title.trim()) {
      setError(
        "Please enter a letter title."
      );

      return;
    }


    if (!form.letter_content.trim()) {
      setError(
        "Please write the letter before saving."
      );

      return;
    }


    const slug =
      createSlug(
        form.slug ||
          form.title
      );


    if (!slug) {
      setError(
        "Please provide a valid title or slug."
      );

      return;
    }


    // ------------------------------------------------------------------------
    // SAVE
    // ------------------------------------------------------------------------

    setSaving(true);


    try {

      await createLetter({
        slot_key:
          form.slot_key,

        title:
          form.title.trim(),

        slug,

        letter_content:
          form.letter_content,

        date:
          form.date.trim() ||
          null,

        age:
          form.age.trim() ||
          null,

        signature:
          form.signature.trim() ||
          null,

        published:
          form.published,

        display_order:
          Number(
            form.display_order
          ) || 0,
      });


      navigate(
        "/admin/letters"
      );

    } catch (err) {

      console.error(
        "Unable to create letter:",
        err
      );


      setError(
        err?.message ||
          "Unable to create the letter."
      );

    } finally {

      setSaving(false);

    }
  }


  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <AdminLayout>

      <div
        className="
          max-w-4xl
          mx-auto
        "
      >

        {/* ================================================================
            HEADER
            ================================================================ */}

        <div className="mb-10">

          <button
            type="button"
            onClick={() =>
              navigate(
                "/admin/letters"
              )
            }
            className="
              text-sm
              font-semibold
              text-[#8FAE7A]
              hover:text-[#789961]
              transition
              mb-5
            "
          >
            ← Back to Letters
          </button>


          <h1
            className="
              text-6xl
              leading-none
            "
            style={{
              fontFamily:
                "Baloo 2",

              color:
                "#5A5148",
            }}
          >
            New Letter
          </h1>


          <p
            className="
              mt-3
              text-gray-500
            "
          >
            Write a letter that can be treasured
            for years to come.
          </p>

        </div>


        {/* ================================================================
            ERROR
            ================================================================ */}

        {error && (

          <div
            className="
              mb-8
              rounded-[20px]
              border
              border-[#E8CACA]
              bg-[#FFF4F4]
              px-6
              py-5
              text-[#A35D5D]
            "
          >

            <p className="font-semibold">
              Unable to save letter
            </p>

            <p className="mt-1 text-sm">
              {error}
            </p>

          </div>

        )}


        {/* ================================================================
            FORM
            ================================================================ */}

        <form
          onSubmit={handleSubmit}
          className="space-y-8"
        >

          {/* ==============================================================
              BASIC INFORMATION
              ============================================================== */}

          <section
            className="
              bg-white
              rounded-[28px]
              shadow-xl
              p-8
            "
          >

            <h2
              className="
                text-2xl
                font-bold
                text-[#5A5148]
              "
              style={{
                fontFamily:
                  "Baloo 2",
              }}
            >
              Letter Details
            </h2>


            <p
              className="
                mt-1
                mb-7
                text-sm
                text-gray-500
              "
            >
              Choose where this letter belongs
              in the Letters world.
            </p>


            {/* CATEGORY */}

            <div className="mb-6">

              <FieldLabel required>
                Letter Category
              </FieldLabel>


              <select
                name="slot_key"
                value={form.slot_key}
                onChange={handleChange}
                className="
                  w-full
                  rounded-[16px]
                  border
                  border-[#E4DED5]
                  bg-white
                  px-5
                  py-4
                  text-[#4F4943]
                  outline-none
                  focus:border-[#8FAE7A]
                  focus:ring-2
                  focus:ring-[#8FAE7A]/20
                "
              >

                {CATEGORIES.map(
                  (category) => (

                    <option
                      key={
                        category.value
                      }
                      value={
                        category.value
                      }
                    >
                      {category.label}
                    </option>

                  )
                )}

              </select>

            </div>


            {/* TITLE */}

            <div className="mb-6">

              <FieldLabel required>
                Letter Title
              </FieldLabel>


              <input
                type="text"
                name="title"
                value={form.title}
                onChange={
                  handleTitleChange
                }
                placeholder="e.g. A Letter For My Little Boy"
                className="
                  w-full
                  rounded-[16px]
                  border
                  border-[#E4DED5]
                  bg-white
                  px-5
                  py-4
                  text-[#4F4943]
                  outline-none
                  focus:border-[#8FAE7A]
                  focus:ring-2
                  focus:ring-[#8FAE7A]/20
                "
              />

            </div>


            {/* SLUG */}

            <div>

              <FieldLabel>
                URL Slug
              </FieldLabel>


              <input
                type="text"
                name="slug"
                value={form.slug}
                onChange={handleChange}
                placeholder="a-letter-for-my-little-boy"
                className="
                  w-full
                  rounded-[16px]
                  border
                  border-[#E4DED5]
                  bg-white
                  px-5
                  py-4
                  text-[#4F4943]
                  outline-none
                  focus:border-[#8FAE7A]
                  focus:ring-2
                  focus:ring-[#8FAE7A]/20
                "
              />


              <p
                className="
                  mt-2
                  text-xs
                  text-gray-400
                "
              >
                This becomes the URL for the
                letter.
              </p>

            </div>

          </section>


          {/* ==============================================================
              LETTER CONTENT
              ============================================================== */}

          <section
            className="
              bg-white
              rounded-[28px]
              shadow-xl
              p-8
            "
          >

            <h2
              className="
                text-2xl
                font-bold
                text-[#5A5148]
              "
              style={{
                fontFamily:
                  "Baloo 2",
              }}
            >
              The Letter
            </h2>


            <p
              className="
                mt-1
                mb-7
                text-sm
                text-gray-500
              "
            >
              Write the actual memory or message.
            </p>


            <FieldLabel required>
              Letter Content
            </FieldLabel>


            <textarea
              name="letter_content"
              value={
                form.letter_content
              }
              onChange={handleChange}
              rows={16}
              placeholder={
                "Dear Azain,\n\nWrite your letter here...\n\nLove,\nPapa"
              }
              className="
                w-full
                resize-y
                rounded-[18px]
                border
                border-[#E4DED5]
                bg-[#FFFEFC]
                px-5
                py-5
                text-[#4F4943]
                leading-7
                outline-none
                focus:border-[#8FAE7A]
                focus:ring-2
                focus:ring-[#8FAE7A]/20
              "
            />


            <p
              className="
                mt-2
                text-xs
                text-gray-400
              "
            >
              Leave blank lines between paragraphs
              to preserve paragraph spacing.
            </p>

          </section>


          {/* ==============================================================
              MEMORY INFORMATION
              ============================================================== */}

          <section
            className="
              bg-white
              rounded-[28px]
              shadow-xl
              p-8
            "
          >

            <h2
              className="
                text-2xl
                font-bold
                text-[#5A5148]
              "
              style={{
                fontFamily:
                  "Baloo 2",
              }}
            >
              Memory Details
            </h2>


            <p
              className="
                mt-1
                mb-7
                text-sm
                text-gray-500
              "
            >
              Optional information shown with
              the letter.
            </p>


            <div
              className="
                grid
                md:grid-cols-2
                gap-6
              "
            >

              {/* DATE */}

              <div>

                <FieldLabel>
                  Date
                </FieldLabel>


                <input
                  type="text"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  placeholder="e.g. August 2026"
                  className="
                    w-full
                    rounded-[16px]
                    border
                    border-[#E4DED5]
                    bg-white
                    px-5
                    py-4
                    text-[#4F4943]
                    outline-none
                    focus:border-[#8FAE7A]
                    focus:ring-2
                    focus:ring-[#8FAE7A]/20
                  "
                />

              </div>


              {/* AGE */}

              <div>

                <FieldLabel>
                  Age
                </FieldLabel>


                <input
                  type="text"
                  name="age"
                  value={form.age}
                  onChange={handleChange}
                  placeholder="e.g. 2 Years"
                  className="
                    w-full
                    rounded-[16px]
                    border
                    border-[#E4DED5]
                    bg-white
                    px-5
                    py-4
                    text-[#4F4943]
                    outline-none
                    focus:border-[#8FAE7A]
                    focus:ring-2
                    focus:ring-[#8FAE7A]/20
                  "
                />

              </div>


              {/* SIGNATURE */}

              <div
                className="
                  md:col-span-2
                "
              >

                <FieldLabel>
                  Signature
                </FieldLabel>


                <textarea
                  name="signature"
                  value={
                    form.signature
                  }
                  onChange={handleChange}
                  rows={3}
                  placeholder={
                    "Love,\nPapa ❤️"
                  }
                  className="
                    w-full
                    resize-y
                    rounded-[16px]
                    border
                    border-[#E4DED5]
                    bg-white
                    px-5
                    py-4
                    text-[#4F4943]
                    outline-none
                    focus:border-[#8FAE7A]
                    focus:ring-2
                    focus:ring-[#8FAE7A]/20
                  "
                />

              </div>


              {/* DISPLAY ORDER */}

              <div>

                <FieldLabel>
                  Display Order
                </FieldLabel>


                <input
                  type="number"
                  name="display_order"
                  value={
                    form.display_order
                  }
                  onChange={handleChange}
                  min="0"
                  className="
                    w-full
                    rounded-[16px]
                    border
                    border-[#E4DED5]
                    bg-white
                    px-5
                    py-4
                    text-[#4F4943]
                    outline-none
                    focus:border-[#8FAE7A]
                    focus:ring-2
                    focus:ring-[#8FAE7A]/20
                  "
                />

              </div>

            </div>

          </section>


          {/* ==============================================================
              PUBLISH
              ============================================================== */}

          <section
            className="
              bg-white
              rounded-[28px]
              shadow-xl
              p-8
            "
          >

            <div
              className="
                flex
                items-center
                justify-between
                gap-6
              "
            >

              <div>

                <h2
                  className="
                    text-2xl
                    font-bold
                    text-[#5A5148]
                  "
                  style={{
                    fontFamily:
                      "Baloo 2",
                  }}
                >
                  Publish Letter
                </h2>


                <p
                  className="
                    mt-1
                    text-sm
                    text-gray-500
                  "
                >
                  Published letters become visible
                  on the public Letters page.
                </p>

              </div>


              <label
                className="
                  relative
                  inline-flex
                  cursor-pointer
                  items-center
                "
              >

                <input
                  type="checkbox"
                  name="published"
                  checked={
                    form.published
                  }
                  onChange={handleChange}
                  className="sr-only peer"
                />


                <div
                  className="
                    h-7
                    w-12
                    rounded-full
                    bg-gray-300
                    peer-checked:bg-[#8FAE7A]
                    transition-colors
                    after:absolute
                    after:left-[3px]
                    after:top-[3px]
                    after:h-[22px]
                    after:w-[22px]
                    after:rounded-full
                    after:bg-white
                    after:shadow
                    after:transition-transform
                    peer-checked:after:translate-x-5
                  "
                />

              </label>

            </div>

          </section>


          {/* ==============================================================
              ACTIONS
              ============================================================== */}

          <div
            className="
              flex
              flex-col-reverse
              sm:flex-row
              sm:justify-end
              gap-3
              pb-10
            "
          >

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/admin/letters"
                )
              }
              disabled={saving}
              className="
                rounded-full
                border
                border-[#DDD5CB]
                bg-white
                px-7
                py-3.5
                font-semibold
                text-[#756A5E]
                hover:bg-[#F8F5F0]
                transition
                disabled:opacity-50
              "
            >
              Cancel
            </button>


            <button
              type="submit"
              disabled={saving}
              className="
                rounded-full
                bg-[#8FAE7A]
                px-8
                py-3.5
                font-semibold
                text-white
                shadow-md
                hover:bg-[#789961]
                hover:shadow-lg
                transition-all
                disabled:opacity-60
                disabled:cursor-not-allowed
              "
            >
              {saving
                ? "Saving Letter..."
                : "Save Letter"}
            </button>

          </div>

        </form>

      </div>

    </AdminLayout>
  );
}