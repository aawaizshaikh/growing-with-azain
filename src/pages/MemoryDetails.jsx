import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getTimelineMemoryBySlug,
  getTimelineMemories,
} from "../services/timelineService";

import diaryBackground from "../assets/illustrations/timeline-memory-diary.png";
import vintageRockingHorse from "../assets/illustrations/timeline-vintage-rocking-horse.png";
import vintageTeddyPillow from "../assets/illustrations/timeline-vintage-teddy-pillow.png";
import { isVideoMedia } from "../utils/mediaHelpers";


/*
=====================================================
MEMORY CHILD PAGE — PERCENTAGE BASED MASTER SCENE
=====================================================

MASTER DESIGN
-------------

The diary artwork is the master 1920 × 1080 scene.

ALL PAGE ELEMENTS are positioned relative to this
master scene using percentages.

PHOTO BEHAVIOUR
---------------

DIARY PAGE:

    Page 1 -> photos 1, 2, 3
    Page 2 -> photos 4, 5, 6
    Page 3 -> photos 7, 8, 9

LIGHTBOX:

    The lightbox has access to ALL photos.

    Page 1:
        click photo 3
        ↓
        lightbox photo 3
        ↓
        next
        ↓
        photo 4

    It does NOT stop at the end of the current
    diary page.

ADMIN PANEL
-----------

No Admin Panel files are changed by this page.
=====================================================
*/

const SCENE_WIDTH = 1920;
const SCENE_HEIGHT = 1080;

const SUPPORTING_PHOTOS_PER_PAGE = 3;

/*
=====================================================
MASTER SCENE ELEMENT POSITIONS
=====================================================
*/

const LAYOUT = {
  /*
  -----------------------------------------------
  BACK BUTTON
  -----------------------------------------------
  */

  backButton: {
    left: "2.9%",
    top: "4.2%",
    width: "3.4%",
    height: "5.9%",
  },

  /*
  -----------------------------------------------
  MEMORY TITLE
  -----------------------------------------------
  */

  title: {
    left: "29.2%",
    top: "5.1%",
    width: "41.6%",
    height: "11.1%",
  },

  /*
  -----------------------------------------------
  COVER PHOTO
  -----------------------------------------------
  */

  cover: {
    left: "22.5%",
    top: "30.4%",
    width: "24.1%",
    height: "52.3%",
  },

  /*
  -----------------------------------------------
  OUR STORY
  -----------------------------------------------
  */

  story: {
    left: "53.9%",
    top: "28.2%",
    width: "28.1%",
    height: "16.2%",
  },

  /*
  -----------------------------------------------
  AGE
  -----------------------------------------------
  */

  age: {
    left: "53.9%",
    top: "43.5%",
    width: "28.1%",
    height: "10.2%",
  },

  /*
  -----------------------------------------------
  SUPPORTING PHOTOS
  -----------------------------------------------
  */

  supportingPhotos: {
    left: "52.1%",
    top: "59.3%",
    width: "31.3%",
    height: "22.2%",
  },

  /*
  -----------------------------------------------
  PHOTO PAGINATION
  -----------------------------------------------
  */

  photoPagination: {
    left: "52.1%",
    top: "81.9%",
    width: "31.3%",
    height: "4.6%",
  },

  /*
  -----------------------------------------------
  MEMORY NAVIGATION
  -----------------------------------------------
  */

  memoryNavigation: {
    left: "31.8%",
    top: "88.9%",
    width: "36.5%",
    height: "6.5%",
  },

  /*
  -----------------------------------------------
  ROCKING HORSE
  Decorative floor illustration from Timeline
  -----------------------------------------------
  */

  rockingHorse: {
    left: "3.8%",
    top: "72.5%",
    width: "17.5%",
  },

  /*
  -----------------------------------------------
  TEDDY WITH PILLOW
  Decorative floor illustration from Timeline
  -----------------------------------------------
  */

  teddy: {
    right: "3.8%",
    top: "70.5%",
    width: "18%",
  },
};

/*
=====================================================
HELPERS
=====================================================
*/

function parseArray(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      if (Array.isArray(parsed)) {
        return parsed.filter(Boolean);
      }

      if (typeof parsed === "string" && parsed.trim()) {
        return [parsed.trim()];
      }
    } catch {
      // A normal URL is also a valid single media value.
      if (value.trim()) {
        return [value.trim()];
      }
    }
  }

  return [];
}

function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function getMemoryChapter(memory) {
  return normalize(
    memory?.category || memory?.age
  );
}

/*
=====================================================
COMPONENT
=====================================================
*/

export default function MemoryDetails() {
  const navigate = useNavigate();
  const { slug } = useParams();

  /*
  =====================================================
  DATA
  =====================================================
  */

  const [loading, setLoading] =
    useState(true);

  const [memory, setMemory] =
    useState(null);

  const [allMemories, setAllMemories] =
    useState([]);

  /*
  =====================================================
  DIARY PHOTO PAGINATION

  Controls which 3 photos are physically visible
  on the diary page.
  =====================================================
  */

  const [photoPage, setPhotoPage] =
    useState(1);

  /*
  =====================================================
  LIGHTBOX

  IMPORTANT:

  This stores the index from the COMPLETE
  supportingPhotos array.

  It does NOT store the index from visiblePhotos.
  =====================================================
  */

  const [lightboxIndex, setLightboxIndex] =
    useState(null);

  /*
  =====================================================
  MASTER SCENE SCALE
  =====================================================
  */

  const [sceneScale, setSceneScale] =
    useState(1);

  /*
  =====================================================
  SCALE MASTER SCENE
  =====================================================
  */

  useEffect(() => {
    function updateSceneScale() {
      const viewportWidth =
        window.innerWidth;

      const viewportHeight =
        window.innerHeight;

      const scaleX =
        viewportWidth /
        SCENE_WIDTH;

      const scaleY =
        viewportHeight /
        SCENE_HEIGHT;

      const scale =
        Math.min(
          scaleX,
          scaleY
        );

      setSceneScale(scale);
    }

    updateSceneScale();

    window.addEventListener(
      "resize",
      updateSceneScale
    );

    return () => {
      window.removeEventListener(
        "resize",
        updateSceneScale
      );
    };
  }, []);

  /*
  =====================================================
  LOAD MEMORY
  =====================================================
  */

  useEffect(() => {
    let cancelled = false;

    async function loadMemory() {
      setLoading(true);

      try {
        const [current, all] =
          await Promise.all([
            getTimelineMemoryBySlug(slug),
            getTimelineMemories(),
          ]);

        if (cancelled) {
          return;
        }

        setMemory(
          current || null
        );

        setAllMemories(
          all || []
        );

        setPhotoPage(1);

        setLightboxIndex(null);
      } catch (error) {
        console.error(
          "Failed to load memory:",
          error
        );

        if (!cancelled) {
          setMemory(null);
          setAllMemories([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadMemory();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  /*
  =====================================================
  COVER IMAGE
  =====================================================
  */

  const coverImage =
    memory?.cover_image ||
    memory?.cover ||
    memory?.image ||
    "/placeholder-memory.jpg";

  /*
  =====================================================
  ALL SUPPORTING MEDIA
  =====================================================

  THIS IS THE COMPLETE IMAGE + VIDEO COLLECTION.

  Pagination only controls what is displayed.

  The lightbox uses this COMPLETE array.
  =====================================================
  */

  const supportingPhotos =
    useMemo(() => {
      if (!memory) {
        return [];
      }

      /*
      -----------------------------------------------------
      SUPPORTING MEDIA

      Keep the existing gallery_images behaviour, while
      also accepting videos stored in the separate video
      fields used by Timeline memories.

      This is intentionally additive and does not change
      how existing image/video gallery data is handled.
      -----------------------------------------------------
      */

      const galleryImages = parseArray(
        memory.gallery_images
      );

      const gallery = parseArray(
        memory.gallery
      );

      const videoUrl = parseArray(
        memory.video_url
      );

      const videos = parseArray(
        memory.videos
      );

      const videoUrls = [
        ...parseArray(memory.videoUrls),
        ...parseArray(memory.video_urls),
      ];

      const combined = [
        ...galleryImages,
        ...gallery,
        ...videoUrl,
        ...videos,
        ...videoUrls,
      ];

      /*
      Remove duplicates while preserving the original
      order, and keep the cover out of supporting media.
      */

      return Array.from(
        new Set(combined)
      ).filter(
        (media) =>
          media &&
          media !== coverImage
      );
    }, [
      memory,
      coverImage,
    ]);

  /*
  =====================================================
  LIGHTBOX MEDIA
  =====================================================

  The lightbox uses the COMPLETE supportingPhotos
  collection, including both images and videos.
  =====================================================
  */

  const lightboxPhotos = supportingPhotos;

  /*
  =====================================================
  PHOTO PAGINATION
  =====================================================
  */

  const totalPhotoPages =
    Math.max(
      1,
      Math.ceil(
        lightboxPhotos.length /
          SUPPORTING_PHOTOS_PER_PAGE
      )
    );

  /*
  =====================================================
  ONLY THESE MEDIA ITEMS APPEAR ON THE CURRENT DIARY PAGE
  =====================================================
  */

  const visiblePhotos =
    supportingPhotos.slice(
      (photoPage - 1) *
        SUPPORTING_PHOTOS_PER_PAGE,

      photoPage *
        SUPPORTING_PHOTOS_PER_PAGE
    );

  /*
  =====================================================
  KEEP PHOTO PAGE VALID
  =====================================================
  */

  useEffect(() => {
    setPhotoPage((page) =>
      Math.min(
        Math.max(
          page,
          1
        ),
        totalPhotoPages
      )
    );
  }, [
    totalPhotoPages,
  ]);

  /*
  =====================================================
  SAME CHAPTER MEMORIES
  =====================================================
  */

  const chapterMemories =
    useMemo(() => {
      if (!memory) {
        return [];
      }

      const chapter =
        getMemoryChapter(
          memory
        );

      if (!chapter) {
        return allMemories;
      }

      return allMemories.filter(
        (item) =>
          getMemoryChapter(
            item
          ) === chapter
      );
    }, [
      allMemories,
      memory,
    ]);

  /*
  =====================================================
  CURRENT MEMORY
  =====================================================
  */

  const currentMemoryIndex =
    chapterMemories.findIndex(
      (item) =>
        item.slug === slug
    );

  /*
  =====================================================
  PREVIOUS MEMORY
  =====================================================
  */

  const previousMemory =
    currentMemoryIndex > 0
      ? chapterMemories[
          currentMemoryIndex - 1
        ]
      : null;

  /*
  =====================================================
  NEXT MEMORY
  =====================================================
  */

  const nextMemory =
    currentMemoryIndex >= 0 &&
    currentMemoryIndex <
      chapterMemories.length - 1
      ? chapterMemories[
          currentMemoryIndex + 1
        ]
      : null;

  /*
  =====================================================
  STORY
  =====================================================
  */

  const story =
    memory?.story ||
    memory?.description ||
    "";

  /*
  =====================================================
  OPEN PHOTO

  VERY IMPORTANT:

  visibleIndex = position of the photo on the
  CURRENT diary page.

  We convert that into the GLOBAL index inside
  supportingPhotos.

  Example:

      Page 1 -> visibleIndex 2
      globalIndex = 0 * 3 + 2 = 2

      Page 2 -> visibleIndex 0
      globalIndex = 1 * 3 + 0 = 3
  =====================================================
  */

  function openPhoto(
    visibleIndex
  ) {
    const globalIndex =
      (photoPage - 1) *
        SUPPORTING_PHOTOS_PER_PAGE +
      visibleIndex;

    if (
      globalIndex >= 0 &&
      globalIndex <
        lightboxPhotos.length
    ) {
      const selectedMedia =
        supportingPhotos[
          globalIndex
        ];

      const mediaIndex =
        lightboxPhotos.indexOf(
          selectedMedia
        );

      if (mediaIndex >= 0) {
        setLightboxIndex(
          mediaIndex
        );
      }
    }
  }

  /*
  =====================================================
  CLOSE LIGHTBOX
  =====================================================
  */

  function closePhoto() {
    setLightboxIndex(null);
  }

  /*
  =====================================================
  PREVIOUS PHOTO

  IMPORTANT:

  Uses supportingPhotos, NOT visiblePhotos.

  Therefore it can cross page boundaries.
  =====================================================
  */

  function previousPhoto() {
    setLightboxIndex(
      (index) => {
        if (
          index === null
        ) {
          return null;
        }

        return Math.max(
          0,
          index - 1
        );
      }
    );
  }

  /*
  =====================================================
  NEXT PHOTO

  IMPORTANT:

  Uses the COMPLETE supportingPhotos array.

  Therefore:

      photo 3 → photo 4
      photo 6 → photo 7
      etc.
  =====================================================
  */

  function nextPhoto() {
    setLightboxIndex(
      (index) => {
        if (
          index === null
        ) {
          return null;
        }

        return Math.min(
          lightboxPhotos.length - 1,
          index + 1
        );
      }
    );
  }

  /*
  =====================================================
  KEYBOARD CONTROLS
  =====================================================
  */

  useEffect(() => {
    function handleKeyDown(
      event
    ) {
      if (
        lightboxIndex === null
      ) {
        return;
      }

      if (
        event.key ===
        "Escape"
      ) {
        closePhoto();
      }

      if (
        event.key ===
        "ArrowLeft"
      ) {
        previousPhoto();
      }

      if (
        event.key ===
        "ArrowRight"
      ) {
        nextPhoto();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    lightboxIndex,
    lightboxPhotos.length,
  ]);

  /*
  =====================================================
  LOADING
  =====================================================
  */

  if (loading) {
    return (
      <main
        className="
          fixed
          inset-0
          flex
          items-center
          justify-center
          bg-[#D8B27C]
          text-[#5A3D25]
        "
      >
        <div
          className="
            text-3xl
            font-bold
          "
          style={{
            fontFamily:
              "Cormorant Garamond, serif",
          }}
        >
          Opening your memory...
        </div>
      </main>
    );
  }

  /*
  =====================================================
  MEMORY NOT FOUND
  =====================================================
  */

  if (!memory) {
    return (
      <main
        className="
          fixed
          inset-0
          flex
          items-center
          justify-center
          bg-[#D8B27C]
          text-[#5A3D25]
        "
      >
        <div className="text-center">
          <h1
            className="
              text-5xl
              font-bold
            "
            style={{
              fontFamily:
                "Cormorant Garamond, serif",
            }}
          >
            Memory not found
          </h1>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/timeline"
              )
            }
            className="
              mt-6
              px-6
              py-3
              rounded-full
              bg-[#8F653A]
              text-white
              font-semibold
            "
          >
            ← Back to Journey
          </button>
        </div>
      </main>
    );
  }

  /*
  =====================================================
  MAIN PAGE
  =====================================================
  */

  return (
    <main
      className="
        fixed
        inset-0
        overflow-hidden
        bg-[#D8B27C]
      "
    >
      {/* =================================================
          MASTER 1920 × 1080 SCENE
          ================================================= */}

      <div
        style={{
          position: "absolute",

          width:
            `${SCENE_WIDTH}px`,

          height:
            `${SCENE_HEIGHT}px`,

          left: "50%",

          top: "50%",

          transform: `
            translate(-50%, -50%)
            scale(${sceneScale})
          `,

          transformOrigin:
            "center center",

          overflow:
            "visible",
        }}
      >
        {/* =================================================
            DIARY BACKGROUND
            ================================================= */}

        <img
          src={diaryBackground}
          alt=""
          aria-hidden="true"
          draggable={false}
          style={{
            position:
              "absolute",

            left: 0,
            top: 0,

            width:
              `${SCENE_WIDTH}px`,

            height:
              `${SCENE_HEIGHT}px`,

            objectFit:
              "fill",

            display:
              "block",

            userSelect:
              "none",

            pointerEvents:
              "none",

            zIndex: 0,
          }}
        />

        {/* =================================================
            BACK TO JOURNEY
            ================================================= */}

        <button
          type="button"
          onClick={() =>
            navigate(
              "/timeline"
            )
          }
          aria-label="Back to Journey"
          style={{
            position:
              "absolute",

            left:
              LAYOUT.backButton.left,

            top:
              LAYOUT.backButton.top,

            width:
              LAYOUT.backButton.width,

            height:
              LAYOUT.backButton.height,

            zIndex: 30,
          }}
          className="
            rounded-full
            bg-[#FFF7E8]/95
            border
            border-[#C9A16A]
            shadow-lg
            flex
            items-center
            justify-center
            text-[#6C472A]
            text-3xl
            transition-transform
            duration-200
            hover:scale-105
          "
        >
          ←
        </button>

        {/* =================================================
            MEMORY TITLE
            ================================================= */}

        <div
          style={{
            position:
              "absolute",

            left:
              LAYOUT.title.left,

            top:
              LAYOUT.title.top,

            width:
              LAYOUT.title.width,

            height:
              LAYOUT.title.height,

            zIndex: 10,

            display:
              "flex",

            alignItems:
              "center",

            justifyContent:
              "center",

            textAlign:
              "center",

            padding:
              "0 2%",
          }}
        >
          <h1
            className="
              text-[42px]
              leading-none
              font-bold
              text-[#5A3820]
            "
            style={{
              fontFamily:
                "Cormorant Garamond, serif",

              textShadow:
                "0 1px 1px rgba(255,255,255,0.35)",
            }}
          >
            {memory.title}
          </h1>
        </div>

        {/* =================================================
            FLOOR DECORATIONS — ROCKING HORSE + TEDDY

            These are decorative only and sit behind the
            interactive diary content. They scale with the
            same 1920 × 1080 master scene.
            ================================================= */}

        <style>
          {`
            @keyframes childPageRockingHorse {
              0% {
                transform: rotate(-4deg);
              }

              25% {
                transform: rotate(0deg);
              }

              50% {
                transform: rotate(4deg);
              }

              75% {
                transform: rotate(0deg);
              }

              100% {
                transform: rotate(-4deg);
              }
            }
          `}
        </style>

        {/* ROCKING HORSE */}
        <img
          src={vintageRockingHorse}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="
            absolute
            pointer-events-none
            select-none
          "
          style={{
            left: LAYOUT.rockingHorse.left,
            top: LAYOUT.rockingHorse.top,
            width: LAYOUT.rockingHorse.width,
            height: "auto",
            transformOrigin: "50% 88%",
            animation: "childPageRockingHorse 2.8s ease-in-out infinite",
            zIndex: 2,
          }}
        />

        {/* TEDDY + PILLOW */}
        <img
          src={vintageTeddyPillow}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="
            absolute
            pointer-events-none
            select-none
          "
          style={{
            right: LAYOUT.teddy.right,
            top: LAYOUT.teddy.top,
            width: LAYOUT.teddy.width,
            height: "auto",
            zIndex: 2,
          }}
        />

        {/* =================================================
            COVER PHOTO
            ================================================= */}

        <div
          style={{
            position:
              "absolute",

            left:
              LAYOUT.cover.left,

            top:
              LAYOUT.cover.top,

            width:
              LAYOUT.cover.width,

            height:
              LAYOUT.cover.height,

            zIndex: 5,

            overflow:
              "hidden",

            borderRadius:
              "1%",
          }}
        >
          <img
            src={coverImage}
            alt={
              memory.title ||
              "Memory cover"
            }
            draggable={false}
            style={{
              width: "100%",

              height: "100%",

              objectFit:
                "cover",

              objectPosition:
                "center",

              display:
                "block",

              userSelect:
                "none",
            }}
          />

          <div
            style={{
              position:
                "absolute",

              inset: 0,

              pointerEvents:
                "none",

              boxShadow:
                "inset 0 0 30px rgba(91, 58, 30, 0.10)",
            }}
          />
        </div>

        {/* =================================================
            OUR STORY
            ================================================= */}

        <section
          style={{
            position:
              "absolute",

            left:
              LAYOUT.story.left,

            top:
              LAYOUT.story.top,

            width:
              LAYOUT.story.width,

            height:
              LAYOUT.story.height,

            zIndex: 6,

            display:
              "flex",

            flexDirection:
              "column",

            alignItems:
              "center",

            textAlign:
              "center",

            padding:
              "0 2%",
          }}
        >
          <h2
            className="
              text-[25px]
              leading-none
              font-bold
              text-[#633F24]
            "
            style={{
              fontFamily:
                "Cormorant Garamond, serif",
            }}
          >
            Our Story
          </h2>

          {story && (
            <p
              className="
                mt-5
                text-[16px]
                leading-6
                text-[#6C513B]
                whitespace-pre-wrap
                overflow-y-auto
              "
              style={{
                maxHeight:
                  "72%",

                width:
                  "100%",

                scrollbarWidth:
                  "none",

                fontFamily:
                  "Cormorant Garamond, serif",
              }}
            >
              {story}
            </p>
          )}
        </section>

        {/* =================================================
            AGE
            ================================================= */}

        {memory.age && (
          <section
            style={{
              position:
                "absolute",

              left:
                LAYOUT.age.left,

              top:
                LAYOUT.age.top,

              width:
                LAYOUT.age.width,

              height:
                LAYOUT.age.height,

              zIndex: 6,

              display:
                "flex",

              alignItems:
                "center",

              justifyContent:
                "center",
            }}
          >
            <div
              className="
                flex
                items-center
                gap-4
                text-[17px]
                text-[#70492B]
              "
            >
              <span
                className="
                  text-[24px]
                "
                aria-hidden="true"
              >
                ♡
              </span>

              <span>
                {memory.age}
              </span>
            </div>
          </section>
        )}

        {/* =================================================
            SUPPORTING MEDIA

            ONLY 3 MEDIA ITEMS ARE DISPLAYED AT A TIME.

            Clicking them opens the COMPLETE gallery.
            ================================================= */}

        <section
          style={{
            position:
              "absolute",

            left:
              LAYOUT.supportingPhotos.left,

            top:
              LAYOUT.supportingPhotos.top,

            width:
              LAYOUT.supportingPhotos.width,

            height:
              LAYOUT.supportingPhotos.height,

            zIndex: 7,
          }}
        >
          {/* SECTION TITLE */}

          <div
            style={{
              position:
                "absolute",

              left: 0,

              right: 0,

              top:
                "-17%",

              textAlign:
                "center",
            }}
            className="
              text-[24px]
              font-semibold
              text-[#633F24]
            "
          >
            More moments from this chapter
          </div>

          {/* PHOTO ROW */}

          <div
            style={{
              width:
                "100%",

              height:
                "100%",

              display:
                "flex",

              alignItems:
                "flex-end",

              justifyContent:
                "center",

              gap:
                "3%",
            }}
          >
            {visiblePhotos.length >
            0 ? (
              visiblePhotos.map(
                (
                  media,
                  index
                ) => {
                  const video =
                    isVideoMedia(
                      media
                    );

                  return (
                    <button
                      key={`${media}-${index}`}
                      type="button"
                      onClick={() =>
                        openPhoto(
                          index
                        )
                      }
                      className="
                        group
                        relative
                        rounded-[10px]
                        bg-[#FFF9EC]
                        border
                        border-[#D6B986]
                        shadow-md
                        p-3
                        transition-all
                        duration-200
                        hover:-translate-y-2
                        hover:shadow-xl
                        focus:outline-none
                        focus:ring-2
                        focus:ring-[#A8753F]
                      "
                      style={{
                        width:
                          "29%",

                        height:
                          "90%",

                        transform:
                          index === 0
                            ? "rotate(-2deg)"
                            : index === 1
                            ? "rotate(1deg)"
                            : "rotate(2deg)",
                      }}
                    >
                      {video ? (
                        <video
                          src={media}
                          controls
                          playsInline
                          onClick={() =>
                            openPhoto(index)
                          }
                          style={{
                            width:
                              "100%",

                            height:
                              "82%",

                            objectFit:
                              "cover",

                            borderRadius:
                              "4px",

                            display:
                              "block",
                          }}
                        />
                      ) : (
                        <img
                          src={media}
                          alt={`Memory photo ${
                            (photoPage - 1) *
                              SUPPORTING_PHOTOS_PER_PAGE +
                            index +
                            1
                          }`}
                          loading="lazy"
                          draggable={false}
                          style={{
                            width:
                              "100%",

                            height:
                              "82%",

                            objectFit:
                              "cover",

                            borderRadius:
                              "4px",

                            display:
                              "block",
                          }}
                        />
                      )}
                    </button>
                  );
                }
              )
            ) : (
              <div
                className="
                  flex
                  items-center
                  justify-center
                  w-full
                  h-full
                  text-[#8A6847]
                  text-lg
                  text-center
                "
                style={{
                  fontFamily:
                    "Cormorant Garamond, serif",
                }}
              >
                This chapter is still gathering
                its little moments.
              </div>
            )}
          </div>
        </section>

        {/* =================================================
            PHOTO PAGINATION

            This controls the photos displayed ON THE PAGE.

            It does NOT restrict the lightbox.
            ================================================= */}

        {totalPhotoPages >
          1 && (
          <div
            style={{
              position:
                "absolute",

              left:
                LAYOUT.photoPagination.left,

              top:
                LAYOUT.photoPagination.top,

              width:
                LAYOUT.photoPagination.width,

              height:
                LAYOUT.photoPagination.height,

              zIndex: 15,

              display:
                "flex",

              alignItems:
                "center",

              justifyContent:
                "center",

              gap:
                "0.7%",
            }}
            aria-label="Memory photo pagination"
          >
            {/* PREVIOUS PAGE */}

            <button
              type="button"
              disabled={
                photoPage === 1
              }
              onClick={() =>
                setPhotoPage(
                  (page) =>
                    Math.max(
                      1,
                      page - 1
                    )
                )
              }
              className="
                rounded-full
                border
                border-[#C6A16C]
                bg-[#F7E7C2]
                text-[#6B482A]
                shadow-sm
                disabled:opacity-35
                disabled:cursor-not-allowed
                transition
                hover:-translate-y-0.5
              "
              style={{
                width:
                  "6%",

                aspectRatio:
                  "1 / 1",

                fontSize:
                  "16px",
              }}
            >
              ←
            </button>

            {/* PAGE NUMBERS */}

            {Array.from(
              {
                length:
                  totalPhotoPages,
              },
              (
                _,
                index
              ) =>
                index + 1
            ).map(
              (page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() =>
                    setPhotoPage(
                      page
                    )
                  }
                  aria-current={
                    photoPage ===
                    page
                      ? "page"
                      : undefined
                  }
                  className={`
                    rounded-full
                    border
                    shadow-sm
                    transition
                    hover:-translate-y-0.5

                    ${
                      photoPage ===
                      page
                        ? "bg-[#A8733F] text-white border-[#A8733F] scale-105"
                        : "bg-[#F7E7C2] text-[#6B482A] border-[#C6A16C]"
                    }
                  `}
                  style={{
                    width:
                      "6%",

                    aspectRatio:
                      "1 / 1",

                    fontSize:
                      "15px",
                  }}
                >
                  {page}
                </button>
              )
            )}

            {/* NEXT PAGE */}

            <button
              type="button"
              disabled={
                photoPage ===
                totalPhotoPages
              }
              onClick={() =>
                setPhotoPage(
                  (page) =>
                    Math.min(
                      totalPhotoPages,
                      page + 1
                    )
                )
              }
              className="
                rounded-full
                border
                border-[#C6A16C]
                bg-[#F7E7C2]
                text-[#6B482A]
                shadow-sm
                disabled:opacity-35
                disabled:cursor-not-allowed
                transition
                hover:-translate-y-0.5
              "
              style={{
                width:
                  "6%",

                aspectRatio:
                  "1 / 1",

                fontSize:
                  "16px",
              }}
            >
              →
            </button>
          </div>
        )}

        {/* =================================================
            PREVIOUS / NEXT MEMORY
            ================================================= */}

        <div
          style={{
            position:
              "absolute",

            left:
              LAYOUT.memoryNavigation.left,

            top:
              LAYOUT.memoryNavigation.top,

            width:
              LAYOUT.memoryNavigation.width,

            height:
              LAYOUT.memoryNavigation.height,

            zIndex: 20,

            display:
              "flex",

            alignItems:
              "center",

            justifyContent:
              "center",

            gap:
              "2%",
          }}
        >
          {previousMemory && (
            <button
              type="button"
              onClick={() =>
                navigate(
                  `/timeline/memory/${previousMemory.slug}`
                )
              }
              className="
                px-5
                py-2
                rounded-full
                bg-[#FFF4DE]/95
                border
                border-[#C6A16C]
                text-[#70492B]
                shadow-md
                text-sm
                font-semibold
                transition
                hover:-translate-y-0.5
              "
            >
              ← Previous
            </button>
          )}

          {nextMemory && (
            <button
              type="button"
              onClick={() =>
                navigate(
                  `/timeline/memory/${nextMemory.slug}`
                )
              }
              className="
                px-5
                py-2
                rounded-full
                bg-[#9B6B3D]
                border
                border-[#82552F]
                text-white
                shadow-md
                text-sm
                font-semibold
                transition
                hover:-translate-y-0.5
              "
            >
              Next →
            </button>
          )}
        </div>
      </div>

      {/* =====================================================
          COMPLETE PHOTO LIGHTBOX
          =====================================================

          IMPORTANT:

          The diary displays only visiblePhotos.

          The lightbox displays supportingPhotos.

          Therefore the lightbox can move through the
          COMPLETE gallery regardless of which diary
          pagination page the user came from.
          ===================================================== */}

      {lightboxIndex !==
        null &&
        lightboxPhotos[
          lightboxIndex
        ] && (
          <div
            className="
              fixed
              inset-0
              z-[9999]
              bg-[#2D2118]/85
              backdrop-blur-sm
              flex
              items-center
              justify-center
              p-8
            "
            onClick={
              closePhoto
            }
          >
            {/* =================================================
                CLOSE
                ================================================= */}

            <button
              type="button"
              onClick={
                closePhoto
              }
              aria-label="Close photo"
              className="
                absolute
                top-6
                right-8
                text-white
                text-5xl
                leading-none
                hover:scale-110
                transition
                z-10
              "
            >
              ×
            </button>

            {/* =================================================
                PREVIOUS PHOTO

                Goes through the COMPLETE gallery.
                ================================================= */}

            {lightboxIndex >
              0 && (
              <button
                type="button"
                onClick={(
                  event
                ) => {
                  event.stopPropagation();

                  previousPhoto();
                }}
                aria-label="Previous photo"
                className="
                  absolute
                  left-8
                  text-white
                  text-7xl
                  hover:scale-110
                  transition
                  z-10
                "
              >
                ‹
              </button>
            )}

            {/* =================================================
                LIGHTBOX MEDIA
                ================================================= */}

            <div
              className="
                relative
                max-w-[82vw]
                max-h-[82vh]
                bg-[#FFF9ED]
                p-4
                rounded-[24px]
                shadow-2xl
              "
              onClick={(
                event
              ) =>
                event.stopPropagation()
              }
            >
              {isVideoMedia(
                lightboxPhotos[
                  lightboxIndex
                ]
              ) ? (
                <video
                  src={
                    lightboxPhotos[
                      lightboxIndex
                    ]
                  }
                  controls
                  autoPlay
                  playsInline
                  className="
                    max-w-[78vw]
                    max-h-[76vh]
                    object-contain
                    rounded-[12px]
                    bg-black
                  "
                />
              ) : (
                <img
                  src={
                    lightboxPhotos[
                      lightboxIndex
                    ]
                  }
                  alt={`Memory photo ${
                    lightboxIndex + 1
                  }`}
                  className="
                    max-w-[78vw]
                    max-h-[76vh]
                    object-contain
                    rounded-[12px]
                  "
                />
              )}

              {/* =================================================
                  COMPLETE GALLERY COUNTER

                  Images and videos are counted together.

                  Example:

                      4 / 12
                  ================================================= */}

              <div
                className="
                  mt-2
                  text-center
                  text-[#70492B]
                  text-sm
                  font-semibold
                "
              >
                {lightboxIndex +
                  1}{" "}
                /{" "}
                {
                  lightboxPhotos.length
                }
              </div>
            </div>

            {/* =================================================
                NEXT PHOTO

                Goes through the COMPLETE gallery.

                Example:

                    Photo 3 → Photo 4
                    Photo 6 → Photo 7
                    Photo 9 → Photo 10
                ================================================= */}

            {lightboxIndex <
              lightboxPhotos.length -
                1 && (
              <button
                type="button"
                onClick={(
                  event
                ) => {
                  event.stopPropagation();

                  nextPhoto();
                }}
                aria-label="Next photo"
                className="
                  absolute
                  right-8
                  text-white
                  text-7xl
                  hover:scale-110
                  transition
                  z-10
                "
              >
                ›
              </button>
            )}
          </div>
        )}
    </main>
  );
}