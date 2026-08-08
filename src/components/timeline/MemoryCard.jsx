import React from "react";
import { useNavigate } from "react-router-dom";

import memoryWall from "../../assets/illustrations/timeline-memory-wall.png";

export default function MemoryCard({ memory }) {
  const navigate = useNavigate();

  const formattedDate = memory.date
    ? new Date(memory.date).toLocaleDateString(
        "en-IN",
        {
          day: "numeric",
          month: "long",
          year: "numeric",
        }
      )
    : "";

  /* ======================================
     IMAGE
  ====================================== */

  const coverImage =
    memory.cover_image ||
    memory.cover ||
    memory.image ||
    "/placeholder-memory.jpg";

  return (
    <div
      onClick={() =>
        navigate(`/timeline/memory/${memory.slug}`)
      }
      className="
        group
        cursor-pointer
        relative
        -translate-y-20
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

   {/* ======================================
    IMAGE
====================================== */}

<div
  className="overflow-hidden h-35"
  style={{
    backgroundImage: `url(${coverImage})`,
    backgroundSize: "100% auto",
    backgroundPosition: "center 35%",
    backgroundRepeat: "no-repeat",
  }}
>

</div>


      {/* ======================================
          CONTENT
      ====================================== */}

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

        {/* Category */}

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


        {/* Date */}

        <p className="mt-1 text-sm text-[#A68B64] font-medium">
          {formattedDate}
        </p>


        {/* Title */}

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


        {/* Description */}

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


        {/* Button */}

        <button
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