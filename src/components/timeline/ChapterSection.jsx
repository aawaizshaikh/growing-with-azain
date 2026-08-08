import React, { useState } from "react";
import MemoryGrid from "./MemoryGrid";

import memoryWall from "../../assets/illustrations/timeline-memory-wall.png";

export default function ChapterSection({
  loading,
  book,
  memories,
}) {
  const [currentPage, setCurrentPage] =
    useState(1);

  const MEMORIES_PER_PAGE = 6;

  /* ==========================================
     FILTER
  ========================================== */

  const filteredMemories = memories;

  /* ==========================================
     PAGINATION
  ========================================== */

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

  function goToPage(page) {
    setCurrentPage(page);

    window.scrollTo({
      top: 700,
      behavior: "smooth",
    });
  }

  return (
    <div
      className="
        mx-auto
        rounded-[40px]
        border
        shadow-sm
        overflow-hidden
      "
      style={{
        width: "min(1400px, calc(100% - 10px))",
        height: "505px",
        padding: "0px 50px",
        marginTop: "-275px",
        boxSizing: "border-box",
        position: "relative",

        /* ==========================================
           MEMORY WALLPAPER
        ========================================== */

        backgroundImage: `url(${memoryWall})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",

        borderColor: "#CBA66F",

        boxShadow:
          "inset 0 0 45px rgba(120, 79, 35, 0.16)",
      }}
    >

      {/* ==========================================
          HEADING
      ========================================== */}

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


      {/* ==========================================
          MEMORY GRID
      ========================================== */}

      <MemoryGrid
        loading={loading}
        memories={paginatedMemories}
      />


      {/* ==========================================
          PAGINATION
      ========================================== */}

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

          <button
            disabled={currentPage === 1}
            onClick={() =>
              goToPage(currentPage - 1)
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


          {Array.from(
            { length: totalPages },
            (_, i) => i + 1
          ).map((page) => (

            <button
              key={page}
              onClick={() => goToPage(page)}
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


          <button
            disabled={
              currentPage === totalPages
            }
            onClick={() =>
              goToPage(currentPage + 1)
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