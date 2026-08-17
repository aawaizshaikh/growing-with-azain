import { FaArrowLeft, FaMusic } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import SongTimeline from "../components/songs/SongTimeline";

import background from "../assets/illustrations/favsongs/background.webp";

import AnimatedGuitarBoy from "../components/songs/AnimatedGuitarBoy";
import AnimatedDancingGirl from "../components/songs/AnimatedDancingGirl";
import AnimatedGirlWithMic from "../components/songs/AnimatedGirlWithMic";
import AnimatedDancingBoy from "../components/songs/AnimatedDancingBoy";
import AnimatedBoyDj from "../components/songs/AnimatedBoyDj";

import boyDancing from "../assets/illustrations/favsongs/boy-dancing.webp";
import boyDj from "../assets/illustrations/favsongs/boy-dj.webp";
import girlDancing from "../assets/illustrations/favsongs/girl-dancing.webp";

import table from "../assets/illustrations/favsongs/table.webp";
import bluestool from "../assets/illustrations/favsongs/blue-stool.webp";
import greenstool from "../assets/illustrations/favsongs/green-stool.webp";
import discoLight from "../assets/illustrations/favsongs/disco-light.webp";


const SCENE_WIDTH = 1672;
const SCENE_HEIGHT = 941;

const ILLUSTRATIONS = {
  /* ==========================================================
     BOY WITH GUITAR
     ========================================================== */

  boyWithGuitar: {
    left: "9%",
    top: "56%",
    width: "12%",
  },

  /* ==========================================================
     BOY DANCING
     ========================================================== */

  boyDancing: {
    left: "40%",
    top: "55%",
    width: "14%",
  },
  discoLight: {
  left: "58%",
  top: "-1%",
  width: "8%",
},

  /* ==========================================================
     GIRL DANCING
     ========================================================== */

  girlDancing: {
    left: "27%",
    top: "60%",
    width: "13%",
  },

  /* ==========================================================
     TABLE
     ========================================================== */

  table: {
    left: "59%",
    top: "76%",
    width: "35%",
  },
  table2: {
  left: "15%",
  top: "65%",
  width: "15%",
},
  

  /* ==========================================================
     BLUE STOOL
     ========================================================== */

  bluestool: {
    left: "3%",
    top: "82%",
    width: "8%",
  },

  /* ==========================================================
     GREEN STOOL
     ========================================================== */

  greenstool: {
    left: "9%",
    top: "75%",
    width: "8%",
  },

  /* ==========================================================
     GIRL WITH MICROPHONE
     ========================================================== */

  girlWithMic: {
    left: "54%",
    top: "45%",
    width: "13%",
    flip: true,
  },

  /* ==========================================================
     BOY DJ
     ========================================================== */

  boyDj: {
    left: "66%",
    top: "38%",
    width: "19%",
    rotate: "10deg",
  },
};

export default function FavoriteSongs() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  /* ==========================================================
     TIMELINE-STYLE COVER SCENE SCALING

     The entire Favourite Songs page uses one fixed artwork
     coordinate system. The scene scales to COVER the viewport,
     exactly like the Timeline main page.

     All illustrations inside the scene remain positioned using
     their existing percentage coordinates.
     ========================================================== */

  const [viewport, setViewport] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : SCENE_WIDTH,
    height:
      typeof window !== "undefined" ? window.innerHeight : SCENE_HEIGHT,
  });

  useEffect(() => {
    const updateViewport = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateViewport();

    window.addEventListener("resize", updateViewport);

    return () => {
      window.removeEventListener("resize", updateViewport);
    };
  }, []);

  const sceneScale = Math.max(
    viewport.width / SCENE_WIDTH,
    viewport.height / SCENE_HEIGHT
  );

  return (
    <>
      {/* ==========================================================
          MASTER SCENE AREA

          This area belongs exclusively to Favourite Songs.

          No Navbar.
          No Footer.
          No SongHeader.

          The scene now behaves exactly like Timeline:
          the fixed artwork is scaled using COVER logic so it
          always fills the complete viewport.
          ========================================================== */}

      <div className="fixed inset-0 overflow-hidden">
        {/* ========================================================
            MASTER SCENE

            Exact artwork ratio:
            1672 × 941

            Everything inside this container is positioned relative
            to this same fixed scene using percentages.
            ======================================================== */}

        <div
          className="absolute overflow-hidden"
          style={{
            width: `${SCENE_WIDTH}px`,
            height: `${SCENE_HEIGHT}px`,
            left: "50%",
            top: "50%",
            transform: `translate(-50%, -50%) scale(${sceneScale})`,
            transformOrigin: "center center",
          }}
        >
          {/* ======================================================
              BACKGROUND IMAGE
              ====================================================== */}

          <img
            src={background}
            alt=""
            draggable="false"
            className="
              absolute
              inset-0
              block
              w-full
              h-full
              select-none
              pointer-events-none
            "
          />

          {/* ======================================================
              BACK BUTTON
              ====================================================== */}

          <button
            type="button"
            onClick={() => navigate("/")}
            aria-label="Go back"
            className="
              absolute
              z-[100]
              flex
              items-center
              justify-center
              rounded-full
              bg-[#FFF4DB]
              border
              border-[#E5C99D]
              shadow-lg
              text-[#5A4635]
              hover:bg-white
              hover:scale-105
              active:scale-95
              transition-all
            "
            style={{
              left: "2.2%",
              top: "2%",
              width: "2.5%",
              aspectRatio: "1",
            }}
          >
            <FaArrowLeft
              style={{
                width: "36%",
                height: "36%",
              }}
            />
          </button>

          {/* ======================================================
              TOP RIGHT MUSIC BUTTON
              ====================================================== */}

          <div
            className="absolute z-[100]"
            style={{
              right: "2.2%",
              top: "2%",
            }}
          >
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Open navigation menu"
              aria-expanded={menuOpen}
              className="
                flex
                items-center
                justify-center
                rounded-full
                bg-[#FFF4DB]
                border
                border-[#E5C99D]
                shadow-lg
                text-[#5A4635]
                hover:bg-white
                hover:scale-105
                active:scale-95
                transition-all
              "
              style={{
                width: "2.5vw",
                minWidth: "38px",
                maxWidth: "48px",
                aspectRatio: "1",
              }}
            >
              <FaMusic
                style={{
                  width: "38%",
                  height: "38%",
                }}
              />
            </button>

            {menuOpen && (
              <div
                className="
                  absolute
                  right-0
                  mt-3
                  w-56
                  rounded-2xl
                  bg-[#FFFDF8]
                  border
                  border-[#E5C99D]
                  shadow-2xl
                  p-3
                "
              >
                <nav className="flex flex-col gap-1">
                  {[
                    { title: "Home", path: "/" },
                    { title: "Timeline", path: "/timeline" },
                    { title: "Milestones", path: "/milestones" },
                    { title: "Favourite Songs", path: "/favorite-songs" },
                    { title: "Gallery", path: "/gallery" },
                    { title: "Letters", path: "/letters" },
                    { title: "My People", path: "/family" },
                    { title: "About Azain", path: "/about" },
                  ].map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMenuOpen(false)}
                      className="
                        px-4
                        py-3
                        rounded-xl
                        text-[#5A4635]
                        font-semibold
                        hover:bg-[#FFF4DB]
                        hover:text-[#B58A5A]
                        transition
                      "
                    >
                      {item.title}
                    </Link>
                  ))}
                </nav>
              </div>
            )}
          </div>
          {/* DISCO LIGHT FIXTURE */}

<img
  src={discoLight}
  alt=""
  draggable="false"
  className="absolute z-[50] pointer-events-none select-none"
  style={{
    left: ILLUSTRATIONS.discoLight.left,
    top: ILLUSTRATIONS.discoLight.top,
    width: ILLUSTRATIONS.discoLight.width,
  }}
/>

          {/* ======================================================
              DYNAMIC VINYL LAYER

              Vinyls remain above the background but below the
              decorative foreground characters.
              ====================================================== */}

          <SongTimeline />

          {/* ======================================================
              TABLE + STOOLS

              These are placed BEFORE the characters so that the
              characters visually sit in front of them.
              ====================================================== */}

          <img
            src={table}
            alt=""
            draggable="false"
            className="
              absolute
              z-[40]
              pointer-events-none
              select-none
            "
            style={{
              left: ILLUSTRATIONS.table.left,
              top: ILLUSTRATIONS.table.top,
              width: ILLUSTRATIONS.table.width,
            }}
          />
          {/* TABLE 2 */}
<img
  src={table}
  alt=""
  draggable="false"
  className="
    absolute
    z-[40]
    pointer-events-none
    select-none
  "
  style={{
    left: ILLUSTRATIONS.table2.left,
    top: ILLUSTRATIONS.table2.top,
    width: ILLUSTRATIONS.table2.width,
  }}
/>

          <img
            src={bluestool}
            alt=""
            draggable="false"
            className="
              absolute
              z-[40]
              pointer-events-none
              select-none
            "
            style={{
              left: ILLUSTRATIONS.bluestool.left,
              top: ILLUSTRATIONS.bluestool.top,
              width: ILLUSTRATIONS.bluestool.width,
            }}
          />

          <img
            src={greenstool}
            alt=""
            draggable="false"
            className="
              absolute
              z-[40]
              pointer-events-none
              select-none
            "
            style={{
              left: ILLUSTRATIONS.greenstool.left,
              top: ILLUSTRATIONS.greenstool.top,
              width: ILLUSTRATIONS.greenstool.width,
            }}
          />

          {/* ======================================================
              BOY WITH GUITAR
              ====================================================== */}

          <AnimatedGuitarBoy
            position={{
              left: ILLUSTRATIONS.boyWithGuitar.left,
              top: ILLUSTRATIONS.boyWithGuitar.top,
              width: ILLUSTRATIONS.boyWithGuitar.width,
              zIndex: 60,
            }}
          />

          {/* ======================================================
              BOY DANCING
              ====================================================== */}

          <AnimatedDancingBoy
  position={{
    left: ILLUSTRATIONS.boyDancing.left,
    top: ILLUSTRATIONS.boyDancing.top,
    width: ILLUSTRATIONS.boyDancing.width,
    zIndex: 60,
  }}
/>

          {/* ======================================================
              GIRL DANCING
              ====================================================== */}

          <AnimatedDancingGirl
  position={{
    left: ILLUSTRATIONS.girlDancing.left,
    top: ILLUSTRATIONS.girlDancing.top,
    width: ILLUSTRATIONS.girlDancing.width,
    zIndex: 60,
  }}
/>

          {/* ======================================================
              GIRL WITH MICROPHONE
              ====================================================== */}

          <AnimatedGirlWithMic
            position={{
              left: ILLUSTRATIONS.girlWithMic.left,
              top: ILLUSTRATIONS.girlWithMic.top,
              width: ILLUSTRATIONS.girlWithMic.width,
              zIndex: 60,
              flip: ILLUSTRATIONS.girlWithMic.flip,
            }}
          />

          {/* ======================================================
              BOY DJ
              ====================================================== */}

          <AnimatedBoyDj
  position={{
    left: ILLUSTRATIONS.boyDj.left,
    top: ILLUSTRATIONS.boyDj.top,
    width: ILLUSTRATIONS.boyDj.width,
    zIndex: 60,
  }}
/>
        </div>
      </div>
    </>
  );
}