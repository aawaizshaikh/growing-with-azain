import React from "react";
import { useNavigate } from "react-router-dom";

import memoryWall from "../../assets/illustrations/timeline-memory-wall.png";

export default function MemoryCard({ memory }) {
  const navigate = useNavigate();

  /*
  =====================================================
  FORMATTED DATE
  =====================================================
  */

  const formattedDate = memory.date
    ? new Date(
        memory.date
      ).toLocaleDateString(
        "en-IN",
        {
          day: "numeric",
          month: "long",
          year: "numeric",
        }
      )
    : "";

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
    navigate(
      `/timeline/memory/${memory.slug}`
    );
  }

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
        bg-[#FFFDF9]
        border
        border-[#EEE4D7]
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-2
        hover:shadow-xl
      "
    >
      {/* =====================================================
          COVER IMAGE

          IMPORTANT:

          The image has a deliberate master-scene height.

          We do NOT allow the source image's natural
          dimensions to determine the card height.

          object-cover preserves the image geometry without
          distorting the photograph.
          ===================================================== */}

      <div
        style={{
          width: "100%",
          height: "150px",
          overflow: "hidden",
        }}
      >
        <img
          src={coverImage}
          alt={
            memory.title ||
            "Memory"
          }
          draggable={false}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            display: "block",
            userSelect: "none",
          }}
        />
      </div>

      {/* =====================================================
          CONTENT
          ===================================================== */}

      <div
        className="p-2"
        style={{
          backgroundImage: `
            linear-gradient(
              rgba(221, 181, 116, 0.72),
              rgba(221, 181, 116, 0.72)
            ),
            url(${memoryWall})
          `,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* =================================================
            CATEGORY
            ================================================= */}

        {memory.category && (
          <span
            className="
              inline-block
              px-3
              py-1
              rounded-full
              bg-[#F3ECE1]
              text-[#A67F4C]
              text-xs
              font-semibold
              uppercase
              tracking-wider
            "
          >
            {memory.category}
          </span>
        )}

        {/* =================================================
            DATE
            ================================================= */}

        <p
          className="
            mt-1
            text-sm
            text-[#A68B64]
            font-medium
          "
        >
          {formattedDate}
        </p>

        {/* =================================================
            TITLE
            ================================================= */}

        <h3
          className="
            mt-2
            text-[24px]
            leading-tight
            font-bold
            text-[#5A4332]
          "
          style={{
            fontFamily:
              "Cormorant Garamond, serif",
          }}
        >
          {memory.title}
        </h3>

        {/* =================================================
            DESCRIPTION
            ================================================= */}

        <p
          className="
            mt-2
            text-[#75675B]
            leading-6
            line-clamp-2
            min-h-0
          "
        >
          {memory.description}
        </p>

        {/* =================================================
            BUTTON
            ================================================= */}

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            openMemory();
          }}
          className="
            mt-4
            px-5
            py-2.5
            rounded-full
            bg-[#B58A5A]
            text-white
            font-semibold
            transition-colors
            duration-300
            hover:bg-[#9C7448]
          "
        >
          Read Memory →
        </button>
      </div>
    </div>
  );
}