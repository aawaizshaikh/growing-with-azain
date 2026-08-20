import { useEffect, useMemo } from "react";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import {
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaPlay,
} from "react-icons/fa";

import {
  getDetailImageUrl,
} from "../../utils/supabaseImageUrl";

export default function Lightbox({
  /*
  ==========================================================
  EXISTING MEMORY PAGE SUPPORT
  ==========================================================

  Your existing Memory page still sends:

      images={[...]}

  So this remains supported.
  */

  images = [],

  /*
  ==========================================================
  NEW GALLERY SUPPORT
  ==========================================================

  Gallery sends:

      items={[
        {
          mediaType: "image",
          image: "...",
        },
        {
          mediaType: "video",
          video: "...",
        }
      ]}
  */

  items = [],

  currentIndex,
  setCurrentIndex,

  isOpen,

  onClose,
}) {
  /*
  ==========================================================
  NORMALIZE MEDIA
  ==========================================================

  If Gallery sends "items", use those.

  Otherwise convert the old "images" array into
  image media items.

  This keeps the component backward compatible.
  */

  const mediaItems = useMemo(() => {
    if (
      items &&
      items.length > 0
    ) {
      return items;
    }

    return images.map(
      (image, index) => ({
        id:
          `legacy-image-${index}`,

        mediaType:
          "image",

        image,
      })
    );
  }, [
    items,
    images,
  ]);

  /*
  ==========================================================
  KEYBOARD CONTROLS
  ==========================================================
  */

  useEffect(() => {
    function handleKeyDown(event) {
      if (!isOpen) {
        return;
      }

      if (
        event.key ===
        "Escape"
      ) {
        onClose();
        return;
      }

      if (
        event.key ===
        "ArrowRight"
      ) {
        setCurrentIndex(
          (previous) =>
            previous ===
            mediaItems.length - 1
              ? 0
              : previous + 1
        );

        return;
      }

      if (
        event.key ===
        "ArrowLeft"
      ) {
        setCurrentIndex(
          (previous) =>
            previous === 0
              ? mediaItems.length - 1
              : previous - 1
        );
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
  }, [
    isOpen,
    mediaItems.length,
    onClose,
    setCurrentIndex,
  ]);

  /*
  ==========================================================
  EMPTY / CLOSED
  ==========================================================
  */

  if (
    !isOpen ||
    mediaItems.length === 0
  ) {
    return null;
  }

  /*
  ==========================================================
  CURRENT MEDIA
  ==========================================================
  */

  const currentMedia =
    mediaItems[
      currentIndex
    ];

  if (!currentMedia) {
    return null;
  }

  /*
  ==========================================================
  NAVIGATION
  ==========================================================
  */

  const nextMedia = () => {
    setCurrentIndex(
      (previous) =>
        previous ===
        mediaItems.length - 1
          ? 0
          : previous + 1
    );
  };

  const previousMedia = () => {
    setCurrentIndex(
      (previous) =>
        previous === 0
          ? mediaItems.length - 1
          : previous - 1
    );
  };

  /*
  ==========================================================
  MEDIA TYPE
  ==========================================================
  */

  const isVideo =
    currentMedia.mediaType ===
    "video";

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4"
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        exit={{
          opacity: 0,
        }}
        onClick={onClose}
      >

        {/* ==================================================
            CLOSE
        ================================================== */}

        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 lg:top-8 lg:right-8 z-20 text-white text-3xl lg:text-4xl hover:scale-110 transition"
          aria-label="Close"
        >
          <FaTimes />
        </button>

        {/* ==================================================
            PREVIOUS
        ================================================== */}

        {mediaItems.length > 1 && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              previousMedia();
            }}
            className="absolute left-4 lg:left-8 z-20 text-white text-3xl lg:text-4xl hover:scale-110 transition"
            aria-label="Previous"
          >
            <FaChevronLeft />
          </button>
        )}

        {/* ==================================================
            MEDIA
        ================================================== */}

        <motion.div
          key={
            currentMedia.id ||
            currentIndex
          }
          initial={{
            scale: 0.85,
            opacity: 0,
          }}
          animate={{
            scale: 1,
            opacity: 1,
          }}
          exit={{
            scale: 0.85,
            opacity: 0,
          }}
          transition={{
            duration: 0.25,
          }}
          className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
          onClick={(event) =>
            event.stopPropagation()
          }
        >

          {isVideo ? (

            <div className="relative max-w-[90vw] max-h-[90vh]">

              <video
                key={
                  currentMedia.video
                }
                src={
                  currentMedia.video
                }
                controls
                autoPlay
                playsInline
                className="max-h-[88vh] max-w-[88vw] rounded-3xl shadow-2xl bg-black"
              />

              {/* Video badge */}

              <div className="absolute top-4 left-4 bg-black/70 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-2">
                <FaPlay size={10} />
                VIDEO
              </div>

            </div>

          ) : (

            <img
              key={
                currentMedia.image
              }
              src={
                getDetailImageUrl(
                  currentMedia.image
                )
              }
              alt={
                currentMedia.title ||
                ""
              }
              className="max-h-[90vh] max-w-[90vw] rounded-3xl shadow-2xl object-contain"
            />

          )}

        </motion.div>

        {/* ==================================================
            NEXT
        ================================================== */}

        {mediaItems.length > 1 && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              nextMedia();
            }}
            className="absolute right-4 lg:right-8 z-20 text-white text-3xl lg:text-4xl hover:scale-110 transition"
            aria-label="Next"
          >
            <FaChevronRight />
          </button>
        )}

        {/* ==================================================
            COUNTER
        ================================================== */}

        <div className="absolute bottom-6 lg:bottom-8 left-1/2 -translate-x-1/2 text-white text-base lg:text-lg bg-black/50 px-4 py-2 rounded-full">

          {currentIndex + 1}
          {" / "}
          {mediaItems.length}

        </div>

        {/* ==================================================
            TITLE
        ================================================== */}

        {currentMedia.title && (
          <div className="absolute bottom-6 lg:bottom-8 left-4 lg:left-8 max-w-[35vw] text-white">

            <div className="text-sm lg:text-base font-semibold truncate">
              {currentMedia.title}
            </div>

            {currentMedia.category && (
              <div className="text-xs text-white/70 mt-1 truncate">
                {currentMedia.category}
              </div>
            )}

          </div>
        )}

      </motion.div>
    </AnimatePresence>
  );
}