import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import closedDiary from "../assets/illustrations/diary/closed-diary.webp";
import midOpenDiary from "../assets/illustrations/diary/mid-open-diary.webp";
import openDiary from "../assets/illustrations/diary/open-diary.webp";
import homepagePreview from "../assets/illustrations/diary/homepage-preview.webp";

/*
|--------------------------------------------------------------------------
| TIMING
|--------------------------------------------------------------------------
*/

const INTRO_TIMING = {
  coverOpen: 2400,
  openSettle: 100,
  previewAppear: 2000,
  zoom: 3000,
  finish: 100,
};

/*
|--------------------------------------------------------------------------
| CLOSED DIARY GEOMETRY
|--------------------------------------------------------------------------
|
| Your supplied diary PNGs are 1672 × 941.
|
| Closed diary:
|
|   left edge of physical cover  ≈ 440px
|   right edge                  ≈ 1225px
|   top                         ≈ 55px
|   bottom                      ≈ 875px
|
| These are percentages of the complete 1672 × 941 image.
|
|--------------------------------------------------------------------------
*/

const COVER = {
  left: 26.3,
  top: 5.8,
  width: 47.0,
  height: 87.0,
};

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function easeInOutCubic(value) {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

export default function DiaryIntro({ onComplete }) {
  const [stage, setStage] = useState("closed");
  const [openProgress, setOpenProgress] = useState(0);

  const animationRef = useRef(null);

  /*
  |--------------------------------------------------------------------------
  | OPEN DIARY
  |--------------------------------------------------------------------------
  */

  const handleOpen = () => {
    if (stage !== "closed") return;

    setStage("opening");
    setOpenProgress(0);

    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;

      const rawProgress = Math.min(
        elapsed / INTRO_TIMING.coverOpen,
        1
      );

      const progress = easeInOutCubic(rawProgress);

      setOpenProgress(progress);

      if (rawProgress < 1) {
        animationRef.current =
          requestAnimationFrame(animate);
      } else {
        setOpenProgress(1);
        setStage("open");
      }
    };

    animationRef.current =
      requestAnimationFrame(animate);
  };

  /*
  |--------------------------------------------------------------------------
  | SKIP
  |--------------------------------------------------------------------------
  */

  const handleSkip = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    setStage("complete");
    onComplete?.();
  };

  /*
  |--------------------------------------------------------------------------
  | OPEN → PREVIEW
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (stage !== "open") return;

    const timer = window.setTimeout(() => {
      setStage("preview");
    }, INTRO_TIMING.openSettle);

    return () => window.clearTimeout(timer);
  }, [stage]);

  /*
  |--------------------------------------------------------------------------
  | PREVIEW → ZOOM
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (stage !== "preview") return;

    const timer = window.setTimeout(() => {
      setStage("zoom");
    }, INTRO_TIMING.previewAppear);

    return () => window.clearTimeout(timer);
  }, [stage]);

  /*
  |--------------------------------------------------------------------------
  | ZOOM → COMPLETE
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (stage !== "zoom") return;

    const timer = window.setTimeout(() => {
      setStage("complete");
    }, INTRO_TIMING.zoom);

    return () => window.clearTimeout(timer);
  }, [stage]);

  /*
  |--------------------------------------------------------------------------
  | COMPLETE → HOME
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (stage !== "complete") return;

    const timer = window.setTimeout(() => {
      onComplete?.();
    }, INTRO_TIMING.finish);

    return () => window.clearTimeout(timer);
  }, [stage, onComplete]);

  /*
  |--------------------------------------------------------------------------
  | CLEANUP
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | COVER ROTATION
  |--------------------------------------------------------------------------
  |
  | 0°    = closed
  | ~45°  = mid-open position
  | ~90°  = edge-on
  | 180°  = fully open
  |
  */

  const coverRotation = -180 * openProgress;

  /*
  |--------------------------------------------------------------------------
  | OPEN DIARY REVEAL
  |--------------------------------------------------------------------------
  |
  | We don't fade between three complete diary images.
  |
  | The open diary is simply underneath the physical cover.
  |
  | It becomes visible as the cover moves away.
  |
  */

  const interiorOpacity =
    stage === "opening"
      ? Math.min(1, openProgress * 1.45)
      : stage === "closed"
      ? 0
      : 1;

  /*
  |--------------------------------------------------------------------------
  | COVER SHADOW
  |--------------------------------------------------------------------------
  */

  const coverShadowOpacity =
    stage === "opening"
      ? Math.sin(openProgress * Math.PI) * 0.42
      : 0;

  return (
    <AnimatePresence>
      {stage !== "complete" && (
        <motion.div
          className="
            fixed
            inset-0
            z-[9999]
            overflow-hidden
            bg-[#f4ecdc]
          "
          initial={{
            opacity: 1,
          }}
          exit={{
            opacity: 0,
          }}
          transition={{
            duration: 0.5,
            ease: "easeOut",
          }}
          aria-label="Growing with Azain diary introduction"
        >

          {/* =========================================================
              DIARY 3D STAGE
              ========================================================= */}

          <div
            className="
              absolute
              inset-0
              flex
              items-center
              justify-center
            "
            style={{
              perspective: "1800px",
              perspectiveOrigin: "50% 50%",
            }}
          >

            {/* =======================================================
                OPEN DIARY — STATIONARY INTERIOR
                =======================================================

                This is NOT animated as a separate state.

                It sits underneath the front cover.
            */}

            <motion.img
              src={openDiary}
              alt=""
              draggable="false"
              className="
                absolute
                h-auto
                w-[min(94vw,1200px)]
                select-none
                object-contain
              "
              style={{
                zIndex: 1,

                opacity: interiorOpacity,

                filter:
                  "drop-shadow(0 30px 45px rgba(65,55,40,0.25))",

                pointerEvents: "none",
              }}
              initial={{
                opacity: 0,
                scale: 1,
              }}
              animate={{
                opacity: interiorOpacity,
                scale: 1,
              }}
              transition={{
                duration: 0.12,
                ease: "linear",
              }}
            />

            {/* =======================================================
                INTERIOR / HINGE SHADOW
                ======================================================= */}

            <div
              className="
                pointer-events-none
                absolute
              "
              style={{
                zIndex: 5,

                left: "26%",
                top: "9%",

                width: "49%",
                height: "82%",

                opacity: coverShadowOpacity,

                background:
                  "radial-gradient(ellipse at 48% 50%, rgba(55,42,25,0.38) 0%, rgba(55,42,25,0.17) 45%, transparent 74%)",

                filter: "blur(18px)",

                transform:
                  "translateZ(-30px) scaleX(0.92)",
              }}
            />

            {/* =======================================================
                PHYSICAL FRONT COVER
                =======================================================

                IMPORTANT:

                The complete closed PNG is NOT being placed in
                a rotating rectangle anymore.

                Instead:

                1. The complete closed PNG is loaded.
                2. clip-path cuts away everything except the
                   physical front-cover rectangle.
                3. The resulting transparent layer rotates
                   around the actual spine.
                
                Therefore the surrounding brown paper/background
                CANNOT appear.
            */}

            {(stage === "closed" ||
              stage === "opening") && (
              <div
                className="
                  absolute
                  pointer-events-none
                "
                style={{
                  zIndex: 20,

                  width:
                    "min(88vw, 1100px)",

                  aspectRatio:
                    "1672 / 941",

                  transformStyle:
                    "preserve-3d",

                  perspective:
                    "1800px",

                  /*
                   * Center the complete PNG exactly
                   * like the supplied image.
                   */
                  transform:
                    `rotateY(${coverRotation}deg)`,

                  transformOrigin:
                    `${COVER.left}% 50%`,

                  willChange:
                    "transform",
                }}
              >

                {/* =================================================
                    CLOSED IMAGE

                    This remains the actual source image.

                    clip-path makes everything outside the
                    front cover transparent.
                ================================================= */}

                <img
                  src={closedDiary}
                  alt=""
                  draggable="false"
                  className="
                    absolute
                    inset-0
                    h-full
                    w-full
                    select-none
                    object-contain
                  "
                  style={{
                    clipPath: `
                      polygon(
                        ${COVER.left}% ${COVER.top}%,
                        ${COVER.left + COVER.width}% ${COVER.top}%,
                        ${COVER.left + COVER.width}% ${COVER.top + COVER.height}%,
                        ${COVER.left}% ${COVER.top + COVER.height}%
                      )
                    `,

                    /*
                     * The image itself remains transparent
                     * outside the polygon.
                     */
                    backfaceVisibility:
                      "hidden",

                    WebkitBackfaceVisibility:
                      "hidden",

                    pointerEvents:
                      "none",
                  }}
                />

                {/* =================================================
                    COVER EDGE SHADOW
                ================================================= */}

                <div
                  className="
                    absolute
                    pointer-events-none
                  "
                  style={{
                    left: `${COVER.left}%`,
                    top: `${COVER.top}%`,

                    width: `${COVER.width}%`,
                    height: `${COVER.height}%`,

                    opacity:
                      stage === "opening"
                        ? 0.22 +
                          openProgress * 0.18
                        : 0.22,

                    boxShadow:
                      "12px 15px 28px rgba(55,42,25,0.28)",

                    transform:
                      "translateZ(-8px)",

                    pointerEvents:
                      "none",
                  }}
                />

                {/* =================================================
                    PHYSICAL SPINE
                ================================================= */}

                <div
                  className="
                    absolute
                    pointer-events-none
                  "
                  style={{
                    left:
                      `${COVER.left - 0.15}%`,

                    top:
                      `${COVER.top + 1}%`,

                    width: "7px",

                    height:
                      `${COVER.height - 2}%`,

                    background:
                      "linear-gradient(to right, rgba(45,34,20,0.35), rgba(225,194,132,0.18), rgba(55,42,24,0.28))",

                    filter:
                      "blur(0.7px)",

                    opacity:
                      stage === "opening"
                        ? 1 -
                          openProgress * 0.85
                        : 1,
                  }}
                />

              </div>
            )}

            {/* =======================================================
                SUBTLE PAGE EDGE REVEAL

                This is only a soft light/shadow effect.
                We do NOT display the complete mid-open image.
            ======================================================= */}

            {stage === "opening" && (
              <div
                className="
                  pointer-events-none
                  absolute
                "
                style={{
                  zIndex: 15,

                  left: "49%",
                  top: "11%",

                  width: "2%",
                  height: "78%",

                  opacity:
                    Math.sin(
                      openProgress * Math.PI
                    ) * 0.35,

                  background:
                    "linear-gradient(to right, transparent, rgba(255,248,225,0.75), transparent)",

                  filter:
                    "blur(5px)",
                }}
              />
            )}

          </div>

          {/* =========================================================
              HOMEPAGE PREVIEW AFTER DIARY OPENS
              ========================================================= */}

          {(stage === "open" ||
            stage === "preview" ||
            stage === "zoom") && (
            <div
              className="
                absolute
                inset-0
                pointer-events-none
              "
              style={{
                zIndex: 40,
              }}
            >

              {/* =====================================================
                  MINIATURE HOMEPAGE
                  ===================================================== */}

              <motion.div
                className="
                  absolute
                  left-[56.5%]
                  top-[43%]
                  w-[10%]
                  origin-center
                  overflow-hidden
                "
                initial={{
                  opacity: 0,
                  scale: 0.72,
                }}
                animate={{
                  opacity:
                    stage === "preview" ||
                    stage === "zoom"
                      ? 1
                      : 0,

                  scale:
                    stage === "preview"
                      ? 0.92
                      : stage === "zoom"
                      ? 11
                      : 0.92,
                }}
                transition={{
                  duration:
                    stage === "zoom"
                      ? INTRO_TIMING.zoom /
                        350
                      : 0.2,

                  ease:
                    stage === "zoom"
                      ? [0.16, 1, 0.3, 1]
                      : "easeOut",
                }}
              >
                <img
                  src={homepagePreview}
                  alt=""
                  draggable="false"
                  className="
                    block
                    h-auto
                    w-full
                    select-none
                  "
                />
              </motion.div>

              {/* =====================================================
                  FINAL WHITE HANDOFF
                  ===================================================== */}

              <motion.div
                className="
                  pointer-events-none
                  absolute
                  inset-0
                  bg-[#fffdf8]
                "
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity:
                    stage === "zoom"
                      ? 0.82
                      : 0,
                }}
                transition={{
                  duration:
                    stage === "zoom"
                      ? 1.15
                      : 0.3,

                  delay:
                    stage === "zoom"
                      ? 1.15
                      : 0,

                  ease: "easeInOut",
                }}
              />

            </div>
          )}

          {/* =========================================================
              OPEN DIARY BUTTON
              ========================================================= */}

          <AnimatePresence>
            {stage === "closed" && (
              <motion.button
                type="button"
                onClick={handleOpen}
                className="
                  absolute
                  bottom-[8vh]
                  right-[8vw]
                  z-[100]
                  rounded-full
                  border
                  border-[#a58d62]/40
                  bg-[#f8f0df]/95
                  px-6
                  py-3
                  text-sm
                  font-medium
                  tracking-wide
                  text-[#687b58]
                  shadow-[0_8px_24px_rgba(70,60,40,0.15)]
                  backdrop-blur-sm
                  transition-colors
                  hover:bg-white
                  focus:outline-none
                  focus:ring-2
                  focus:ring-[#8da477]/50
                "
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.8,
                  duration: 0.5,
                  ease: "easeOut",
                }}
              >
                Open Diary →
              </motion.button>
            )}
          </AnimatePresence>

          {/* =========================================================
              SKIP
              ========================================================= */}

          <motion.button
            type="button"
            onClick={handleSkip}
            className="
              absolute
              bottom-5
              left-1/2
              z-[100]
              -translate-x-1/2
              rounded-full
              px-4
              py-2
              text-xs
              tracking-wide
              text-[#7b806f]/70
              transition-colors
              hover:text-[#59664d]
            "
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity:
                stage === "closed"
                  ? 0.65
                  : 0.45,
            }}
            transition={{
              duration: 0.4,
            }}
          >
            Skip
          </motion.button>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
