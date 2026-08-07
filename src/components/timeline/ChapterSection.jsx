import React, { useMemo, useState } from "react";
import MemoryGrid from "./MemoryGrid";

export default function ChapterSection({
  loading,
  book,
  memories,
}) {
  const [selectedMonth, setSelectedMonth] =
    useState("All");

  const [currentPage, setCurrentPage] =
    useState(1);

  const MEMORIES_PER_PAGE = 6;

  /*
  ==========================
  MONTHS
  ==========================
  */

  const months = useMemo(() => {
    const unique = new Set();

    memories.forEach((memory) => {
      if (!memory.date) return;

      const month = new Date(
        memory.date
      ).toLocaleString("default", {
        month: "long",
        year: "numeric",
      });

      unique.add(month);
    });

    return ["All", ...unique];
  }, [memories]);

  /*
  ==========================
  FILTER
  ==========================
  */

  const filteredMemories = useMemo(() => {
    if (selectedMonth === "All")
      return memories;

    return memories.filter((memory) => {
      const month = new Date(
        memory.date
      ).toLocaleString("default", {
        month: "long",
        year: "numeric",
      });

      return month === selectedMonth;
    });
  }, [selectedMonth, memories]);

  /*
  ==========================
  PAGINATION
  ==========================
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

  function goToPage(page) {
    setCurrentPage(page);

    window.scrollTo({
      top: 700,
      behavior: "smooth",
    });
  }
    return (
    <section className="max-w-7xl mx-auto px-6 mt-20 mb-24">

      {/* ==========================================
          CHAPTER CARD
      ========================================== */}

      <div
        className="rounded-[34px] bg-[#FDFBF6] border border-[#EEE5D7] shadow-sm"
        style={{
          padding: "55px 60px",
        }}
      >

        {/* Heading */}

        <div className="text-center">

          <p
            className="uppercase tracking-[0.35em] text-xs font-semibold text-[#B19169]"
          >
            Chapter
          </p>

          <h2
            className="mt-3 text-[54px] font-bold text-[#5A4332]"
            style={{
              fontFamily:
                "Cormorant Garamond, serif",
            }}
          >
            {book.title}
          </h2>

          <p className="mt-3 text-[#8B7B69]">
            {filteredMemories.length} Memories
          </p>

        </div>

        {/* ==========================================
            MONTH FILTER
        ========================================== */}

        <div
          className="
            flex
            flex-wrap
            justify-center
            gap-3
            mt-10
            mb-12
          "
        >

          {months.map((month) => (

            <button
              key={month}
              onClick={() => {
                setSelectedMonth(month);
                setCurrentPage(1);
              }}
              className={`
                px-5
                py-2.5
                rounded-full
                text-sm
                transition-all
                duration-300
                ${
                  selectedMonth === month
                    ? "bg-[#B58A5A] text-white shadow-md"
                    : "bg-white text-[#75675B] border border-[#ECE3D8]"
                }
              `}
            >
              {month}
            </button>

          ))}

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
              disabled={currentPage === totalPages}
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

    </section>
  );
}