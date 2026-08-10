import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import books from "../components/timeline/books";

import TimelineDrawer from "../components/timeline/TimelineDrawer";
import JourneyHeader from "../components/timeline/JourneyHeader";
import TimelineBookshelf from "../components/timeline/TimelineBookshelf";
import ChapterSection from "../components/timeline/ChapterSection";

import vintageWall from "../assets/illustrations/background-new.png";
import vintageLamp from "../assets/illustrations/timeline-vintage-lamp-new.png";
import vintageCarpet from "../assets/illustrations/timeline-vintage-carpet-new.png";
import vintageTeddyPillow from "../assets/illustrations/timeline-vintage-teddy-pillow.png";
import vintageRockingHorse from "../assets/illustrations/timeline-vintage-rocking-horse.png";
import vintageAlphabetBlocks1 from "../assets/illustrations/timeline-vintage-alphabet-blocks-1.png";
import vintageAlphabetBlocks2 from "../assets/illustrations/timeline-vintage-alphabet-blocks-2.png";
import vintagefootball from "../assets/illustrations/timeline-vintage-football.png";
import vintageunicorn from "../assets/illustrations/timeline-vintage-unicorn.png";
import vintagecars from "../assets/illustrations/timeline-vintage-random-cars.png";
import vintagetoytrain from "../assets/illustrations/timeline-vintage-toytrain.png";

import { getTimelineMemories } from "../services/timelineService";

/*
=====================================================
PROFESSIONAL RESPONSIVE TIMELINE
=====================================================

BACKGROUND
----------
The wallpaper is the first visual layer.

It fills the actual browser viewport:

    width  = 100vw
    height = 100vh
    object-fit = cover

It is NOT part of a 1920 × 1080 master canvas.

ELEMENTS
--------
Every major element is positioned relative to the
actual viewport.

IMPORTANT
---------
The bookshelf is treated as ONE COMPLETE UNIT.

TimelineBookshelf itself is NOT modified here.

Its internal books, shelves, proportions and layout
remain untouched.

We only control:

    left
    top
    overall width

for the COMPLETE bookshelf component.
=====================================================
*/

/*
=====================================================
RESPONSIVE LAYOUT
=====================================================

These are INITIAL values only.

We will manually fine-tune them after confirming
the responsive structure works correctly.

POSITION
--------
left / right = viewport percentage
top / bottom = viewport percentage

SIZE
-----
vw / clamp()

Images preserve their natural proportions.

=====================================================
*/

const RESPONSIVE_LAYOUT = {
  /*
  =====================================================
  HEADER
  =====================================================
  */

  header: {
    top: "4.17%",
  },

  /*
  =====================================================
  BOOKSHELF — COMPLETE UNIT
  =====================================================

  IMPORTANT:

  TimelineBookshelf is treated as ONE object.

  Original complete unit:

      1080 × 600

  Nothing inside this component is individually
  positioned or resized here.

  We only control the complete unit.

  CURRENT POSITION IS ONLY A STARTING POINT.
  We will adjust this manually later.
  =====================================================
  */

  bookshelf: {
    left: "31.88%",
    top: "14.52%",
  },

  /*
  =====================================================
  CHAPTER / MEMORY SECTION
  =====================================================
  */

  chapter: {
    left: "17.54%",
    top: "41.78%",
    width:
      "min(100.92vw, 1640px)",
  },

  /*
  =====================================================
  LEFT LAMP
  =====================================================
  */

  lampLeft: {
    left: "3.65%",
    top: "5.09%",
    width:
      "clamp(90px, 7.81vw, 150px)",
  },

  /*
  =====================================================
  RIGHT LAMP
  =====================================================
  */

  lampRight: {
    right: "5.65%",
    top: "5.09%",
    width:
      "clamp(90px, 7.81vw, 150px)",
  },

  /*
  =====================================================
  ROCKING HORSE
  =====================================================
  */

  horse: {
    left: "3.65%",
    top: "68.06%",
    width:
      "min(19.53vw, 375px)",
  },

  /*
  =====================================================
  TEDDY
  =====================================================
  */

  teddy: {
    right: "6.39%",
    top: "65.06%",
    width:
      "clamp(130px, 12.81vw, 500px)",
  },

  /*
  =====================================================
  CARPET
  =====================================================
  */

  carpet: {
    top: "78.24%",
    width:
      "min(39.11vw, 955px)",
  },

  /*
  =====================================================
  UNICORN
  =====================================================
  */

  unicorn: {
    right: "25.62%",
    top: "75.17%",
    width:
      "min(11.59vw, 365px)",
  },

  /*
  =====================================================
  ALPHABET BLOCKS — RIGHT
  =====================================================
  */

  alphabetRight: {
    right: "38.08%",
    top: "84.09%",
    width:
      "min(9.38vw, 180px)",
  },

  /*
  =====================================================
  ALPHABET BLOCKS — LEFT
  =====================================================
  */

  alphabetLeft: {
    left: "31.25%",
    top: "78.70%",
    width:
      "min(7.55vw, 145px)",
  },

  /*
  =====================================================
  FOOTBALL
  =====================================================
  */

  football: {
    right: "75.04%",
    top: "78.65%",
    width:
      "min(6.25vw, 120px)",
  },

  /*
  =====================================================
  TOY TRAIN
  =====================================================
  */

  train: {
    right: "73.26%",
    top: "87.15%",
    width:
      "min(7.81vw, 150px)",
  },

  /*
  =====================================================
  CARS
  =====================================================
  */

  cars: {
    left: "75.65%",
    top: "84.70%",
    width:
      "min(14.84vw, 285px)",
  },
};

export default function Timeline() {
  const navigate = useNavigate();

  /*
  =====================================================
  STATE
  =====================================================
  */

  const [drawerOpen, setDrawerOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [memories, setMemories] =
    useState([]);

  const [selectedBook, setSelectedBook] =
    useState(books[0]);

  /*
  =====================================================
  VIEWPORT WIDTH
  =====================================================

  Used only to scale the COMPLETE bookshelf unit.

  The bookshelf itself remains a fixed 1080 × 600
  composition internally.
  =====================================================
  */

  const [viewportWidth, setViewportWidth] =
    useState(() =>
      typeof window !== "undefined"
        ? window.innerWidth
        : 1920
    );

  useEffect(() => {
    const updateViewportWidth = () => {
      setViewportWidth(window.innerWidth);
    };

    updateViewportWidth();

    window.addEventListener(
      "resize",
      updateViewportWidth
    );

    return () => {
      window.removeEventListener(
        "resize",
        updateViewportWidth
      );
    };
  }, []);
  const [viewportHeight, setViewportHeight] =
  useState(() =>
    typeof window !== "undefined"
      ? window.innerHeight
      : 1080
  );

useEffect(() => {
  const updateViewportHeight = () => {
    setViewportHeight(window.innerHeight);
  };

  updateViewportHeight();

  window.addEventListener(
    "resize",
    updateViewportHeight
  );

  return () => {
    window.removeEventListener(
      "resize",
      updateViewportHeight
    );
  };
}, []);

  /*
  =====================================================
  COMPLETE BOOKSHELF SCALE

  1920px viewport = original 1080px bookshelf.

  Smaller screens scale the COMPLETE unit down.

  Larger screens do not enlarge the bookshelf beyond
  its original 1080px design size.

  The internal bookshelf is never resized or distorted.
  =====================================================
  */

  const BOOKSHELF_SIZE = 0.75;

const bookshelfScale =
  Math.min(viewportWidth / 1920, 1) * BOOKSHELF_SIZE;
  const chapterScale = Math.min(
  Math.max(
    0.75 +
      ((viewportHeight - 700) / 380) *
        0.15,
    0.75
  ),
  0.90
);
const chapterTop =
  41.78 -
  Math.max(
    0,
    (1080 - viewportHeight) / 380
  ) * 9;

  /*
  =====================================================
  PREVENT PAGE SCROLLING
  =====================================================
  */

  useEffect(() => {
    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, []);

  /*
  =====================================================
  LOAD MEMORIES
  =====================================================
  */

  useEffect(() => {
    async function loadMemories() {
      try {
        const data =
          await getTimelineMemories();

        setMemories(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadMemories();
  }, []);

  /*
  =====================================================
  GROUP MEMORIES BY CHAPTER
  =====================================================
  */

  const memoriesByChapter =
    useMemo(() => {
      const grouped = {};

      books.forEach((book) => {
        grouped[book.slug] = [];
      });

      memories.forEach((memory) => {
        const chapter =
          memory.category?.toLowerCase() ||
          memory.age?.toLowerCase();

        if (grouped[chapter]) {
          grouped[chapter].push(memory);
        }
      });

      return grouped;
    }, [memories]);

  /*
  =====================================================
  CURRENT CHAPTER
  =====================================================
  */

  const selectedMemories =
    memoriesByChapter[
      selectedBook.slug
    ] || [];

  return (
    <main
      className="
        relative
        w-screen
        h-screen
        overflow-hidden
      "
      style={{
        backgroundColor:
          "#D9A765",
      }}
    >

      {/* =================================================
          BACKGROUND
          =================================================

          This is the first visual layer.

          It belongs directly to the viewport.

          It is NOT inside the bookshelf.
          It is NOT inside a 1920 × 1080 stage.
          ================================================= */}

      <img
        src={vintageWall}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="
          absolute
          inset-0
          w-full
          h-full
          object-cover
          object-center
          pointer-events-none
          select-none
        "
        style={{
          zIndex: 0,
        }}
      />

      {/* =================================================
          LEFT LAMP
          ================================================= */}

      <img
        src={vintageLamp}
        alt=""
        draggable={false}
        className="
          absolute
          pointer-events-none
          select-none
        "
        style={{
          left:
            RESPONSIVE_LAYOUT
              .lampLeft
              .left,

          top:
            RESPONSIVE_LAYOUT
              .lampLeft
              .top,

          width:
            RESPONSIVE_LAYOUT
              .lampLeft
              .width,

          height:
            "auto",

          zIndex: 10,
        }}
      />

      {/* =================================================
          RIGHT LAMP
          ================================================= */}

      <img
        src={vintageLamp}
        alt=""
        draggable={false}
        className="
          absolute
          pointer-events-none
          select-none
        "
        style={{
          right:
            RESPONSIVE_LAYOUT
              .lampRight
              .right,

          top:
            RESPONSIVE_LAYOUT
              .lampRight
              .top,

          width:
            RESPONSIVE_LAYOUT
              .lampRight
              .width,

          height:
            "auto",

          transform:
            "scaleX(-1)",

          transformOrigin:
            "center",

          zIndex: 10,
        }}
      />

      {/* =================================================
          JOURNEY HEADER
          ================================================= */}

      <div
        className="
          absolute
          left-1/2
          -translate-x-1/2
          max-w-[90vw]
          z-20
        "
        style={{
          left: "15%",
          top:
            RESPONSIVE_LAYOUT
              .header
              .top,
        }}
      >
        <JourneyHeader />
      </div>

      {/* =================================================
          BOOKSHELF — COMPLETE UNIT
          =================================================

          IMPORTANT:

          DO NOT MODIFY TimelineBookshelf itself.

          This wrapper controls ONLY:

              position
              overall size

          The entire bookshelf remains one unit.

          Original internal ratio:

              1080 × 600
          ================================================= */}

      <div
        className="
          absolute
          z-30
        "
        style={{
          left:
            RESPONSIVE_LAYOUT
              .bookshelf
              .left,

          top:
            RESPONSIVE_LAYOUT
              .bookshelf
              .top,

          /*
          =================================================
          COMPLETE BOOKSHELF UNIT

          The component continues to live in its original
          1080 × 600 coordinate space.

          Only the COMPLETE UNIT is scaled.

          Nothing inside TimelineBookshelf is changed.
          =================================================
          */

          width: "1080px",
          height: "600px",

          transform:
            `scale(${bookshelfScale})`,

          transformOrigin:
            "top left",

          overflow:
            "visible",
        }}
      >
        <TimelineBookshelf
          books={books}
          memoriesByChapter={
            memoriesByChapter
          }
          selectedBook={
            selectedBook
          }
          onSelectBook={
            setSelectedBook
          }
        />
      </div>

      {/* =================================================
          CHAPTER / MEMORY SECTION
          ================================================= */}

      <div
        className="
          absolute
          z-20
        "
        style={{
          left:
            RESPONSIVE_LAYOUT
              .chapter
              .left,

           top: `${chapterTop}%`,


          width:
            RESPONSIVE_LAYOUT
              .chapter
              .width,

            transform: `scale(${chapterScale})`,
            transformOrigin: "top left",   
        }}
      >
        <ChapterSection
          loading={loading}
          book={selectedBook}
          memories={
            selectedMemories
          }
        />
      </div>

      {/* =================================================
          CARPET
          ================================================= */}

      <img
        src={vintageCarpet}
        alt=""
        draggable={false}
        className="
          absolute
          left-1/2
          -translate-x-1/2
          pointer-events-none
          select-none
        "
        style={{
          top:
            RESPONSIVE_LAYOUT
              .carpet
              .top,

          width:
            RESPONSIVE_LAYOUT
              .carpet
              .width,

          height:
            "auto",

          zIndex: 1,
        }}
      />

      {/* =================================================
          TEDDY
          ================================================= */}

      <img
        src={vintageTeddyPillow}
        alt=""
        draggable={false}
        className="
          absolute
          pointer-events-none
          select-none
        "
        style={{
          right:
            RESPONSIVE_LAYOUT
              .teddy
              .right,

          top:
            RESPONSIVE_LAYOUT
              .teddy
              .top,

          width:
            RESPONSIVE_LAYOUT
              .teddy
              .width,

          height:
            "auto",

          zIndex: 25,
        }}
      />

      {/* =================================================
          ROCKING HORSE ANIMATION
          ================================================= */}

      <style>
        {`
          @keyframes timelineRockingHorse {
            0% {
              transform: rotate(-4deg);
            }

            25% {
              transform: rotate(0deg);
            }

            50% {
              transform: rotate(4deg);
            }

            75% {
              transform: rotate(0deg);
            }

            100% {
              transform: rotate(-4deg);
            }
          }
        `}
      </style>

      {/* =================================================
          ROCKING HORSE
          ================================================= */}

      <img
        src={vintageRockingHorse}
        alt=""
        draggable={false}
        className="
          absolute
          pointer-events-none
          select-none
        "
        style={{
          left:
            RESPONSIVE_LAYOUT
              .horse
              .left,

          top:
            RESPONSIVE_LAYOUT
              .horse
              .top,

          width:
            RESPONSIVE_LAYOUT
              .horse
              .width,

          height:
            "auto",

          transformOrigin:
            "50% 88%",

          animation:
            "timelineRockingHorse 2.8s ease-in-out infinite",

          zIndex: 50,
        }}
      />

      {/* =================================================
          ALPHABET BLOCKS — RIGHT
          ================================================= */}

      <img
        src={vintageAlphabetBlocks1}
        alt=""
        draggable={false}
        className="
          absolute
          pointer-events-none
          select-none
        "
        style={{
          right:
            RESPONSIVE_LAYOUT
              .alphabetRight
              .right,

          top:
            RESPONSIVE_LAYOUT
              .alphabetRight
              .top,

          width:
            RESPONSIVE_LAYOUT
              .alphabetRight
              .width,

          height:
            "auto",

          zIndex: 25,
        }}
      />

      {/* =================================================
          ALPHABET BLOCKS — LEFT
          ================================================= */}

      <img
        src={vintageAlphabetBlocks2}
        alt=""
        draggable={false}
        className="
          absolute
          pointer-events-none
          select-none
        "
        style={{
          left:
            RESPONSIVE_LAYOUT
              .alphabetLeft
              .left,

          top:
            RESPONSIVE_LAYOUT
              .alphabetLeft
              .top,

          width:
            RESPONSIVE_LAYOUT
              .alphabetLeft
              .width,

          height:
            "auto",

          zIndex: 25,
        }}
      />

      {/* =================================================
          FOOTBALL
          ================================================= */}

      <img
        src={vintagefootball}
        alt=""
        draggable={false}
        className="
          absolute
          pointer-events-none
          select-none
        "
        style={{
          right:
            RESPONSIVE_LAYOUT
              .football
              .right,

          top:
            RESPONSIVE_LAYOUT
              .football
              .top,

          width:
            RESPONSIVE_LAYOUT
              .football
              .width,

          height:
            "auto",

          zIndex: 25,
        }}
      />

      {/* =================================================
          TOY TRAIN
          ================================================= */}

      <img
        src={vintagetoytrain}
        alt=""
        draggable={false}
        className="
          absolute
          pointer-events-none
          select-none
        "
        style={{
          right:
            RESPONSIVE_LAYOUT
              .train
              .right,

          top:
            RESPONSIVE_LAYOUT
              .train
              .top,

          width:
            RESPONSIVE_LAYOUT
              .train
              .width,

          height:
            "auto",

          zIndex: 25,
        }}
      />

      {/* =================================================
          UNICORN
          ================================================= */}

      <img
        src={vintageunicorn}
        alt=""
        draggable={false}
        className="
          absolute
          pointer-events-none
          select-none
        "
        style={{
          right:
            RESPONSIVE_LAYOUT
              .unicorn
              .right,

          top:
            RESPONSIVE_LAYOUT
              .unicorn
              .top,

          width:
            RESPONSIVE_LAYOUT
              .unicorn
              .width,

          height:
            "auto",

          zIndex: 25,
        }}
      />

      {/* =================================================
          CARS
          ================================================= */}

      <img
        src={vintagecars}
        alt=""
        draggable={false}
        className="
          absolute
          pointer-events-none
          select-none
        "
        style={{
          left:
            RESPONSIVE_LAYOUT
              .cars
              .left,

          top:
            RESPONSIVE_LAYOUT
              .cars
              .top,

          width:
            RESPONSIVE_LAYOUT
              .cars
              .width,

          height:
            "auto",

          zIndex: 25,
        }}
      />

      {/* =================================================
          DRAWER
          ================================================= */}

      <TimelineDrawer
        open={drawerOpen}
        onClose={() =>
          setDrawerOpen(false)
        }
      />

      {/* =================================================
          BACK BUTTON
          ================================================= */}

      <button
        onClick={() =>
          navigate(-1)
        }
        className="
          fixed
          top-6
          left-6
          z-50
          w-12
          h-12
          rounded-full
          bg-white
          shadow-lg
          flex
          items-center
          justify-center
          hover:scale-105
          transition
        "
      >
        ←
      </button>

      {/* =================================================
          MENU BUTTON
          ================================================= */}

      <button
        onClick={() =>
          setDrawerOpen(true)
        }
        className="
          fixed
          top-6
          right-6
          z-50
          w-12
          h-12
          rounded-full
          bg-white
          shadow-lg
          flex
          items-center
          justify-center
          hover:scale-105
          transition
        "
      >
        ☰
      </button>
    </main>
  );
}