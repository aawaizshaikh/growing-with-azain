import { useEffect, useMemo, useState } from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import TimelineDrawer from "../components/timeline/TimelineDrawer";

import { getPublishedLetters } from "../services/letterService";

// ============================================================================
// LETTER GARDEN ARTWORK
// ============================================================================
//
// These are visual assets only.
//
// IMPORTANT:
// The Letter Garden background is deliberately rendered as an actual <img>
// element inside the fixed 1920 x 1080 scene.
//
// It is NOT a CSS background-image.
//
// This keeps the Letters page consistent with the existing illustrated
// scene architecture used elsewhere in the project.
//
// Files:
//
// src/assets/illustrations/letters/
// ├── letter-garden-background.png
// ├── letter-envelope.png
// └── letter-writing-table-background.png
//
// The writing-table background is used by LetterMemory.jsx.
// ============================================================================

import letterGardenBackground from "../assets/illustrations/letters/letter-garden-background.webp";
import letterEnvelope from "../assets/illustrations/letters/letter-envelope.webp";

// ============================================================================
// PAGINATION
// ============================================================================

const LETTERS_PER_PAGE = 10;

// ============================================================================
// LETTER SLOTS
// ============================================================================
//
// The positions are intentionally kept as percentages of the 1920 x 1080
// scene.
//
// The envelopes have been moved slightly downward to create a dedicated
// visual area for the page title and subtitle.
// ============================================================================

const LETTER_SLOTS = [
  {
    key: "envelope-1",
    envelopeLeft: "22%",
    envelopeTop: "33%",
    envelopeWidth: "12%",
  },

  {
    key: "envelope-2",
    envelopeLeft: "35%",
    envelopeTop: "33%",
    envelopeWidth: "12%",
  },

  {
    key: "envelope-3",
    envelopeLeft: "48%",
    envelopeTop: "33%",
    envelopeWidth: "12%",
  },

  {
    key: "envelope-4",
    envelopeLeft: "61%",
    envelopeTop: "33%",
    envelopeWidth: "12%",
  },

  {
    key: "envelope-5",
    envelopeLeft: "74%",
    envelopeTop: "33%",
    envelopeWidth: "12%",
  },

  {
    key: "envelope-6",
    envelopeLeft: "22%",
    envelopeTop: "52%",
    envelopeWidth: "12%",
  },

  {
    key: "envelope-7",
    envelopeLeft: "35%",
    envelopeTop: "52%",
    envelopeWidth: "12%",
  },

  {
    key: "envelope-8",
    envelopeLeft: "48%",
    envelopeTop: "52%",
    envelopeWidth: "12%",
  },

  {
    key: "envelope-9",
    envelopeLeft: "61%",
    envelopeTop: "52%",
    envelopeWidth: "12%",
  },

  {
    key: "envelope-10",
    envelopeLeft: "74%",
    envelopeTop: "52%",
    envelopeWidth: "12%",
  },
];

// ============================================================================
// PAGE TITLE
// ============================================================================
//
// Dynamic HTML/React text.
//
// Nothing is baked into the illustration.
// ============================================================================

function PageHeading() {
  return (
    <div
      className="
        absolute
        z-50
        pointer-events-none
        left-1/2
        -translate-x-1/2
        top-[16.5%]
        w-[62%]
        text-center
      "
    >
      {/* ==================================================================
          MAIN TITLE
          ================================================================== */}

      <h1
        className="
          m-0
          font-semibold
          leading-none
          text-[#5B4C3A]
          drop-shadow-[0_2px_3px_rgba(255,250,235,0.72)]
        "
        style={{
          fontFamily:
            "DM Serif Display, Georgia, serif",

          fontSize:
            "clamp(34px, 3.1vw, 60px)",

          letterSpacing:
            "0.01em",
        }}
      >
        Letters from the Heart
      </h1>

      {/* ==================================================================
          SUBTITLE
          ================================================================== */}

      <p
        className="
          m-0
          mt-[0.7%]
          text-[#75624D]
          italic
          leading-tight
          drop-shadow-[0_1px_2px_rgba(255,250,235,0.72)]
        "
        style={{
          fontFamily:
            "Parisienne, cursive",

          fontSize:
            "clamp(16px, 1.35vw, 26px)",

          letterSpacing:
            "0.015em",
        }}
      >
        A little garden of words, waiting to be discovered.
      </p>

      {/* ==================================================================
          SMALL DECORATIVE DIVIDER
          ================================================================== */}

      <div
        className="
          mt-[1.3%]
          flex
          items-center
          justify-center
          gap-[0.65%]
        "
      >
        <span
          className="
            h-px
            w-[7%]
            bg-[#9D805C]/45
          "
        />

        <span
          className="
            text-[#A1845E]
          "
          style={{
            fontSize:
              "clamp(8px, 0.65vw, 13px)",
          }}
        >
          ✦
        </span>

        <span
          className="
            h-px
            w-[7%]
            bg-[#9D805C]/45
          "
        />
      </div>
    </div>
  );
}

// ============================================================================
// LETTER ENVELOPE
// ============================================================================

function LetterEnvelope({
  slot,
  letter,
  onOpen,
}) {
  const hasLetter =
    Boolean(letter?.slug);

  const title =
    letter?.title || "";

  return (
    <>
      {/* ====================================================================
          ENVELOPE
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
            : "Empty letter envelope"
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
          left:
            slot.envelopeLeft,

          top:
            slot.envelopeTop,

          width:
            slot.envelopeWidth,

          WebkitTapHighlightColor:
            "transparent",
        }}
      >
        <img
          src={letterEnvelope}
          alt=""
          draggable={false}
          className={`
            block
            w-full
            h-auto
            select-none
            object-contain
            transition-all
            duration-300
            ${
              hasLetter
                ? `
                  hover:scale-[1.035]
                  hover:-translate-y-[2%]
                  active:scale-[0.98]
                `
                : "opacity-35"
            }
          `}
        />
      </button>

      {/* ====================================================================
          DYNAMIC LETTER TITLE
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
  left:
    `calc(${slot.envelopeLeft} + ${slot.envelopeWidth} * 0.05)`,

  top:
    `calc(${slot.envelopeTop} - ${slot.envelopeWidth} * -0.10)`,

  width:
    `calc(${slot.envelopeWidth} * 0.90)`,

  minHeight:
    `calc(${slot.envelopeWidth} * 0.18)`,

  transform:
    "none",
}}
        >
          <span
            className="
              max-w-full
              font-semibold
              leading-[1.05]
              text-[#66553F]
              drop-shadow-[0_1px_2px_rgba(255,250,235,0.85)]
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
    DYNAMIC LETTER SIGNATURE
    ==================================================================== */}

{hasLetter && letter.signature && (
  <div
    className="
      absolute
      z-40
      pointer-events-none
      text-left
      whitespace-pre-line
      leading-[0.95]
    "
    style={{
      left:
        `calc(${slot.envelopeLeft} + ${slot.envelopeWidth} * 0.08)`,

      top:
        `calc(${slot.envelopeTop} + ${slot.envelopeWidth} * 0.85)`,

      width:
        `calc(${slot.envelopeWidth} * 0.48)`,

      color:
        "#66533F",

      fontFamily:
        "Cormorant Garamond, Georgia, serif",

      fontSize:
        "clamp(10px, 0.85vw, 18px)",

      fontStyle:
        "italic",

      lineHeight:
        1.05,
    }}
  >
    {letter.signature}
  </div>
)}

         </>
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
        disabled={
          currentPage === 0
        }
        aria-label="Previous letters page"
        className={`
          flex
          items-center
          justify-center
          rounded-full
          border
          transition-all
          duration-200
          ${
            currentPage === 0
              ? "cursor-default opacity-40"
              : `
                cursor-pointer
                hover:scale-105
                hover:bg-[#FFF9EE]
              `
          }
        `}
        style={{
          width:
            "clamp(30px, 2.5vw, 48px)",

          height:
            "clamp(24px, 2vw, 38px)",

          background:
            "rgba(255, 250, 238, 0.88)",

          borderColor:
            "rgba(157, 132, 91, 0.55)",

          color:
            "#685B47",

          boxShadow:
            "0 3px 10px rgba(72,58,35,0.14)",

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
        "
        style={{
          background:
            "rgba(255, 250, 238, 0.88)",

          borderColor:
            "rgba(157, 132, 91, 0.55)",

          boxShadow:
            "0 3px 10px rgba(72,58,35,0.12)",
        }}
      >
        {Array.from(
          {
            length:
              totalPages,
          },
          (_, index) => {
            const isActive =
              index ===
              currentPage;

            return (
              <button
                key={index}
                type="button"
                onClick={() =>
                  onPageChange(
                    index
                  )
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
                  font-semibold
                  transition-all
                  duration-200
                  ${
                    isActive
                      ? `
                        bg-[#A48A62]
                        text-[#FFF8E8]
                        scale-105
                      `
                      : `
                        text-[#70634F]
                        hover:bg-[#EDE2CF]
                      `
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
          transition-all
          duration-200
          ${
            currentPage ===
            totalPages - 1
              ? "cursor-default opacity-40"
              : `
                cursor-pointer
                hover:scale-105
                hover:bg-[#FFF9EE]
              `
          }
        `}
        style={{
          width:
            "clamp(30px, 2.5vw, 48px)",

          height:
            "clamp(24px, 2vw, 38px)",

          background:
            "rgba(255, 250, 238, 0.88)",

          borderColor:
            "rgba(157, 132, 91, 0.55)",

          color:
            "#685B47",

          boxShadow:
            "0 3px 10px rgba(72,58,35,0.14)",

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
          border
          px-5
          py-2.5
          font-semibold
        "
        style={{
          background:
            "rgba(255,250,238,0.90)",

          borderColor:
            "rgba(167,145,105,0.55)",

          boxShadow:
            "0 5px 18px rgba(72,58,35,0.15)",

          color:
            "#675B49",

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
          px-[3%]
          py-[2%]
          text-center
        "
        style={{
          width: "34%",
          minWidth: "280px",

          background:
            "rgba(255,250,238,0.95)",

          border:
            "1px solid rgba(167,145,105,0.55)",

          boxShadow:
            "0 8px 30px rgba(72,58,35,0.18)",
        }}
      >
        <h2
          className="
            m-0
            font-semibold
          "
          style={{
            color:
              "#625542",

            fontFamily:
              "Cormorant Garamond, Georgia, serif",

            fontSize:
              "clamp(24px, 2vw, 40px)",
          }}
        >
          The garden is quiet...
        </h2>

        <p
          className="
            mt-2
          "
          style={{
            color:
              "#776C59",

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
            px-5
            py-2
            font-semibold
            transition
            hover:scale-[1.02]
            active:scale-95
          "
          style={{
            background:
              "#D9C7A8",

            borderColor:
              "rgba(139,113,76,0.55)",

            color:
              "#5D503E",

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
  const navigate =
    useNavigate();

  // ==========================================================================
  // PAGE URL STATE
  // ==========================================================================

  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const [
    drawerOpen,
    setDrawerOpen,
  ] = useState(false);

  // ==========================================================================
  // TIMELINE-STYLE COVER SCENE SCALING
  // ==========================================================================

  const [
    viewport,
    setViewport,
  ] = useState({
    width:
      window.innerWidth,

    height:
      window.innerHeight,
  });

  useEffect(() => {
    const handleResize =
      () => {
        setViewport({
          width:
            window.innerWidth,

          height:
            window.innerHeight,
        });
      };

    handleResize();

    window.addEventListener(
      "resize",
      handleResize
    );

    return () => {
      window.removeEventListener(
        "resize",
        handleResize
      );
    };
  }, []);

  const SCENE_WIDTH =
    1920;

  const SCENE_HEIGHT =
    1080;

  const sceneScale =
    Math.max(
      viewport.width /
        SCENE_WIDTH,

      viewport.height /
        SCENE_HEIGHT
    );

  // ==========================================================================
  // LETTER DATA
  // ==========================================================================

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

  const pageFromUrl =
    Number(
      searchParams.get("page")
    );

  const safeInitialPage =
    Number.isFinite(
      pageFromUrl
    ) &&
    pageFromUrl >= 1
      ? pageFromUrl - 1
      : 0;

  const [
    currentPage,
    setCurrentPage,
  ] = useState(
    safeInitialPage
  );

  // ==========================================================================
  // KEEP URL IN SYNC WITH PAGINATION
  // ==========================================================================

  useEffect(() => {
    const expectedPage =
      currentPage + 1;

    const currentUrlPage =
      Number(
        searchParams.get(
          "page"
        )
      );

    if (
      expectedPage === 1
    ) {
      if (
        searchParams.has(
          "page"
        )
      ) {
        setSearchParams(
          {},
          {
            replace: true,
          }
        );
      }

      return;
    }

    if (
      currentUrlPage !==
      expectedPage
    ) {
      setSearchParams(
        {
          page: String(
            expectedPage
          ),
        },
        {
          replace: true,
        }
      );
    }
  }, [
    currentPage,
    searchParams,
    setSearchParams,
  ]);

  // ==========================================================================
  // LOAD LETTERS
  // ==========================================================================

  async function loadLetters() {
    setLoading(true);
    setError(null);

    try {
      const data =
        await getPublishedLetters();

      setLetters(
        data || []
      );
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

        setLetters(
          data || []
        );
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

  const sortedLetters =
    useMemo(() => {
      return [
        ...letters,
      ].sort(
        (a, b) => {
          const orderA =
            Number.isFinite(
              Number(
                a?.display_order
              )
            )
              ? Number(
                  a.display_order
                )
              : Number.MAX_SAFE_INTEGER;

          const orderB =
            Number.isFinite(
              Number(
                b?.display_order
              )
            )
              ? Number(
                  b.display_order
                )
              : Number.MAX_SAFE_INTEGER;

          return (
            orderA -
            orderB
          );
        }
      );
    }, [letters]);

  // ==========================================================================
  // TOTAL PAGES
  // ==========================================================================

  const totalPages =
    Math.max(
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
        start +
          LETTERS_PER_PAGE
      );
    }, [
      sortedLetters,
      currentPage,
    ]);

  // ==========================================================================
  // PAGE SAFETY
  // ==========================================================================

  useEffect(() => {
    if (
      currentPage >=
      totalPages
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

  function openLetter(
    slug
  ) {
    if (!slug) return;

    const page =
      currentPage + 1;

    navigate(
      `/letters/${slug}?page=${page}`
    );
  }

  // ==========================================================================
  // PAGINATION
  // ==========================================================================

  function goPrevious() {
    setCurrentPage(
      (page) =>
        Math.max(
          0,
          page - 1
        )
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

  function goToPage(
    page
  ) {
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
        bg-[#DCE8E2]
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
          width:
            `${SCENE_WIDTH}px`,

          height:
            `${SCENE_HEIGHT}px`,

          transform:
            `translate(-50%, -50%) scale(${sceneScale})`,

          transformOrigin:
            "center center",
        }}
      >
        {/* ==================================================================
            LETTER GARDEN BACKGROUND
            ================================================================== */}

        <img
          src={
            letterGardenBackground
          }
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
            NAME ON HANGING WOODEN SIGN
            ================================================================== */}

        <div
          className="
            absolute
            z-40
            pointer-events-none
            text-center
            font-semibold
            text-[#66503F]
            drop-shadow-[0_1px_2px_rgba(255,250,235,0.75)]
          "
          style={{
            left: "1.5%",
            top: "32.8%",
            width: "35%",
            fontFamily:
              "Tangerine, cursive",
            fontSize:
              "clamp(25px, 2.65vw, 38px)",
            letterSpacing:
              "0.01em",
          }}
        >
          Azain
        </div>

        {/* ==================================================================
            SUBTLE CENTRAL LIGHT
            ================================================================== */}

        <div
          className="
            absolute
            z-10
            pointer-events-none
          "
          style={{
            left: "7%",
            top: "12%",
            width: "86%",
            height: "72%",

            background:
              "radial-gradient(ellipse at center, rgba(255,252,239,0.13) 0%, rgba(255,252,239,0.035) 48%, rgba(255,252,239,0) 75%)",
          }}
        />

        {/* ==================================================================
            PAGE TITLE + SUBTITLE
            ================================================================== */}

        <PageHeading />

        {/* ==================================================================
            BACK BUTTON
            ================================================================== */}

        <button
          type="button"
          onClick={() =>
            navigate("/")
          }
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
            transition-all
            duration-200
            hover:scale-105
            active:scale-95
          "
          style={{
            width:
              "clamp(34px, 3vw, 52px)",

            height:
              "clamp(34px, 3vw, 52px)",

            background:
              "rgba(255,250,238,0.84)",

            borderColor:
              "rgba(157,132,91,0.55)",

            color:
              "#675A46",

            boxShadow:
              "0 3px 10px rgba(72,58,35,0.16)",

            fontSize:
              "clamp(18px, 1.5vw, 28px)",
          }}
        >
          ←
        </button>

        {/* ==================================================================
            NAVIGATION BUTTON
            ================================================================== */}

        <button
          type="button"
          onClick={() =>
            setDrawerOpen(
              true
            )
          }
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
            transition-all
            duration-200
            hover:scale-105
            active:scale-95
          "
          style={{
            width:
              "clamp(34px, 3vw, 52px)",

            height:
              "clamp(34px, 3vw, 52px)",

            background:
              "rgba(255,250,238,0.84)",

            borderColor:
              "rgba(157,132,91,0.55)",

            color:
              "#675A46",

            boxShadow:
              "0 3px 10px rgba(72,58,35,0.16)",

            fontSize:
              "clamp(17px, 1.3vw, 24px)",
          }}
        >
          ☰
        </button>

        {/* ==================================================================
            LETTER ENVELOPES
            ================================================================== */}

        {LETTER_SLOTS.map(
          (
            slot,
            index
          ) => {
            const letter =
              currentPageLetters[
                index
              ];

            return (
              <LetterEnvelope
                key={`${slot.key}-${currentPage}`}
                slot={
                  slot
                }
                letter={
                  letter
                }
                onOpen={
                  openLetter
                }
              />
            );
          }
        )}

        {/* ==================================================================
            PAGINATION
            ================================================================== */}

        <Pagination
          currentPage={
            currentPage
          }
          totalPages={
            totalPages
          }
          onPrevious={
            goPrevious
          }
          onNext={
            goNext
          }
          onPageChange={
            goToPage
          }
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

        {!loading &&
          error && (
            <ErrorOverlay
              onRetry={
                loadLetters
              }
            />
          )}
      </div>

      {/* ====================================================================
          EXISTING WEBSITE NAVIGATION DRAWER
          ==================================================================== */}

      <TimelineDrawer
        open={
          drawerOpen
        }
        onClose={() =>
          setDrawerOpen(
            false
          )
        }
      />
    </div>
  );
}