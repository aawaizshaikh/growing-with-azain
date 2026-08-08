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
  ============================================================
  LOAD MEMORIES
  ============================================================
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
  ============================================================
  GROUP MEMORIES
  ============================================================
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
  ============================================================
  CURRENT CHAPTER
  ============================================================
  */

  const selectedMemories =
    memoriesByChapter[selectedBook.slug] || [];

  return (
    <main
      className="
        relative
        min-h-screen
        overflow-hidden
      "
    >

      {/* =====================================================
          VINTAGE WALL BACKGROUND
          ===================================================== */}

      <img
        src={vintageWall}
        alt=""
        className="
          absolute
          inset-0
          w-full
          h-full
          object-cover
          z-0
          pointer-events-none
          select-none
        "
      />


      {/* =====================================================
          LEFT VINTAGE LAMP
          Decorative only - does not affect layout
          ===================================================== */}

      <img
        src={vintageLamp}
        alt=""
        draggable={false}
        className="
          fixed
          pointer-events-none
          select-none
        "
        style={{
          left: "5.5%",
          top: "8%",
          width: "245px",
          height: "auto",
          zIndex: 10,
        }}
      />


      {/* =====================================================
          RIGHT VINTAGE LAMP
          Decorative only - does not affect layout
          ===================================================== */}

      <img
        src={vintageLamp}
        alt=""
        draggable={false}
        className="
          fixed
          pointer-events-none
          select-none
        "
        style={{
          right: "5.5%",
          top: "8%",
          width: "245px",
          height: "auto",
          transform: "scaleX(-1)",
          transformOrigin: "center",
          zIndex: 2,
        }}
      />


      {/* =====================================================
          VINTAGE CARPET
          Sits visually on the floor.
          Does NOT affect bookshelf layout.
          ===================================================== */}

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
          top: "1150px",
          width: "1080px",
          height: "auto",
          zIndex: 1,
        }}
      />


      {/* =====================================================
          ALL EXISTING PAGE CONTENT
          LEFT UNCHANGED
          ===================================================== */}

      <div className="relative z-10">


        {/* Drawer */}

        <TimelineDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        />


        {/* Back */}

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


        {/* Menu */}

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


        {/* Header */}

        <JourneyHeader />


        {/* Books */}

        <TimelineBookshelf
          books={books}
          memoriesByChapter={memoriesByChapter}
          selectedBook={selectedBook}
          onSelectBook={setSelectedBook}
        />


        {/* ====================================================
    MEMORIES
    Positioned in the lower half of the scene
    ==================================================== */}

<div
  style={{
    position: "relative",
    marginTop: "-50px",
    zIndex: 10,
  }}
>
  <ChapterSection
    loading={loading}
    book={selectedBook}
    memories={selectedMemories}
  />
</div>

        {/* Footer */}

        <Footer />

      </div>

    </main>
  );
}