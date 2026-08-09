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
MASTER DESIGN CANVAS
=====================================================

The supplied wallpaper is:

    1920 × 1080

This is the MASTER coordinate system.

Everything visual belongs to this scene.

At 100% browser zoom:

1920 viewport
    → 1920 × 1080 scene

1440 viewport
    → scene scales uniformly to 1440 wide

1366 viewport
    → scene scales uniformly to 1366 wide

The X/Y relationship NEVER changes.

=====================================================
*/

const SCENE_WIDTH = 1920;
const SCENE_HEIGHT = 1080;

/*
=====================================================
MASTER SCENE POSITIONS
=====================================================
*/

const SCENE_LAYOUT = {
  /*
  ================================================
  JOURNEY HEADER
  ================================================
  */

  header: {
    top: 45,
  },

  /*
  ================================================
  BOOKSHELF
  ================================================

  TimelineBookshelf internally uses:

      1080 × 600

  We position that entire composition inside
  the master 1920 × 1080 scene.
  */

  bookshelf: {
    left: 420,
    top: 200,
    width: 1080,
    height: 600,
  },

  /*
  ================================================
  CHAPTER / MEMORY SECTION
  ================================================
  */

  chapter: {
    left: 260,
    top: 570,
    width: 1400,
  },

  /*
  ================================================
  LEFT LAMP
  ================================================
  */

  lampLeft: {
    left: 70,
    top: 55,
    width: 150,
  },

  /*
  ================================================
  RIGHT LAMP
  ================================================
  */

  lampRight: {
    right: 70,
    top: 55,
    width: 150,
  },

  /*
  ================================================
  ROCKING HORSE
  ================================================
  */

  horse: {
    left: 70,
    top: 735,
    width: 375,
  },

  /*
  ================================================
  TEDDY
  ================================================
  */

  teddy: {
    right: 65,
    top: 735,
    width: 150,
  },

  /*
  ================================================
  CARPET
  ================================================
  */

  carpet: {
    top: 845,
    width: 655,
  },

  /*
  ================================================
  UNICORN
  ================================================
  */

  unicorn: {
    right: 300,
    top: 855,
    width: 165,
  },

  /*
  ================================================
  ALPHABET BLOCKS — RIGHT
  ================================================
  */

  alphabetRight: {
    right: 40,
    top: 865,
    width: 180,
  },

  /*
  ================================================
  ALPHABET BLOCKS — LEFT
  ================================================
  */

  alphabetLeft: {
    left: 600,
    top: 850,
    width: 145,
  },

  /*
  ================================================
  FOOTBALL
  ================================================
  */

  football: {
    right: 20,
    top: 925,
    width: 120,
  },

  /*
  ================================================
  TOY TRAIN
  ================================================
  */

  train: {
    right: 5,
    top: 790,
    width: 150,
  },

  /*
  ================================================
  CARS
  ================================================
  */

  cars: {
    left: 70,
    top: 850,
    width: 285,
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
  RESPONSIVE MASTER SCALE
  =====================================================

  IMPORTANT:

  Only viewport WIDTH determines scale.

  The master scene itself is ALWAYS:

      1920 × 1080

  We scale the entire scene uniformly.

  There is no separate X scale.
  There is no separate Y scale.
  There are no monitor breakpoints.
  =====================================================
  */

  const [sceneScale, setSceneScale] =
    useState(1);

  useEffect(() => {
    const updateSceneScale = () => {
      if (
        typeof window === "undefined"
      ) {
        return;
      }

      const viewportWidth =
        window.innerWidth;

      const nextScale =
        viewportWidth /
        SCENE_WIDTH;

      setSceneScale(
        Number.isFinite(nextScale) &&
          nextScale > 0
          ? nextScale
          : 1
      );
    };

    updateSceneScale();

    window.addEventListener(
      "resize",
      updateSceneScale
    );

    return () => {
      window.removeEventListener(
        "resize",
        updateSceneScale
      );
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

  /*
  =====================================================
  MASTER SCENE HEIGHT

  Because transform does not participate in normal
  document flow, the wrapper gets the scaled height.

  There is NO FOOTER after this scene.

  Therefore the 1920 × 1080 artwork is the complete
  Timeline visual composition.
  =====================================================
  */

  const scaledSceneHeight =
    SCENE_HEIGHT * sceneScale;

  return (
    <main
      className="
        relative
        w-full
        overflow-x-hidden
      "
      style={{
        backgroundImage:
          `url(${vintageWall})`,
        backgroundRepeat:
          "no-repeat",
        backgroundPosition:
          "center center",
        backgroundSize:
          "cover",
        backgroundAttachment:
          "fixed",
        backgroundColor:
          "#D9A765",
      }}
    >
      {/* =====================================================
          MASTER SCENE WRAPPER
          ===================================================== */}

      <div
        className="
          relative
          w-full
        "
        style={{
          height:
            `${scaledSceneHeight}px`,
        }}
      >
        {/* =====================================================
            1920 × 1080 MASTER SCENE

            EVERYTHING visual belongs inside here.
            ===================================================== */}

        <div
          className="
            absolute
            top-0
            left-0
          "
          style={{
            width:
              `${SCENE_WIDTH}px`,

            height:
              `${SCENE_HEIGHT}px`,

            transform:
              `scale(${sceneScale})`,

            transformOrigin:
              "top left",

            /*
            ================================================
            EXACT 16:9 WALLPAPER
            ================================================
            */

            backgroundColor:
              "transparent",
          }}
        >
          {/* =====================================================
              LEFT LAMP
              ===================================================== */}

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
                `${SCENE_LAYOUT.lampLeft.left}px`,

              top:
                `${SCENE_LAYOUT.lampLeft.top}px`,

              width:
                `${SCENE_LAYOUT.lampLeft.width}px`,

              height: "auto",

              zIndex: 10,
            }}
          />

          {/* =====================================================
              RIGHT LAMP
              ===================================================== */}

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
                `${SCENE_LAYOUT.lampRight.right}px`,

              top:
                `${SCENE_LAYOUT.lampRight.top}px`,

              width:
                `${SCENE_LAYOUT.lampRight.width}px`,

              height: "auto",

              transform:
                "scaleX(-1)",

              transformOrigin:
                "center",

              zIndex: 10,
            }}
          />

          {/* =====================================================
              JOURNEY HEADER
              ===================================================== */}

          <div
            className="
              absolute
              left-1/2
              -translate-x-1/2
              z-20
            "
            style={{
              top:
                `${SCENE_LAYOUT.header.top}px`,
            }}
          >
            <JourneyHeader />
          </div>

          {/* =====================================================
              BOOKSHELF
              ===================================================== */}

          <div
            className="
              absolute
              z-30
            "
            style={{
              left:
                `${SCENE_LAYOUT.bookshelf.left}px`,

              top:
                `${SCENE_LAYOUT.bookshelf.top}px`,

              width:
                `${SCENE_LAYOUT.bookshelf.width}px`,

              height:
                `${SCENE_LAYOUT.bookshelf.height}px`,
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

          {/* =====================================================
              CHAPTER / MEMORY SECTION
              ===================================================== */}

          <div
            className="
              absolute
              z-20
            "
            style={{
              left:
                `${SCENE_LAYOUT.chapter.left}px`,

              top:
                `${SCENE_LAYOUT.chapter.top}px`,

              width:
                `${SCENE_LAYOUT.chapter.width}px`,
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

          {/* =====================================================
              CARPET
              ===================================================== */}

          <img
            src={vintageCarpet}
            alt=""
            draggable={false}
            className="
              absolute
              pointer-events-none
              select-none
            "
            style={{
              left: "50%",

              top:
                `${SCENE_LAYOUT.carpet.top}px`,

              width:
                `${SCENE_LAYOUT.carpet.width}px`,

              height: "auto",

              transform:
                "translateX(-50%)",

              zIndex: 1,
            }}
          />

          {/* =====================================================
              TEDDY
              ===================================================== */}

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
                `${SCENE_LAYOUT.teddy.right}px`,

              top:
                `${SCENE_LAYOUT.teddy.top}px`,

              width:
                `${SCENE_LAYOUT.teddy.width}px`,

              height: "auto",

              zIndex: 25,
            }}
          />

          {/* =====================================================
              ROCKING HORSE ANIMATION
              ===================================================== */}

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

          {/* =====================================================
              ROCKING HORSE
              ===================================================== */}

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
                `${SCENE_LAYOUT.horse.left}px`,

              top:
                `${SCENE_LAYOUT.horse.top}px`,

              width:
                `${SCENE_LAYOUT.horse.width}px`,

              height: "auto",

              transformOrigin:
                "50% 88%",

              animation:
                "timelineRockingHorse 2.8s ease-in-out infinite",

              zIndex: 50,
            }}
          />

          {/* =====================================================
              ALPHABET BLOCKS — RIGHT
              ===================================================== */}

          <img
            src={
              vintageAlphabetBlocks1
            }
            alt=""
            draggable={false}
            className="
              absolute
              pointer-events-none
              select-none
            "
            style={{
              right:
                `${SCENE_LAYOUT.alphabetRight.right}px`,

              top:
                `${SCENE_LAYOUT.alphabetRight.top}px`,

              width:
                `${SCENE_LAYOUT.alphabetRight.width}px`,

              height: "auto",

              zIndex: 25,
            }}
          />

          {/* =====================================================
              ALPHABET BLOCKS — LEFT
              ===================================================== */}

          <img
            src={
              vintageAlphabetBlocks2
            }
            alt=""
            draggable={false}
            className="
              absolute
              pointer-events-none
              select-none
            "
            style={{
              left:
                `${SCENE_LAYOUT.alphabetLeft.left}px`,

              top:
                `${SCENE_LAYOUT.alphabetLeft.top}px`,

              width:
                `${SCENE_LAYOUT.alphabetLeft.width}px`,

              height: "auto",

              zIndex: 25,
            }}
          />

          {/* =====================================================
              FOOTBALL
              ===================================================== */}

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
                `${SCENE_LAYOUT.football.right}px`,

              top:
                `${SCENE_LAYOUT.football.top}px`,

              width:
                `${SCENE_LAYOUT.football.width}px`,

              height: "auto",

              zIndex: 25,
            }}
          />

          {/* =====================================================
              TOY TRAIN
              ===================================================== */}

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
                `${SCENE_LAYOUT.train.right}px`,

              top:
                `${SCENE_LAYOUT.train.top}px`,

              width:
                `${SCENE_LAYOUT.train.width}px`,

              height: "auto",

              zIndex: 25,
            }}
          />

          {/* =====================================================
              UNICORN
              ===================================================== */}

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
                `${SCENE_LAYOUT.unicorn.right}px`,

              top:
                `${SCENE_LAYOUT.unicorn.top}px`,

              width:
                `${SCENE_LAYOUT.unicorn.width}px`,

              height: "auto",

              zIndex: 25,
            }}
          />

          {/* =====================================================
              CARS
              ===================================================== */}

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
                `${SCENE_LAYOUT.cars.left}px`,

              top:
                `${SCENE_LAYOUT.cars.top}px`,

              width:
                `${SCENE_LAYOUT.cars.width}px`,

              height: "auto",

              zIndex: 25,
            }}
          />
        </div>
      </div>

      {/* =====================================================
          NO FOOTER HERE

          The 1920 × 1080 wallpaper is the complete
          Timeline scene.

          This prevents:

          - orange area below the artwork
          - "Made with love..." appearing after it
          - additional document height
          - footer affecting the master composition
          ===================================================== */}

      {/* =====================================================
          DRAWER
          ===================================================== */}

      <TimelineDrawer
        open={drawerOpen}
        onClose={() =>
          setDrawerOpen(false)
        }
      />

      {/* =====================================================
          BACK BUTTON
          ===================================================== */}

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

      {/* =====================================================
          MENU BUTTON
          ===================================================== */}

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