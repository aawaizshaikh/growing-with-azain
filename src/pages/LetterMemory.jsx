import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import { getLetterBySlug } from "../services/letterService";

import letterWritingTableBackground from "../assets/illustrations/letters/letter-writing-table-background.png";

// ============================================================================
// LOADING
// ============================================================================

function LoadingScreen() {
  return (
    <div
      className="
        fixed
        inset-0
        flex
        items-center
        justify-center
        bg-[#DCE8E2]
      "
    >
      <div
        className="
          rounded-full
          border
          px-6
          py-3
          font-semibold
        "
        style={{
          background:
            "rgba(255,250,238,0.92)",

          borderColor:
            "rgba(157,132,91,0.55)",

          color:
            "#675B49",

          boxShadow:
            "0 6px 25px rgba(72,58,35,0.16)",

          fontFamily:
            "Nunito, Arial, sans-serif",

          fontSize:
            "clamp(11px, 0.8vw, 16px)",
        }}
      >
        Opening your letter...
      </div>
    </div>
  );
}

// ============================================================================
// ERROR
// ============================================================================

function ErrorScreen({
  onBack,
}) {
  return (
    <div
      className="
        fixed
        inset-0
        flex
        items-center
        justify-center
        bg-[#DCE8E2]
        px-6
      "
    >
      <div
        className="
          w-full
          max-w-[520px]
          rounded-[28px]
          border
          px-8
          py-10
          text-center
        "
        style={{
          background:
            "rgba(255,250,238,0.96)",

          borderColor:
            "rgba(157,132,91,0.55)",

          boxShadow:
            "0 12px 40px rgba(72,58,35,0.18)",
        }}
      >
        <div
          className="
            font-semibold
          "
          style={{
            color:
              "#625542",

            fontFamily:
              "Cormorant Garamond, Georgia, serif",

            fontSize:
              "clamp(28px, 3vw, 48px)",
          }}
        >
          This letter is hiding...
        </div>

        <p
          className="mt-3"
          style={{
            color:
              "#776C59",

            fontFamily:
              "Nunito, Arial, sans-serif",

            fontSize:
              "clamp(11px, 0.85vw, 16px)",
          }}
        >
          We couldn't find this letter.
        </p>

        <button
          type="button"
          onClick={onBack}
          className="
            mt-6
            rounded-full
            border
            px-6
            py-2.5
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

            boxShadow:
              "0 3px 10px rgba(72,58,35,0.12)",

            fontFamily:
              "Nunito, Arial, sans-serif",

            fontSize:
              "clamp(10px, 0.75vw, 15px)",
          }}
        >
          Back to Letters
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// META
// ============================================================================
//
// Only the date is displayed.
//
// The date comes dynamically from the Admin/Supabase letter record.
//
// Age has intentionally been removed.
// ============================================================================

function LetterMeta({
  letter,
}) {
  const hasDate =
    Boolean(letter?.date);

  if (!hasDate) {
    return null;
  }

  return (
    <div
      className="
        mt-[1.2%]
        flex
        items-center
        justify-center
      "
      style={{
        color:
          "#77583E",

        fontFamily:
          "Nunito, Arial, sans-serif",

        fontSize:
          "clamp(9px, 0.72vw, 14px)",
      }}
    >
      {letter.date}
    </div>
  );
}

// ============================================================================
// LETTER BODY
// ============================================================================

function LetterBody({
  content,
}) {
  if (!content) {
    return (
      <p
        className="
          text-center
          italic
          text-[#5B4D3D]
        "
        style={{
          fontFamily:
            "Cormorant Garamond, Georgia, serif",

          fontSize:
            "clamp(14px, 1.15vw, 23px)",
        }}
      >
        This letter is waiting to be written...
      </p>
    );
  }

  const paragraphs =
    String(content)
      .split(/\n\s*\n/)
      .filter(Boolean);

  return (
    <div
      className="
        text-[#4D4235]
        text-left
      "
      style={{
        fontFamily:
          "Cormorant Garamond, Georgia, serif",

        fontSize:
          "clamp(15px, 1.12vw, 23px)",

        lineHeight:
          1.62,

        fontWeight:
          500,
      }}
    >
      {paragraphs.map(
        (paragraph, index) => (
          <p
            key={index}
            className="
              m-0
              mb-[1.15em]
              last:mb-0
            "
            style={{
              whiteSpace:
                "pre-wrap",
            }}
          >
            {paragraph}
          </p>
        )
      )}
    </div>
  );
}

// ============================================================================
// LETTER CONTENT
// ============================================================================
//
// The supplied Garden Writing Table background contains the central
// parchment/stationery area.
//
// The actual letter information remains dynamic HTML/React content.
//
// Nothing is baked into the artwork.
// ============================================================================

function LetterContent({
  letter,
}) {
  return (
    <div
      className="
        absolute
        z-30
        flex
        flex-col
        items-center
      "
      style={{
        left: "32%",
        top: "18%",
        width: "40%",
        height: "60%",
      }}
    >
      {/* ==================================================================
          LETTER TITLE
          ================================================================== */}

      <h1
        className="
          absolute
          z-40
          text-center
          font-semibold
          leading-[0.98]
          text-[#5B4C3A]
        "
        style={{
          left: "27%",
          top: "15%",
          width: "46%",

          fontFamily:
            "Cormorant Garamond, Georgia, serif",

          fontSize:
            "clamp(18px, 1.55vw, 32px)",

          letterSpacing:
            "0.01em",
        }}
      >
        {letter.title}
      </h1>

      {/* ==================================================================
          CONTENT AREA
          ================================================================== */}

      <div
        className="
          w-full
          h-full
          flex
          flex-col
          items-center
        "
        style={{
          paddingLeft: "9%",
          paddingRight: "9%",
          paddingTop: "5%",
          paddingBottom: "5%",
        }}
      >
        {/* ==================================================================
            SMALL BOTANICAL HEART
            ================================================================== */}

        <div
          className="
            mt-[-1.5%]
            text-[#9A8060]
            flex-shrink-0
          "
          style={{
            fontSize:
              "clamp(10px, 0.9vw, 18px)",
          }}
        >
          ♥
        </div>

        

        {/* ==================================================================
            LETTER META
            ================================================================== */}

        <LetterMeta
          letter={letter}
        />

        {/* ==================================================================
            LETTER BODY
            ================================================================== */}

        <div
          className="
            w-full
            flex-1
            min-h-0
            overflow-y-auto
            pr-[2%]
          "
          style={{
            paddingTop: "12%",
            scrollbarWidth:
              "thin",

            scrollbarColor:
              "#A9825B transparent",
          }}
        >
          <LetterBody
            content={
              letter.letter_content
            }
          />
        </div>

        {/* ==================================================================
            SIGNATURE
            ================================================================== */}

        {letter.signature && (
          <div
            className="
              mt-[2.2%]
              w-full
              text-right
              text-[#66533F]
              flex-shrink-0
            "
            style={{
              fontFamily:
                "Cormorant Garamond, Georgia, serif",

              fontSize:
                "clamp(14px, 1.05vw, 22px)",

              fontStyle:
                "italic",

              whiteSpace:
                "pre-wrap",
            }}
          >
            {letter.signature}
          </div>
        )}
      </div>

      {/* ==================================================================
          SUBTLE WAX-SEAL ACCENT
          ==================================================================
          
          This remains deliberately understated so it does not compete with
          the actual letter content.
      ================================================================== */}

      <div
        className="
          absolute
          z-40
          pointer-events-none
          flex
          items-center
          justify-center
          rounded-full
          bg-[#B89A62]/75
          border
          border-[#947545]/55
        "
        style={{
          right: "7%",
          bottom: "3%",

          width:
            "clamp(24px, 2.2vw, 42px)",

          aspectRatio:
            "1 / 1",

          boxShadow:
            "0 2px 6px rgba(72,58,35,0.12)",
        }}
      >
        <span
          className="
            text-[#FFF5DC]
          "
          style={{
            fontSize:
              "clamp(9px, 0.65vw, 14px)",
          }}
        >
          ♥
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// BACK BUTTON
// ============================================================================
//
// The button remains a real HTML button.
//
// It sits above the illustrated scene and provides the actual navigation.
//
// The destination is now supplied dynamically so the user can return to the
// exact Letters pagination page they came from.
// ============================================================================

function BackButton({
  onClick,
}) {
  return (
    <button
      type="button"
      aria-label="Back to Letters"
      onClick={onClick}
      className="
        absolute
        left-[2.3%]
        top-[2.5%]
        z-[100]
        flex
        items-center
        justify-center
        rounded-full
        border
        p-0
        cursor-pointer
        transition
        hover:scale-105
        active:scale-95
      "
      style={{
        width:
          "clamp(38px, 4.2vw, 70px)",

        height:
          "clamp(38px, 4.2vw, 70px)",

        background:
          "rgba(255,250,238,0.72)",

        borderColor:
          "rgba(157,132,91,0.40)",

        color:
          "#675A46",

        boxShadow:
          "0 3px 10px rgba(72,58,35,0.12)",

        fontSize:
          "clamp(18px, 1.6vw, 28px)",
      }}
    >
      ←

      <span className="sr-only">
        Back to Letters
      </span>
    </button>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function LetterMemory() {
  const {
    slug,
  } = useParams();

  const navigate =
    useNavigate();

  // ==========================================================================
  // PAGE PARAMETER
  // ==========================================================================
  //
  // Letters.jsx now opens a letter as:
  //
  // /letters/example-slug?page=4
  //
  // We read that parameter here ONLY for returning to the correct Letters
  // pagination page.
  //
  // It does not affect the Supabase query.
  // It does not affect the slug.
  // It does not affect Admin.
  // ==========================================================================

  const [
    searchParams,
  ] = useSearchParams();

  const pageParam =
    Number(
      searchParams.get("page")
    );

  const returnPage =
    Number.isFinite(pageParam) &&
    pageParam >= 1
      ? pageParam
      : 1;

  // ==========================================================================
  // LETTER STATE
  // ==========================================================================

  const [
    letter,
    setLetter,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState(null);

  // ==========================================================================
  // TIMELINE-STYLE COVER SCENE SCALING
  // ==========================================================================
  //
  // Existing 1920 x 1080 architecture preserved.
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
  // LOAD LETTER
  // ==========================================================================
  //
  // IMPORTANT:
  //
  // Existing Supabase/service call remains exactly the same:
  //
  // getLetterBySlug(slug)
  //
  // No data-flow changes.
  // ==========================================================================

  useEffect(() => {
    let mounted = true;

    async function loadLetter() {
      setLoading(true);
      setError(null);

      try {
        if (!slug) {
          throw new Error(
            "No letter slug was provided."
          );
        }

        const data =
          await getLetterBySlug(
            slug
          );

        if (!mounted) return;

        setLetter(data);
      } catch (err) {
        console.error(
          "Unable to load letter:",
          err
        );

        if (!mounted) return;

        setLetter(null);
        setError(err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadLetter();

    return () => {
      mounted = false;
    };
  }, [slug]);

  // ==========================================================================
  // RETURN TO EXACT LETTERS PAGE
  // ==========================================================================

  function goBackToLetters() {
    navigate(
      returnPage === 1
        ? "/letters"
        : `/letters?page=${returnPage}`
    );
  }

  // ==========================================================================
  // LOADING
  // ==========================================================================

  if (loading) {
    return (
      <LoadingScreen />
    );
  }

  // ==========================================================================
  // ERROR
  // ==========================================================================

  if (
    error ||
    !letter
  ) {
    return (
      <ErrorScreen
        onBack={
          goBackToLetters
        }
      />
    );
  }

  // ==========================================================================
  // SCENE
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
            GARDEN WRITING TABLE BACKGROUND
            ==================================================================
            
            IMPORTANT:
            
            This is an actual IMAGE ELEMENT.
            
            It is NOT a CSS background.
            
            The artwork itself provides the visual environment while React
            renders the actual letter content dynamically on top.
        ================================================================== */}

        <img
          src={
            letterWritingTableBackground
          }
          alt=""
          draggable={false}
          className="
            absolute
            inset-0
            w-full
            h-full
            object-fill
            pointer-events-none
            select-none
          "
        />

        {/* ==================================================================
            SOFT ATMOSPHERIC OVERLAY
            ================================================================== */}

        <div
          className="
            absolute
            inset-0
            z-10
            pointer-events-none
          "
          style={{
            background:
              "radial-gradient(circle at 50% 43%, rgba(255,252,239,0.10) 0%, rgba(255,250,235,0.025) 52%, rgba(72,58,35,0.055) 100%)",
          }}
        />

        {/* ==================================================================
            ACTUAL DYNAMIC LETTER
            ================================================================== */}

        <LetterContent
          letter={letter}
        />

        {/* ==================================================================
            BACK BUTTON
            ================================================================== */}

        <BackButton
          onClick={
            goBackToLetters
          }
        />
      </div>
    </div>
  );
}