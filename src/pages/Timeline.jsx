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

  The visual design was approved at 67% Chrome zoom.

  Chrome changes devicePixelRatio when browser zoom
  changes. We compensate for that here so the scene
  keeps the same visual composition.

  0.67 = our approved reference zoom.
  =====================================================
  */

  const [sceneScale, setSceneScale] = useState(() => {
    if (typeof window === "undefined") {
      return 1;
    }

    return 0.67 / window.devicePixelRatio;
  });

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
        overflow-hidden
      "
      style={{
        background: "#D9A765",
      }}
    >

      {/* =====================================================
          VINTAGE WALL
          ===================================================== */}

      <img
        src={vintageWall}
        alt=""
        draggable={false}
        className="
          fixed
          inset-0
          w-full
          h-full
          object-cover
          pointer-events-none
          select-none
          z-0
        "
      />


      {/* =====================================================
          LOCKED DESIGN SCENE

          IMPORTANT:

          Everything that belongs to the visual scrapbook
          composition lives inside this same coordinate system.

          Browser zoom is compensated by sceneScale.
          ===================================================== */}

      <div
        className="
          relative
          z-10
          mx-auto
        "
        style={{
          width: "1536px",
          minHeight: "1500px",

          /*
          Scale the entire scene as ONE unit.
          */
          transform: `scale(${sceneScale})`,

          /*
          Keep the scene centered after scaling.
          */
          transformOrigin: "top center",

          /*
          Keep the existing scene positioning/balance.
          */
          marginBottom: `${1500 * (sceneScale - 1)}px`,
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
          DRAWER
          ===================================================== */}

      <TimelineDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />


      {/* =====================================================
          BACK BUTTON
          ===================================================== */}

      <button
        onClick={() => navigate(-1)}
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
        onClick={() => setDrawerOpen(true)}
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