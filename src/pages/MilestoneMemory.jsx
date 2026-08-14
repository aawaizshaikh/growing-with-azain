import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";


import { getMilestones } from "../services/milestoneService";
import mapMilestone from "../utils/mapMilestone";
import { isVideoMedia } from "../utils/mediaHelpers";

import lionIllustration from "../assets/illustrations/animals/lion.webp";
import parrotIllustration from "../assets/illustrations/animals/parrot.webp";
import butterflyIllustration from "../assets/illustrations/animals/butterfly.webp";
import deerIllustration from "../assets/illustrations/animals/deer-1.webp";

import milestoneBackground from "../assets/illustrations/milestone/milestone-child-forest-background.webp";

/*
  ============================================================
  MILESTONE MEMORY — STORYBOOK CHILD PAGE
  ============================================================

  IMPORTANT:
  - The forest artwork is the exact supplied background image.
  - The artwork is NOT recreated with CSS.
  - Title, story, cover image and gallery media come from Admin.
  - No placeholder/lorem ipsum content is used.
  - Three gallery items are shown at a time.
  - Pagination changes the three visible media items.
  - Clicking a media item opens the existing full-screen lightbox.
  ============================================================
*/

const MEDIA_PER_PAGE = 3;

export default function MilestoneMemory() {
  const navigate = useNavigate();
  const { slug } = useParams();

  const [memory, setMemory] = useState(null);
  const [loading, setLoading] = useState(true);

  const [mediaPage, setMediaPage] = useState(1);

  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  /*
    ------------------------------------------------------------
    LOAD THE ACTUAL MEMORY FROM ADMIN / SUPABASE
    ------------------------------------------------------------
  */
  useEffect(() => {
    let mounted = true;

    async function loadMemory() {
      try {
        const data = await getMilestones();

        const item = (data || []).find(
          (milestone) => milestone.slug === slug
        );

        if (mounted && item) {
          setMemory(mapMilestone(item));
        }
      } catch (err) {
        console.error("Unable to load milestone memory:", err);

        if (mounted) {
          setMemory(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadMemory();

    return () => {
      mounted = false;
    };
  }, [slug]);

  /*
    ------------------------------------------------------------
    COMPLETE GALLERY MEDIA FROM ADMIN
    ------------------------------------------------------------

    This remains the complete media collection.

    Pagination only controls which three are visible.
    The lightbox continues to use the complete collection.
  */
  const galleryMedia = useMemo(() => {
    return (memory?.gallery || [])
      .filter(Boolean)
      .map((item) => String(item).trim())
      .filter(Boolean);
  }, [memory]);

  const totalPages = Math.max(
    1,
    Math.ceil(galleryMedia.length / MEDIA_PER_PAGE)
  );

  /*
    ------------------------------------------------------------
    CURRENT THREE MEDIA ITEMS
    ------------------------------------------------------------
  */
  const visibleMedia = useMemo(() => {
    const start = (mediaPage - 1) * MEDIA_PER_PAGE;

    return galleryMedia.slice(
      start,
      start + MEDIA_PER_PAGE
    );
  }, [galleryMedia, mediaPage]);

  /*
    Keep pagination valid if Admin media changes.
  */
  useEffect(() => {
    setMediaPage((page) =>
      Math.min(Math.max(page, 1), totalPages)
    );
  }, [totalPages]);

  /*
    ------------------------------------------------------------
    LIGHTBOX
    ------------------------------------------------------------
  */

  function openMedia(globalIndex) {
    if (
      globalIndex < 0 ||
      globalIndex >= galleryMedia.length
    ) {
      return;
    }

    setCurrentIndex(globalIndex);
    setIsOpen(true);
  }

  function closeLightbox() {
    setIsOpen(false);
  }

  function previousMedia() {
    setCurrentIndex((current) =>
      current === 0
        ? Math.max(galleryMedia.length - 1, 0)
        : current - 1
    );
  }

  function nextMedia() {
    setCurrentIndex((current) =>
      galleryMedia.length === 0 ||
      current === galleryMedia.length - 1
        ? 0
        : current + 1
    );
  }

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        closeLightbox();
      } else if (event.key === "ArrowLeft") {
        previousMedia();
      } else if (event.key === "ArrowRight") {
        nextMedia();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, galleryMedia.length]);

  /*
    ------------------------------------------------------------
    LOADING
    ------------------------------------------------------------
  */
  if (loading) {
    return (
      <>
        <main className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
          <h1
            className="text-5xl text-[#5D4734]"
            style={{ fontFamily: "Cormorant Garamond, serif" }}
          >
            Loading...
          </h1>
        </main>

      </>
    );
  }

  /*
    ------------------------------------------------------------
    NOT FOUND
    ------------------------------------------------------------
  */
  if (!memory) {
    return (
      <>
        <main className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
          <div className="text-center">
            <h1
              className="text-5xl text-[#5D4734]"
              style={{ fontFamily: "Cormorant Garamond, serif" }}
            >
              Milestone Not Found
            </h1>

            <button
              type="button"
              onClick={() => navigate("/milestones")}
              className="
                mt-8
                px-8
                py-3
                rounded-full
                bg-[#8FAE7A]
                text-white
                font-semibold
              "
            >
              Back to Milestones
            </button>
          </div>
        </main>

      </>
    );
  }

  /*
    ------------------------------------------------------------
    ACTUAL ADMIN CONTENT
    ------------------------------------------------------------
  */

  const title = memory.title || "";
  const story = memory.story || memory.description || "";
  const coverImage =
    memory.coverImage ||
    memory.cover_image ||
    memory.cover ||
    memory.image ||
    "";

  /*
    The visible media need their GLOBAL gallery index for the
    lightbox. Calculate it from the current page.
  */
  const visibleStartIndex =
    (mediaPage - 1) * MEDIA_PER_PAGE;

  /*
    ------------------------------------------------------------
    STORYBOOK SCENE
    ------------------------------------------------------------
  */

  return (
    <>
      <main
        className="
          fixed
          inset-0
          z-[40]
          overflow-hidden
          bg-[#E7D5B5]
        "
      >
        {/*
          The entire illustration uses ONE coordinate system.
          The supplied background and every content element
          scale together.
        */}
        <div
          className="
            absolute
            inset-0
            w-full
            h-full
          "
        >
          {/*
            ------------------------------------------------------
            MASTER BACKGROUND ARTWORK
            ------------------------------------------------------
          */}
          <img
            src={milestoneBackground}
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

          {/*
            ------------------------------------------------------
            BACK BUTTON
            ------------------------------------------------------
          */}
          <button
            type="button"
            onClick={() => navigate("/milestones")}
            aria-label="Back to milestones"
            className="
              absolute
              z-[50]
              flex
              items-center
              justify-center
              w-[44px]
              h-[44px]
              rounded-full
              bg-white/70
              text-[#5D4734]
              shadow-md
              hover:bg-white
              transition
            "
            style={{
              left: "2.2%",
              top: "4.5%",
            }}
          >
            <FaArrowLeft />
          </button>

          {/*
            ------------------------------------------------------
            DECORATIVE ANIMALS
            ------------------------------------------------------

            All four decorations are plain PNG image elements.
            There is NO animation and no other page logic is changed.

            Position/size can be adjusted independently with
            left / top / width percentages.
          */}

          {/* Lion — static PNG */}
          <img
            src={lionIllustration}
            alt=""
            draggable={false}
            className="
              absolute
              z-[25]
              pointer-events-none
              select-none
              object-contain
            "
            style={{
              left: "20.5%",
              top: "76%",
              width: "15%",
              height: "auto",
              transform: "scaleX(-1)",
              
            }}
          />
          {/* Deer — static PNG */}
<img
  src={deerIllustration}
  alt=""
  draggable={false}
  className="
    absolute
    z-[25]
    pointer-events-none
    select-none
    object-contain
  "
  style={{
    left: "75%",
    top: "83%",
    width: "10%",
    height: "auto",
    transform: "scaleX(1)",
  }}
/>

          {/* Parrot — static PNG */}
          <img
            src={parrotIllustration}
            alt=""
            draggable={false}
            className="
              absolute
              z-[13]
              pointer-events-none
              select-none
              object-contain
            "
            style={{
              right: "8%",
              top: "10%",
              width: "7%",
              height: "auto",
            }}
          />

          {/* Butterfly 1 — static PNG */}
          <img
            src={butterflyIllustration}
            alt=""
            draggable={false}
            className="
              absolute
              z-[13]
              pointer-events-none
              select-none
              object-contain
            "
            style={{
              left: "48%",
              bottom: "5%",
              width: "7%",
              height: "auto",
            }}
          />

          {/* Butterfly 2 — static PNG */}
          <img
            src={butterflyIllustration}
            alt=""
            draggable={false}
            className="
              absolute
              z-[13]
              pointer-events-none
              select-none
              object-contain
            "
            style={{
              left: "90%",
              top: "53%",
              width: "7%",
              height: "auto",
            }}
          />

          {/*
            ------------------------------------------------------
            TITLE
            ------------------------------------------------------

            The rectangle itself is already part of the supplied
            artwork. We only place the REAL Admin title over it.
          */}
          <div
            className="
              absolute
              z-[20]
              flex
              items-center
              justify-center
              text-center
              px-8
              overflow-hidden
            "
            style={{
              left: "30.25%",
              top: "8.8%",
              width: "35.55%",
              height: "9.05%",
            }}
          >
            <h1
              className="
                max-w-full
                text-[40px]
                leading-tight
                font-bold
                text-[#241C15]
                break-words
              "
              style={{
                fontFamily: "Cormorant Garamond, serif",
              }}
            >
              {title}
            </h1>
          </div>

          {/*
            ------------------------------------------------------
            COVER PHOTO
            ------------------------------------------------------

            The cream scrapbook frame is already in the artwork.
            The actual Admin cover is inserted inside it.
          */}
          {coverImage ? (
            <button
              type="button"
              onClick={() => {
                if (galleryMedia.length > 0) {
                  const coverIndex = galleryMedia.findIndex(
                    (item) => item === coverImage
                  );

                  if (coverIndex >= 0) {
                    openMedia(coverIndex);
                  }
                }
              }}
              className="
                absolute
                z-[15]
                border-0
                bg-transparent
                p-0
                cursor-pointer
              "
              style={{
                /*
                  COVER POSITION / SIZE

                  These percentages now control the ACTUAL visible
                  cover image rather than an invisible containing box.

                  Change only these four values when fine-tuning:
                    left   = horizontal position
                    top    = vertical position
                    width  = visible photo width

                  Height is intentionally AUTO so the complete Admin
                  photo keeps its original aspect ratio and is never
                  cropped or distorted.
                */
                left: "19.5%",
                top: "28.3%",
                width: "29%",
                height: "52.65%",
              }}
              aria-label="Open cover photo"
            >
              <img
                src={coverImage}
                alt={title}
                draggable={false}
                className="w-full h-full object-fill block"
                 
                style={{
                  /*
                    The supplied scrapbook frame is angled.
                    Rotate ONLY the real photo so the photo follows
                    the angle of the frame.

                    The image itself is NOT cropped.
                  */
                  transform: "rotate(-6deg)",
                  transformOrigin: "center center",
                }}
              />
            </button>
          ) : (
            <div
              className="
                absolute
                z-[15]
                flex
                items-center
                justify-center
                text-center
                text-[#7A6754]
                text-lg
                font-semibold
              "
              style={{
                left: "22.65%",
                top: "41.25%",
                width: "20.25%",
                height: "34.65%",
                transform: "rotate(-8deg)",
                transformOrigin: "center center",
              }}
            >
              No cover photo
            </div>
          )}

          {/*
            ------------------------------------------------------
            OUR STORY
            ------------------------------------------------------

            The parchment panel is already part of the artwork.
            The REAL story from Admin is placed inside it.
          */}
          <div
            className="
              absolute
              z-[20]
              overflow-y-auto
              overflow-x-hidden
              px-8
              py-7
              text-[#2F261E]
              scrollbar-thin
            "
            style={{
              left: "53.35%",
              top: "26.75%",
              width: "29.25%",
              height: "30.5%",
            }}
          >
            <h2
              className="
                text-[22px]
                leading-tight
                font-bold
                text-[#5D4734]
                mb-4
              "
              style={{
                fontFamily: "Cormorant Garamond, serif",
              }}
            >
              Our Story
            </h2>

            <p
              className="
                whitespace-pre-wrap
                text-[17px]
                leading-[1.65]
                font-medium
              "
              style={{
                fontFamily: "Cormorant Garamond, serif",
              }}
            >
              {story}
            </p>
          </div>

          {/*
            ------------------------------------------------------
            GALLERY
            ------------------------------------------------------

            Exactly three Admin media items are shown.

            The tape/card/frame is already part of the artwork.
            We only place the actual media over the image areas.
          */}
          {visibleMedia.map((media, localIndex) => {
            const globalIndex =
              visibleStartIndex + localIndex;

            const video = isVideoMedia(media);

            const slots = [
              {
                left: "53.15%",
                top: "64%",
                width: "9.8%",
                height: "18%",
              },
              {
                left: "65.15%",
                top: "64%",
                width: "9.8%",
                height: "18.4%",
              },
              {
                left: "76.8%",
                top: "64%",
                width: "9.8%",
                height: "18.5%",
              },
            ];

            const slot = slots[localIndex];

            return (
              <button
                key={`${media}-${globalIndex}`}
                type="button"
                onClick={() => openMedia(globalIndex)}
                className="
                  absolute
                  z-[25]
                  overflow-hidden
                  border-0
                  p-0
                  bg-transparent
                  cursor-pointer
                "
                style={slot}
                aria-label={
                  video
                    ? `Open video ${globalIndex + 1}`
                    : `Open image ${globalIndex + 1}`
                }
              >
                {video ? (
                  <video
                    src={media}
                    muted
                    playsInline
                    preload="metadata"
                    className="
                      pointer-events-none
                      block
                      w-full
                      h-full
                      object-cover
                    "
                  />
                ) : (
                  <img
                    src={media}
                    alt=""
                    draggable={false}
                    className="
                      pointer-events-none
                      block
                      w-full
                      h-full
                      object-cover
                    "
                  />
                )}
              </button>
            );
          })}

          {/*
            ------------------------------------------------------
            EMPTY GALLERY SLOTS

            Keep the three scrapbook positions available even if
            Admin has fewer than three media files.
          */}
          {Array.from({
            length: Math.max(
              0,
              MEDIA_PER_PAGE - visibleMedia.length
            ),
          }).map((_, emptyIndex) => {
            const actualSlotIndex =
              visibleMedia.length + emptyIndex;

            const slots = [
              {
                left: "55.15%",
                top: "76.15%",
                width: "6.55%",
                height: "14.25%",
              },
              {
                left: "66.95%",
                top: "78.75%",
                width: "6.55%",
                height: "14.25%",
              },
              {
                left: "78.35%",
                top: "78.05%",
                width: "6.55%",
                height: "14.25%",
              },
            ];

            return (
              <div
                key={`empty-media-${actualSlotIndex}`}
                className="absolute z-[24]"
                style={slots[actualSlotIndex]}
              />
            );
          })}

          {/*
            ------------------------------------------------------
            PAGINATION
            ------------------------------------------------------
          */}
          {galleryMedia.length > MEDIA_PER_PAGE && (
            <div
              className="
                absolute
                z-[60]
                flex
                items-center
                justify-center
                gap-2
              "
              style={{
                left: "68.5%",
                bottom: "12.0%",
                transform: "translateX(-50%)",
              }}
            >
              <button
                type="button"
                onClick={() =>
                  setMediaPage((page) =>
                    page <= 1 ? totalPages : page - 1
                  )
                }
                className="
                  w-8
                  h-8
                  rounded-full
                  bg-[#FFF8E8]/90
                  text-[#5D4734]
                  shadow
                  flex
                  items-center
                  justify-center
                  text-xl
                  hover:bg-white
                  transition
                "
                aria-label="Previous media page"
              >
                ‹
              </button>

              {Array.from(
                { length: totalPages },
                (_, index) => index + 1
              ).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setMediaPage(page)}
                  className={`
                    w-8
                    h-8
                    rounded-full
                    flex
                    items-center
                    justify-center
                    text-sm
                    font-semibold
                    transition
                    ${
                      mediaPage === page
                        ? "bg-[#6F5A42] text-white shadow"
                        : "bg-[#FFF8E8]/90 text-[#5D4734] hover:bg-white"
                    }
                  `}
                  aria-label={`Gallery page ${page}`}
                  aria-current={
                    mediaPage === page ? "page" : undefined
                  }
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                onClick={() =>
                  setMediaPage((page) =>
                    page >= totalPages ? 1 : page + 1
                  )
                }
                className="
                  w-8
                  h-8
                  rounded-full
                  bg-[#FFF8E8]/90
                  text-[#5D4734]
                  shadow
                  flex
                  items-center
                  justify-center
                  text-xl
                  hover:bg-white
                  transition
                "
                aria-label="Next media page"
              >
                ›
              </button>
            </div>
          )}
        </div>
      </main>

      {/*
        ----------------------------------------------------------
        FULL-SCREEN LIGHTBOX
        ----------------------------------------------------------
      */}
      {isOpen && galleryMedia[currentIndex] && (
        <div
          className="
            fixed
            inset-0
            z-[9999]
            bg-[#2D2118]/90
            backdrop-blur-sm
            flex
            items-center
            justify-center
            p-6
          "
          onClick={closeLightbox}
        >
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              closeLightbox();
            }}
            aria-label="Close media"
            className="
              absolute
              top-4
              right-6
              z-[10001]
              text-white
              text-5xl
              leading-none
              hover:scale-110
              transition
            "
          >
            ×
          </button>

          {galleryMedia.length > 1 && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                previousMedia();
              }}
              aria-label="Previous media"
              className="
                absolute
                left-4
                md:left-8
                z-[10001]
                text-white
                text-6xl
                md:text-7xl
                hover:scale-110
                transition
              "
            >
              ‹
            </button>
          )}

          <div
            className="
              relative
              max-w-[92vw]
              max-h-[90vh]
              bg-[#FFF9ED]
              p-3
              md:p-4
              rounded-[24px]
              shadow-2xl
              flex
              items-center
              justify-center
            "
            onClick={(event) => event.stopPropagation()}
          >
            {isVideoMedia(
              galleryMedia[currentIndex]
            ) ? (
              <video
                key={galleryMedia[currentIndex]}
                src={galleryMedia[currentIndex]}
                controls
                autoPlay
                playsInline
                className="
                  max-w-[88vw]
                  max-h-[84vh]
                  object-contain
                  rounded-[12px]
                  bg-black
                "
              />
            ) : (
              <img
                src={galleryMedia[currentIndex]}
                alt={`Memory ${currentIndex + 1}`}
                className="
                  max-w-[88vw]
                  max-h-[84vh]
                  object-contain
                  rounded-[12px]
                "
              />
            )}
          </div>

          {galleryMedia.length > 1 && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                nextMedia();
              }}
              aria-label="Next media"
              className="
                absolute
                right-4
                md:right-8
                z-[10001]
                text-white
                text-6xl
                md:text-7xl
                hover:scale-110
                transition
              "
            >
              ›
            </button>
          )}

          <div
            className="
              absolute
              bottom-5
              left-1/2
              -translate-x-1/2
              rounded-full
              bg-black/45
              px-4
              py-2
              text-sm
              font-semibold
              text-white
            "
          >
            {currentIndex + 1} / {galleryMedia.length}
          </div>
        </div>
      )}
    </>
  );
}