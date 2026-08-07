import React from "react";

import decoration from "../../assets/illustrations/timeline-header-decoration.png";

export default function JourneyHeader() {
  return (
    <div
      className="
        relative
        z-10
        text-center
        max-w-6xl
        mx-auto
        -mt-1
        mb-15
      "
    >

      {/* HEADER DECORATION */}
      <img
        src={decoration}
        alt=""
        className="
          mx-auto
          w-36
          mb-1
          pointer-events-none
          select-none
        "
      />


      {/* MAIN TITLE */}
      <h1
        className="
          text-[#F3E6C8]
          text-6xl
          md:text-7xl
          font-bold
          leading-none
        "
        style={{
          fontFamily: "Cormorant Garamond, serif",
        }}
      >
        Journey
      </h1>


      {/* SUB TITLE */}
      <p
        className="
          mt-1
          text-[#E8D3A8]
          text-base
        "
      >
        Every stage, every smile, every memory.
      </p>

    </div>
  );
}