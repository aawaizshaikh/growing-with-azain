import React from "react";
import MemoryCard from "./MemoryCard";

export default function MemoryGrid({
  loading,
  memories,
}) {
  /*
  =====================================
  LOADING
  =====================================
  */

  if (loading) {
    return (
      <div className="py-20 text-center text-[#8A7A68]">
        Loading memories...
      </div>
    );
  }

  /*
  =====================================
  EMPTY
  =====================================
  */

  if (!memories.length) {
    return (
      <div className="flex justify-center">

        <div
          className="
            bg-[#FFFDF9]
            border
            border-[#EEE4D7]
            rounded-[28px]
            px-12
            py-16
            max-w-xl
            text-center
          "
        >

          <div className="text-6xl mb-6">
            📖
          </div>

          <h3
            className="text-4xl text-[#5A4332] font-bold"
            style={{
              fontFamily:
                "Cormorant Garamond, serif",
            }}
          >
            No Memories Yet
          </h3>

          <p className="mt-5 text-[#7B6F63] leading-7">
            Memories added from your Admin
            Panel will automatically appear
            here.
          </p>

        </div>

      </div>
    );
  }

  /*
  =====================================
  GRID
  =====================================
  */

  return (

    <div
      className="
        grid
        grid-cols-1
        md:grid-cols-2
        lg:grid-cols-3
        gap-8
      "
    >

      {memories.map((memory) => (

        <MemoryCard
          key={memory.id}
          memory={memory}
        />

      ))}

    </div>

  );
}