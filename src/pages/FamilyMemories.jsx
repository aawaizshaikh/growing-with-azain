import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import Navbar from "../components/Navbar";

import familyMembers from "../data/familyMembers";

import suitcaseImage from "../assets/illustrations/people/family-suitcase-main.webp";
import titlePlaque from "../assets/illustrations/people/memory-title-plaque.webp";
import luggageTag from "../assets/illustrations/people/memory-luggage-tag.webp";
import travelStickers from "../assets/illustrations/people/memory-travel-stickers.webp";
import desktopBackground from "../assets/illustrations/people/memory-suitcase-desktop-bg.webp";

/*
===============================================================================
FAMILY MEMORIES — MAIN PAGE
===============================================================================

Route:

    /family

This page is ONLY the family-member selection page.

It does NOT load memories from Supabase.

Family member identity comes exclusively from:

    src/data/familyMembers.js

The 10 family members are hardcoded.

===============================================================================

MASTER SCENE ARCHITECTURE
===============================================================================

The entire page is built on a fixed 1920 × 1080 master scene.

The background is an ACTUAL IMAGE ELEMENT.

Every other visual element is positioned against the same master scene:

    background
    title
    suitcase
    stickers
    luggage tag
    family portraits
    name plaques
    decorative elements

Nothing is positioned relative to the browser viewport.

Nothing is positioned relative to the suitcase.

The complete scene scales uniformly to the viewport.

===============================================================================
*/

const SCENE_WIDTH = 1920;
const SCENE_HEIGHT = 1080;

/*
===============================================================================
MASTER SCENE LAYOUT
===============================================================================

All positions are percentages of the 1920 × 1080 master scene.

===============================================================================
*/

const SCENE_LAYOUT = {
  title: {
    left: "32.5%",
    top: "18.5%",
    width: "35%",
  },

  suitcase: {
    left: "0%",
    top: "0%",
    width: "115%",
  },

  stickers: {
    left: "32.5%",
    top: "14%",
    width: "10%",
     zIndex: 50,
  },

  luggageTag: {
    right: "12%",
    top: "79%",
    width: "10%",
  },
};

/*
===============================================================================
FAMILY PORTRAIT POSITIONS
===============================================================================

IMPORTANT:

These positions are relative to the MASTER SCENE.

They are NOT relative to the suitcase.

Each member can therefore be adjusted independently without changing
the coordinate system of the rest of the artwork.

===============================================================================
*/

const portraitPositions = [
  {
    key: "dada",
    left: "30.2%",
    top: "57.3%",
    size: "8.2%",
  },

  {
    key: "dadi",
    left: "38.05%",
    top: "57.12%",
    size: "8.44%",
  },

  {
    key: "nana",
    left: "29.32%",
    top: "73.12%",
    size: "8.64%",
  },

  {
    key: "nani",
    left: "37.59%",
    top: "73.62%",
    size: "8.64%",
  },

  {
    key: "mumma",
    left: "53.78%",
    top: "73.59%",
    size: "8.54%",
  },

  {
    key: "papa",
    left: "53.55%",
    top: "57.29%",
    size: "8.44%",
  },

  {
    key: "chachu",
    left: "45.72%",
    top: "57.62%",
    size: "8.24%",
  },

  {
    key: "mamu",
    left: "45.59%",
    top: "73.19%",
    size: "8.64%",
  },

  {
    key: "yaaya",
    left: "62.05%",
    top: "73.60%",
    size: "8.64%",
  },

  {
    key: "ansha",
    left: "61.52%",
    top: "57.20%",
    size: "8.44%",
  },
];

/*
===============================================================================
FAMILY PORTRAIT COMPONENT
===============================================================================

Each portrait:

    - uses the hardcoded local family photo
    - is positioned inside the master scene
    - links to /family/:memberKey
    - has a small hover interaction
    - has a name plaque
===============================================================================
*/

function FamilyPortrait({
  member,
  position,
  index,
}) {
  if (!member || !position) {
    return null;
  }

  return (
    <Link
      to={`/family/${member.key}`}
      aria-label={`Open ${member.name}'s memories`}
      className="
        absolute
        block
        cursor-pointer
        select-none
      "
      style={{
        left: position.left,
        top: position.top,
        width: position.size,
        aspectRatio: "1 / 1",
        zIndex: 30,
      }}
    >
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.82,
          y: 12,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        transition={{
          duration: 0.55,
          delay: 0.12 + index * 0.055,
          ease: [0.22, 1, 0.36, 1],
        }}
        whileHover={{
          scale: 1.075,
          y: -4,
        }}
        whileTap={{
          scale: 0.96,
        }}
        className="
          relative
          w-full
          h-full
          rounded-full
        "
      >
        {/*
        =======================================================================
        REAL FAMILY PHOTO
        =======================================================================
        */}

        <div
          className="
            absolute
            inset-[9%]
            overflow-hidden
            rounded-full
          "
          style={{
            background:
              "linear-gradient(145deg, #f4e5c7, #c99552)",

            boxShadow:
              "inset 0 0 0 2px rgba(255,255,255,0.35)",
          }}
        >
          <img
            src={member.photo}
            alt={member.name}
            draggable={false}
            className="
              block
              w-full
              h-full
              object-cover
              object-center
              select-none
            "
          />

          {/*
          Warm vintage treatment to integrate the local portrait
          with the suitcase artwork.
          */}

          <div
            className="
              absolute
              inset-0
              pointer-events-none
            "
            style={{
              background:
                "linear-gradient(145deg, rgba(255,220,160,0.10), rgba(107,66,31,0.10))",

              mixBlendMode: "soft-light",
            }}
          />
        </div>

        {/*
        =======================================================================
        PORTRAIT HIGHLIGHT
        =======================================================================
        */}

        <div
          className="
            absolute
            inset-[4%]
            rounded-full
            pointer-events-none
          "
          style={{
            border:
              "1px solid rgba(255,244,210,0.55)",

            boxShadow:
              "inset 0 1px 4px rgba(255,255,255,0.45)",
          }}
        />

        {/*
        =======================================================================
        NAME PLAQUE
        =======================================================================
        */}

        <div
          className="
            absolute
            left-1/2
            top-[89%]
            -translate-x-1/2
            w-[50%]
            pointer-events-none
          "
        >
          <div className="relative w-full">
            <img
              src={titlePlaque}
              alt=""
              draggable={false}
              className="
                block
                w-full
                h-auto
                select-none
              "
            />

            <span
              className="
                absolute
                inset-0
                flex
                items-center
                justify-center
                pb-[1%]
                px-3
                text-center
                whitespace-nowrap
              "
              style={{
                fontFamily: "Baloo 2",
                fontSize: "clamp(10px, 1.15vw, 18px)",
                fontWeight: 700,
                color: "#5B3920",
                textShadow:
                  "0 1px 0 rgba(255,255,255,0.35)",
              }}
            >
              {member.name}
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

/*
===============================================================================
MAIN FAMILY MEMORIES PAGE
===============================================================================
*/

export default function FamilyMemories() {
  /*
  ============================================================================
  MATCH HARDCODED FAMILY MEMBERS TO MASTER-SCENE POSITIONS
  ============================================================================
  */

  const positionedMembers = useMemo(() => {
    return portraitPositions
      .map((position) => {
        const member = familyMembers.find(
          (item) => item.key === position.key
        );

        return {
          member,
          position,
        };
      })
      .filter((item) => item.member);
  }, []);

  /*
  ============================================================================
  VIEWPORT
  ============================================================================

  The viewport is used ONLY to calculate the uniform scale of the complete
  master scene.

  It is NOT used to calculate the positions of individual artwork elements.
  ============================================================================
  */

  const [viewport, setViewport] = useState({
    width:
      typeof window !== "undefined"
        ? window.innerWidth
        : SCENE_WIDTH,

    height:
      typeof window !== "undefined"
        ? window.innerHeight
        : SCENE_HEIGHT,
  });

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
  ============================================================================
  LOCK PAGE SCROLL
  ============================================================================

  This is a full-screen illustrated scene.

  The page itself should not scroll while this scene is active.
  ============================================================================
  */

  useEffect(() => {
    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, []);

  /*
  ============================================================================
  UNIFORM MASTER-SCENE SCALE
  ============================================================================

  The complete 1920 × 1080 scene covers the viewport.

  All artwork inside the scene scales together.
  ============================================================================
  */

  const sceneScale = Math.max(
    viewport.width / SCENE_WIDTH,
    viewport.height / SCENE_HEIGHT
  );

  return (
    <main
      className="
        fixed
        inset-0
        overflow-hidden
        select-none
      "
      style={{
        backgroundColor: "#24180F",
      }}
    >
      {/*
      ==========================================================================
      MASTER SCENE
      ==========================================================================

      This is the ONLY positioning coordinate system for the artwork.

      Everything inside this container uses percentages relative to:

          1920 × 1080

      ==========================================================================
      */}

      <div
        className="
          absolute
          overflow-visible
        "
        style={{
          width: `${SCENE_WIDTH}px`,
          height: `${SCENE_HEIGHT}px`,
          left: "50%",
          top: "50%",

          transform:
            `translate(-50%, -50%) scale(${sceneScale})`,

          transformOrigin:
            "center center",
        }}
      >
        {/*
        ========================================================================
        MASTER BACKGROUND IMAGE
        ========================================================================

        IMPORTANT:

        This is intentionally an <img>.

        It is NOT:

            background-image
            background-size: cover
            background-position: center

        The background artwork defines the master scene.
        ========================================================================
        */}

        <img
          src={desktopBackground}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="
            absolute
            inset-0
            block
            w-full
            h-full
            object-fill
            pointer-events-none
            select-none
          "
          style={{
            zIndex: 0,
          }}
        />

        {/*
        ========================================================================
        VERY LIGHT MASTER-SCENE OVERLAY
        ========================================================================
        */}

        <div
          className="
            absolute
            inset-0
            pointer-events-none
          "
          style={{
            background:
              "linear-gradient(180deg, rgba(24,16,10,0.08), rgba(24,16,10,0.20))",

            zIndex: 1,
          }}
        />

        {/*
        ========================================================================
        TITLE PLAQUE
        ========================================================================
        */}

        <motion.div
          initial={{
            opacity: 0,
            y: -18,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.65,
          }}
          className="
            absolute
            z-20
          "
          style={{
            left: SCENE_LAYOUT.title.left,
            top: SCENE_LAYOUT.title.top,
            width: SCENE_LAYOUT.title.width,
          }}
        >
          <div className="relative w-full">
            <img
              src={titlePlaque}
              alt=""
              draggable={false}
              className="
                block
                w-full
                h-auto
                select-none
              "
            />

            <div
              className="
                absolute
                inset-0
                flex
                flex-col
                items-center
                justify-center
                text-center
              "
            >
              <h1
                className="
                  leading-none
                  font-bold
                "
                style={{
                  fontFamily: "Baloo 2",
                  fontSize: "64px",
                  color: "#56361F",
                }}
              >
                My People
              </h1>

              <p
                className="mt-2"
                style={{
                  fontFamily: "Nunito",
                  fontSize: "20px",
                  color: "#795737",
                }}
              >
                The ones who make my world special
              </p>
            </div>
          </div>
        </motion.div>

        {/*
        ========================================================================
        TRAVEL STICKERS
        ========================================================================
        */}

        <motion.img
          src={travelStickers}
          alt=""
          aria-hidden="true"
          draggable={false}
          initial={{
            opacity: 0,
            scale: 0.94,
          }}
          animate={{
            opacity: 0.72,
            scale: 1,
          }}
          transition={{
            duration: 0.8,
            delay: 0.2,
          }}
          className="
            absolute
            object-contain
            pointer-events-none
            select-none
          "
          style={{
            left: SCENE_LAYOUT.stickers.left,
            top: SCENE_LAYOUT.stickers.top,
            width: SCENE_LAYOUT.stickers.width,
            zIndex: SCENE_LAYOUT.stickers.zIndex,
          }}
        />

        {/*
        ========================================================================
        LUGGAGE TAG
        ========================================================================
        */}

        <motion.img
          src={luggageTag}
          alt=""
          aria-hidden="true"
          draggable={false}
          initial={{
            opacity: 0,
            rotate: 8,
          }}
          animate={{
            opacity: 1,
            rotate: 5,
          }}
          transition={{
            duration: 0.7,
            delay: 0.45,
          }}
          className="
            absolute
            object-contain
            pointer-events-none
            select-none
          "
          style={{
            right: SCENE_LAYOUT.luggageTag.right,
            top: SCENE_LAYOUT.luggageTag.top,
            width: SCENE_LAYOUT.luggageTag.width,
            zIndex: 50,
          }}
        />

        {/*
        ========================================================================
        SUITCASE
        ========================================================================

        IMPORTANT:

        The suitcase is an independent artwork element.

        It is NOT the positioning parent of the portraits.

        The portraits below are direct children of the master scene.
        ========================================================================
        */}

        <motion.img
          src={suitcaseImage}
          alt="Memory suitcase containing family members"
          draggable={false}
          initial={{
            opacity: 0,
            y: 22,
            scale: 0.985,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          transition={{
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="
            absolute
            object-contain
            pointer-events-none
            select-none
          "
          style={{
            left: SCENE_LAYOUT.suitcase.left,
            top: SCENE_LAYOUT.suitcase.top,
            width: SCENE_LAYOUT.suitcase.width,
            height: SCENE_LAYOUT.suitcase.width,
            zIndex: 10,
          }}
        />

        {/*
        ========================================================================
        FAMILY PORTRAITS
        ========================================================================

        These are direct children of the MASTER SCENE.

        Each portrait is independently positioned with:

            left
            top
            size

        All values are percentages of the master scene.
        ========================================================================
        */}

        {positionedMembers.map(
          ({ member, position }, index) => (
            <FamilyPortrait
              key={member.key}
              member={member}
              position={position}
              index={index}
            />
          )
        )}

        {/*
        ========================================================================
        SUBTLE WARM GLOW
        ========================================================================
        */}

        <div
          className="
            absolute
            pointer-events-none
          "
          style={{
            left: "20%",
            top: "39%",
            width: "60%",
            height: "55%",

            background:
              "radial-gradient(circle, rgba(255,214,139,0.045), transparent 68%)",

            zIndex: 40,
          }}
        />
      </div>

      {/*
      ==========================================================================
      EXISTING NAVBAR
      ==========================================================================

      Navbar stays outside the transformed master scene.

      This prevents the navigation from scaling with the artwork.

      We will modify the Navbar itself later to add Family Memories as the
      final navigation item.
      ==========================================================================
      */}

      <Navbar />

      {/*
      ==========================================================================
      HELPER TEXT
      ==========================================================================

      This is outside the master artwork scene so it does not influence
      artwork positioning or scaling.
      ==========================================================================
      */}

      <motion.p
        initial={{
          opacity: 0,
          y: 8,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.6,
          delay: 0.9,
        }}
        className="
          fixed
          left-1/2
          bottom-5
          z-[80]
          -translate-x-1/2
          whitespace-nowrap
          px-6
          text-sm
          sm:text-base
          pointer-events-none
        "
        style={{
          fontFamily: "Nunito",
          color: "#F5E4C4",
          textShadow:
            "0 2px 6px rgba(0,0,0,0.5)",
        }}
      >
        Tap a family member to open our memories together ✨
      </motion.p>
    </main>
  );
}