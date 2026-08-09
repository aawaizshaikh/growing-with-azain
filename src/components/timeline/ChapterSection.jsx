import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import MemoryGrid from "./MemoryGrid";

import memoryWall from "../../assets/illustrations/timeline-memory-wall.png";

export default function ChapterSection({
  loading,
  book,
  memories,
}) {
  const [currentPage, setCurrentPage] =
    useState(1);

  /*
  =====================================================
  CHAPTER SECTION REF

  Pagination scrolls to the actual chapter section
  instead of using a fixed browser-pixel scroll
  position.
  =====================================================
  */

  const chapterSectionRef = useRef(null);

  /*
  =====================================================
  PAGINATION
  =====================================================
  */

  const MEMORIES_PER_PAGE = 6;

  /*
  =====================================================
  FILTER
  =====================================================
  */

  const filteredMemories = memories;

  /*
  =====================================================
  PAGINATION CALCULATION
  =====================================================
  */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredMemories.length /
        MEMORIES_PER_PAGE
    )
  );

  const paginatedMemories =
    filteredMemories.slice(
      (currentPage - 1) *
        MEMORIES_PER_PAGE,
      currentPage *
        MEMORIES_PER_PAGE
    );

  /*
  =====================================================
  RESET PAGINATION WHEN CHAPTER CHANGES
  =====================================================
  */

  useEffect(() => {
    setCurrentPage(1);
  }, [book?.slug]);

  /*
  =====================================================
  PAGINATION NAVIGATION

  Scroll to the actual ChapterSection rather than
  using a hard-coded browser position.
  =====================================================
  */

  function goToPage(page) {
    setCurrentPage(page);

    requestAnimationFrame(() => {
      chapterSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  return (
    <div
      ref={chapterSectionRef}
      className="
        mx-auto
        rounded-[40px]
        border
        shadow-sm
        overflow-hidden
      "
      style={{
        /*
        =================================================
        MASTER SCENE GEOMETRY

        The parent Timeline scene is 1920px wide.

        This ChapterSection occupies 1400px of the
        master scene and therefore scales together
        with the rest of the Timeline composition.
        =================================================
        */

        width: "1400px",

        height: "505px",

        padding: "0px 50px",

        /*
        =================================================
        IMPORTANT TEST

        Previously this section was pulled upward by:

            marginTop: "-275px"

        That created an artificial overlap between the
        ChapterSection and the room/floor scene.

        We are now testing its natural position inside
        the master scene.

        Do not compensate with another negative value
        until we inspect the result.
        =================================================
        */

        marginTop: "0px",

        boxSizing: "border-box",

        position: "relative",

        /*
        ================================================
        MEMORY WALLPAPER
        ================================================
        */

        backgroundImage: `url(${memoryWall})`,

        backgroundSize: "cover",

        backgroundPosition: "center",

        backgroundRepeat: "no-repeat",

        /*
        ================================================
        BORDER
        ================================================
        */

        borderColor: "#CBA66F",

        /*
        ================================================
        INNER SHADOW
        ================================================
        */

        boxShadow:
          "inset 0 0 45px rgba(120, 79, 35, 0.16)",
      }}
    >
      {/* =====================================================
          HEADING
          ===================================================== */}

      <div className="text-center">
        <h2
          className="
            mt-5
            text-[54px]
            font-bold
            text-[#5A4332]
          "
          style={{
            fontFamily:
              "Cormorant Garamond, serif",
          }}
        >
          {book.title}
        </h2>
      </div>

      {/* =====================================================
          MEMORY GRID
          ===================================================== */}

      <MemoryGrid
        loading={loading}
        memories={paginatedMemories}
      />

      {/* =====================================================
          PAGINATION
          ===================================================== */}

      {totalPages > 1 && (
        <div
          className="
            flex
            justify-center
            items-center
            gap-3
            mt-14
          "
        >
          {/* =================================================
              PREVIOUS
              ================================================= */}

          <button
            disabled={currentPage === 1}
            onClick={() =>
              goToPage(
                currentPage - 1
              )
            }
            className="
              px-5
              py-2
              rounded-full
              border
              border-[#CBA66F]
              disabled:opacity-40
              bg-[#EBD09B]
            "
          >
            ←
          </button>

          {/* =================================================
              PAGE NUMBERS
              ================================================= */}

          {Array.from(
            {
              length: totalPages,
            },
            (_, i) => i + 1
          ).map((page) => (
            <button
              key={page}
              onClick={() =>
                goToPage(page)
              }
              className={`
                w-10
                h-10
                rounded-full
                transition-all
                ${
                  currentPage === page
                    ? "bg-[#B58A5A] text-white"
                    : "bg-[#EBD09B] border border-[#CBA66F]"
                }
              `}
            >
              {page}
            </button>
          ))}

          {/* =================================================
              NEXT
              ================================================= */}

          <button
            disabled={
              currentPage === totalPages
            }
            onClick={() =>
              goToPage(
                currentPage + 1
              )
            }
            className="
              px-5
              py-2
              rounded-full
              border
              border-[#CBA66F]
              disabled:opacity-40
              bg-[#EBD09B]
            "
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}