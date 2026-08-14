import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import TimelineDrawer from "../components/timeline/TimelineDrawer";

import { getPublishedLetters } from "../services/letterService";

// ============================================================================
// LETTER ARTWORK
// ============================================================================

import background from "../assets/illustrations/letters/background.png";

import caveBoy from "../assets/illustrations/letters/cave-boy.png";
import caveDad from "../assets/illustrations/letters/cave-dad.png";
import caveFire from "../assets/illustrations/letters/cave-fire.png";
import caveMom from "../assets/illustrations/letters/cave-mom.png";
import caveGirl from "../assets/illustrations/letters/cave-girl.png";
import letterChildBackground from "../assets/illustrations/letters/letter-child-background.png";
import tigerRug from "../assets/illustrations/letters/tiger-rug.png";
import caveStone from "../assets/illustrations/letters/cave-stone.png";

// ============================================================================
// PAGINATION
// ============================================================================
//
// There are 10 stone positions in the cave.
//
// Each page displays up to 10 letters:
// Page 1 = letters 1 - 10
// Page 2 = letters 11 - 20
// Page 3 = letters 21 - 30
// etc.
//
// The same 10 stone artworks are reused for every page.
// ============================================================================

const LETTERS_PER_PAGE = 10;

// ============================================================================
// LETTER SLOTS
// ============================================================================
//
// These positions belong to the visual cave artwork.
// They should NOT be changed by Admin.
//
// The actual title/content comes from Supabase.
// ============================================================================

const LETTER_SLOTS = [
  {
    key: "stone-1",
    stoneLeft: "14%",
    stoneTop: "19%",
    stoneWidth: "11%",
  },

  {
    key: "stone-2",
    stoneLeft: "25.5%",
    stoneTop: "19%",
    stoneWidth: "11%",
  },

  {
    key: "stone-3",
    stoneLeft: "36.5%",
    stoneTop: "19%",
    stoneWidth: "11%",
  },

  {
    key: "stone-4",
    stoneLeft: "47.5%",
    stoneTop: "19%",
    stoneWidth: "11%",
  },

  {
    key: "stone-5",
    stoneLeft: "58%",
    stoneTop: "19%",
    stoneWidth: "11%",
  },

  {
    key: "stone-6",
    stoneLeft: "14%",
    stoneTop: "47%",
    stoneWidth: "11%",
  },

  {
    key: "stone-7",
    stoneLeft: "25.5%",
    stoneTop: "47%",
    stoneWidth: "11%",
  },

  {
    key: "stone-8",
    stoneLeft: "36.5%",
    stoneTop: "47%",
    stoneWidth: "11%",
  },

  {
    key: "stone-9",
    stoneLeft: "47.5%",
    stoneTop: "47%",
    stoneWidth: "11%",
  },

  {
    key: "stone-10",
    stoneLeft: "58%",
    stoneTop: "47%",
    stoneWidth: "11%",
  },
];

// ============================================================================
// CAVE CHARACTERS
// ============================================================================
//
// These are decorative illustrations only.
// They are NOT connected to Supabase or the letters.
// ============================================================================

function CaveCharacters() {
  return (
    <>
      {/* ====================================================================
          DAD
          ==================================================================== */}

      <img
        src={caveDad}
        alt=""
        draggable={false}
        className="
          absolute
          z-50
          pointer-events-none
          select-none
          object-contain
        "
        style={{
          left: "77%",
          top: "38%",
          width: "13%",
        }}
      />

      {/* ====================================================================
          BOY
          ==================================================================== */}

      <img
        src={caveBoy}
        alt=""
        draggable={false}
        className="
          absolute
          z-50
          pointer-events-none
          select-none
          object-contain
        "
        style={{
          left: "57%",
          top: "65%",
          width: "15%",
        }}
      />
      

      {/* ====================================================================
          MOM
          ==================================================================== */}

      <img
        src={caveMom}
        alt=""
        draggable={false}
        className="
          absolute
          z-50
          pointer-events-none
          select-none
          object-contain
        "
        style={{
          right: "4%",
          top: "50%",
          width: "15%",
          transform: "scaleX(-1)",
        }}
      />

      {/* ====================================================================
          GIRL
          ==================================================================== */}

      <img
        src={caveGirl}
        alt=""
        draggable={false}
        className="
          absolute
          z-50
          pointer-events-none
          select-none
          object-contain
        "
        style={{
          right: "40%",
          top: "70%",
          width: "19%",
        }}
      />
    </>
  );
}

// ============================================================================
// LETTER STONE
// ============================================================================

function LetterStone({
  slot,
  letter,
  onOpen,
}) {
  // --------------------------------------------------------------------------
  // A stone only becomes an actual letter if Supabase supplied a slug.
  // --------------------------------------------------------------------------

  const hasLetter = Boolean(letter?.slug);

  // --------------------------------------------------------------------------
  // IMPORTANT:
  // No fallback title.
  //
  // Empty stone = completely blank.
  // --------------------------------------------------------------------------

  const title = letter?.title || "";

  return (
    <>
      {/* ====================================================================
          STONE
          ==================================================================== */}

      <button
        type="button"
        disabled={!hasLetter}
        onClick={() => {
          if (!hasLetter) return;

          onOpen(letter.slug);
        }}
        aria-label={
          hasLetter
            ? `Open ${title}`
            : "Empty letter stone"
        }
        className={`
          absolute
          z-30
          p-0
          border-0
          bg-transparent
          outline-none
          ${
            hasLetter
              ? "cursor-pointer"
              : "cursor-default"
          }
        `}
        style={{
          left: slot.stoneLeft,
          top: slot.stoneTop,
          width: slot.stoneWidth,
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <img
          src={caveStone}
          alt=""
          draggable={false}
          className={`
            block
            w-full
            h-auto
            select-none
            transition-all
            duration-300
            ${
              hasLetter
                ? "hover:scale-[1.04] hover:-translate-y-[2%] active:scale-[0.98]"
                : "opacity-75"
            }
          `}
        />
      </button>

      {/* ====================================================================
          TITLE
          ==================================================================== */}

      {hasLetter && (
        <div
          className="
            absolute
            z-40
            pointer-events-none
            flex
            items-center
            justify-center
            text-center
          "
          style={{
            left: `calc(${slot.stoneLeft} + ${slot.stoneWidth} * 0.16)`,
            top: `calc(${slot.stoneTop} + ${slot.stoneWidth} * 0.22)`,
            width: `calc(${slot.stoneWidth} * 0.68)`,
            minHeight: `calc(${slot.stoneWidth} * 0.30)`,
            transform: "translateY(300%)",
          }}
        >
          <span
            className="
              max-w-full
              font-semibold
              leading-[1.05]
              text-[#4A3323]
              drop-shadow-[0_1px_1px_rgba(255,248,225,0.8)]
            "
            style={{
              fontFamily:
                "Cormorant Garamond, Georgia, serif",

              fontSize:
                "clamp(10px, 0.78vw, 17px)",
            }}
          >
            {title}
          </span>
        </div>
      )}

      {/* ====================================================================
          PUBLISHED INDICATOR
          ==================================================================== */}

      {hasLetter && (
        <div
          className="
            absolute
            z-50
            pointer-events-none
            flex
            items-center
            justify-center
            rounded-full
            bg-[#FFF0C8]
            border
            border-[#A77C4D]
            shadow-[0_2px_5px_rgba(50,30,15,0.25)]
          "
          style={{
            left:
              `calc(${slot.stoneLeft} + ${slot.stoneWidth} * 0.77)`,

            top:
              `calc(${slot.stoneTop} + ${slot.stoneWidth} * 0.08)`,

            width:
              `calc(${slot.stoneWidth} * 0.15)`,

            aspectRatio: "1",
          }}
        >
          <span
            className="
              text-[#6C4B30]
              font-bold
            "
            style={{
              fontFamily:
                "Georgia, serif",

              fontSize:
                "clamp(7px, 0.5vw, 11px)",
            }}
          >
            ♥
          </span>
        </div>
      )}
    </>
  );
}

// ============================================================================
// FIRE
// ============================================================================

function FireDecoration() {
  return (
    <img
      src={caveFire}
      alt=""
      draggable={false}
      className="
        absolute
        z-20
        pointer-events-none
        select-none
        object-contain
      "
      style={{
        left: "52.5%",
        bottom: "4%",
        width: "11%",
      }}
    />
  );
}

// ============================================================================
// PAGINATION
// ============================================================================

function Pagination({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
  onPageChange,
}) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div
      className="
        absolute
        left-1/2
        bottom-[1.5%]
        z-[150]
        -translate-x-1/2
        flex
        items-center
        gap-[0.45vw]
      "
    >
      {/* ==================================================================
          PREVIOUS
          ================================================================== */}

      <button
        type="button"
        onClick={onPrevious}
        disabled={currentPage === 0}
        aria-label="Previous letters page"
        className={`
          flex
          items-center
          justify-center
          rounded-full
          border
          shadow-[0_3px_10px_rgba(45,25,12,0.22)]
          transition-all
          duration-200
          ${
            currentPage === 0
              ? "cursor-default opacity-40"
              : "cursor-pointer hover:scale-105 hover:bg-[#FFF1CE]"
          }
        `}
        style={{
          width: "clamp(30px, 2.5vw, 48px)",
          height: "clamp(24px, 2vw, 38px)",
          background:
            "rgba(255, 243, 214, 0.92)",
          borderColor:
            "rgba(167, 124, 77, 0.75)",
          color: "#68492F",
          fontSize:
            "clamp(16px, 1.3vw, 25px)",
        }}
      >
        ←
      </button>

      {/* ==================================================================
          PAGE NUMBERS
          ================================================================== */}

      <div
        className="
          flex
          items-center
          gap-[0.3vw]
          rounded-full
          border
          px-[0.45vw]
          py-[0.25vw]
          shadow-[0_3px_10px_rgba(45,25,12,0.18)]
        "
        style={{
          background:
            "rgba(255, 243, 214, 0.92)",
          borderColor:
            "rgba(167, 124, 77, 0.75)",
        }}
      >
        {Array.from(
          { length: totalPages },
          (_, index) => {
            const isActive =
              index === currentPage;

            return (
              <button
                key={index}
                type="button"
                onClick={() =>
                  onPageChange(index)
                }
                aria-label={`Go to letters page ${index + 1}`}
                aria-current={
                  isActive
                    ? "page"
                    : undefined
                }
                className={`
                  flex
                  items-center
                  justify-center
                  rounded-full
                  font-bold
                  transition-all
                  duration-200
                  ${
                    isActive
                      ? "bg-[#8C6945] text-[#FFF7E5] scale-105"
                      : "text-[#68492F] hover:bg-[#E8D2A7]"
                  }
                `}
                style={{
                  width:
                    "clamp(22px, 1.8vw, 34px)",

                  height:
                    "clamp(22px, 1.8vw, 34px)",

                  fontFamily:
                    "Nunito, Arial, sans-serif",

                  fontSize:
                    "clamp(9px, 0.65vw, 13px)",
                }}
              >
                {index + 1}
              </button>
            );
          }
        )}
      </div>

      {/* ==================================================================
          NEXT
          ================================================================== */}

      <button
        type="button"
        onClick={onNext}
        disabled={
          currentPage ===
          totalPages - 1
        }
        aria-label="Next letters page"
        className={`
          flex
          items-center
          justify-center
          rounded-full
          border
          shadow-[0_3px_10px_rgba(45,25,12,0.22)]
          transition-all
          duration-200
          ${
            currentPage ===
            totalPages - 1
              ? "cursor-default opacity-40"
              : "cursor-pointer hover:scale-105 hover:bg-[#FFF1CE]"
          }
        `}
        style={{
          width: "clamp(30px, 2.5vw, 48px)",
          height: "clamp(24px, 2vw, 38px)",
          background:
            "rgba(255, 243, 214, 0.92)",
          borderColor:
            "rgba(167, 124, 77, 0.75)",
          color: "#68492F",
          fontSize:
            "clamp(16px, 1.3vw, 25px)",
        }}
      >
        →
      </button>
    </div>
  );
}

// ============================================================================
// LOADING
// ============================================================================

function LoadingOverlay() {
  return (
    <div
      className="
        absolute
        inset-0
        z-[300]
        flex
        items-center
        justify-center
        pointer-events-none
      "
    >
      <div
        className="
          rounded-full
          bg-[#FFF4DB]/90
          border
          border-[#D5B47C]
          px-5
          py-2.5
          shadow-[0_5px_18px_rgba(40,25,15,0.2)]
          text-[#65462D]
          font-semibold
        "
        style={{
          fontFamily:
            "Nunito, Arial, sans-serif",

          fontSize:
            "clamp(10px, 0.7vw, 15px)",
        }}
      >
        Opening the letters...
      </div>
    </div>
  );
}

// ============================================================================
// ERROR
// ============================================================================

function ErrorOverlay({
  onRetry,
}) {
  return (
    <div
      className="
        absolute
        inset-0
        z-[300]
        flex
        items-center
        justify-center
      "
    >
      <div
        className="
          rounded-[22px]
          bg-[#FFF6E4]/95
          border
          border-[#D6B27B]
          px-[3%]
          py-[2%]
          text-center
          shadow-[0_8px_30px_rgba(45,25,12,0.25)]
        "
        style={{
          width: "34%",
          minWidth: "280px",
        }}
      >
        <h2
          className="
            m-0
            text-[#60412B]
            font-bold
          "
          style={{
            fontFamily:
              "Cormorant Garamond, Georgia, serif",

            fontSize:
              "clamp(24px, 2vw, 40px)",
          }}
        >
          The cave is quiet...
        </h2>

        <p
          className="
            mt-2
            text-[#76583F]
          "
          style={{
            fontFamily:
              "Nunito, Arial, sans-serif",

            fontSize:
              "clamp(10px, 0.7vw, 15px)",
          }}
        >
          We couldn't load the letters right now.
        </p>

        <button
          type="button"
          onClick={onRetry}
          className="
            mt-4
            rounded-full
            border
            border-[#A98254]
            bg-[#F0D9AD]
            px-5
            py-2
            font-bold
            text-[#5E402A]
            transition
            hover:bg-[#F5E3C2]
            active:scale-95
          "
          style={{
            fontFamily:
              "Nunito, Arial, sans-serif",

            fontSize:
              "clamp(10px, 0.7vw, 14px)",
          }}
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN LETTERS PAGE
// ============================================================================

export default function Letters() {
  const navigate = useNavigate();

  const [drawerOpen, setDrawerOpen] = useState(false);

  // Timeline-style COVER scene scaling.
  // The entire artwork lives in one fixed 16:9 coordinate system and
  // scales to COVER the viewport, cropping only when the viewport ratio differs.
  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const SCENE_WIDTH = 1920;
  const SCENE_HEIGHT = 1080;

  const sceneScale = Math.max(
    viewport.width / SCENE_WIDTH,
    viewport.height / SCENE_HEIGHT
  );

  const [
    letters,
    setLetters,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState(null);

  // ==========================================================================
  // PAGINATION STATE
  // ==========================================================================

  const [
    currentPage,
    setCurrentPage,
  ] = useState(0);

  // ==========================================================================
  // LOAD LETTERS
  // ==========================================================================

  async function loadLetters() {
    setLoading(true);
    setError(null);

    try {
      const data =
        await getPublishedLetters();

      setLetters(data || []);
      setCurrentPage(0);
    } catch (err) {
      console.error(
        "Unable to load published letters:",
        err
      );

      setLetters([]);
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  // ==========================================================================
  // INITIAL LOAD
  // ==========================================================================

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const data =
          await getPublishedLetters();

        if (!mounted) return;

        setLetters(data || []);
        setCurrentPage(0);
      } catch (err) {
        console.error(
          "Unable to load published letters:",
          err
        );

        if (!mounted) return;

        setLetters([]);
        setError(err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  // ==========================================================================
  // SORT LETTERS
  // ==========================================================================
  //
  // Admin controls display_order.
  //
  // Letters with no display_order are placed after ordered letters.
  // ==========================================================================

  const sortedLetters = useMemo(() => {
    return [...letters].sort(
      (a, b) => {
        const orderA =
          Number.isFinite(
            Number(a?.display_order)
          )
            ? Number(a.display_order)
            : Number.MAX_SAFE_INTEGER;

        const orderB =
          Number.isFinite(
            Number(b?.display_order)
          )
            ? Number(b.display_order)
            : Number.MAX_SAFE_INTEGER;

        return orderA - orderB;
      }
    );
  }, [letters]);

  // ==========================================================================
  // TOTAL PAGES
  // ==========================================================================

  const totalPages = Math.max(
    1,
    Math.ceil(
      sortedLetters.length /
        LETTERS_PER_PAGE
    )
  );

  // ==========================================================================
  // CURRENT PAGE LETTERS
  // ==========================================================================

  const currentPageLetters =
    useMemo(() => {
      const start =
        currentPage *
        LETTERS_PER_PAGE;

      return sortedLetters.slice(
        start,
        start + LETTERS_PER_PAGE
      );
    }, [
      sortedLetters,
      currentPage,
    ]);

  // ==========================================================================
  // SAFETY
  // ==========================================================================
  //
  // If letters are deleted and the current page no longer exists,
  // automatically return to the last valid page.
  // ==========================================================================

  useEffect(() => {
    if (
      currentPage >= totalPages
    ) {
      setCurrentPage(
        totalPages - 1
      );
    }
  }, [
    currentPage,
    totalPages,
  ]);

  // ==========================================================================
  // OPEN LETTER
  // ==========================================================================

  function openLetter(slug) {
    if (!slug) return;

    navigate(
      `/letters/${slug}`
    );
  }

  // ==========================================================================
  // PAGINATION CONTROLS
  // ==========================================================================

  function goPrevious() {
    setCurrentPage(
      (page) =>
        Math.max(0, page - 1)
    );
  }

  function goNext() {
    setCurrentPage(
      (page) =>
        Math.min(
          totalPages - 1,
          page + 1
        )
    );
  }

  function goToPage(page) {
    setCurrentPage(
      Math.max(
        0,
        Math.min(
          totalPages - 1,
          page
        )
      )
    );
  }

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div
      className="
        fixed
        inset-0
        overflow-hidden
        bg-[#241A13]
      "
    >
      {/* ====================================================================
          MASTER 16:9 SCENE
          ==================================================================== */}

      <div
        className="
          absolute
          left-1/2
          top-1/2
          overflow-hidden
        "
        style={{
          width: `${SCENE_WIDTH}px`,
          height: `${SCENE_HEIGHT}px`,
          transform: `translate(-50%, -50%) scale(${sceneScale})`,
          transformOrigin: "center center",
        }}
      >
        {/* ==================================================================
            BACKGROUND
            ================================================================== */}

        <img
          src={background}
          alt=""
          draggable={false}
          className="
            absolute
            inset-0
            w-full
            h-full
            object-fill
            select-none
            pointer-events-none
          "
        />

        {/* ==================================================================
            BACK BUTTON
            ================================================================== */}

        <button
          type="button"
          onClick={() => navigate("/")}
          aria-label="Back to home"
          className="
            absolute
            left-[2%]
            top-[3%]
            z-[200]
            flex
            items-center
            justify-center
            rounded-full
            border
            border-[#D7B985]
            bg-[#FFF3D6]/90
            text-[#68492F]
            shadow-[0_3px_10px_rgba(45,25,12,0.25)]
            transition-all
            duration-200
            hover:scale-105
            hover:bg-[#FFF8E8]
            active:scale-95
          "
          style={{
            width: "clamp(34px, 3vw, 52px)",
            height: "clamp(34px, 3vw, 52px)",
            fontSize: "clamp(18px, 1.5vw, 28px)",
          }}
        >
          ←
        </button>

        {/* ==================================================================
            NAVIGATION BUTTON
            ================================================================== */}

        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open navigation"
          className="
            absolute
            right-[2%]
            top-[3%]
            z-[200]
            flex
            items-center
            justify-center
            rounded-full
            border
            border-[#D7B985]
            bg-[#FFF3D6]/90
            text-[#68492F]
            shadow-[0_3px_10px_rgba(45,25,12,0.25)]
            transition-all
            duration-200
            hover:scale-105
            hover:bg-[#FFF8E8]
            active:scale-95
          "
          style={{
            width: "clamp(34px, 3vw, 52px)",
            height: "clamp(34px, 3vw, 52px)",
            fontSize: "clamp(17px, 1.3vw, 24px)",
          }}
        >
          ☰
        </button>

        {/* ==================================================================
            CAVE CHARACTERS
            ================================================================== */}

        <CaveCharacters />

        {/* ==================================================================
            FIRE
            ================================================================== */}

        <FireDecoration />

        {/* ==================================================================
            LETTER STONES
            ================================================================== */}
        {/*
            IMPORTANT:

            The 10 visual stone positions never move.

            Instead, the letters assigned to those positions change
            when the user changes page.

            Page 1:
              letters 1-10

            Page 2:
              letters 11-20

            Page 3:
              letters 21-30

            etc.
        */}

        {LETTER_SLOTS.map(
          (slot, index) => {
            const letter =
              currentPageLetters[
                index
              ];

            return (
              <LetterStone
                key={`${slot.key}-${currentPage}`}
                slot={slot}
                letter={letter}
                onOpen={openLetter}
              />
            );
          }
        )}

        {/* ==================================================================
            PAGINATION
            ================================================================== */}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPrevious={goPrevious}
          onNext={goNext}
          onPageChange={goToPage}
        />

        {/* ==================================================================
            LOADING
            ================================================================== */}

        {loading && (
          <LoadingOverlay />
        )}

        {/* ==================================================================
            ERROR
            ================================================================== */}

        {!loading && error && (
          <ErrorOverlay
            onRetry={loadLetters}
          />
        )}
      </div>

      {/* ====================================================================
          EXISTING WEBSITE NAVIGATION DRAWER
          ==================================================================== */}

      <TimelineDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}