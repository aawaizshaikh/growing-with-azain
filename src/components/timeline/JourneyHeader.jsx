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
          text-[#4A2E22]
          text-6xl
          md:text-7xl
          font-bold
          leading-none
          -translate-y-8
        "
        style={{
          fontFamily: "Cormorant Garamond, serif",
        }}
      >
        Journey
      </h1>


      {/* SUB TITLE */}
      <p
      style={{
      position: "relative",
      left: "-50%",
    }}
        className="
          mt-1
          w-[45vw]
          max-w-[650px]
          text-[#4A2E22]
          text-1g
          font-bold
        "
      >
        Every little moment of your journey is tucked away in these pages — every giggle, every tear, every tiny wonder, and every beautiful thing you do.
For you are our greatest blessing, our sweetest story, and the most precious chapter of our lives.


      </p>

    </div>
  );
}