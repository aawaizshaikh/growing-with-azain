import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getLetterBySlug } from "../services/letterService";

import letterChildBackground from "../assets/illustrations/letters/letter-child-background.png";
import tigerRug from "../assets/illustrations/letters/tiger-rug.png";


// ============================================================================
// CATEGORY LABELS
// ============================================================================

const CATEGORY_LABELS = {
  "little-one": "A Letter for My Little One",
  mommy: "A Letter from Mommy",
  daddy: "A Letter from Daddy",
  family: "A Letter from Family",
  "for-you": "A Letter for You",
  birthday: "A Birthday Letter",
  milestone: "A Milestone Letter",
  "big-moments": "A Letter for a Big Moment",
  "open-when": "A Letter to Open When...",
  future: "A Letter for the Future",
};


// ============================================================================
// CATEGORY LABEL
// ============================================================================

function getCategoryLabel(slotKey) {
  return (
    CATEGORY_LABELS[slotKey] ||
    "A Letter to Treasure"
  );
}


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
        bg-[#241A13]
      "
    >
      <div
        className="
          rounded-full
          border
          border-[#D8B87D]
          bg-[#FFF5DE]
          px-6
          py-3
          text-[#64442B]
          shadow-[0_6px_25px_rgba(30,18,10,0.25)]
        "
        style={{
          fontFamily: "Nunito, Arial, sans-serif",
          fontSize: "clamp(11px, 0.8vw, 16px)",
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

function ErrorScreen({ onBack }) {
  return (
    <div
      className="
        fixed
        inset-0
        flex
        items-center
        justify-center
        bg-[#241A13]
        px-6
      "
    >
      <div
        className="
          w-full
          max-w-[520px]
          rounded-[28px]
          border
          border-[#D8B87D]
          bg-[#FFF5DE]
          px-8
          py-10
          text-center
          shadow-[0_12px_40px_rgba(30,18,10,0.3)]
        "
      >
        <div
          className="
            text-[#62432B]
            font-bold
          "
          style={{
            fontFamily:
              "Cormorant Garamond, Georgia, serif",
            fontSize:
              "clamp(28px, 3vw, 48px)",
          }}
        >
          This letter is hiding...
        </div>

        <p
          className="mt-3 text-[#795B41]"
          style={{
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
            border-[#A98254]
            bg-[#F0D9AD]
            px-6
            py-2.5
            font-bold
            text-[#5D402A]
            shadow-sm
            transition
            hover:bg-[#F5E3C2]
            active:scale-95
          "
          style={{
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

function LetterMeta({ letter }) {
  const hasDate = Boolean(letter?.date);

  const hasAge =
    letter?.age !== null &&
    letter?.age !== undefined &&
    String(letter.age).trim() !== "";

  if (!hasDate && !hasAge) {
    return null;
  }

  return (
    <div
      className="
        mt-[1.2%]
        flex
        items-center
        justify-center
        gap-[2%]
        flex-wrap
        text-[#77583E]
      "
      style={{
        fontFamily:
          "Nunito, Arial, sans-serif",
        fontSize:
          "clamp(9px, 0.72vw, 14px)",
      }}
    >
      {hasDate && (
        <span>
          {letter.date}
        </span>
      )}

      {hasDate && hasAge && (
        <span
          className="
            h-[0.3em]
            w-[0.3em]
            rounded-full
            bg-[#A9845B]
          "
        />
      )}

      {hasAge && (
        <span>
          {letter.age}
        </span>
      )}
    </div>
  );
}


// ============================================================================
// LETTER BODY
// ============================================================================

function LetterBody({ content }) {
  if (!content) {
    return (
      <p
        className="
          text-center
          italic
          text-[#2F2118]
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

  const paragraphs = String(content)
    .split(/\n\s*\n/)
    .filter(Boolean);

  return (
    <div
      className="
        text-[#2F2118]
        text-left
        font-semibold
      "
      style={{
        fontFamily:
          "Cormorant Garamond, Georgia, serif",
        fontSize:
          "clamp(14px, 1.12vw, 23px)",
        lineHeight: 1.55,
      }}
    >
      {paragraphs.map((paragraph, index) => (
        <p
          key={index}
          className="
            m-0
            mb-[1.1em]
            last:mb-0
          "
          style={{
            whiteSpace: "pre-wrap",
          }}
        >
          {paragraph}
        </p>
      ))}
    </div>
  );
}


// ============================================================================
// LETTER CONTENT
//
// The new background already contains the parchment.
// Therefore we DO NOT render cave-stone.png here.
// ============================================================================

function LetterContent({ letter }) {
  const categoryLabel =
    getCategoryLabel(letter.slot_key);

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
        left: "14%",
        top: "15%",
        width: "48%",
        height: "58%",
      }}
    >

      {/* ==================================================================
          LETTER TITLE
          
          Positioned independently over the small hanging parchment.
          ================================================================== */}

      <h1
        className="
          absolute
          z-40
          text-center
          font-bold
          leading-[0.95]
          text-[#2F2118]
        "
        style={{
          left: "27%",
          top: "16%",
          width: "46%",
          fontFamily:
            "Cormorant Garamond, Georgia, serif",
          fontSize:
            "clamp(18px, 1.55vw, 32px)",
        }}
      >
        {letter.title}
      </h1>


      {/* ================================================================
          CONTENT AREA
          ================================================================ */}

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

        {/* ==============================================================
            CATEGORY
            ============================================================== */}

        <div
          className="
            uppercase
            tracking-[0.18em]
            text-[#88623E]
            text-center
            flex-shrink-0
          "
          style={{
            fontFamily:
              "Nunito, Arial, sans-serif",
            fontSize:
              "clamp(7px, 0.55vw, 12px)",
          }}
        >
          {categoryLabel}
        </div>


        {/* ==============================================================
            TITLE
            ============================================================== */}

        {/* Title intentionally removed from normal content flow.
            It is positioned above on the hanging parchment. */}


        {/* ==============================================================
            HEART
            ============================================================== */}

        <div
          className="
            mt-[1.2%]
            text-[#9C6843]
            flex-shrink-0
          "
          style={{
            fontSize:
              "clamp(10px, 0.9vw, 18px)",
          }}
        >
          ♥
        </div>


      


        {/* ==============================================================
            DIVIDER
            ============================================================== */}

        <div
          className="
            my-[2.2%]
            flex
            items-center
            justify-center
            w-[70%]
            flex-shrink-0
          "
        >
          <div
            className="
              h-px
              flex-1
              bg-[#A9825B]/45
            "
          />

          <span
            className="
              mx-[4%]
              text-[#9A7049]
            "
            style={{
              fontSize:
                "clamp(8px, 0.7vw, 14px)",
            }}
          >
            ✦
          </span>

          <div
            className="
              h-px
              flex-1
              bg-[#A9825B]/45
            "
          />
        </div>


        {/* ==============================================================
            LETTER BODY
            ============================================================== */}

        <div
          className="
            w-full
            flex-1
            min-h-0
            overflow-y-auto
            pr-[2%]
          "
          style={{
            scrollbarWidth: "thin",
            scrollbarColor:
              "#A9825B transparent",
          }}
        >
          <LetterBody
            content={letter.letter_content}
          />
        </div>


        {/* ==============================================================
            SIGNATURE
            ============================================================== */}

        {letter.signature && (
          <div
            className="
              mt-[2.2%]
              w-full
              text-right
              text-[#62432D]
              flex-shrink-0
            "
            style={{
              fontFamily:
                "Cormorant Garamond, Georgia, serif",
              fontSize:
                "clamp(13px, 1.05vw, 22px)",
              whiteSpace: "pre-wrap",
            }}
          >
            {letter.signature}
          </div>
        )}

      </div>
    </div>
  );
}


// ============================================================================
// BACK BUTTON
//
// The supplied background already contains the visual arrow.
// This button provides the actual clickable functionality on top of it.
// ============================================================================

function BackButton({ onClick }) {
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
        bg-transparent
        border-0
        p-0
        cursor-pointer
        transition
        hover:scale-105
        active:scale-95
      "
      style={{
        width: "5.2%",
        aspectRatio: "1 / 1",
      }}
    >
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
  const { slug } = useParams();
  const navigate = useNavigate();

  const [letter, setLetter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Timeline-style COVER scene scaling.
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


  // ==========================================================================
  // LOAD LETTER
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
          await getLetterBySlug(slug);

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
  // LOADING
  // ==========================================================================

  if (loading) {
    return <LoadingScreen />;
  }


  // ==========================================================================
  // ERROR
  // ==========================================================================

  if (error || !letter) {
    return (
      <ErrorScreen
        onBack={() => navigate("/letters")}
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
        bg-[#241A13]
      "
    >

      {/* ==================================================================
          MASTER SCENE
          ================================================================== */}

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

        {/* ================================================================
            NEW CHILD PAGE BACKGROUND
            ================================================================ */}

        <img
          src={letterChildBackground}
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
<img
  src={tigerRug}
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
    left: "30%",
    bottom: "-2%",
    width: "20%",
     transform: "rotate(8deg)",
  }}
/>

        {/* ================================================================
            VERY SOFT OVERLAY
            ================================================================ */}

        <div
          className="
            absolute
            inset-0
            z-10
            pointer-events-none
          "
          style={{
            background:
              "radial-gradient(circle at 50% 45%, rgba(255,235,195,0.04) 0%, rgba(45,28,16,0.04) 55%, rgba(25,15,9,0.10) 100%)",
          }}
        />


        {/* ================================================================
            ACTUAL LETTER
            ================================================================ */}

        <LetterContent
          letter={letter}
        />


        {/* ================================================================
            BACK BUTTON
            ================================================================ */}

        <BackButton
          onClick={() => navigate("/letters")}
        />

      </div>
    </div>
  );
}