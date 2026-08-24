import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import MemoryGrid from "./MemoryGrid";
import memoryWall from "../../assets/illustrations/timeline-memory-wall.png";

/*
=====================================================
TIMELINE MEMORY PAGINATION
=====================================================

The design has three memory cards across, so each page
shows three memories.

Example:

10 memories -> 4 pages
Page 1 -> 1, 2, 3
Page 2 -> 4, 5, 6
Page 3 -> 7, 8, 9
Page 4 -> 10

The admin panel and Timeline data source remain untouched.
=====================================================
*/

const MEMORIES_PER_PAGE = 3;
const MAX_VISIBLE_PAGE_BUTTONS = 5;

const paginationButtonClass = `
  w-10
  h-10
  rounded-full
  border
  border-[#CBA66F]
  bg-[#F5E3B8]
  text-[#6B4B2F]
  font-semibold
  shadow-sm
  transition-all
  duration-200
  hover:-translate-y-0.5
  hover:shadow-md
`;

export default function ChapterSection({
  loading,
  book,
  memories,
  currentPage,
  onPageChange,
}) {
 

  const filteredMemories = memories || [];

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredMemories.length / MEMORIES_PER_PAGE
    )
  );

  const paginatedMemories = filteredMemories.slice(
    (currentPage - 1) * MEMORIES_PER_PAGE,
    currentPage * MEMORIES_PER_PAGE
  );

  
  
  /* Keep the current page valid if the memory count changes. */
  useEffect(() => {
  if (loading) {
    return;
  }

  const validPage = Math.min(
    Math.max(currentPage, 1),
    totalPages
  );

  if (validPage !== currentPage) {
    onPageChange(validPage);
  }
}, [
  loading,
  currentPage,
  totalPages,
  onPageChange,
]);

  /*
  =====================================================
  PAGE NUMBERS
  =====================================================

  Five page buttons are the maximum shown at once.
  This keeps pagination compact even if a book eventually
  contains dozens of memories.
  =====================================================
  */
  const visiblePages = useMemo(() => {
    if (totalPages <= MAX_VISIBLE_PAGE_BUTTONS) {
      return Array.from(
        { length: totalPages },
        (_, index) => index + 1
      );
    }

    let start = Math.max(1, currentPage - 2);
    let end = Math.min(
      totalPages,
      start + MAX_VISIBLE_PAGE_BUTTONS - 1
    );

    if (end - start + 1 < MAX_VISIBLE_PAGE_BUTTONS) {
      start = Math.max(
        1,
        end - MAX_VISIBLE_PAGE_BUTTONS + 1
      );
    }

    return Array.from(
      { length: end - start + 1 },
      (_, index) => start + index
    );
  }, [currentPage, totalPages]);

 function goToPage(page) {
  onPageChange(
    Math.min(Math.max(page, 1), totalPages)
  );
}

  const firstVisiblePage = visiblePages[0];
  const lastVisiblePage =
    visiblePages[visiblePages.length - 1];

  return (
    <div
      className="mx-auto rounded-[40px] border shadow-sm"
      style={{
        width: "1400px",
        height: "clamp(400px, 46.76vh, 505px)",
        padding: "0px 50px",
        marginTop: "0px",
        boxSizing: "border-box",
        position: "relative",

        /*
        The pagination sits just below the memory cards,
        so it must not be clipped by the chapter container.
        */
        overflow: "visible",

        backgroundImage: `url(${memoryWall})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        borderColor: "#CBA66F",
        boxShadow:
          "inset 0 0 45px rgba(120, 79, 35, 0.16)",
      }}
    >
      {/* =====================================================
          CHAPTER TITLE
          ===================================================== */}
      <div className="text-center">
        <h2
          className="mt-1 text-[34px] font-bold text-[#5A4332]"
          style={{
            fontFamily: "Cormorant Garamond, serif",
          }}
        >
          {book.title}
        </h2>
      </div>

      {/* =====================================================
          MEMORY CARDS

          Exactly three cards are rendered per page so the
          existing one-row design remains unchanged.
          ===================================================== */}
      <MemoryGrid
  loading={loading}
  memories={paginatedMemories}
  book={book}
  currentPage={currentPage}
/>

      {/* =====================================================
          PAGINATION
          ===================================================== */}
      {!loading && totalPages > 1 && (
        <div
          className="
            absolute
            left-0
            right-0
            -bottom-0
            z-50
            flex
            items-center
            justify-center
            gap-2
          "
          aria-label="Memory pagination"
        >
          {/* PREVIOUS */}
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => goToPage(currentPage - 1)}
            aria-label="Previous page"
            className={`
              ${paginationButtonClass}
              font-bold
              disabled:opacity-35
              disabled:cursor-not-allowed
              disabled:hover:translate-y-0
            `}
          >
            ←
          </button>

          {/* FIRST PAGE + LEFT ELLIPSIS */}
          {firstVisiblePage > 1 && (
            <>
              <button
                type="button"
                onClick={() => goToPage(1)}
                className={paginationButtonClass}
              >
                1
              </button>

              <span
                className="px-1 font-semibold text-[#8A6B4B]"
                aria-hidden="true"
              >
                …
              </span>
            </>
          )}

          {/* VISIBLE PAGE NUMBERS */}
          {visiblePages.map((page) => (
            <button
              type="button"
              key={page}
              onClick={() => goToPage(page)}
              aria-current={
                currentPage === page ? "page" : undefined
              }
              className={
                currentPage === page
                  ? `${paginationButtonClass} bg-[#B58A5A] text-white border-[#B58A5A] scale-105`
                  : paginationButtonClass
              }
            >
              {page}
            </button>
          ))}

          {/* RIGHT ELLIPSIS + LAST PAGE */}
          {lastVisiblePage < totalPages && (
            <>
              <span
                className="px-1 font-semibold text-[#8A6B4B]"
                aria-hidden="true"
              >
                …
              </span>

              <button
                type="button"
                onClick={() => goToPage(totalPages)}
                className={paginationButtonClass}
              >
                {totalPages}
              </button>
            </>
          )}

          {/* NEXT */}
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => goToPage(currentPage + 1)}
            aria-label="Next page"
            className={`
              ${paginationButtonClass}
              font-bold
              disabled:opacity-35
              disabled:cursor-not-allowed
              disabled:hover:translate-y-0
            `}
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}