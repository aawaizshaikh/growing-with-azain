import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import AdminLayout from "../../components/admin/AdminLayout";

import {
  getLetterById,
  updateLetter,
  deleteLetter,
} from "../../services/letterService";


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

function createSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}


// ============================================================================
// FIELD LABEL
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
// LOADING SCREEN
// ============================================================================

function LoadingScreen() {
  return (
    <AdminLayout>

      <div
        className="
          flex
          items-center
          justify-center
          min-h-[500px]
        "
      >

        <div className="text-center">

          <div className="text-5xl mb-4">
            💌
          </div>

          <p className="text-gray-500">
            Loading letter...
          </p>

        </div>

      </div>

    </AdminLayout>
  );
}


// ============================================================================
// MAIN PAGE
// ============================================================================

export default function EditLetter() {

  const {
    id,
  } = useParams();

  const navigate =
    useNavigate();


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    saving,
    setSaving,
  ] = useState(false);


  const [
    deleting,
    setDeleting,
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
  // LOAD LETTER
  // ==========================================================================

  useEffect(() => {

    let mounted = true;


    async function loadLetter() {

      setLoading(true);
      setError("");


      try {

        const data =
          await getLetterById(id);


        if (!mounted) {
          return;
        }


        if (!data) {
          throw new Error(
            "Letter could not be found."
          );
        }


        setForm({
          slot_key:
            data.slot_key ||
            "daddy",

          title:
            data.title ||
            "",

          slug:
            data.slug ||
            "",

          letter_content:
            data.letter_content ||
            "",

          date:
            data.date ||
            "",

          age:
            data.age ||
            "",

          signature:
            data.signature ||
            "",

          published:
            Boolean(
              data.published
            ),

          display_order:
            Number(
              data.display_order
            ) || 0,
        });

      } catch (err) {

        console.error(
          "Unable to load letter:",
          err
        );


        if (!mounted) {
          return;
        }


        setError(
          err?.message ||
            "Unable to load the letter."
        );

      } finally {

        if (mounted) {
          setLoading(false);
        }

      }

    }


    if (id) {
      loadLetter();
    } else {
      setLoading(false);
      setError(
        "No letter ID was provided."
      );
    }


    return () => {
      mounted = false;
    };

  }, [id]);


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
  // ==========================================================================

  function handleTitleChange(event) {

    const title =
      event.target.value;


    setForm(
      (previous) => ({
        ...previous,

        title,

        // Keep the existing slug stable.
        // If there isn't one, generate it.
        slug:
          previous.slug
            ? previous.slug
            : createSlug(title),
      })
    );
  }


  // ==========================================================================
  // SAVE
  // ==========================================================================

  async function handleSubmit(event) {

    event.preventDefault();

    setError("");


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
        "Please provide a valid URL slug."
      );

      return;
    }


    setSaving(true);


    try {

      await updateLetter(
        id,
        {
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
        }
      );


      navigate(
        "/admin/letters"
      );

    } catch (err) {

      console.error(
        "Unable to update letter:",
        err
      );


      setError(
        err?.message ||
          "Unable to update the letter."
      );

    } finally {

      setSaving(false);

    }
  }


  // ==========================================================================
  // DELETE
  // ==========================================================================

  async function handleDelete() {

    const confirmed =
      window.confirm(
        "Are you sure you want to permanently delete this letter?"
      );


    if (!confirmed) {
      return;
    }


    setDeleting(true);
    setError("");


    try {

      await deleteLetter(id);


      navigate(
        "/admin/letters"
      );

    } catch (err) {

      console.error(
        "Unable to delete letter:",
        err
      );


      setError(
        err?.message ||
          "Unable to delete the letter."
      );

      setDeleting(false);

    }
  }


  // ==========================================================================
  // LOADING
  // ==========================================================================

  if (loading) {
    return <LoadingScreen />;
  }


  // ==========================================================================
  // ERROR WITH NO FORM
  // ==========================================================================

  if (
    error &&
    !form.title &&
    !form.letter_content
  ) {

    return (
      <AdminLayout>

        <div
          className="
            max-w-2xl
            mx-auto
          "
        >

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
              mb-6
            "
          >
            ← Back to Letters
          </button>


          <div
            className="
              rounded-[28px]
              border
              border-[#E8CACA]
              bg-[#FFF4F4]
              p-8
              text-[#A35D5D]
            "
          >

            <h1
              className="
                text-2xl
                font-bold
              "
            >
              Unable to open letter
            </h1>


            <p className="mt-2">
              {error}
            </p>

          </div>

        </div>

      </AdminLayout>
    );
  }


  // ==========================================================================
  // FORM
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


          <div
            className="
              flex
              flex-col
              md:flex-row
              md:items-end
              md:justify-between
              gap-5
            "
          >

            <div>

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
                Edit Letter
              </h1>


              <p
                className="
                  mt-3
                  text-gray-500
                "
              >
                Update this treasured memory.
              </p>

            </div>


            {/* STATUS */}

            <div
              className={`
                self-start
                md:self-auto
                rounded-full
                px-5
                py-2.5
                text-sm
                font-semibold
                ${
                  form.published
                    ? "bg-[#E7F2DE] text-[#688653]"
                    : "bg-gray-100 text-gray-500"
                }
              `}
            >
              {form.published
                ? "Published"
                : "Draft"}
            </div>

          </div>

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
              Unable to save changes
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
              LETTER DETAILS
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
              Manage the category and identity
              of this letter.
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
                Changing this changes the public
                letter URL.
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
              Edit the actual memory or message.
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

          </section>


          {/* ==============================================================
              MEMORY DETAILS
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
                  Published letters are visible on
                  the public Letters page.
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
              ACTION BUTTONS
              ============================================================== */}

          <div
            className="
              flex
              flex-col-reverse
              sm:flex-row
              sm:items-center
              sm:justify-between
              gap-4
              pb-10
            "
          >

            {/* DELETE */}

            <button
              type="button"
              onClick={
                handleDelete
              }
              disabled={
                saving ||
                deleting
              }
              className="
                rounded-full
                bg-[#FCEAEA]
                px-7
                py-3.5
                font-semibold
                text-[#B45E5E]
                hover:bg-[#F6D9D9]
                transition
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >
              {deleting
                ? "Deleting..."
                : "Delete Letter"}
            </button>


            {/* RIGHT ACTIONS */}

            <div
              className="
                flex
                flex-col
                sm:flex-row
                gap-3
              "
            >

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/admin/letters"
                  )
                }
                disabled={
                  saving ||
                  deleting
                }
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
                disabled={
                  saving ||
                  deleting
                }
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
                  ? "Saving Changes..."
                  : "Save Changes"}
              </button>

            </div>

          </div>

        </form>

      </div>

    </AdminLayout>
  );
}