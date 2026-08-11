import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import AdminLayout from "../../components/admin/AdminLayout";

import {
  getLetters,
  deleteLetter,
  toggleLetterPublished,
} from "../../services/letterService";


// ============================================================================
// LETTER CATEGORIES
// ============================================================================

const CATEGORY_LABELS = {
  "little-one": "To My Little One",
  mommy: "Letters from Mommy",
  daddy: "Letters from Daddy",
  family: "Letters from Family",
  "for-you": "Letters for You",
  birthday: "Birthday Letters",
  milestone: "Milestone Letters",
  "big-moments": "Letters for Big Moments",
  "open-when": "Letters to Open When...",
  future: "Future Letters",
};


// ============================================================================
// HELPERS
// ============================================================================

function getCategoryLabel(slotKey) {
  return (
    CATEGORY_LABELS[slotKey] ||
    slotKey ||
    "Unassigned"
  );
}


// ============================================================================
// LETTER CARD
// ============================================================================

function LetterCard({
  letter,
  onEdit,
  onDelete,
  onTogglePublished,
}) {
  return (
    <article
      className="
        bg-white
        rounded-[28px]
        p-7
        shadow-xl
        hover:shadow-2xl
        transition-all
        duration-300
      "
    >

      {/* ================================================================
          HEADER
          ================================================================ */}

      <div
        className="
          flex
          items-start
          justify-between
          gap-5
        "
      >

        <div className="min-w-0">

          {/* Category */}

          <div
            className="
              inline-flex
              items-center
              rounded-full
              bg-[#F1ECE4]
              px-4
              py-2
              text-sm
              font-semibold
              text-[#756A5E]
              mb-4
            "
          >
            {getCategoryLabel(letter.slot_key)}
          </div>


          {/* Title */}

          <h2
            className="
              text-3xl
              font-bold
              text-[#5A5148]
              break-words
            "
            style={{
              fontFamily: "Baloo 2",
            }}
          >
            {letter.title || "Untitled Letter"}
          </h2>

        </div>


        {/* Published status */}

        <button
          type="button"
          onClick={() =>
            onTogglePublished(
              letter,
              !letter.published
            )
          }
          className={`
            shrink-0
            rounded-full
            px-4
            py-2
            text-sm
            font-semibold
            transition-all
            ${
              letter.published
                ? "bg-[#E7F2DE] text-[#688653] hover:bg-[#DCEBCF]"
                : "bg-[#F1F1F1] text-[#777] hover:bg-[#E7E7E7]"
            }
          `}
        >
          {letter.published
            ? "Published"
            : "Draft"}
        </button>

      </div>


      {/* ================================================================
          LETTER PREVIEW
          ================================================================ */}

      <div
        className="
          mt-6
          rounded-[22px]
          border
          border-[#EEE8DF]
          bg-[#FAF8F3]
          p-5
        "
      >

        <p
          className="
            text-[#6D655D]
            leading-7
            whitespace-pre-line
            line-clamp-5
          "
        >
          {letter.letter_content ||
            "No letter content yet."}
        </p>

      </div>


      {/* ================================================================
          META
          ================================================================ */}

      <div
        className="
          flex
          flex-wrap
          gap-x-6
          gap-y-2
          mt-5
          text-sm
          text-gray-500
        "
      >

        {letter.date && (
          <span>
            📅 {letter.date}
          </span>
        )}

        {letter.age && (
          <span>
            🎂 {letter.age}
          </span>
        )}

        {letter.signature && (
          <span>
            ✍️ {letter.signature}
          </span>
        )}

      </div>


      {/* ================================================================
          SLUG
          ================================================================ */}

      {letter.slug && (
        <div className="mt-4">

          <p
            className="
              text-xs
              text-gray-400
              break-all
            "
          >
            /letters/{letter.slug}
          </p>

        </div>
      )}


      {/* ================================================================
          ACTIONS
          ================================================================ */}

      <div
        className="
          flex
          justify-end
          gap-3
          mt-6
          pt-5
          border-t
          border-gray-100
        "
      >

        <button
          type="button"
          onClick={() =>
            onEdit(letter)
          }
          className="
            rounded-full
            px-6
            py-2.5
            bg-[#F1ECE4]
            text-[#756A5E]
            font-semibold
            hover:bg-[#E6DED2]
            transition
          "
        >
          Edit
        </button>


        <button
          type="button"
          onClick={() =>
            onDelete(letter)
          }
          className="
            rounded-full
            px-6
            py-2.5
            bg-[#FCEAEA]
            text-[#B45E5E]
            font-semibold
            hover:bg-[#F6D9D9]
            transition
          "
        >
          Delete
        </button>

      </div>

    </article>
  );
}


// ============================================================================
// EMPTY STATE
// ============================================================================

function EmptyState({
  search,
  onCreate,
}) {
  return (
    <div
      className="
        bg-white
        rounded-[28px]
        shadow-xl
        p-16
        text-center
      "
    >

      <div
        className="
          text-6xl
          mb-5
        "
      >
        💌
      </div>


      <h2
        className="
          text-3xl
          font-bold
          text-[#5A5148]
        "
        style={{
          fontFamily: "Baloo 2",
        }}
      >
        {search
          ? "No Letters Found"
          : "No Letters Yet"}
      </h2>


      <p
        className="
          mt-3
          text-gray-500
        "
      >
        {search
          ? "Try a different search term."
          : "Create your first letter to begin your collection."}
      </p>


      {!search && (
        <button
          type="button"
          onClick={onCreate}
          className="
            mt-7
            rounded-full
            bg-[#8FAE7A]
            px-7
            py-3
            text-white
            font-semibold
            hover:bg-[#789961]
            transition
          "
        >
          + Create First Letter
        </button>
      )}

    </div>
  );
}


// ============================================================================
// MAIN MANAGER
// ============================================================================

export default function LetterManager() {

  const navigate =
    useNavigate();


  const [
    letters,
    setLetters,
  ] = useState([]);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    search,
    setSearch,
  ] = useState("");


  const [
    error,
    setError,
  ] = useState(null);


  // ==========================================================================
  // LOAD LETTERS
  // ==========================================================================

  async function loadLetters() {

    setLoading(true);
    setError(null);

    try {

      const data =
        await getLetters();

      setLetters(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (err) {

      console.error(
        "Unable to load letters:",
        err
      );

      setError(
        err?.message ||
          "Unable to load letters."
      );

    } finally {

      setLoading(false);

    }
  }


  useEffect(() => {
    loadLetters();
  }, []);


  // ==========================================================================
  // SEARCH
  // ==========================================================================

  const filteredLetters =
    useMemo(() => {

      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return letters;
      }

      return letters.filter(
        (letter) => {

          const title =
            String(
              letter.title || ""
            ).toLowerCase();

          const category =
            String(
              getCategoryLabel(
                letter.slot_key
              )
            ).toLowerCase();

          const content =
            String(
              letter.letter_content || ""
            ).toLowerCase();

          const signature =
            String(
              letter.signature || ""
            ).toLowerCase();

          const slug =
            String(
              letter.slug || ""
            ).toLowerCase();

          return (
            title.includes(query) ||
            category.includes(query) ||
            content.includes(query) ||
            signature.includes(query) ||
            slug.includes(query)
          );
        }
      );

    }, [
      letters,
      search,
    ]);


  // ==========================================================================
  // EDIT
  // ==========================================================================

  function handleEdit(letter) {

    navigate(
      `/admin/letters/edit/${letter.id}`
    );

  }


  // ==========================================================================
  // DELETE
  // ==========================================================================

  async function handleDelete(letter) {

    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${letter.title}"?`
      );

    if (!confirmed) {
      return;
    }


    try {

      await deleteLetter(
        letter.id
      );


      setLetters(
        (previous) =>
          previous.filter(
            (item) =>
              item.id !== letter.id
          )
      );

    } catch (err) {

      console.error(
        "Unable to delete letter:",
        err
      );

      alert(
        err?.message ||
          "Unable to delete letter."
      );

    }
  }


  // ==========================================================================
  // PUBLISHED / DRAFT
  // ==========================================================================

  async function handleTogglePublished(
    letter,
    published
  ) {

    try {

      const updated =
        await toggleLetterPublished(
          letter.id,
          published
        );


      setLetters(
        (previous) =>
          previous.map(
            (item) =>
              item.id === letter.id
                ? {
                    ...item,
                    ...(updated || {}),
                    published,
                  }
                : item
          )
      );

    } catch (err) {

      console.error(
        "Unable to update letter:",
        err
      );

      alert(
        err?.message ||
          "Unable to update publication status."
      );

    }
  }


  // ==========================================================================
  // CREATE
  // ==========================================================================

  function handleCreate() {

    navigate(
      "/admin/letters/new"
    );

  }


  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <AdminLayout>

      {/* ================================================================
          PAGE HEADER
          ================================================================ */}

      <div
        className="
          flex
          flex-col
          md:flex-row
          md:items-center
          md:justify-between
          gap-6
          mb-10
        "
      >

        <div>

          <h1
            className="
              text-6xl
              leading-none
            "
            style={{
              fontFamily: "Baloo 2",
              color: "#5A5148",
            }}
          >
            Letters
          </h1>


          <p
            className="
              mt-3
              text-gray-500
            "
          >
            Write and manage treasured letters
            for Azain.
          </p>

        </div>


        <button
          type="button"
          onClick={handleCreate}
          className="
            self-start
            md:self-auto
            rounded-full
            bg-[#8FAE7A]
            px-7
            py-3.5
            text-white
            font-semibold
            shadow-md
            hover:bg-[#789961]
            hover:shadow-lg
            transition-all
          "
        >
          + Add Letter
        </button>

      </div>


      {/* ================================================================
          SUMMARY
          ================================================================ */}

      <div
        className="
          grid
          sm:grid-cols-3
          gap-5
          mb-8
        "
      >

        <div
          className="
            bg-white
            rounded-[22px]
            p-5
            shadow-md
          "
        >

          <p
            className="
              text-sm
              text-gray-500
            "
          >
            Total Letters
          </p>

          <p
            className="
              mt-1
              text-3xl
              font-bold
              text-[#5A5148]
            "
          >
            {letters.length}
          </p>

        </div>


        <div
          className="
            bg-white
            rounded-[22px]
            p-5
            shadow-md
          "
        >

          <p
            className="
              text-sm
              text-gray-500
            "
          >
            Published
          </p>

          <p
            className="
              mt-1
              text-3xl
              font-bold
              text-[#8FAE7A]
            "
          >
            {
              letters.filter(
                (letter) =>
                  letter.published
              ).length
            }
          </p>

        </div>


        <div
          className="
            bg-white
            rounded-[22px]
            p-5
            shadow-md
          "
        >

          <p
            className="
              text-sm
              text-gray-500
            "
          >
            Drafts
          </p>

          <p
            className="
              mt-1
              text-3xl
              font-bold
              text-[#B08A61]
            "
          >
            {
              letters.filter(
                (letter) =>
                  !letter.published
              ).length
            }
          </p>

        </div>

      </div>


      {/* ================================================================
          SEARCH
          ================================================================ */}

      <div className="mb-8">

        <input
          type="text"
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
          placeholder="Search letters by title, category or content..."
          className="
            w-full
            rounded-[18px]
            border
            border-[#E4DED5]
            bg-white
            px-5
            py-4
            text-[#4F4943]
            outline-none
            shadow-sm
            transition
            focus:border-[#8FAE7A]
            focus:ring-2
            focus:ring-[#8FAE7A]/20
          "
        />

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
            Unable to load letters
          </p>

          <p className="mt-1 text-sm">
            {error}
          </p>

          <button
            type="button"
            onClick={loadLetters}
            className="
              mt-4
              rounded-full
              bg-[#B45E5E]
              px-5
              py-2
              text-white
              text-sm
              font-semibold
              hover:bg-[#9F4F4F]
              transition
            "
          >
            Try Again
          </button>

        </div>

      )}


      {/* ================================================================
          LOADING
          ================================================================ */}

      {loading ? (

        <div
          className="
            bg-white
            rounded-[28px]
            shadow-xl
            p-16
            text-center
          "
        >

          <div
            className="
              text-4xl
              mb-4
            "
          >
            💌
          </div>

          <p className="text-gray-500">
            Loading letters...
          </p>

        </div>

      ) : filteredLetters.length === 0 ? (

        <EmptyState
          search={search}
          onCreate={handleCreate}
        />

      ) : (

        <div
          className="
            grid
            lg:grid-cols-2
            gap-8
          "
        >

          {filteredLetters.map(
            (letter) => (

              <LetterCard
                key={letter.id}
                letter={letter}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onTogglePublished={
                  handleTogglePublished
                }
              />

            )
          )}

        </div>

      )}

    </AdminLayout>
  );
}