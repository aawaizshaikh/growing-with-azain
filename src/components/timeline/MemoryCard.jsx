import React from "react";
import { useNavigate } from "react-router-dom";

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

  /*
  ======================================
  IMAGE
  ======================================
  */

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

      <div className="overflow-hidden">

        <img
          src={coverImage}
          alt={memory.title}
          className="
            w-full
            h-64
            object-cover
            transition-transform
            duration-500
            group-hover:scale-105
          "
        />

      </div>

      {/* ======================================
          CONTENT
      ====================================== */}

      <div className="p-6">

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

        <p className="mt-4 text-sm text-[#A68B64] font-medium">
          {formattedDate}
        </p>

        {/* Title */}

        <h3
          className="
            mt-2
            text-[30px]
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
            mt-4
            text-[#75675B]
            leading-7
            line-clamp-3
            min-h-[84px]
          "
        >
          {memory.description}
        </p>

        {/* Button */}

        <button
          className="
            mt-8
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