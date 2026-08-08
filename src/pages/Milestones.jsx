import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import TimelineDrawer from "../components/timeline/TimelineDrawer";

import { getMilestones } from "../services/milestoneService";
import mapMilestone from "../utils/mapMilestone";

import background from "../assets/illustrations/animals/background.png";
import milestoneSignpost from "../assets/illustrations/animals/milestone-signpost.png";

import parrot from "../assets/illustrations/animals/parrot.png";
import bluebird from "../assets/illustrations/animals/bluebird.png";
import deer1 from "../assets/illustrations/animals/deer-1.png";
import monkey from "../assets/illustrations/animals/moneky.png";
import hedgehog from "../assets/illustrations/animals/hedgehog.png";
import turtle from "../assets/illustrations/animals/turtle.png";
import butterfly from "../assets/illustrations/animals/butterfly.png";

import lion1 from "../assets/illustrations/animals/lion/1.png";
import lion2 from "../assets/illustrations/animals/lion/2.png";
import lion3 from "../assets/illustrations/animals/lion/3.png";
import lion4 from "../assets/illustrations/animals/lion/4.png";
import lion5 from "../assets/illustrations/animals/lion/5.png";
import lion6 from "../assets/illustrations/animals/lion/6.png";
import lion7 from "../assets/illustrations/animals/lion/7.png";
import lion8 from "../assets/illustrations/animals/lion/8.png";

import squirrel from "../assets/illustrations/animals/squirrel.png";
import deer2 from "../assets/illustrations/animals/deer-2.png";
import owl from "../assets/illustrations/animals/owl.png";

import elephant1 from "../assets/illustrations/animals/elephant/1.png";
import elephant2 from "../assets/illustrations/animals/elephant/2.png";
import elephant3 from "../assets/illustrations/animals/elephant/3.png";
import elephant4 from "../assets/illustrations/animals/elephant/4.png";
import elephant5 from "../assets/illustrations/animals/elephant/5.png";
import elephant6 from "../assets/illustrations/animals/elephant/6.png";
import elephant7 from "../assets/illustrations/animals/elephant/7.png";
import elephant8 from "../assets/illustrations/animals/elephant/8.png";

import giraffe from "../assets/illustrations/animals/giraffe.png";
import vine from "../assets/illustrations/animals/vine.png";

const DESIGN_WIDTH = 1440;
const DESIGN_HEIGHT = 900;

/*
  All coordinates belong to the same 1440 × 900 design space.
*/

/*
  LION ANIMATION
  1 = calm
  2 = preparation
  3 = mouth opening
  4 = active roar
  5 = peak roar
  6 = roar ending
  7 = returning to idle
  8 = calm
*/
const LION_FRAMES = [
  lion1,
  lion2,
  lion3,
  lion4,
  lion5,
  lion6,
  lion7,
  lion8,
];

const LION_FRAME_DURATIONS = [
  2500,
  250,
  250,
  250,
  400,
  250,
  250,
  2500,
];

/*
  ELEPHANT ANIMATION
  1 = normal idle
  2 = beginning to look down
  3 = looking down
  4 = beginning to raise head + trunk
  5 = head up + trunk raised
  6 = holding raised trunk
  7 = returning downward
  8 = normal idle
*/
const ELEPHANT_FRAMES = [
  elephant1,
  elephant2,
  elephant3,
  elephant4,
  elephant5,
  elephant6,
  elephant7,
  elephant8,
];

const ELEPHANT_FRAME_DURATIONS = [
  2500,
  350,
  550,
  350,
  650,
  500,
  400,
  2500,
];

const ANIMALS = [
  {
    id: "parrot",
    src: parrot,
    left: 1075,
    top: 550,
    width: 145,
    zIndex: 25,
    rotate: -4,
  },
  {
    id: "bluebird",
    src: bluebird,
    left: 470,
    top: 182,
    width: 92,
    zIndex: 20,
    rotate: -2,
  },
  {
    id: "butterfly",
    src: butterfly,
    left: 800,
    top: 690,
    width: 58,
    zIndex: 19,
    rotate: 8,
  },
  {
    id: "butterfly",
    src: butterfly,
    left: 740,
    top: 745,
    width: 58,
    zIndex: 19,
    rotate: 8,
  },
  {
    id: "owl",
    src: owl,
    left: 1055,
    top: 700,
    width: 88,
    zIndex: 19,
    rotate: 1,
    flip: true,
  },
  {
    id: "monkey",
    src: monkey,
    left: 1100,
    top: 90,
    width: 165,
    zIndex: 12,
    rotate: 5,
  },
  {
    id: "vine",
    src: vine,
    left: 1110,
    top: -15,
    width: 205,
    zIndex: 100,
    rotate: 100,
  },
  {
    id: "deer",
    src: deer1,
    left: 170,
    top: 646,
    width: 195,
    zIndex: 100,
    rotate: 0,
    flip: true,
  },
  {
    id: "giraffe",
    src: giraffe,
    left: 1000,
    top: 150,
    width: 205,
    zIndex: 20,
    rotate: 1,
  },
  {
    id: "lion",
    src: lion1,
    left: 590,
    top: 490,
    width: 200,
    zIndex: 24,
    rotate: -2,
    flip: true,
  },
  {
    id: "elephant",
    src: elephant1,
    left: 895,
    top: 400,
    width: 175,
    zIndex: 23,
    rotate: 2,
  },
  {
    id: "squirrel",
    src: squirrel,
    left: 1170,
    top: 410,
    width: 118,
    zIndex: 50,
    rotate: -4,
  },
  {
    id: "hedgehog",
    src: hedgehog,
    left: 510,
    top: 695,
    width: 125,
    zIndex: 25,
    rotate: 2,
    flip: true,
  },
  {
    id: "turtle",
    src: turtle,
    left: 620,
    top: 630,
    width: 125,
    zIndex: 25,
    rotate: -2,
  },
  {
    id: "deer2",
    src: deer2,
    left: 280,
    top: 705,
    width: 105,
    zIndex: 100,
    rotate: 3,
    flip: true,
  },
];

/*
  Ten fixed visual signpost positions.

  The positions are visual only.
  The actual memory/title comes from Admin.
*/
const SIGNPOST_ANCHORS = [
  { left: 110, top: 850, rotation: -2, scale: 1.0 },
  { left: 515, top: 855, rotation: 2, scale: 0.98 },
  { left: 315, top: 752, rotation: -2, scale: 0.96 },
  { left: 850, top: 690, rotation: 2, scale: 0.84 },
  { left: 600, top: 625, rotation: -1, scale: 0.82 },
  { left: 1100, top: 550, rotation: 2, scale: 0.75 },
  { left: 835, top: 480, rotation: -2, scale: 0.68 },
  { left: 975, top: 425, rotation: 2, scale: 0.58 },
  { left: 1145, top: 410, rotation: -1, scale: 0.64 },
  { left: 1005, top: 320, rotation: 2, scale: 0.58 },
];

function AnimalLayer({
  animal,
  lionFrame,
  elephantFrame,
}) {
  let src = animal.src;

  if (animal.id === "lion") {
    src = LION_FRAMES[lionFrame];
  }

  if (animal.id === "elephant") {
    src = ELEPHANT_FRAMES[elephantFrame];
  }

  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      draggable={false}
      className="absolute pointer-events-none select-none"
      style={{
        left: animal.left,
        top: animal.top,
        width: animal.width,
        height: "auto",
        zIndex: animal.zIndex,
        transform: `${animal.flip ? "scaleX(-1) " : ""}rotate(${animal.rotate}deg)`,
      }}
    />
  );
}

/*
  Rustic PNG signpost.

  The PNG provides:
  - weathered wood
  - rustic board
  - wooden post
  - rusty details
  - watercolor texture

  The title remains HTML so Admin continues to control it.
*/
function MilestoneSignpost({ milestone, anchor, index }) {
  const signpostWidth = 260;
  const signpostHeight = 260;

  const content = (
    <>
      <img
        src={milestoneSignpost}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="
          absolute
          inset-0
          h-full
          w-full
          object-contain
          pointer-events-none
          select-none
        "
      />

      {milestone && (
        <>
          <div
            className="
              absolute
              left-[55px]
              top-[57px]
              flex
              w-[145px]
              items-center
              justify-center
              text-center
              pointer-events-none
            "
          >
            <h2
              className="
                max-w-[145px]
                text-[22px]
                leading-[1.05]
                font-bold
                text-[#5B3F2C]
                drop-shadow-[0_1px_0_rgba(255,243,211,0.75)]
              "
              style={{
                fontFamily: "Cormorant Garamond, serif",
              }}
            >
              {milestone.title}
            </h2>
          </div>

          <span
            className="
              absolute
              left-1/2
              top-[210px]
              -translate-x-1/2
              whitespace-nowrap
              rounded-full
              bg-[#F2D8A7]/95
              border
              border-[#765034]
              px-3
              py-1
              text-[10px]
              font-bold
              uppercase
              tracking-[0.16em]
              text-[#5D4734]
              opacity-0
              shadow-[0_4px_9px_rgba(72,51,30,0.22)]
              transition-all
              duration-300
              group-hover:opacity-100
              group-hover:-translate-y-1
            "
          >
            Open memory
          </span>
        </>
      )}
    </>
  );

  const sharedStyle = {
    left: anchor.left,
    top: anchor.top,
    zIndex: 40 + index,
    width: signpostWidth,
    height: signpostHeight,
    transform: `
      translate(-50%, -100%)
      rotate(${anchor.rotation}deg)
      scale(${anchor.scale || 1})
    `,
    transformOrigin: "50% 100%",
  };

  if (!milestone) {
    return (
      <div
        aria-hidden="true"
        className="
          absolute
          pointer-events-none
          select-none
        "
        style={sharedStyle}
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      to={`/milestone/${milestone.slug}`}
      aria-label={`Open milestone: ${milestone.title}`}
      className="
        absolute
        block
        group
        cursor-pointer
        select-none
      "
      style={sharedStyle}
    >
      {content}
    </Link>
  );
}

export default function Milestones() {
  const navigate = useNavigate();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sceneScale, setSceneScale] = useState(1);

  /*
    Browser zoom compensation for fixed UI controls.

    The illustrated scene intentionally uses sceneScale.
    The Back/Menu controls are outside that scene, so they need
    their own compensation based on Chrome's devicePixelRatio.

    We capture the DPR when the page first loads as the baseline.
    If Chrome zoom changes from that baseline, the controls are
    scaled and positioned by the inverse zoom factor.
  */
  const [browserZoom, setBrowserZoom] = useState(1);

  const [lionFrame, setLionFrame] = useState(0);
  const [elephantFrame, setElephantFrame] = useState(0);

  /*
    Load milestones from the existing Admin/data system.
  */
  useEffect(() => {
    let mounted = true;

    async function loadMilestones() {
      try {
        const data = await getMilestones();

        if (!mounted) return;

        const published = (data || [])
          .filter((item) => item.published)
          .map(mapMilestone);

        setMilestones(published);
      } catch (err) {
        console.error("Unable to load milestones:", err);

        if (mounted) {
          setMilestones([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadMilestones();

    return () => {
      mounted = false;
    };
  }, []);

  /*
    LION ANIMATION

    The lion animation remains exactly as previously implemented.
  */
  useEffect(() => {
    let timeoutId;

    const scheduleNextFrame = (currentFrame) => {
      timeoutId = window.setTimeout(() => {
        const nextFrame =
          (currentFrame + 1) % LION_FRAMES.length;

        setLionFrame(nextFrame);
        scheduleNextFrame(nextFrame);
      }, LION_FRAME_DURATIONS[currentFrame]);
    };

    setLionFrame(0);
    scheduleNextFrame(0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  /*
    ELEPHANT ANIMATION

    Normal idle
      ↓
    look down
      ↓
    look down
      ↓
    raise head + trunk
      ↓
    trunk fully raised
      ↓
    brief hold
      ↓
    return
      ↓
    normal idle
      ↓
    repeat
  */
  useEffect(() => {
    let timeoutId;

    const scheduleNextFrame = (currentFrame) => {
      timeoutId = window.setTimeout(() => {
        const nextFrame =
          (currentFrame + 1) % ELEPHANT_FRAMES.length;

        setElephantFrame(nextFrame);
        scheduleNextFrame(nextFrame);
      }, ELEPHANT_FRAME_DURATIONS[currentFrame]);
    };

    setElephantFrame(0);
    scheduleNextFrame(0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  /*
    Fill the viewport with the complete illustrated stage.

    The 1440 × 900 design space remains the single coordinate system.
  */
  useEffect(() => {
    const updateScale = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const nextScale = Math.max(
        viewportWidth / DESIGN_WIDTH,
        viewportHeight / DESIGN_HEIGHT
      );

      setSceneScale(Math.max(nextScale, 0.35));
    };

    updateScale();

    window.addEventListener("resize", updateScale);

    return () => {
      window.removeEventListener("resize", updateScale);
    };
  }, []);

  /*
    Detect Chrome page-zoom changes.

    We compare the current devicePixelRatio with the value that
    existed when this page loaded. This means 150% -> 250% becomes
    approximately 1.6667, and the controls use its inverse.
  */
  useEffect(() => {
    const initialDpr = window.devicePixelRatio || 1;

    const updateBrowserZoom = () => {
      const currentDpr = window.devicePixelRatio || initialDpr;
      const nextZoom = currentDpr / initialDpr;

      setBrowserZoom(nextZoom);
    };

    updateBrowserZoom();

    window.addEventListener("resize", updateBrowserZoom);

    const mediaQuery = window.matchMedia(
      `(resolution: ${window.devicePixelRatio}dppx)`
    );

    const handleResolutionChange = () => {
      updateBrowserZoom();

      mediaQuery.removeEventListener("change", handleResolutionChange);

      const nextMediaQuery = window.matchMedia(
        `(resolution: ${window.devicePixelRatio}dppx)`
      );

      nextMediaQuery.addEventListener("change", handleResolutionChange);
    };

    mediaQuery.addEventListener("change", handleResolutionChange);

    return () => {
      window.removeEventListener("resize", updateBrowserZoom);
      mediaQuery.removeEventListener("change", handleResolutionChange);
    };
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  /*
    Every visual signpost exists independently.

    If there are fewer memories than slots:
    blank signposts remain visible.

    If there are more memories later:
    additional memories can be handled separately without changing
    the existing Admin/data structure.
  */
  const positionedSignposts = useMemo(() => {
    return SIGNPOST_ANCHORS.map((anchor, index) => ({
      anchor,
      milestone: milestones[index] || null,
    }));
  }, [milestones]);

  const scaledWidth = DESIGN_WIDTH * sceneScale;
  const scaledHeight = DESIGN_HEIGHT * sceneScale;

  return (
    <main
      className="
        fixed
        inset-0
        overflow-hidden
        bg-[#E8D8B8]
        select-none
      "
    >
      <div
        className="absolute"
        style={{
          width: DESIGN_WIDTH,
          height: DESIGN_HEIGHT,
          left: `calc(50% - ${scaledWidth / 2}px)`,
          top: `calc(50% - ${scaledHeight / 2}px)`,
          transform: `scale(${sceneScale})`,
          transformOrigin: "top left",
        }}
      >
        {/* =====================================================
            BACKGROUND
        ===================================================== */}

        <img
          src={background}
          alt=""
          draggable={false}
          className="
            absolute
            inset-0
            h-full
            w-full
            object-fill
            pointer-events-none
          "
          style={{
            zIndex: 0,
          }}
        />

        {/* Gentle watercolor integration veil */}

        <div
          className="
            absolute
            inset-0
            pointer-events-none
            bg-gradient-to-b
            from-[#FFF8E8]/12
            via-transparent
            to-[#6F5A38]/10
          "
          style={{
            zIndex: 1,
          }}
        />

        {/* =====================================================
            INDEPENDENT ANIMAL LAYERS
        ===================================================== */}

        {ANIMALS.map((animal, index) => (
          <AnimalLayer
            key={`${animal.id}-${index}`}
            animal={animal}
            lionFrame={lionFrame}
            elephantFrame={elephantFrame}
          />
        ))}

        {/* =====================================================
            10 MILESTONE SIGNPOSTS
        ===================================================== */}

        {positionedSignposts.map(({ milestone, anchor }, index) => (
          <MilestoneSignpost
            key={`signpost-${index}`}
            milestone={milestone}
            anchor={anchor}
            index={index}
          />
        ))}

        {/* =====================================================
            LOADING STATE
        ===================================================== */}

        {loading && (
          <div
            className="
              absolute
              inset-0
              z-[100]
              flex
              items-center
              justify-center
              bg-[#F8EBCF]/25
            "
          >
            <div
              className="
                rounded-[28px]
                border
                border-[#E4C997]
                bg-[#FFF8E8]/90
                px-10
                py-7
                text-center
                shadow-[0_12px_35px_rgba(72,51,30,0.20)]
              "
            >
              <p
                className="
                  text-[12px]
                  font-bold
                  uppercase
                  tracking-[0.22em]
                  text-[#80603F]
                "
                style={{
                  fontFamily: "Nunito, sans-serif",
                }}
              >
                Growing With Azain
              </p>

              <p
                className="
                  mt-2
                  text-[28px]
                  font-bold
                  text-[#5D4734]
                "
                style={{
                  fontFamily: "Cormorant Garamond, serif",
                }}
              >
                Opening the memory path…
              </p>
            </div>
          </div>
        )}

        {/* =====================================================
            EMPTY STATE
        ===================================================== */}

        {!loading && milestones.length === 0 && (
          <div
            className="
              absolute
              left-1/2
              top-[455px]
              z-[70]
              -translate-x-1/2
              -translate-y-1/2
              rounded-[30px]
              border
              border-[#E4C997]
              bg-[#FFF8E8]/90
              px-12
              py-8
              text-center
              shadow-[0_14px_38px_rgba(72,51,30,0.20)]
            "
          >
            <p
              className="
                text-[30px]
                font-bold
                text-[#5D4734]
              "
              style={{
                fontFamily: "Cormorant Garamond, serif",
              }}
            >
              The journey is waiting for its first memory.
            </p>

            <p
              className="
                mt-2
                text-sm
                text-[#806A53]
              "
              style={{
                fontFamily: "Nunito, sans-serif",
              }}
            >
              Published milestones added through Admin will appear here.
            </p>
          </div>
        )}

        {/* =====================================================
            FOOTER HINT
        ===================================================== */}

        <div
          className="
            absolute
            bottom-[22px]
            left-1/2
            z-[60]
            -translate-x-1/2
            rounded-full
            bg-[#FFF8E8]/70
            px-5
            py-2
            text-[10px]
            font-bold
            uppercase
            tracking-[0.2em]
            text-[#806A53]
            shadow-sm
            pointer-events-none
          "
          style={{
            fontFamily: "Nunito, sans-serif",
          }}
        >
          Tap a signpost to open the memory
        </div>
      </div>

      {/* =====================================================
          FIXED PAGE HEADER

          Kept outside the transformed 1440 × 900 scene so the
          title is always visible and follows the same browser-zoom
          compensation as the Back/Menu controls.
      ===================================================== */}

      <div
        className="fixed pointer-events-none"
        style={{
          top: 70 / browserZoom,
          left: "50%",
          width: 600 / browserZoom,
          zIndex: 1000,
          transform: `translateX(-50%) scale(${1 / browserZoom})`,
          transformOrigin: "top center",
          textAlign: "center",
        }}
      >
        <p
          className="
            text-[11px]
            font-bold
            uppercase
            tracking-[0.32em]
            text-[#6D684B]
          "
          style={{
            fontFamily: "Nunito, sans-serif",
          }}
        >
          A little journey
        </p>

        <h1
          className="
            mt-[-2px]
            text-[48px]
            leading-none
            font-bold
            text-[#5D4734]
            drop-shadow-[0_2px_0_rgba(255,248,226,0.65)]
          "
          style={{
            fontFamily: "Cormorant Garamond, serif",
          }}
        >
          Our Milestones
        </h1>
      </div>

      {/* =====================================================
          FIXED BRAND PILL
      ===================================================== */}

      <div
        className="fixed pointer-events-none"
        style={{
          top: 75 / browserZoom,
          left: 75 / browserZoom,
          zIndex: 1000,
          transform: `scale(${1 / browserZoom})`,
          transformOrigin: "top left",
        }}
      >
        <div
          className="
            rounded-full
            border
            border-[#F7E8C6]/80
            bg-[#FFF8E8]/75
            px-5
            py-2
            shadow-[0_4px_14px_rgba(76,55,32,0.14)]
            backdrop-blur-[2px]
          "
        >
          <span
            className="
              text-[11px]
              font-bold
              uppercase
              tracking-[0.24em]
              text-[#76583B]
            "
            style={{
              fontFamily: "Nunito, sans-serif",
            }}
          >
            Growing With Azain
          </span>
        </div>
      </div>

      {/* =====================================================
          EXISTING NAVIGATION DRAWER
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
          top: 24 / browserZoom,
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
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-full
            border-[2px]
            border-[#765034]
            bg-[#EED19D]
            text-[23px]
            font-semibold
            text-[#5D4734]
            shadow-[0_5px_12px_rgba(82,55,30,0.28)]
            transition-all
            duration-200
            hover:scale-105
            hover:bg-[#F3DDAF]
            active:scale-95
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
          top: 24 / browserZoom,
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
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-full
            border-[2px]
            border-[#765034]
            bg-[#EED19D]
            text-[21px]
            font-semibold
            text-[#5D4734]
            shadow-[0_5px_12px_rgba(82,55,30,0.28)]
            transition-all
            duration-200
            hover:scale-105
            hover:bg-[#F3DDAF]
            active:scale-95
          "
        >
          ☰
        </button>
      </div>
</main>
  );
}