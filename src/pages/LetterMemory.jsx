import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getLetterBySlug } from "../services/letterService";

import background from "../assets/illustrations/letters/background.png";
import caveStone from "../assets/illustrations/letters/cave-stone.png";
import caveFire from "../assets/illustrations/letters/cave-fire.png";


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
          text-[#80624A]
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
      className="text-[#4F3827] text-left"
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
          className="m-0 mb-[1.1em] last:mb-0"
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
// LETTER TABLET
// ============================================================================

function LetterTablet({ letter }) {
  const categoryLabel =
    getCategoryLabel(letter.slot_key);

  return (
    <div
      className="
        absolute
        left-1/2
        top-[12%]
        z-40
        -translate-x-1/2
      "
      style={{
        width: "51%",
        height: "76%",
      }}
    >

      {/* ==============================================================
          STONE
          ============================================================== */}

      <img
        src={caveStone}
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
        style={{
          filter:
            "drop-shadow(0 10px 15px rgba(38,22,12,0.35))",
        }}
      />


      {/* ==============================================================
          LETTER CONTENT
          ============================================================== */}

      <div
        className="
          absolute
          left-[15%]
          right-[15%]
          top-[13%]
          bottom-[13%]
          overflow-hidden
          flex
          flex-col
          items-center
        "
      >

        {/* CATEGORY */}

        <div
          className="
            uppercase
            tracking-[0.18em]
            text-[#88623E]
            text-center
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


        {/* TITLE */}

        <h1
          className="
            mt-[1.2%]
            mb-0
            max-w-[92%]
            text-center
            font-bold
            leading-[0.95]
            text-[#4A3020]
          "
          style={{
            fontFamily:
              "Cormorant Garamond, Georgia, serif",
            fontSize:
              "clamp(25px, 2.35vw, 48px)",
          }}
        >
          {letter.title}
        </h1>


        {/* HEART */}

        <div
          className="
            mt-[1.2%]
            text-[#9C6843]
          "
          style={{
            fontSize:
              "clamp(10px, 0.9vw, 18px)",
          }}
        >
          ♥
        </div>


        {/* DATE / AGE */}

        <LetterMeta letter={letter} />


        {/* DIVIDER */}

        <div
          className="
            my-[2.2%]
            flex
            items-center
            justify-center
            w-[70%]
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


        {/* LETTER */}

        <div
          className="
            w-full
            flex-1
            overflow-y-auto
            pr-[2%]
          "
        >
          <LetterBody
            content={letter.letter_content}
          />
        </div>


        {/* SIGNATURE */}

        {letter.signature && (
          <div
            className="
              mt-[2.2%]
              w-full
              text-right
              text-[#62432D]
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
        left-[3%]
        bottom-[4%]
        z-20
        pointer-events-none
        select-none
      "
      style={{
        width: "11%",
      }}
    />
  );
}


// ============================================================================
// BACK BUTTON
// ============================================================================

function BackButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        absolute
        left-[4%]
        bottom-[5%]
        z-[100]
        rounded-full
        border
        border-[#C7A16D]
        bg-[#FFF1D3]/90
        px-[1.4%]
        py-[0.7%]
        text-[#64452D]
        font-bold
        shadow-[0_4px_12px_rgba(45,25,12,0.2)]
        transition
        hover:bg-[#FFF7E7]
        hover:-translate-y-[2%]
        active:scale-95
      "
      style={{
        fontFamily:
          "Nunito, Arial, sans-serif",
        fontSize:
          "clamp(8px, 0.65vw, 14px)",
      }}
    >
      ← Back to Letters
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


  // --------------------------------------------------------------------------
  // LOAD LETTER
  // --------------------------------------------------------------------------

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


  // --------------------------------------------------------------------------
  // LOADING
  // --------------------------------------------------------------------------

  if (loading) {
    return <LoadingScreen />;
  }


  // --------------------------------------------------------------------------
  // ERROR
  // --------------------------------------------------------------------------

  if (error || !letter) {
    return (
      <ErrorScreen
        onBack={() => navigate("/letters")}
      />
    );
  }


  // --------------------------------------------------------------------------
  // SCENE
  // --------------------------------------------------------------------------

  return (
    <div
      className="
        fixed
        inset-0
        overflow-hidden
        bg-[#241A13]
      "
    >

      {/* ================================================================
          MASTER 16:9 SCENE
          ================================================================ */}

      <div
        className="
          absolute
          left-1/2
          top-1/2
          -translate-x-1/2
          -translate-y-1/2
          overflow-hidden
        "
        style={{
          width:
            "min(100vw, 177.7777778vh)",
          height:
            "min(100vh, 56.25vw)",
          aspectRatio: "16 / 9",
        }}
      >

        {/* BACKGROUND */}

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
            pointer-events-none
            select-none
          "
        />


        {/* SOFT OVERLAY */}

        <div
          className="
            absolute
            inset-0
            z-10
            pointer-events-none
          "
          style={{
            background:
              "radial-gradient(circle at 50% 47%, rgba(255,235,195,0.08) 0%, rgba(45,28,16,0.08) 45%, rgba(25,15,9,0.16) 100%)",
          }}
        />


        {/* FIRE */}

        <FireDecoration />


        {/* LETTER */}

        <LetterTablet
          letter={letter}
        />


        {/* BACK */}

        <BackButton
          onClick={() => navigate("/letters")}
        />


        {/* TOP LABEL */}

        <div
          className="
            absolute
            left-1/2
            top-[4%]
            z-[100]
            -translate-x-1/2
            text-center
            pointer-events-none
          "
        >

          <div
            className="
              uppercase
              tracking-[0.25em]
              text-[#F1D5A3]
              drop-shadow-[0_2px_3px_rgba(30,17,9,0.5)]
            "
            style={{
              fontFamily:
                "Nunito, Arial, sans-serif",
              fontSize:
                "clamp(7px, 0.55vw, 12px)",
            }}
          >
            A treasured memory
          </div>

          <div
            className="
              mt-[0.3vw]
              text-[#FFF1CE]
              font-bold
              drop-shadow-[0_3px_3px_rgba(30,17,9,0.45)]
            "
            style={{
              fontFamily:
                "Cormorant Garamond, Georgia, serif",
              fontSize:
                "clamp(18px, 1.6vw, 32px)",
            }}
          >
            Written with love
          </div>

        </div>


        {/* BOTTOM RIGHT */}

        <div
          className="
            absolute
            right-[4%]
            bottom-[5%]
            z-[100]
            pointer-events-none
            text-right
          "
        >

          <div
            className="
              text-[#F0D4A0]
              tracking-[0.12em]
              uppercase
              drop-shadow-[0_2px_3px_rgba(30,17,9,0.45)]
            "
            style={{
              fontFamily:
                "Nunito, Arial, sans-serif",
              fontSize:
                "clamp(7px, 0.52vw, 12px)",
            }}
          >
            Cherish forever
          </div>

          <div
            className="
              mt-[0.25vw]
              text-[#FFE8B9]
              font-bold
            "
            style={{
              fontFamily:
                "Cormorant Garamond, Georgia, serif",
              fontSize:
                "clamp(12px, 1vw, 20px)",
            }}
          >
            ♥
          </div>

        </div>

      </div>

    </div>
  );
}