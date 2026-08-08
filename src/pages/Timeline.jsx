import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Footer from "../components/Footer";

import books from "../components/timeline/books";

import TimelineDrawer from "../components/timeline/TimelineDrawer";
import JourneyHeader from "../components/timeline/JourneyHeader";
import TimelineBookshelf from "../components/timeline/TimelineBookshelf";
import ChapterSection from "../components/timeline/ChapterSection";

import vintageWall from "../assets/illustrations/timeline-vintage-wall.png";
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

export default function Timeline() {
  const navigate = useNavigate();

  const [drawerOpen, setDrawerOpen] = useState(false);

  const [loading, setLoading] = useState(true);

  const [memories, setMemories] = useState([]);

  const [selectedBook, setSelectedBook] = useState(
    books[0]
  );

  /*
  =====================================================
  LOCKED SCENE SCALE

  The visual design uses a fixed 1536 × 1500
  design canvas.

  Chrome changes devicePixelRatio when browser zoom
  changes. We compensate for that here so the scene
  keeps the same physical scale.

  0.67 = the existing approved reference scale.
  =====================================================
  */

  const [sceneScale, setSceneScale] = useState(() => {
    if (typeof window === "undefined") {
      return 1;
    }

    return 0.67 / window.devicePixelRatio;
  });

  /*
  =====================================================
  FIXED VIEWPORT UI ZOOM COMPENSATION

  Back/Menu are outside the illustrated scene.

  Chrome desktop page zoom changes devicePixelRatio.
  We capture the devicePixelRatio when this page first
  loads as the 100% browser-zoom baseline.

  Using the DPR ratio is much more reliable here than
  comparing outerWidth / innerWidth, because the latter
  also changes with the browser window and browser chrome.

  This is intentionally separate from sceneScale.
  =====================================================
  */

  const [browserZoom, setBrowserZoom] = useState(1);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    /*
      Capture the display/OS-scaled DPR once.

      Example:
        initial DPR = 1.25

        100% Chrome -> DPR 1.25 -> zoom 1
        175% Chrome -> DPR 2.1875 -> zoom 1.75
        250% Chrome -> DPR 3.125 -> zoom 2.50
        300% Chrome -> DPR 3.75 -> zoom 3.00

      The UI wrapper then uses 1 / browserZoom,
      cancelling Chrome page zoom while preserving
      the requested w-16 / h-16 physical size.
    */
    const initialDpr =
      window.devicePixelRatio || 1;

    const updateBrowserZoom = () => {
      const currentDpr =
        window.devicePixelRatio || initialDpr;

      const nextZoom =
        currentDpr / initialDpr;

      setBrowserZoom(
        Math.min(4, Math.max(0.25, nextZoom))
      );
    };

    updateBrowserZoom();

    window.addEventListener(
      "resize",
      updateBrowserZoom
    );

    /*
      Chrome can change devicePixelRatio when page
      zoom changes without giving us a reliable
      resize sequence. Re-check the value periodically.
    */
    const intervalId = window.setInterval(
      updateBrowserZoom,
      100
    );

    return () => {
      window.removeEventListener(
        "resize",
        updateBrowserZoom
      );

      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    let mediaQuery = null;

    const updateSceneScale = () => {
      if (typeof window === "undefined") {
        return;
      }

      const dpr = window.devicePixelRatio || 1;

      /*
      Keep the same physical composition as the
      approved 67% reference.
      */
      const newScale = 0.67 / dpr;

      setSceneScale(newScale);
    };

    const watchResolution = () => {
      if (mediaQuery) {
        mediaQuery.removeEventListener(
          "change",
          watchResolution
        );
      }

      mediaQuery = window.matchMedia(
        `(resolution: ${window.devicePixelRatio}dppx)`
      );

      mediaQuery.addEventListener(
        "change",
        watchResolution
      );
    };

    updateSceneScale();
    watchResolution();

    window.addEventListener(
      "resize",
      updateSceneScale
    );

    return () => {
      window.removeEventListener(
        "resize",
        updateSceneScale
      );

      if (mediaQuery) {
        mediaQuery.removeEventListener(
          "change",
          watchResolution
        );
      }
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
        const data = await getTimelineMemories();

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
  GROUP MEMORIES
  =====================================================
  */

  const memoriesByChapter = useMemo(() => {
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
    memoriesByChapter[selectedBook.slug] || [];

  return (
    <main
      className="
        fixed
        inset-0
        w-full
        h-full
        overflow-y-scroll
        overflow-x-hidden
        overscroll-behavior-y: contain
      "
      style={{
        background: "#D9A765",
      }}
    >

      {/* =====================================================
          VINTAGE WALL — SCROLLING BACKGROUND ONLY
          =====================================================

          IMPORTANT:
          This background is intentionally OUTSIDE the transformed
          1536px design scene.

          It scrolls with the page, but it is NOT affected by
          sceneScale. This keeps the existing zoom-stable scene
          completely unchanged.

          Its height follows the same scroll range as the scene,
          so the background remains visible while scrolling.
          ===================================================== */}

      <div
        aria-hidden="true"
        className="
          absolute
          top-0
          left-0
          w-full
          pointer-events-none
          select-none
          z-0
        "
        style={{
          height: `${Math.max(
            typeof window !== "undefined" ? window.innerHeight : 900,
            1500 * sceneScale + 120
          )}px`,
          backgroundImage: `url(${vintageWall})`,
          backgroundSize: "cover",
          backgroundPosition: "top center",
          backgroundRepeat: "no-repeat",
        }}
      />


      {/* =====================================================
          LOCKED DESIGN SCENE

          IMPORTANT:

          Everything that belongs to the visual scrapbook
          composition lives inside this same coordinate system.

          Browser zoom is compensated by sceneScale.
          The canvas itself is centered independently
          of the scaled width.
          ===================================================== */}

      <div
        className="
          absolute
          z-10
        "
        style={{
          width: "1536px",
          height: "1500px",

          /*
          =====================================================
          FIXED DESIGN CANVAS POSITIONING

          The scene is positioned from the viewport center
          first, then scaled as ONE complete unit.

          This avoids mx-auto + transformed-width
          calculations changing the horizontal position
          when Chrome zoom changes.
          =====================================================
          */
          left: "50%",
          top: 0,

          transform: `translateX(-50%) scale(${sceneScale})`,
          transformOrigin: "top center",
        }}
      >

        {/* =====================================================
            DECORATIVE LEFT LAMP
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
            left: "-250px",
            top: "120px",
            width: "245px",
            height: "auto",
            zIndex: 10,
          }}
        />


        {/* =====================================================
            DECORATIVE RIGHT LAMP
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
            right: "-250px",
            top: "120px",
            width: "245px",
            height: "auto",
            transform: "scaleX(-1)",
            transformOrigin: "center",
            zIndex: 10,
          }}
        />


        {/* =====================================================
            HEADER
            ===================================================== */}

        <div
          className="
            relative
            z-20
          "
        >
          <JourneyHeader />
        </div>


        {/* =====================================================
            BOOKSHELF

            Existing bookshelf remains unchanged.
            ===================================================== */}

        <div
          className="
            relative
            z-30
          "
        >
          <TimelineBookshelf
            books={books}
            memoriesByChapter={memoriesByChapter}
            selectedBook={selectedBook}
            onSelectBook={setSelectedBook}
          />
        </div>


        {/* =====================================================
            CHAPTER SECTION

            Existing ChapterSection positioning is preserved.
            ===================================================== */}

        <div
          className="
            relative
            z-20
          "
        >
          <ChapterSection
            loading={loading}
            book={selectedBook}
            memories={selectedMemories}
          />
        </div>


        {/* =====================================================
            CARPET

            The carpet belongs to the same locked scene.
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
            transform: "translateX(-50%)",
            top: "1150px",
            width: "1080px",
            height: "auto",
            zIndex: 1,
          }}
        />


        {/* =====================================================
            TEDDY BEAR ON FLOOR
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
            left: "105%",
            top: "1000px",
            width: "260px",
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
            ROCKING HORSE ON FLOOR
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
            right: "100%",
            top: "925px",
            width: "475px",
            height: "auto",
            transformOrigin: "50% 88%",
            animation: "timelineRockingHorse 2.8s ease-in-out infinite",
            zIndex: 50,
          }}
        />


        {/* =====================================================
            ALPHABET BLOCKS — COLOR SET 1
            ===================================================== */}

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
            left: "95%",
            top: "1150px",
            width: "180px",
            height: "auto",
            zIndex: 25,
          }}
        />


        {/* =====================================================
            ALPHABET BLOCKS — COLOR SET 2
            ===================================================== */}

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
            right: "55%",
            top: "1150px",
            width: "180px",
            height: "auto",
            zIndex: 25,
          }}
        />
          {/* =====================================================
              Football
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
            right: "-15%",
            top: "1250px",
            width: "180px",
            height: "auto",
            zIndex: 25,
          }}
        />{/* =====================================================
              TOYTRAIN
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
            right: "-29%",
            top: "1200px",
            width: "180px",
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
            right: "5%",
            top: "1125px",
            width: "280px",
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
            right: "82%",
            top: "1200px",
            width: "285px",
            height: "auto",
            zIndex: 25,
            
          }}
        />

        {/* =====================================================
            FOOTER
            ===================================================== */}

        <div
          className="
            relative
            z-20
          "
        >
          <Footer />
        </div>

      </div>


      {/* =====================================================
          SCROLL HEIGHT SPACER

          The illustrated scene is absolutely positioned, so it
          does not contribute its 1500px height to normal document
          flow. This invisible spacer creates enough scroll space
          for the complete existing scene.

          It does NOT move, resize, or change any illustration.
          ===================================================== */}

      <div
        aria-hidden="true"
        style={{
          width: "1px",
          height: `${1500 * sceneScale}px`,
          pointerEvents: "none",
          userSelect: "none",
        }}
      />

      {/* =====================================================
          DRAWER
          ===================================================== */}

      <TimelineDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />


      {/* =====================================================
          BACK BUTTON
          ===================================================== */}

      <div
        className="fixed"
        style={{
          top: 12 / browserZoom,
          left: 24 / browserZoom,
          zIndex: 1000,
          transform: `scale(${1 / browserZoom})`,
          transformOrigin: "top left",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="
            w-3
            h-3
            text-[7px]
            rounded-full
            bg-#EED19D
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
      </div>


      {/* =====================================================
          MENU BUTTON
          ===================================================== */}

      <div
        className="fixed"
        style={{
          top: 12 / browserZoom,
          right: 24 / browserZoom,
          zIndex: 1000,
          transform: `scale(${1 / browserZoom})`,
          transformOrigin: "top right",
        }}
      >
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          className="
            w-3
            h-3
            text-[7px]
            rounded-full
            bg-#EED19D
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
      </div>

    </main>
  );
}