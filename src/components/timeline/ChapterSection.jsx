import React, { useState } from "react";
import MemoryGrid from "./MemoryGrid";

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
        bg-[#FDFBF6]
        border
        border-[#EEE5D7]
        shadow-sm
      "
      style={{
        width: "min(1400px, calc(100% - 10px))",
        height: "505px",
        padding: "0px 50px",
        marginTop: "-300px",
        boxSizing: "border-box",
        position: "relative",
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
              border-[#E7DDD0]
              disabled:opacity-40
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
                    : "bg-white border border-[#E7DDD0]"
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
              border-[#E7DDD0]
              disabled:opacity-40
            "
          >
            →
          </button>

        </div>

      )}

    </div>
  );
}