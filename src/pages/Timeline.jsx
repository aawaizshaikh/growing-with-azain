import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import books from "../components/timeline/books";

import TimelineDrawer from "../components/timeline/TimelineDrawer";
import JourneyHeader from "../components/timeline/JourneyHeader";
import TimelineBookshelf from "../components/timeline/TimelineBookshelf";
import ChapterSection from "../components/timeline/ChapterSection";

import vintageWall from "../assets/illustrations/background-new.webp";
import vintageLamp from "../assets/illustrations/timeline-vintage-lamp-new.webp";
import vintageCarpet from "../assets/illustrations/timeline-vintage-carpet-new.webp";
import vintageTeddyPillow from "../assets/illustrations/timeline-vintage-teddy-pillow.webp";
import vintageRockingHorse from "../assets/illustrations/timeline-vintage-rocking-horse.webp";
import vintageAlphabetBlocks1 from "../assets/illustrations/timeline-vintage-alphabet-blocks-1.webp";
import vintageAlphabetBlocks2 from "../assets/illustrations/timeline-vintage-alphabet-blocks-2.webp";
import vintagefootball from "../assets/illustrations/timeline-vintage-football.webp";
import vintageunicorn from "../assets/illustrations/timeline-vintage-unicorn.webp";
import vintagecars from "../assets/illustrations/timeline-vintage-random-cars.webp";
import vintagetoytrain from "../assets/illustrations/timeline-vintage-toytrain.webp";

import { getTimelineMemories } from "../services/timelineService";

/*
=====================================================
RESPONSIVE STORYBOOK SCENE
=====================================================

IMPORTANT ARCHITECTURE
----------------------

The entire Timeline is now treated as ONE illustrated
storybook room.

REFERENCE SCENE
---------------

    1920 × 1080

The wallpaper and ALL visual elements live inside
this same scene coordinate system.

The browser viewport only controls the SCALE of the
complete scene.

Therefore:

    wallpaper
    bookshelf
    Journey
    chapter
    lamps
    horse
    teddy
    carpet
    unicorn
    blocks
    football
    train
    cars

all scale together.

This means their visual relationships remain intact.

=====================================================
BOOKSHELF
=====================================================

TimelineBookshelf remains completely untouched.

Its internal design remains:

    1080 × 600

We only control the complete bookshelf unit.

=====================================================
=====================================================
*/

const SCENE_WIDTH = 1920;
const SCENE_HEIGHT = 1080;

/*
=====================================================
SCENE LAYOUT

These positions are now RELATIVE TO THE 1920 × 1080
STORYBOOK SCENE.

They are NOT relative to the browser viewport.

This is the important architectural change.
=====================================================
*/

const SCENE_LAYOUT = {
  /*
  ===================================================
  JOURNEY HEADER
  ===================================================
  */

  header: {
    left: "15%",
    top: "4.17%",
  },

  /*
  ===================================================
  BOOKSHELF — COMPLETE UNIT
  ===================================================

  Original internal component:

      1080 × 600

  Current visual scale:

      0.75

  The bookshelf itself is NOT modified.
  */

  bookshelf: {
    left: "23.88%",
    top: "14.8%",
    width: "1480px",
    height: "600px",
    scale: 0.75,
  },

  /*
  ===================================================
  CHAPTER / MEMORY SECTION
  ===================================================
  */

  chapter: {
    left: "16.54%",
    top: "44.78%",
    width: "1640px",
    scale: 0.85,
  },

  /*
  ===================================================
  LEFT LAMP
  ===================================================
  */

  lampLeft: {
    left: "3.65%",
    top: "5.09%",
    width: "150px",
  },

  /*
  ===================================================
  RIGHT LAMP
  ===================================================
  */

  lampRight: {
    right: "5.65%",
    top: "5.09%",
    width: "150px",
  },

  /*
  ===================================================
  ROCKING HORSE
  ===================================================
  */

  horse: {
    left: "3.65%",
    top: "58.06%",
    width: "375px",
  },

  /*
  ===================================================
  TEDDY
  ===================================================
  */

  teddy: {
    right: "3.39%",
    top: "55.06%",
    width: "346px",
  },

  /*
  ===================================================
  CARPET
  ===================================================
  */

  carpet: {
    top: "76.24%",
    width: "751px",
  },

  /*
  ===================================================
  UNICORN
  ===================================================
  */

  unicorn: {
    right: "23.62%",
    top: "75.17%",
    width: "263px",
  },

  /*
  ===================================================
  ALPHABET BLOCKS — RIGHT
  ===================================================
  */

  alphabetRight: {
    right: "38.08%",
    top: "84.09%",
    width: "180px",
  },

  /*
  ===================================================
  ALPHABET BLOCKS — LEFT
  ===================================================
  */

  alphabetLeft: {
    left: "31.25%",
    top: "78.70%",
    width: "145px",
  },

  /*
  ===================================================
  FOOTBALL
  ===================================================
  */

  football: {
    right: "70.04%",
    top: "78.65%",
    width: "120px",
  },

  /*
  ===================================================
  TOY TRAIN
  ===================================================
  */

  train: {
    right: "71.26%",
    top: "85.15%",
    width: "150px",
  },

  /*
  ===================================================
  CARS
  ===================================================
  */

  cars: {
    left: "75.65%",
    top: "82.70%",
    width: "255px",
  },
};

export default function Timeline() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] =
    useSearchParams();

  /*
  ===================================================
  STATE
  ===================================================
  */

  const [drawerOpen, setDrawerOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [memories, setMemories] =
    useState([]);

  const initialBookSlug =
  searchParams.get("book");

const initialBook =
  books.find(
    (book) => book.slug === initialBookSlug
  ) || books[0];

const initialPage = Math.max(
  1,
  Number(searchParams.get("page")) || 1
);

const [selectedBook, setSelectedBook] =
  useState(initialBook);

const [selectedPage, setSelectedPage] =
  useState(initialPage);
  useEffect(() => {
  const params = new URLSearchParams();

  params.set("book", selectedBook.slug);
  params.set("page", String(selectedPage));

  setSearchParams(params, {
    replace: true,
  });
}, [
  selectedBook.slug,
  selectedPage,
  setSearchParams,
]);

  /*
  ===================================================
  VIEWPORT
  ===================================================

  The viewport is ONLY used to calculate the scale
  of the COMPLETE STORYBOOK SCENE.

  Nothing inside the scene individually responds to
  the browser anymore.
  ===================================================
  */

  const [viewport, setViewport] =
    useState(() => ({
      width:
        typeof window !== "undefined"
          ? window.innerWidth
          : SCENE_WIDTH,

      height:
        typeof window !== "undefined"
          ? window.innerHeight
          : SCENE_HEIGHT,
    }));

  useEffect(() => {
    const updateViewport = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateViewport();

    window.addEventListener(
      "resize",
      updateViewport
    );

    return () => {
      window.removeEventListener(
        "resize",
        updateViewport
      );
    };
  }, []);

  /*
  ===================================================
  COMPLETE SCENE SCALE
  ===================================================

  COVER BEHAVIOUR

  We use the larger of:

      viewport width ratio
      viewport height ratio

  This means the scene ALWAYS fills the viewport.

  There will be:

      NO empty margins
      NO distortion

  Some cropping is intentionally allowed on unusual
  aspect ratios.

  Examples:

      1920 × 1080
      scale = 1

      1536 × 864
      scale = 0.8

      1200 × 700
      scale ≈ 0.648

      2560 × 1080
      scale ≈ 1.333
  ===================================================
  */

  const sceneScale = Math.max(
    viewport.width / SCENE_WIDTH,
    viewport.height / SCENE_HEIGHT
  );

  /*
  ===================================================
  PREVENT PAGE SCROLLING
  ===================================================
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
  ===================================================
  LOAD MEMORIES
  ===================================================
  */

  useEffect(() => {
    async function loadMemories() {
      try {
        const data =
  await getTimelineMemories();

const sortedMemories = [...(data || [])].sort(
  (a, b) =>
    new Date(a.date) - new Date(b.date)
);

setMemories(sortedMemories);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadMemories();
  }, []);

  /*
  ===================================================
  GROUP MEMORIES BY CHAPTER
  ===================================================
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
  ===================================================
  CURRENT CHAPTER
  ===================================================
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
      {/*
      =================================================
      COMPLETE STORYBOOK SCENE
      =================================================

      EVERYTHING inside this container belongs to
      the same 1920 × 1080 coordinate system.

      The container itself is the ONLY thing that
      responds to viewport size.

      =================================================
      */}

      <div
        style={{
          position: "absolute",

          width: `${SCENE_WIDTH}px`,
          height: `${SCENE_HEIGHT}px`,

          left: "50%",
          top: "50%",

          transform: `
            translate(-50%, -49%)
            scale(${sceneScale})
          `,

          transformOrigin:
            "center center",

          overflow: "visible",
        }}
      >
        {/*
        ================================================
        WALLPAPER
        ================================================
        */}

        <img
          src={vintageWall}
          alt=""
          aria-hidden="true"
          draggable={false}
          style={{
            position: "absolute",

            left: 0,
            top: 0,

            width: `${SCENE_WIDTH}px`,
            height: `${SCENE_HEIGHT}px`,

            objectFit: "cover",
            objectPosition: "center",

            pointerEvents: "none",
            userSelect: "none",

            zIndex: 0,
          }}
        />

        {/*
        ================================================
        LEFT LAMP
        ================================================
        */}

        <img
          src={vintageLamp}
          alt=""
          draggable={false}
          style={{
            position: "absolute",

            left:
              SCENE_LAYOUT
                .lampLeft
                .left,

            top:
              SCENE_LAYOUT
                .lampLeft
                .top,

            width:
              SCENE_LAYOUT
                .lampLeft
                .width,

            height: "auto",

            pointerEvents: "none",
            userSelect: "none",

            zIndex: 10,
          }}
        />

        {/*
        ================================================
        RIGHT LAMP
        ================================================
        */}

        <img
          src={vintageLamp}
          alt=""
          draggable={false}
          style={{
            position: "absolute",

            right:
              SCENE_LAYOUT
                .lampRight
                .right,

            top:
              SCENE_LAYOUT
                .lampRight
                .top,

            width:
              SCENE_LAYOUT
                .lampRight
                .width,

            height: "auto",

            transform:
              "scaleX(-1)",

            transformOrigin:
              "center",

            pointerEvents: "none",
            userSelect: "none",

            zIndex: 10,
          }}
        />

        {/*
        ================================================
        JOURNEY HEADER
        ================================================
        */}

        <div
  style={{
    position: "absolute",
    left: "10%",
    top: "8%",
    width: "15%",
  }}
>
  <JourneyHeader />
</div>

        {/*
        ================================================
        BOOKSHELF — COMPLETE UNIT
        ================================================

        DO NOT MODIFY TimelineBookshelf.

        It remains:

            1080 × 600

        We scale the COMPLETE UNIT only.

        ================================================
        */}

        <div
          style={{
            position: "absolute",

            left:
              SCENE_LAYOUT
                .bookshelf
                .left,

            top:
              SCENE_LAYOUT
                .bookshelf
                .top,

            width:
              SCENE_LAYOUT
                .bookshelf
                .width,

            height:
              SCENE_LAYOUT
                .bookshelf
                .height,

            transform:
              `scale(${SCENE_LAYOUT.bookshelf.scale})`,

            transformOrigin:
              "top left",

            overflow:
              "visible",

            zIndex: 30,
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
            onSelectBook={(book) => {
  setSelectedBook(book);
  setSelectedPage(1);
}}
          />
        </div>

        {/*
        ================================================
        CHAPTER / MEMORY SECTION
        ================================================
        */}

        <div
          style={{
            position: "absolute",

            left:
              SCENE_LAYOUT
                .chapter
                .left,

            top:
              SCENE_LAYOUT
                .chapter
                .top,

            width:
              SCENE_LAYOUT
                .chapter
                .width,

            transform:
              `scale(${SCENE_LAYOUT.chapter.scale})`,

            transformOrigin:
              "top left",

            zIndex: 20,
          }}
        >
          <ChapterSection
  loading={loading}
  book={selectedBook}
  memories={
    selectedMemories
  }
  currentPage={selectedPage}
  onPageChange={setSelectedPage}
/>
        </div>

        {/*
        ================================================
        CARPET
        ================================================
        */}

        <img
          src={vintageCarpet}
          alt=""
          draggable={false}
          style={{
            position: "absolute",

            left: "50%",

            top:
              SCENE_LAYOUT
                .carpet
                .top,

            width:
              SCENE_LAYOUT
                .carpet
                .width,

            height: "auto",

            transform:
              "translateX(-50%)",

            pointerEvents: "none",
            userSelect: "none",

            zIndex: 1,
          }}
        />

        {/*
        ================================================
        TEDDY
        ================================================
        */}

        <img
          src={vintageTeddyPillow}
          alt=""
          draggable={false}
          style={{
            position: "absolute",

            right:
              SCENE_LAYOUT
                .teddy
                .right,

            top:
              SCENE_LAYOUT
                .teddy
                .top,

            width:
              SCENE_LAYOUT
                .teddy
                .width,

            height: "auto",

            pointerEvents: "none",
            userSelect: "none",

            zIndex: 25,
          }}
        />

        {/*
        ================================================
        ROCKING HORSE ANIMATION
        ================================================
        */}

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

        {/*
        ================================================
        ROCKING HORSE
        ================================================
        */}

        <img
          src={vintageRockingHorse}
          alt=""
          draggable={false}
          style={{
            position: "absolute",

            left:
              SCENE_LAYOUT
                .horse
                .left,

            top:
              SCENE_LAYOUT
                .horse
                .top,

            width:
              SCENE_LAYOUT
                .horse
                .width,

            height: "auto",

            transformOrigin:
              "50% 88%",

            animation:
              "timelineRockingHorse 2.8s ease-in-out infinite",

            pointerEvents: "none",
            userSelect: "none",

            zIndex: 50,
          }}
        />

        {/*
        ================================================
        ALPHABET BLOCKS — RIGHT
        ================================================
        */}

        <img
          src={vintageAlphabetBlocks1}
          alt=""
          draggable={false}
          style={{
            position: "absolute",

            right:
              SCENE_LAYOUT
                .alphabetRight
                .right,

            top:
              SCENE_LAYOUT
                .alphabetRight
                .top,

            width:
              SCENE_LAYOUT
                .alphabetRight
                .width,

            height: "auto",

            pointerEvents: "none",
            userSelect: "none",

            zIndex: 25,
          }}
        />

        {/*
        ================================================
        ALPHABET BLOCKS — LEFT
        ================================================
        */}

        <img
          src={vintageAlphabetBlocks2}
          alt=""
          draggable={false}
          style={{
            position: "absolute",

            left:
              SCENE_LAYOUT
                .alphabetLeft
                .left,

            top:
              SCENE_LAYOUT
                .alphabetLeft
                .top,

            width:
              SCENE_LAYOUT
                .alphabetLeft
                .width,

            height: "auto",

            pointerEvents: "none",
            userSelect: "none",

            zIndex: 25,
          }}
        />

        {/*
        ================================================
        FOOTBALL
        ================================================
        */}

        <img
          src={vintagefootball}
          alt=""
          draggable={false}
          style={{
            position: "absolute",

            right:
              SCENE_LAYOUT
                .football
                .right,

            top:
              SCENE_LAYOUT
                .football
                .top,

            width:
              SCENE_LAYOUT
                .football
                .width,

            height: "auto",

            pointerEvents: "none",
            userSelect: "none",

            zIndex: 25,
          }}
        />

        {/*
        ================================================
        TOY TRAIN
        ================================================
        */}

        <img
          src={vintagetoytrain}
          alt=""
          draggable={false}
          style={{
            position: "absolute",

            right:
              SCENE_LAYOUT
                .train
                .right,

            top:
              SCENE_LAYOUT
                .train
                .top,

            width:
              SCENE_LAYOUT
                .train
                .width,

            height: "auto",

            pointerEvents: "none",
            userSelect: "none",

            zIndex: 25,
          }}
        />

        {/*
        ================================================
        UNICORN
        ================================================
        */}

        <img
          src={vintageunicorn}
          alt=""
          draggable={false}
          style={{
            position: "absolute",

            right:
              SCENE_LAYOUT
                .unicorn
                .right,

            top:
              SCENE_LAYOUT
                .unicorn
                .top,

            width:
              SCENE_LAYOUT
                .unicorn
                .width,

            height: "auto",

            pointerEvents: "none",
            userSelect: "none",

            zIndex: 25,
          }}
        />

        {/*
        ================================================
        CARS
        ================================================
        */}

        <img
          src={vintagecars}
          alt=""
          draggable={false}
          style={{
            position: "absolute",

            left:
              SCENE_LAYOUT
                .cars
                .left,

            top:
              SCENE_LAYOUT
                .cars
                .top,

            width:
              SCENE_LAYOUT
                .cars
                .width,

            height: "auto",

            pointerEvents: "none",
            userSelect: "none",

            zIndex: 25,
          }}
        />
      </div>

      {/*
      =================================================
      DRAWER
      =================================================
      */}

      <TimelineDrawer
        open={drawerOpen}
        onClose={() =>
          setDrawerOpen(false)
        }
      />

      {/*
      =================================================
      BACK BUTTON
      =================================================
      */}

      <button
        onClick={() =>
        navigate("/")
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

      {/*
      =================================================
      MENU BUTTON
      =================================================
      */}

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