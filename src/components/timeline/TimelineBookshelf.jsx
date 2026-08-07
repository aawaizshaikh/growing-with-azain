import React from "react";

import shelfImg from "../../assets/illustrations/timeline-shelf.png";
import plantLeft from "../../assets/illustrations/timeline-plant-left.png";
import vineRight from "../../assets/illustrations/timeline-vine-right.png";
import balloon from "../../assets/illustrations/balloon.png";
import cloud from "../../assets/illustrations/cloud.png";
import teddy from "../../assets/illustrations/teddy.png";

export default function TimelineBookshelf({
  books,
  memoriesByChapter,
  selectedBook,
  onSelectBook,
}) {
  /*
  ===============================================================
  BOOK POSITIONS
  ===============================================================
  Fine tune ONLY these values.
  Everything else adjusts automatically.
  */

const BOOKS = {
  newborn: {
    left: 113,
    width: 225,
    height: 480,
    bottom: 140,

    badgeTop: 362,
    badgeRight: 95,
  },

  infant: {
    left: 272,
    width: 135,
    height: 500,
    bottom: 140,

    badgeTop: 410,
    badgeRight:50,
  },

  toddler: {
    left: 395,
    width: 140,
    height: 480,
    bottom: 155,

    badgeTop: 408,
    badgeRight: 50,
  },

  preschool: {
    left: 517,
    width: 138,
    height: 490,
    bottom: 140,

    badgeTop: 390,
    badgeRight: 50,
  },

  school: {
    left: 640,
    width: 142,
    height: 500,
    bottom: 137,

    badgeTop: 397,
    badgeRight: 50,
  },

  teen: {
    left: 755,
    width: 140,
    height: 475,
    bottom: 165,

    badgeTop:400,
    badgeRight: 50
  },
};

  return (
    <section className="relative mt-6 pb-20">

      {/* =====================================================
          DECORATIONS
      ===================================================== */}

     
      
      

      {/* =====================================================
          TITLE
      ===================================================== */}
      {/* ===========================
    LEFT CLOUD
=========================== */}

<img
  src={cloud}
  alt=""
  draggable={false}
  style={{
    position: "absolute",
    left: 150,
    top: -150,
    width: 400,
    zIndex: 20,
    pointerEvents: "none",
    userSelect: "none",
  }}
/>

{/* ===========================
    RIGHT CLOUD
=========================== */}

<img
  src={cloud}
  alt=""
  draggable={false}
  style={{
    position: "absolute",
    right: 150,
    top: -150,
    width:400,
    transform: "scaleX(-1)",
    zIndex: 1,
    pointerEvents: "none",
    userSelect: "none",
  }}
/>

      <div className="text-center mb-10">

        <p
          className="
            uppercase
            tracking-[0.35em]
            text-[#A69070]
            text-xs
            font-semibold
          "
        >
          Life Chapters
        </p>

        <h2
          className="
            mt-2
            text-5xl
            font-bold
            text-[#5A4332]
          "
          style={{
            fontFamily: "Cormorant Garamond, serif",
          }}
        >
          Pick a Chapter
        </h2>

        <p className="mt-3 text-[#7B6F63]">
          Every memory belongs to a beautiful chapter.
        </p>

      </div>

      {/* =====================================================
          BOOK AREA
      ===================================================== */}
      {/* Floating Balloon */}
<img
  src={balloon}
  alt=""
  draggable={false}
  style={{
    position: "absolute",
    left: "60%",
    transform: "translateX(-50%)",
    top: -10,
    width: 750,
    zIndex: 5,
    pointerEvents: "none",
    userSelect: "none",
  }}
  className="timeline-float"
/>

      <div
        className="relative mx-auto"
        style={{
          width: 1080,
          height: 760,
          maxWidth: "100%",
        }}
      >
                {/* ===========================
            BOOKS
        ============================ */}

        {books.map((book) => {
          const config = BOOKS[book.slug];

          const memoryCount =
            memoriesByChapter?.[book.slug]?.length || 0;

          const isSelected =
            selectedBook.slug === book.slug;

          return (
            <div
              key={book.slug}
              className="absolute"
              style={{
                left: config.left,
                bottom: config.bottom,
                zIndex: isSelected ? 25 : 20,
                transition: "all .35s ease",
                transform: isSelected
                  ? "translateY(-18px)"
                  : "translateY(0px)",
              }}
            >
              {/* Count */}

              <div
  className="
    absolute
    z-40
    w-9
    h-9
    rounded-full
    bg-[#B58A5A]
    text-white
    text-sm
    font-bold
    flex
    items-center
    justify-center
    shadow-lg
  "
  style={{
    top: config.badgeTop,
    right: config.badgeRight,
  }}
>
  {memoryCount}
</div>

              {/* Book */}

              <img
                src={book.image}
                alt={book.title}
                draggable={false}
                onClick={() => onSelectBook(book)}
                className="
                  cursor-pointer
                  select-none
                  transition-all
                  duration-300
                  hover:scale-[1.03]
                  hover:-translate-y-2
                "
                style={{
                  width: config.width,
                  height: config.height,
                  objectFit: "contain",
                  display: "block",
                }}
              />
            </div>
          );
        })}

        {/* ===========================
            SHELF
        ============================ */}
        {/* Plant Sitting on Shelf */}
        {/* Teddy Sitting on Shelf */}
        {/* Left Hanging Vine */}
        {/* Right Hanging Vine */}

<img
  src={vineRight}
  alt=""
  draggable={false}
  style={{
    position: "absolute",
    right: 75,
    bottom: -50,
    width: 250,
    zIndex: 15,
    pointerEvents: "none",
    userSelect: "none",
  }}
/>

<img
  src={vineRight}
  alt=""
  draggable={false}
  style={{
    position: "absolute",
    left: 10,
    bottom: -55,
    width: 250,
    transform: "scaleX(-1)",
    zIndex: 15,
    pointerEvents: "none",
    userSelect: "none",
  }}
/>

<img
  src={teddy}
  alt=""
  draggable={false}
  style={{
    position: "absolute",
    right: 75,
    bottom: 150,
    width: 200,
    zIndex: 20,
    pointerEvents: "none",
    userSelect: "none",
  }}
/>
        <img
  src={plantLeft}
  alt=""
  draggable={false}
  style={{
    position: "absolute",
    left: 15,
    bottom: 125,
     width: 220,
    zIndex: 20,
    pointerEvents: "none",
    userSelect: "none",
  }}
/>

        <img
          src={shelfImg}
          alt=""
          draggable={false}
          className="
            absolute
            bottom-0
            left-1/2
            -translate-x-1/2
            w-[980px]
            pointer-events-none
            select-none
            z-10
          "
        />

      </div>

    </section>
  );
}