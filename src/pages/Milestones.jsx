import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import TimelineDrawer from "../components/timeline/TimelineDrawer";

import { getMilestones } from "../services/milestoneService";
import mapMilestone from "../utils/mapMilestone";

import background from "../assets/illustrations/animals/background.webp";
import milestoneSignpost from "../assets/illustrations/animals/milestone-signpost.webp";

import parrot from "../assets/illustrations/animals/parrot.webp";
import bluebird from "../assets/illustrations/animals/bluebird.webp";
import deer1 from "../assets/illustrations/animals/deer-1.webp";
import monkey from "../assets/illustrations/animals/moneky.webp";
import hedgehog from "../assets/illustrations/animals/hedgehog.webp";
import turtle from "../assets/illustrations/animals/turtle.webp";
import butterfly from "../assets/illustrations/animals/butterfly.webp";

import flockBirdUp from "../assets/illustrations/animals/flock-bird-up.webp";
import flockBirdLevel from "../assets/illustrations/animals/flock-bird-level.webp";
import flockBirdDown from "../assets/illustrations/animals/flock-bird-down.webp";
import parrotBlue1 from "../assets/illustrations/animals/parrot-blue-1.webp";
import parrotBlue2 from "../assets/illustrations/animals/parrot-blue-2.webp";
import parrotBlue3 from "../assets/illustrations/animals/parrot-blue-3.webp";
import redButterfly from "../assets/illustrations/animals/red-butterfly.webp";
import yellowbird from "../assets/illustrations/animals/yellow-bird.webp";
import greenbird from "../assets/illustrations/animals/green-bird.webp";
import peacock from "../assets/illustrations/animals/peacock.webp";
import rabbit from "../assets/illustrations/animals/rabbit.webp";

import lion1 from "../assets/illustrations/animals/lion/1.webp";
import lion2 from "../assets/illustrations/animals/lion/2.webp";
import lion3 from "../assets/illustrations/animals/lion/3.webp";
import lion4 from "../assets/illustrations/animals/lion/4.webp";
import lion5 from "../assets/illustrations/animals/lion/5.webp";
import lion6 from "../assets/illustrations/animals/lion/6.webp";
import lion7 from "../assets/illustrations/animals/lion/7.webp";
import lion8 from "../assets/illustrations/animals/lion/8.webp";

import squirrel from "../assets/illustrations/animals/squirrel.webp";
import deer2 from "../assets/illustrations/animals/deer-2.webp";
import owl from "../assets/illustrations/animals/owl.webp";

import elephant1 from "../assets/illustrations/animals/elephant/1.webp";
import elephant2 from "../assets/illustrations/animals/elephant/2.webp";
import elephant3 from "../assets/illustrations/animals/elephant/3.webp";
import elephant4 from "../assets/illustrations/animals/elephant/4.webp";
import elephant5 from "../assets/illustrations/animals/elephant/5.webp";
import elephant6 from "../assets/illustrations/animals/elephant/6.webp";
import elephant7 from "../assets/illustrations/animals/elephant/7.webp";
import elephant8 from "../assets/illustrations/animals/elephant/8.webp";


import redBirddown from "../assets/illustrations/animals/red-bird-down.webp";

import giraffe from "../assets/illustrations/animals/giraffe.webp";
import vine from "../assets/illustrations/animals/vine.webp";

const DESIGN_WIDTH = 1440;
const DESIGN_HEIGHT = 900;

const PARROT_BLUE_FRAMES = [
  parrotBlue1,
  parrotBlue2,
  parrotBlue3,
  parrotBlue2,
];

const PARROT_BLUE_FRAME_DURATION = 250;

/*
  FLYING BIRD FLOCK

  The three PNGs are reused as wing positions:
  - flock-bird-up.png
  - flock-bird-level.png
  - flock-bird-down.png

  The flock itself is a separate layer over the existing 1440 × 900 scene.
  It does not change the background, signposts, animals, or Admin data.

  30 tiny birds travel from outside the left edge to outside the right edge,
  then remain off-screen for 2 seconds before repeating.
*/
const FLOCK_BIRDS = [
  { top: "11.666667%", width: "4.166667%", delay: 0.00, duration: 25.0, opacity: 0.92 },
  { top: "8.333333%", width: "4.166667%", delay: 0.10, duration: 25.0, opacity: 0.92 },
  { top: "14.222222%", width: "4.513889%", delay: 6.50, duration: 25.2, opacity: 0.88 },
  
  
];

function FlyingBirdFlock() {
  return (
    <>
      <style>
        {`
          @keyframes growingWithAzainBirdFlock {
            0% {
              transform: translateX(-190px);
            }
            88.888% {
              transform: translateX(1630px);
            }
            100% {
              transform: translateX(1630px);
            }
          }

          @keyframes growingWithAzainBirdUp {
            0%,
            32.999% {
              opacity: 1;
            }
            33%,
            100% {
              opacity: 0;
            }
          }

          @keyframes growingWithAzainBirdLevel {
            0%,
            32.999% {
              opacity: 0;
            }
            33%,
            65.999% {
              opacity: 1;
            }
            66%,
            100% {
              opacity: 0;
            }
          }

          @keyframes growingWithAzainBirdDown {
            0%,
            65.999% {
              opacity: 0;
            }
            66%,
            100% {
              opacity: 1;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .growing-with-azain-bird {
              animation: none !important;
              opacity: 0 !important;
            }
          }
        `}
      </style>

      <div
        className="absolute inset-0 pointer-events-none overflow-visible"
        style={{
          zIndex: 18,
        }}
        aria-hidden="true"
      >
        {FLOCK_BIRDS.map((bird, index) => {
          const wingCycleOffset = (index % 3) * -0.55;

          return (
            <div
              key={`flock-bird-${index}`}
              className="growing-with-azain-bird absolute"
              style={{
                left: 0,
                top: bird.top,
                width: bird.width,
                height: "auto",
                opacity: bird.opacity,
                animationName: "growingWithAzainBirdFlock",
                animationDuration: `${bird.duration}s`,
                animationTimingFunction: "linear",
                animationIterationCount: "infinite",
                animationDelay: `${bird.delay}s`,
                animationFillMode: "both",
                willChange: "transform",
              }}
            >
              <img
                src={flockBirdLevel}
                alt=""
                draggable={false}
                className="absolute inset-0 w-full h-auto"
                style={{
                  opacity: 0,
                  animation:
                    "growingWithAzainBirdLevel 0.9s steps(1,end) infinite",
                  animationDelay: `${wingCycleOffset}s`,
                }}
              />

              <img
                src={flockBirdDown}
                alt=""
                draggable={false}
                className="absolute inset-0 w-full h-auto"
                style={{
                  opacity: 0,
                  animation:
                    "growingWithAzainBirdDown 0.9s steps(1,end) infinite",
                  animationDelay: `${wingCycleOffset}s`,
                }}
              />

              <img
                src={flockBirdUp}
                alt=""
                draggable={false}
                className="relative block w-full h-auto"
                style={{
                  animation:
                    "growingWithAzainBirdUp 0.9s steps(1,end) infinite",
                  animationDelay: `${wingCycleOffset}s`,
                }}
              />
            </div>
          );
        })}
      </div>
    </>
  );
}
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
    left: "76.652778%",
    top: "61.111111%",
    width: "10.069444%",
    zIndex: 25,
    rotate: -4,
  },
  {
  id: "parrotblue",
  src: parrotBlue1,
  left: "72.486111%",
  top: "72.555556%",
  width: "7.986111%",
  zIndex: 26,
  rotate: 4,
},
{
  id: "red-bird",
  src: redBirddown,
  left: "21.527778%",
  top: "50.444444%",
  width: "6.250000%",
  zIndex: 26,
  rotate: 0,
},
{
  id: "yellow-bird",
  src: yellowbird,
  left: "56.944444%",
  top: "50.000000%",
  width: "5.555556%",
  zIndex: 50,
  rotate: 0,
},
{
  id: "green-bird",
  src: greenbird,
  left: "38.194444%",
  top: "30.555556%",
  width: "4.861111%",
  zIndex: 26,
  rotate: 0,
},
{
  id: "red-butterfly",
  src: redButterfly,
  left: "51.736111%",
  top: "50.000000%",
  width: "4.305556%",
  zIndex: 21,
  rotate: -8,
},
{
  id: "red-butterfly2",
  src: redButterfly,
  left: "80.652778%",
  top: "40.222222%",
  width: "4.305556%",
  zIndex: 21,
  rotate: -8,
},
  {
    id: "bluebird",
    src: bluebird,
    left: "32.638889%",
    top: "20.222222%",
    width: "6.388889%",
    zIndex: 20,
    rotate: -2,
  },
  {
    id: "butterfly",
    src: butterfly,
    left: "55.555556%",
    top: "76.666667%",
    width: "4.027778%",
    zIndex: 19,
    rotate: 8,
  },
  {
    id: "butterfly",
    src: butterfly,
    left: "51.388889%",
    top: "82.777778%",
    width: "4.027778%",
    zIndex: 19,
    rotate: 8,
  },
  {
    id: "owl",
    src: owl,
    left: "83.333333%",
    top: "11.666667%",
    width: "6.111111%",
    zIndex: 19,
    rotate: 1,
    flip: true,
  },
  {
    id: "monkey",
    src: monkey,
    left: "76.388889%",
    top: "10.000000%",
    width: "11.458333%",
    zIndex: 25,
    rotate: 5,
  },
  {
    id: "vine",
    src: vine,
    left: "77.083333%",
    top: "-1.666667%",
    width: "14.236111%",
    zIndex: 100,
    rotate: 100,
  },
  {
    id: "deer",
    src: deer1,
    left: "11.805556%",
    top: "71.777778%",
    width: "13.541667%",
    zIndex: 100,
    rotate: 0,
    flip: true,
  },
  {
    id: "giraffe",
    src: giraffe,
    left: "69.444444%",
    top: "16.666667%",
    width: "14.236111%",
    zIndex: 20,
    rotate: 1,
  },
  {
    id: "lion",
    src: lion1,
    left: "40.805556%",
    top: "54.444444%",
    width: "13.888889%",
    zIndex: 25,
    rotate: -2,
    flip: true,
  },
  {
    id: "elephant",
    src: elephant1,
    left: "60.763889%",
    top: "36.666667%",
    width: "12.152778%",
    zIndex: 50,
    rotate: 2,
  },
   {
    id: "peacock",
    src: peacock,
    left: "63.541667%",
    top: "53.333333%",
    width: "12.152778%",
    zIndex: 50,
    rotate: 2,
    
  },
  {
    id: "rabbit",
    src: rabbit,
    left: "52.652778%",
    top: "65.444444%",
    width: "5.208333%",
    zIndex: 50,
    rotate: 2,
  },
  {
    id: "squirrel",
    src: squirrel,
    left: "83.250000%",
    top: "43.555556%",
    width: "8.194444%",
    zIndex: 50,
    rotate: -4,
  },
  {
    id: "hedgehog",
    src: hedgehog,
    left: "35.416667%",
    top: "77.222222%",
    width: "8.680556%",
    zIndex: 25,
    rotate: 2,
    flip: true,
  },
  {
    id: "turtle",
    src: turtle,
    left: "43.055556%",
    top: "70.000000%",
    width: "8.680556%",
    zIndex: 25,
    rotate: -2,
  },
  {
    id: "deer2",
    src: deer2,
    left: "19.444444%",
    top: "78.333333%",
    width: "7.291667%",
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
  { left: "5.638889%", top: "90.444444%", rotation: -2, scale: 1.0 },
  { left: "35.763889%", top: "92.000000%", rotation: 2, scale: 0.98 },
  { left: "21.875000%", top: "80.555556%", rotation: -2, scale: 0.96 },
  { left: "59.027778%", top: "76.666667%", rotation: 2, scale: 0.84 },
  { left: "41.666667%", top: "69.444444%", rotation: -1, scale: 0.82 },
  { left: "76.388889%", top: "61.111111%", rotation: 2, scale: 0.75 },
  { left: "57.986111%", top: "53.333333%", rotation: -2, scale: 0.68 },
  { left: "67.708333%", top: "47.222222%", rotation: 2, scale: 0.58 },
  { left: "79.513889%", top: "45.555556%", rotation: -1, scale: 0.64 },
  { left: "71.791667%", top: "38.555556%", rotation: 2, scale: 0.58 },
];

function AnimalLayer({
  animal,
  lionFrame,
  elephantFrame,
  parrotBlueFrame,
}) {
  let src = animal.src;

  if (animal.id === "lion") {
    src = LION_FRAMES[lionFrame];
  }

  if (animal.id === "elephant") {
    src = ELEPHANT_FRAMES[elephantFrame];
  }

  if (animal.id === "parrotblue") {
    src = PARROT_BLUE_FRAMES[parrotBlueFrame];
  }

  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      draggable={false}
      className="absolute pointer-events-none select-none"
      style={{
        left:
  animal.id === "parrotblue" && parrotBlueFrame === 2
    ? `calc(${animal.left} - 6px)`
    : animal.left,
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
  const signpostWidth = "18.055556%";
  const signpostHeight = "28.888889%";

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
  const [parrotBlueFrame, setParrotBlueFrame] = useState(0);

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
 /*
  LION ANIMATION

  Uses the existing lion frame sequence and durations.
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
  BLUE PARROT FEATHER-BRUSHING ANIMATION

  The parrot stays still for 3 seconds,
  performs one complete feather-brushing animation,
  returns to the resting frame,
  then stays still for another 3 seconds.
*/
useEffect(() => {
  let timeoutIds = [];

  const wait = (callback, delay) => {
    const timeoutId = window.setTimeout(callback, delay);
    timeoutIds.push(timeoutId);
  };

  const playAnimation = () => {
    // Start from resting position
    setParrotBlueFrame(0);

    // REST FOR 3 SECONDS
    wait(() => {
      // Frame 1 → Frame 2
      setParrotBlueFrame(1);

      wait(() => {
        // Frame 2 → Frame 3
        setParrotBlueFrame(2);

        wait(() => {
          // Frame 3 → Frame 2
          setParrotBlueFrame(3);

          wait(() => {
            // Frame 2 → Frame 1
            setParrotBlueFrame(0);

            // NOW REST FOR 3 SECONDS
            wait(() => {
              playAnimation();
            }, 3000);

          }, PARROT_BLUE_FRAME_DURATION);

        }, PARROT_BLUE_FRAME_DURATION);

      }, PARROT_BLUE_FRAME_DURATION);

    }, 3000);
  };

  playAnimation();

  return () => {
    timeoutIds.forEach((timeoutId) => {
      window.clearTimeout(timeoutId);
    });
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
            FLYING BIRD FLOCK
        ===================================================== */}

        <FlyingBirdFlock />
        {/* =====================================================
            INDEPENDENT ANIMAL LAYERS
        ===================================================== */}

        {ANIMALS.map((animal, index) => (
          <AnimalLayer
            key={`${animal.id}-${index}`}
            animal={animal}
            lionFrame={lionFrame}
            elephantFrame={elephantFrame}
            parrotBlueFrame={parrotBlueFrame}
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
          onClick={() => navigate("/")}
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