import React from "react";
import { useNavigate } from "react-router-dom";

export default function MemoryCard({ memory }) {
  const navigate = useNavigate();

  /*
  =====================================================
  MEMORY COVER IMAGE
  =====================================================
  */

  const coverImage =
    memory.cover_image ||
    memory.cover ||
    memory.image ||
    "/placeholder-memory.jpg";

  /*
  =====================================================
  OPEN MEMORY
  =====================================================
  */

  function openMemory() {
    navigate(`/timeline/memory/${memory.slug}`);
  }

  /*
  =====================================================
  RENDER
  =====================================================
  */

  return (
    <div
      onClick={openMemory}
      className="
        group
        cursor-pointer
        relative
        w-full
        rounded-[28px]
        overflow-hidden
        border
        border-[#EEE4D7]
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-2
        hover:shadow-xl
      "
      style={{
        height: "320px",
      }}
    >
      {/* =====================================================
          COVER IMAGE
          ===================================================== */}

      <img
        src={coverImage}
        alt={memory.title || "Memory"}
        draggable={false}
        className="
          absolute
          inset-0
          w-full
          h-full
          object-cover
          transition-transform
          duration-500
          group-hover:scale-[1.03]
        "
        style={{
          objectPosition: "center",
          userSelect: "none",
        }}
      />

      {/* =====================================================
          SUBTLE BOTTOM GRADIENT

          Keeps the title readable without creating the
          beige content section.
          ===================================================== */}

      <div
        className="
          absolute
          inset-x-0
          bottom-0
          h-[45%]
          pointer-events-none
        "
        style={{
          background:
            "linear-gradient(to top, rgba(55, 38, 25, 0.72), rgba(55, 38, 25, 0))",
        }}
      />

      {/* =====================================================
          TITLE
          ===================================================== */}

      <div
        className="
          absolute
          left-0
          right-0
          bottom-0
          px-5
          pb-5
          pointer-events-none
        "
      >
        <h3
          className="
            text-[24px]
            leading-tight
            font-bold
            text-white
            drop-shadow-[0_2px_3px_rgba(0,0,0,0.45)]
          "
          style={{
            fontFamily: "Cormorant Garamond, serif",
          }}
        >
          {memory.title}
        </h3>
      </div>
    </div>
  );
}