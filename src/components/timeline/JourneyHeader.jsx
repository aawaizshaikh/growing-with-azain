import React from "react";

import balloon from "../../assets/illustrations/balloon.png";
import teddy from "../../assets/illustrations/teddy.png";
import leafSpray from "../../assets/illustrations/timeline-leaf-spray.png";
import leftPlant from "../../assets/illustrations/timeline-plant-left.png";
import rightVine from "../../assets/illustrations/timeline-vine-right.png";
import decoration from "../../assets/illustrations/timeline-header-decoration.png";

export default function JourneyHeader() {
  return (
    <section className="relative overflow-hidden pt-24 pb-10">

    
      
      <div className="relative z-10 text-center max-w-6xl mx-auto">

        <img
          src={decoration}
          alt=""
          className="mx-auto w-48 mb-4"
        />

        <h1
          className="text-[#556B2F] text-6xl md:text-7xl font-bold"
          style={{
            fontFamily: "Cormorant Garamond, serif",
          }}
        >
          Journey
        </h1>

        <p className="mt-4 text-[#6d6258] text-lg">
          Every stage, every smile, every memory.
        </p>

      </div>

    </section>
  );
}