import React from "react";
import MemoryCard from "./MemoryCard";

export default function MemoryGrid({
  loading,
  memories,
  book,
  currentPage,
}) {
  /* =====================================================
     LOADING
     ===================================================== */

  if (loading) {
    return (
      <div
        className="
          flex
          items-center
          justify-center
          text-[#7B6F63]
        "
        style={{
          width: "100%",
          minHeight: "300px",
        }}
      >
        Loading memories...
      </div>
    );
  }

  /* =====================================================
     EMPTY
     ===================================================== */

  if (!memories.length) {
    return (
      <div
        className="
          flex
          flex-col
          items-center
          justify-center
          text-center
        "
        style={{
          width: "100%",
          minHeight: "300px",
        }}
      >
        <div
          className="
            text-6xl
            mb-5
          "
        >
          📖
        </div>

        <h3
          className="
            text-4xl
            text-[#5A4332]
            font-bold
          "
          style={{
            fontFamily:
              "Cormorant Garamond, serif",
          }}
        >
          No Memories Yet
        </h3>

        <p
          className="
            mt-5
            text-[#7B6F63]
            leading-7
          "
        >
          Memories added from your Admin
          Panel will automatically appear
          here.
        </p>
      </div>
    );
  }

  /* =====================================================
     MEMORY GRID

     IMPORTANT RESPONSIVE ARCHITECTURE

     ChapterSection is now a fixed 1400px master-scene
     container.

     Therefore this grid is ALSO defined in the master
     coordinate system.

     We deliberately do NOT use:

       - window.innerWidth
       - viewport calculations
       - screen-specific breakpoints
       - vw
       - browser-width-dependent columns

     The entire grid scales automatically because its
     parent ChapterSection belongs to the master scene.

     Six memories per page:

       Card 1   Card 2   Card 3
       Card 4   Card 5   Card 6
     ===================================================== */

  return (
    <div
      style={{
        width: "100%",
        display: "grid",

        /*
        =================================================
        MASTER GRID

        Three equal columns inside the 1400px
        ChapterSection.

        =================================================
        */

        gridTemplateColumns:
          "repeat(3, minmax(0, 1fr))",

        /*
        Fixed master-coordinate gap.

        Because the entire parent scene scales, this
        gap scales with it as well.
        */

        columnGap: "24px",
        rowGap: "24px",

        /*
        Give the grid a predictable master-scene
        footprint.
        */

        alignItems: "start",
      }}
    >
      {memories.map((memory) => (
        <MemoryCard
  key={
    memory.id ||
    memory.slug ||
    memory.created_at ||
    JSON.stringify(memory)
  }
  memory={memory}
  book={book}
  currentPage={currentPage}
/>
      ))}
    </div>
  );
}