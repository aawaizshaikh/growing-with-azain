import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { motion } from "framer-motion";

import Navbar from "../components/Navbar";

import familyMembers from "../data/familyMembers";

import desktopBackground from "../assets/illustrations/people/memory-suitcase-desktop-bg.webp";
import suitcaseImage from "../assets/illustrations/people/family-memory-gallery-main.webp";
import memoryPhotoFrame from "../assets/illustrations/people/memory-photo-frame.webp";

import {
  filterValidFamilyMemories,
  getFamilyMemoryMediaType,
  getFamilyMemories,
} from "../services/familyMemoryService";

import FamilyMemoryLightbox from "../components/family/FamilyMemoryLightbox";
import {
  getGalaxyImageUrl,
} from "../utils/r2ImageUrl";

/*
===============================================================================
FAMILY MEMBER MEMORIES
===============================================================================

PUBLIC ROUTES

    /family/dada
    /family/dadi
    /family/nana
    /family/nani
    /family/mumma
    /family/papa
    /family/chachu
    /family/mamu
    /family/yaaya
    /family/ansha


IMPORTANT ARCHITECTURE

The family member itself is hardcoded in:

    data/familyMembers.js

The memories are NOT hardcoded.

They come directly from:

    Supabase
        ↓
    family_memories
        ↓
    member_key

Example:

    /family/dada

queries:

    member_key = "dada"


MASTER ARTWORK

The background image is the master element.

All child elements are positioned inside the exact same:

    1920 × 1080

coordinate system.

Nothing is positioned relative to the browser viewport.

The complete scene is scaled uniformly to fit the browser.

===============================================================================
*/

const SCENE_WIDTH = 1920;
const SCENE_HEIGHT = 1080;

/*
===============================================================================
CHILD PAGE SUITCASE
===============================================================================

The child page uses the SAME master background artwork as the main /family page.

The suitcase is a separate artwork element placed on top of that background.
Nothing else in the existing child-page architecture is changed.
===============================================================================
*/

const SUITCASE_LAYOUT = {
  left: "0%",
  top: "-10%",
  width: "140%",
};
const FAMILY_MEMBER_TITLES = {
  dada: "Dada's Corner",
  dadi: "Dadi's Stories",
  nana: "Nana's Train Buddy",
  nani: "Nani's World",
  mumma: "Mumma's Magic",
  papa: "Papa's Adventures",
  chachu: "Chachu's Bike Club",
  mamu: "Mamu's Adventure Club",
  yaya: "Yaaya's Happy Place",
  ansha: "Ansha's Little World",
};

/*
===============================================================================
MEMORY POSITIONS
===============================================================================

IMPORTANT:

These values are percentages of the MASTER BACKGROUND.

They are NOT percentages of the browser.

They are NOT percentages of individual cards.

They are percentages of:

    family-memory-gallery-main.png

The frame and the actual memory image share exactly the same position and
dimensions.

===============================================================================
*/

const MEMORY_POSITIONS = [
  {
    left: "28.25%",
    top: "35.85%",
    width: "10%",
  },

  {
    left: "50.25%",
    top: "35.85%",
    width: "10%",
  },

  {
    left: "61.25%",
    top: "35.85%",
    width: "10%",
  },

  {
    left: "39.5%",
    top: "35.85%",
    width: "10%",
  },

  {
    left: "28.25%",
    top: "53.55%",
    width: "10%",
  },

  {
    left: "50.25%",
    top: "53.55%",
    width: "10%",
  },

  {
    left: "61.25%",
    top: "53.55%",
    width: "10%",
  },

  {
    left: "39.5%",
    top: "53.55%",
    width: "10%",
  },
{
    left: "28.25%",
    top: "71.25%",
    width: "10%",
  },

  {
    left: "50.25%",
    top: "71.25%",
    width: "10%",
  },

  {
    left: "61.25%",
    top: "71.25%",
    width: "10%",
  },

  {
    left: "39.5%",
    top: "71.25%",
    width: "10%",
  },
];

/*
===============================================================================
MEMORY POSITION
===============================================================================

We deliberately DO NOT generate positions outside the master artwork.

The master artwork currently provides 12 visual memory locations.

Therefore:

    0 - 11
        are valid visual positions.

If the admin contains more than 12 memories, those additional records are
still kept in Supabase, but are not visually placed outside the master scene.

This prevents the page from breaking the master-artwork architecture.

===============================================================================
*/

function getMemoryPosition(index) {
  return MEMORY_POSITIONS[index] || null;
}

/*
===============================================================================
MEMORY CARD
===============================================================================
*/

function FamilyMemoryCard({
  memory,
  position,
  index,
  onOpen,
}) {
  const mediaType =
    getFamilyMemoryMediaType(memory);

  return (
    <motion.button
      type="button"
      initial={{
        opacity: 0,
        scale: 0.94,
      }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      transition={{
        duration: 0.45,
        delay: index * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{
        scale: 1.045,
      }}
      whileTap={{
        scale: 0.97,
      }}
      onClick={() => onOpen(index)}
      aria-label={
        mediaType === "video"
          ? "Open family memory video"
          : "Open family memory photo"
      }
      className="
        absolute
        block
        p-0
        m-0
        border-0
        bg-transparent
        cursor-pointer
        select-none
      "
      style={{
        /*
        The position is calculated against the 1920 × 1080
        master scene, never against the viewport.
        */
        left: position.left,
        top: position.top,
        width: position.width,

        /*
        Every memory remains square because the artwork frame
        is square.
        */
        aspectRatio: "1 / 1",

        zIndex: 20 + index,
      }}
    >
      <div
        className="
          relative
          w-full
          h-full
        "
      >
        {/*
        =======================================================================
        ACTUAL MEMORY
        =======================================================================
        */}

        <div
          className="
            absolute
            inset-[5%]
            overflow-hidden
          "
          style={{
            background:
              "#26180F",

            borderRadius:
              "2px",
          }}
        >
          {mediaType === "video" ? (
            <video
              src={memory.media_url}
              muted
              playsInline
              preload="metadata"
              className="
                block
                w-full
                h-full
                object-cover
                pointer-events-none
                select-none
              "
            />
          ) : (
            <img
              src={getGalaxyImageUrl(memory.media_url)}
              alt={
                memory.caption ||
                "Family memory"
              }
              draggable={false}
              className="
                block
                w-full
                h-full
                object-cover
                object-center
                pointer-events-none
                select-none
              "
            />
          )}

          {/*
          =====================================================================
          VIDEO INDICATOR
          =====================================================================
          */}

          {mediaType === "video" ? (
            <span
              className="
                absolute
                left-1/2
                top-1/2
                -translate-x-1/2
                -translate-y-1/2
                flex
                items-center
                justify-center
                rounded-full
                pointer-events-none
              "
              style={{
                width: "25%",
                aspectRatio: "1 / 1",

                background:
                  "rgba(30,18,10,0.62)",

                border:
                  "1px solid rgba(255,240,202,0.75)",

                boxShadow:
                  "0 4px 12px rgba(0,0,0,0.35)",
              }}
            >
              <span
                style={{
                  width: 0,
                  height: 0,

                  marginLeft:
                    "8%",

                  borderTop:
                    "8px solid transparent",

                  borderBottom:
                    "8px solid transparent",

                  borderLeft:
                    "13px solid #FFF1D2",
                }}
              />
            </span>
          ) : null}
        </div>

        {/*
        =======================================================================
        FRAME ARTWORK
        =======================================================================

        The frame is an illustration layered above the real memory.

        It does NOT determine the position.

        Its parent is already positioned using the master-scene percentages.
        =======================================================================
        */}

        <img
          src={memoryPhotoFrame}
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
        />

        {/*
        =======================================================================
        CAPTION INDICATOR
        =======================================================================
        */}

        {memory.caption ? (
          <span
            aria-hidden="true"
            className="
              absolute
              right-[6%]
              bottom-[6%]
              rounded-full
              pointer-events-none
            "
            style={{
              width: "14%",
              aspectRatio: "1 / 1",

              background:
                "rgba(91,57,32,0.78)",

              border:
                "1px solid rgba(255,235,194,0.72)",

              boxShadow:
                "0 2px 7px rgba(0,0,0,0.28)",
            }}
          >
            <span
              className="
                absolute
                left-1/2
                top-1/2
                -translate-x-1/2
                -translate-y-1/2
              "
              style={{
                width: "32%",
                height: "32%",
              }}
            >
              <span
                className="
                  absolute
                  left-0
                  top-1/2
                  w-full
                "
                style={{
                  height: "2px",
                  transform:
                    "translateY(-50%)",
                  background:
                    "#FFEAC3",
                }}
              />

              <span
                className="
                  absolute
                  left-1/2
                  top-0
                  h-full
                "
                style={{
                  width: "2px",
                  transform:
                    "translateX(-50%)",
                  background:
                    "#FFEAC3",
                }}
              />
            </span>
          </span>
        ) : null}
      </div>
    </motion.button>
  );
}

/*
===============================================================================
EMPTY STATE
===============================================================================
*/

function EmptyMemoryState({
  memberName,
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 8,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.5,
      }}
      className="
        absolute
        left-1/2
        top-1/2
        -translate-x-1/2
        -translate-y-1/2
        z-[50]
        text-center
        pointer-events-none
      "
      style={{
        width: "30%",
      }}
    >
      <div
        className="
          rounded-2xl
          px-6
          py-5
        "
        style={{
          background:
            "rgba(50,31,18,0.72)",

          border:
            "1px solid rgba(236,202,148,0.30)",

          boxShadow:
            "0 10px 30px rgba(0,0,0,0.22)",
        }}
      >
        <p
          style={{
            margin: 0,

            fontFamily:
              "Baloo 2",

            fontSize:
              "25px",

            fontWeight:
              700,

            color:
              "#F5E2BF",
          }}
        >
          Memories are waiting
        </p>

        <p
          style={{
            marginTop:
              "5px",

            marginBottom:
              0,

            fontFamily:
              "Nunito",

            fontSize:
              "15px",

            color:
              "#E4C89B",
          }}
        >
          {memberName}'s memories
          will appear here.
        </p>
      </div>
    </motion.div>
  );
}

/*
===============================================================================
MAIN COMPONENT
===============================================================================
*/

export default function FamilyMemberMemories() {
  const {
    memberKey,
  } = useParams();

  const navigate =
    useNavigate();

  /*
  ============================================================================
  RESOLVE MEMBER FROM URL
  ============================================================================
  */

  const member =
    useMemo(() => {
      if (!memberKey) {
        return null;
      }

      const normalizedKey =
        String(memberKey)
          .trim()
          .toLowerCase();

      return (
        familyMembers.find(
          (item) =>
            item.key ===
            normalizedKey
        ) || null
      );
    }, [memberKey]);
    const familyMemberTitle =
  FAMILY_MEMBER_TITLES[memberKey] ||
  `${member?.name || "Family"}'s Memories`;

  /*
  ============================================================================
  MEMORY STATE
  ============================================================================
  */

  const [
    memories,
    setMemories,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  /*
  ============================================================================
  LIGHTBOX STATE
  ============================================================================
  */

  const [
    activeMemoryIndex,
    setActiveMemoryIndex,
  ] = useState(null);

  /*
  ============================================================================
  PAGINATION
  ============================================================================

  The artwork provides 12 visual memory positions per page.

  If a family member has more than 12 memories in Supabase, the additional
  memories are shown on the next page instead of being discarded.
  ============================================================================
  */

  const MEMORIES_PER_PAGE =
    MEMORY_POSITIONS.length;

  const [
    currentPage,
    setCurrentPage,
  ] = useState(0);

  /*
  ============================================================================
  FETCH ONLY THIS MEMBER
  ============================================================================
  */

  useEffect(() => {
    let mounted = true;

    async function loadMemberMemories() {
      if (!member) {
        if (mounted) {
          setMemories([]);
          setLoading(false);
        }

        return;
      }

      setLoading(true);
      setErrorMessage("");

      try {
        /*
        IMPORTANT:

        This is the only data request made by this page.

        /family/dada
            → dada

        /family/dadi
            → dadi

        etc.
        */

        const result =
          await getFamilyMemories(
            member.key
          );

        if (!mounted) {
          return;
        }

        const validMemories =
          filterValidFamilyMemories(
            result
          );

        setMemories(
          validMemories
        );
      } catch (error) {
        console.error(
          "Failed to load family memories:",
          error
        );

        if (!mounted) {
          return;
        }

        setMemories([]);

        setErrorMessage(
          "We couldn't load these memories right now."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadMemberMemories();

    return () => {
      mounted = false;
    };
  }, [member]);

  /*
  ============================================================================
  RESET TO FIRST PAGE WHEN THE FAMILY MEMBER CHANGES
  ============================================================================
  */

  useEffect(() => {
    setCurrentPage(0);
    setActiveMemoryIndex(null);
  }, [member]);

  /*
  ============================================================================
  LIGHTBOX
  ============================================================================
  */

  const openLightbox =
    useCallback(
      (index) => {
        setActiveMemoryIndex(
          index
        );
      },
      []
    );

  const closeLightbox =
    useCallback(() => {
      setActiveMemoryIndex(
        null
      );
    }, []);

  const showPreviousMemory =
    useCallback(() => {
      setActiveMemoryIndex(
        (currentIndex) => {
          if (
            currentIndex ===
              null ||
            currentIndex <= 0
          ) {
            return currentIndex;
          }

          return (
            currentIndex - 1
          );
        }
      );
    }, []);

  const showNextMemory =
    useCallback(() => {
      setActiveMemoryIndex(
        (currentIndex) => {
          if (
            currentIndex ===
              null ||
            currentIndex >=
              memories.length - 1
          ) {
            return currentIndex;
          }

          return (
            currentIndex + 1
          );
        }
      );
    }, [memories.length]);

  /*
  ============================================================================
  INVALID MEMBER
  ============================================================================
  */

  if (!member) {
    return (
      <main
        className="
          fixed
          inset-0
          flex
          items-center
          justify-center
        "
        style={{
          background:
            "#24180F",
        }}
      >
        <div
          className="
            text-center
            px-6
          "
          style={{
            color:
              "#F5E4C4",

            fontFamily:
              "Nunito",
          }}
        >
          <h1
            style={{
              margin:
                "0 0 16px",

              fontFamily:
                "Baloo 2",

              fontSize:
                "30px",

              fontWeight:
                700,
            }}
          >
            Family member not found
          </h1>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/family"
              )
            }
            className="
              px-5
              py-2
              rounded-full
              cursor-pointer
            "
            style={{
              border:
                "1px solid rgba(245,228,196,0.35)",

              background:
                "rgba(91,57,32,0.82)",

              color:
                "#F5E4C4",

              fontFamily:
                "Nunito",

              fontWeight:
                700,
            }}
          >
            Back to My People
          </button>
        </div>
      </main>
    );
  }

  /*
  ============================================================================
  VIEWPORT
  ============================================================================
  */

  const [
    viewport,
    setViewport,
  ] = useState({
    width:
      typeof window !==
      "undefined"
        ? window.innerWidth
        : SCENE_WIDTH,

    height:
      typeof window !==
      "undefined"
        ? window.innerHeight
        : SCENE_HEIGHT,
  });

  useEffect(() => {
    const updateViewport =
      () => {
        setViewport({
          width:
            window.innerWidth,

          height:
            window.innerHeight,
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
  */

  useEffect(() => {
    const oldOverflow =
      document.body.style
        .overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        oldOverflow;
    };
  }, []);

  /*
  ============================================================================
  MASTER SCENE SCALE
  ============================================================================

  The background maintains the exact 1920 × 1080 aspect ratio.

  The entire scene is scaled as ONE unit.

  Therefore:

      background
      memory positions
      memory images
      frames
      buttons

  all scale together.

  ============================================================================
  */

  const sceneScale =
    Math.max(
      viewport.width /
        SCENE_WIDTH,

      viewport.height /
        SCENE_HEIGHT
    );

  /*
  ============================================================================
  PAGINATION CALCULATIONS
  ============================================================================
  */

  const totalPages = Math.max(
    1,
    Math.ceil(
      memories.length /
        MEMORIES_PER_PAGE
    )
  );

  const safeCurrentPage =
    Math.min(
      currentPage,
      totalPages - 1
    );

  const pageStart =
    safeCurrentPage *
    MEMORIES_PER_PAGE;

  const pageMemories =
    memories.slice(
      pageStart,
      pageStart +
        MEMORIES_PER_PAGE
    );

  /*
  ============================================================================
  PAGE
  ============================================================================
  */

  return (
    <main
      className="
        fixed
        inset-0
        overflow-hidden
        select-none
      "
      style={{
        backgroundColor:
          "#24180F",
      }}
    >
      {/*
      ==========================================================================
      MASTER SCENE
      ==========================================================================

      THIS is the master coordinate system.

      Width  = 1920px
      Height = 1080px

      Every child element below is positioned relative to this element.

      Nothing uses viewport percentages.
      ==========================================================================

      */}

      <div
        className="
          absolute
          overflow-visible
        "
        style={{
          width:
            `${SCENE_WIDTH}px`,

          height:
            `${SCENE_HEIGHT}px`,

          left:
            "50%",

          top:
            "50%",

          transform:
            `translate(-50%, -50%) scale(${sceneScale})`,

          transformOrigin:
            "center center",
        }}
      >
        {/*
        ========================================================================
        MASTER BACKGROUND
        ========================================================================
        */}

        <img
          src={
            desktopBackground
          }
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
        SUITCASE
        ========================================================================

        Same suitcase artwork and master-scene position as the main /family page.

        It is intentionally a separate image element. Existing memory cards
        remain separate children of the master scene and stay above it.
        ========================================================================
        */}

        <img
          src={suitcaseImage}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="
            absolute
            object-contain
            pointer-events-none
            select-none
          "
          style={{
            left: SUITCASE_LAYOUT.left,
            top: SUITCASE_LAYOUT.top,
            width: SUITCASE_LAYOUT.width,
            height: SUITCASE_LAYOUT.width,
            zIndex: 10,
          }}
        />
        <div
  className="
    absolute
    z-[30]
    pointer-events-none
    text-center
    font-bold
  "
  style={{
    left: "23%",
    top: "10%",
    width: "50%",
    color: "#5A3925",
    fontFamily: "Baloo 2",
    fontSize: "clamp(24px, 2vw, 42px)",
  }}
>
  {familyMemberTitle}
</div>

        {/*
        ========================================================================
        MEMORY CONTENT

        All positions are percentage-based against the master scene.
        ========================================================================
        */}

        {loading ? (
          <div
            className="
              absolute
              left-1/2
              top-1/2
              -translate-x-1/2
              -translate-y-1/2
              z-[70]
            "
            style={{
              width:
                "30%",

              textAlign:
                "center",
            }}
          >
            <div
              className="
                rounded-full
                px-6
                py-3
              "
              style={{
                background:
                  "rgba(50,31,18,0.72)",

                border:
                  "1px solid rgba(236,202,148,0.30)",

                color:
                  "#F5E2BF",

                fontFamily:
                  "Nunito",

                fontSize:
                  "15px",
              }}
            >
              Opening{" "}
              {member.name}
              's memories…
            </div>
          </div>
        ) : errorMessage ? (
          <div
            className="
              absolute
              left-1/2
              top-1/2
              -translate-x-1/2
              -translate-y-1/2
              z-[70]
              text-center
            "
            style={{
              width:
                "30%",
            }}
          >
            <div
              className="
                rounded-2xl
                px-6
                py-5
              "
              style={{
                background:
                  "rgba(50,31,18,0.78)",

                border:
                  "1px solid rgba(236,202,148,0.32)",

                color:
                  "#F5E2BF",
              }}
            >
              <p
                style={{
                  margin: 0,

                  fontFamily:
                    "Baloo 2",

                  fontSize:
                    "23px",

                  fontWeight:
                    700,
                }}
              >
                Memories unavailable
              </p>

              <p
                style={{
                  margin:
                    "5px 0 0",

                  fontFamily:
                    "Nunito",

                  fontSize:
                    "14px",
                }}
              >
                {errorMessage}
              </p>
            </div>
          </div>
        ) : memories.length ===
          0 ? (
          <EmptyMemoryState
            memberName={
              member.name
            }
          />
        ) : (
          pageMemories.map(
            (
              memory,
              index
            ) => {
              const position =
                getMemoryPosition(
                  index
                );

              if (!position) {
                return null;
              }

              return (
                <FamilyMemoryCard
                  key={
                    memory.id
                  }
                  memory={
                    memory
                  }
                  position={
                    position
                  }
                  index={
                    index
                  }
                  onOpen={() =>
                    openLightbox(
                      pageStart +
                        index
                    )
                  }
                />
              );
            }
          )
        )}

        {/*
        ==========================================================================
        PAGINATION
        ==========================================================================

        Pagination is part of the same 1920 × 1080 master scene, so it scales
        together with the background and suitcase.

        It appears only when there is more than one page of memories.
        ==========================================================================
        */}

        {totalPages > 1 ? (
          <div
            className="
              absolute
              left-1/2
              top-[88%]
              -translate-x-1/2
              flex
              items-center
              gap-3
              z-[80]
            "
          >
            <button
              type="button"
              onClick={() =>
                setCurrentPage(
                  (page) =>
                    Math.max(
                      0,
                      page - 1
                    )
                )
              }
              disabled={
                safeCurrentPage === 0
              }
              className="
                w-11
                h-11
                rounded-full
                flex
                items-center
                justify-center
                transition
                disabled:opacity-35
                disabled:cursor-not-allowed
              "
              style={{
                background:
                  "rgba(50,31,18,0.82)",
                border:
                  "1px solid rgba(245,228,196,0.55)",
                color:
                  "#F5E4C4",
                fontSize:
                  "22px",
              }}
              aria-label="Previous page"
            >
              ←
            </button>

            <div
              className="
                px-5
                py-2
                rounded-full
                text-center
              "
              style={{
                minWidth:
                  "105px",
                background:
                  "rgba(50,31,18,0.82)",
                border:
                  "1px solid rgba(245,228,196,0.45)",
                color:
                  "#F5E4C4",
                fontFamily:
                  "Nunito",
                fontSize:
                  "15px",
                fontWeight:
                  700,
              }}
            >
              {safeCurrentPage + 1}
              {" / "}
              {totalPages}
            </div>

            <button
              type="button"
              onClick={() =>
                setCurrentPage(
                  (page) =>
                    Math.min(
                      totalPages - 1,
                      page + 1
                    )
                )
              }
              disabled={
                safeCurrentPage >=
                totalPages - 1
              }
              className="
                w-11
                h-11
                rounded-full
                flex
                items-center
                justify-center
                transition
                disabled:opacity-35
                disabled:cursor-not-allowed
              "
              style={{
                background:
                  "rgba(50,31,18,0.82)",
                border:
                  "1px solid rgba(245,228,196,0.55)",
                color:
                  "#F5E4C4",
                fontSize:
                  "22px",
              }}
              aria-label="Next page"
            >
              →
            </button>
          </div>
        ) : null}

              </div>

      {/*
      ==========================================================================
      EXISTING NAVBAR
      ==========================================================================

      Navbar is deliberately outside the master artwork scene so its existing
      project behavior is not affected.
      ==========================================================================

      */}

      <Navbar />

      {/*
      ==========================================================================
      LIGHTBOX

      Existing component is used unchanged.
      ==========================================================================

      */}

      <FamilyMemoryLightbox
        memories={
          memories
        }
        activeIndex={
          activeMemoryIndex
        }
        onClose={
          closeLightbox
        }
        onPrevious={
          showPreviousMemory
        }
        onNext={
          showNextMemory
        }
      />
    </main>
  );
}