import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaChevronLeft,
  FaChevronRight,
  FaHeart,
  FaMusic,
} from "react-icons/fa";

import {
  getFavoriteSongBySlug,
} from "../services/favoriteSongService";

import mapFavoriteSong from "../utils/mapFavoriteSong";
import { isVideoMedia } from "../utils/mediaHelpers";

import background from "../assets/illustrations/favsongs/favorite-song-memory-background.png";

/*
|--------------------------------------------------------------------------
| ORIGINAL ARTWORK
|--------------------------------------------------------------------------
|
| The supplied artwork is 1672 × 941.
|
| It is rendered as an IMAGE ELEMENT.
| It is NOT a CSS background.
|
*/

const SCENE_WIDTH = 1672;
const SCENE_HEIGHT = 941;

/*
|--------------------------------------------------------------------------
| LAYOUT
|--------------------------------------------------------------------------
|
| Every position is a percentage of the artwork.
|
| DO NOT change the overall page structure.
|
*/

const POSITIONS = {
  /*
  --------------------------------------------------------------------------
  BACK ARROW
  --------------------------------------------------------------------------
  */

  backButton: {
    left: "1.7%",
    top: "2.0%",
    width: "3.2%",
    height: "3.2%",
  },

  /*
  --------------------------------------------------------------------------
  TITLE
  --------------------------------------------------------------------------
  */

  title: {
    left: "29.5%",
    top: "8.4%",
    width: "43.0%",
    height: "7.0%",
  },

 

  /*
  --------------------------------------------------------------------------
  COVER
  --------------------------------------------------------------------------
  */

  cover: {
    left: "29.5%",
    top: "28.0%",
    width: "13.5%",
    height: "45.0%",
  },

  /*
  --------------------------------------------------------------------------
  STORY
  --------------------------------------------------------------------------
  */

  story: {
    left: "60.0%",
    top: "25.0%",
    width: "21.2%",
    height: "19.0%",
  },

  /*
  --------------------------------------------------------------------------
  THREE MEMORY SLOTS
  --------------------------------------------------------------------------
  */

  memoryOne: {
    left: "47.8%",
    top: "47.0%",
    width: "9.2%",
    height: "28.0%",
  },

  memoryTwo: {
    left: "57.8%",
    top: "47.0%",
    width: "9.2%",
    height: "28.0%",
  },

  memoryThree: {
    left: "67.8%",
    top: "47.0%",
    width: "6.8%",
    height: "28.0%",
  },

  /*
  --------------------------------------------------------------------------
  PAGINATION
  --------------------------------------------------------------------------
  */

  pagination: {
    left: "53.0%",
    top: "78.2%",
    width: "26.8%",
    height: "4.3%",
  },

  /*
  --------------------------------------------------------------------------
  PREVIOUS / NEXT
  --------------------------------------------------------------------------
  */

  previous: {
    left: "24.0%",
    top: "48.0%",
    width: "3.4%",
    height: "6.0%",
  },

  next: {
    left: "79.0%",
    top: "48.0%",
    width: "3.4%",
    height: "6.0%",
  },

  /*
  --------------------------------------------------------------------------
  HIGHLIGHTS
  --------------------------------------------------------------------------
  */

  highlights: {
    left: "55.0%",
    top: "83.0%",
    width: "23.0%",
    height: "7.0%",
  },
};

/*
|--------------------------------------------------------------------------
| GALLERY NORMALIZATION
|--------------------------------------------------------------------------
*/

function normalizeGallery(value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .flat()
      .filter(Boolean)
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (!trimmed) {
      return [];
    }

    /*
    JSON array
    */

    try {
      const parsed = JSON.parse(trimmed);

      if (Array.isArray(parsed)) {
        return parsed
          .flat()
          .filter(Boolean)
          .map((item) => String(item).trim())
          .filter(Boolean);
      }
    } catch {
      // Continue.
    }

    /*
    Comma-separated URLs
    */

    if (trimmed.includes(",")) {
      return trimmed
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return [trimmed];
  }

  return [];
}

/*
|--------------------------------------------------------------------------
| VIDEO NORMALIZATION
|--------------------------------------------------------------------------
|
| Supports the existing single video field as well as an array/string
| if the mapped data happens to contain multiple video URLs.
|
*/

function normalizeVideos(song) {
  const values = [];

  const candidates = [
    song?.videoUrl,
    song?.video_url,
    song?.videos,
    song?.videoUrls,
    song?.video_urls,
  ];

  candidates.forEach((value) => {
    values.push(
      ...normalizeGallery(value)
    );
  });

  return [
    ...new Set(
      values.filter(Boolean)
    ),
  ];
}

/*
|--------------------------------------------------------------------------
| YOUTUBE
|--------------------------------------------------------------------------
*/

function getYouTubeEmbed(url) {
  const match = String(url || "").match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([^?&/]+)/i
  );

  if (!match) {
    return null;
  }

  return `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1`;
}

/*
|--------------------------------------------------------------------------
| VIMEO
|--------------------------------------------------------------------------
*/

function getVimeoEmbed(url) {
  const match = String(url || "").match(
    /vimeo\.com\/(?:video\/)?(\d+)/i
  );

  if (!match) {
    return null;
  }

  return `https://player.vimeo.com/video/${match[1]}`;
}

/*
|--------------------------------------------------------------------------
| DIRECT VIDEO
|--------------------------------------------------------------------------
*/

function isDirectVideo(url) {
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(
    String(url || "")
  );
}

/*
|--------------------------------------------------------------------------
| IS PAGE ARTWORK
|--------------------------------------------------------------------------
|
| Prevent the actual page artwork from accidentally being displayed as
| a memory if it exists somewhere in the gallery data.
|
*/

function isPageArtwork(url) {
  const value = String(url || "").toLowerCase();

  return (
    value.includes(
      "favorite-song-memory-page"
    ) ||
    value.includes(
      "favorite-song-memory-background"
    )
  );
}

/*
|--------------------------------------------------------------------------
| RUSTIC PHOTO FRAME
|--------------------------------------------------------------------------
|
| Soft warm-beige paper frame for every dynamic memory image/video.
| The frame itself scales with the percentage-positioned container.
|
*/

function RusticFrame({
  children,
  className = "",
  isCover = false,
}) {
  return (
    <div
      className={`relative h-full w-full ${
        isCover ? "p-[1.8%]" : "p-[3.5%]"
      } ${className}`}
      style={{
        background:
          "linear-gradient(145deg, #f5e8cf 0%, #e7d2ad 48%, #f1dfc0 100%)",
        border: isCover
          ? "0.35vw solid #c9aa7a"
          : "0.22vw solid #c9aa7a",
        boxShadow: `
          0 0 0 0.12vw #f8edd9,
          0 0 0 0.28vw #b89462,
          0 0.45vw 0.8vw rgba(63, 38, 18, 0.28),
          inset 0 0 0 0.08vw rgba(255,255,255,0.65),
          inset 0 0 1vw rgba(111, 76, 39, 0.14)
        `,
        borderRadius: "0.35%",
      }}
    >
      <div
        className="relative h-full w-full overflow-hidden"
        style={{
          border:
            "0.08vw solid rgba(112, 78, 40, 0.38)",
          boxShadow:
            "inset 0 0 0.7vw rgba(73, 43, 21, 0.18)",
          background: "#ead8b9",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| MEMORY CARD
|--------------------------------------------------------------------------
*/

function MemoryCard({
  memory,
  title,
  onOpen,
}) {
  /*
  Empty slot
  */

  if (!memory) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-transparent">
        <FaMusic className="text-[clamp(12px,1vw,20px)] text-[#8d663d]/25" />
      </div>
    );
  }

  /*
  IMAGE
  */

  if (memory.type === "image") {
    return (
      <div
        className="h-full w-full cursor-pointer"
        onClick={onOpen}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onOpen?.();
          }
        }}
        aria-label="Open memory"
      >
        <RusticFrame>
          <img
            src={memory.src}
            alt={title || "Memory"}
            className="block h-full w-full object-cover"
            draggable="false"
          />
        </RusticFrame>
      </div>
    );
  }

  /*
  YOUTUBE
  */

  const youtube = getYouTubeEmbed(memory.src);

  if (youtube) {
    return (
      <div
        className="h-full w-full cursor-pointer"
        onClick={onOpen}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onOpen?.();
          }
        }}
        aria-label="Open video memory"
      >
        <RusticFrame>
          <iframe
            src={youtube}
            title="Memory video"
            className="pointer-events-none h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </RusticFrame>
      </div>
    );
  }

  /*
  VIMEO
  */

  const vimeo = getVimeoEmbed(memory.src);

  if (vimeo) {
    return (
      <div
        className="h-full w-full cursor-pointer"
        onClick={onOpen}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onOpen?.();
          }
        }}
        aria-label="Open video memory"
      >
        <RusticFrame>
          <iframe
            src={vimeo}
            title="Memory video"
            className="pointer-events-none h-full w-full border-0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </RusticFrame>
      </div>
    );
  }

  /*
  DIRECT VIDEO
  */

  if (isDirectVideo(memory.src)) {
    return (
      <div
        className="h-full w-full cursor-pointer"
        onClick={onOpen}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onOpen?.();
          }
        }}
        aria-label="Open video memory"
      >
        <RusticFrame>
          <video
            src={memory.src}
            muted
            playsInline
            preload="metadata"
            className="pointer-events-none h-full w-full object-cover"
          />
        </RusticFrame>
      </div>
    );
  }

  /*
  FALLBACK
  */

  return (
    <div
      className="h-full w-full cursor-pointer"
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen?.();
        }
      }}
      aria-label="Open memory"
    >
      <RusticFrame>
        <iframe
          src={memory.src}
          title="Memory"
          className="pointer-events-none h-full w-full border-0"
          allowFullScreen
        />
      </RusticFrame>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| MAIN COMPONENT
|--------------------------------------------------------------------------
*/

export default function FavoriteSongMemory() {
  const navigate = useNavigate();
  const { slug } = useParams();

  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);

  /*
  Which group of three memories is being shown.
  */

  const [memoryPage, setMemoryPage] =
    useState(0);

  /*
  --------------------------------------------------------------------------
  | FULL-SCREEN MEMORY LIGHTBOX
  --------------------------------------------------------------------------
  | Uses the complete memories array, including images and videos.
  */

  const [lightboxIndex, setLightboxIndex] =
    useState(null);

  /*
  |--------------------------------------------------------------------------
  | LOAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let mounted = true;

    async function loadMemory() {
      try {
        setLoading(true);

        const data =
          await getFavoriteSongBySlug(slug);

        console.log(
          "FavoriteSongMemory raw:",
          data
        );

        if (!mounted) {
          return;
        }

        if (!data) {
          setSong(null);
          return;
        }

        const mapped =
          mapFavoriteSong(data);

        console.log(
          "FavoriteSongMemory mapped:",
          mapped
        );

        setSong(mapped);
        setMemoryPage(0);
      } catch (error) {
        console.error(
          "FavoriteSongMemory load error:",
          error
        );

        if (mounted) {
          setSong(null);
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
  |--------------------------------------------------------------------------
  | BUILD MEMORY LIST
  |--------------------------------------------------------------------------
  |
  | IMPORTANT:
  |
  | Cover is NOT part of this list.
  |
  | The cover belongs exclusively to the large left frame.
  |
  | The right side contains ONLY actual gallery/video memories.
  |
  */

  const memories = useMemo(() => {
    if (!song) {
      return [];
    }

    const result = [];

    /*
    --------------------------------------------------------------------------
    GALLERY IMAGES
    --------------------------------------------------------------------------
    */

    const gallery = [
      ...normalizeGallery(
        song.gallery
      ),
      ...normalizeGallery(
        song.galleryImages
      ),
      ...normalizeGallery(
        song.gallery_images
      ),
    ];

    const uniqueGallery = [
      ...new Set(gallery),
    ];

    uniqueGallery.forEach(
      (image) => {
        if (!image) {
          return;
        }

        if (
          isPageArtwork(image)
        ) {
          return;
        }

        /*
        If gallery accidentally contains
        the cover, do not duplicate it.
        */

        if (
          song.cover &&
          image === song.cover
        ) {
          return;
        }

        result.push({
          type: isVideoMedia(image)
            ? "video"
            : "image",
          src: image,
        });
      }
    );

    /*
    --------------------------------------------------------------------------
    VIDEOS
    --------------------------------------------------------------------------
    */

    const videos =
      normalizeVideos(song);

    videos.forEach(
      (video) => {
        if (!video) {
          return;
        }

        if (
          isPageArtwork(video)
        ) {
          return;
        }

        result.push({
          type: "video",
          src: video,
        });
      }
    );

    /*
    Remove exact duplicates.
    */

    return result.filter(
      (memory, index, array) =>
        index ===
        array.findIndex(
          (other) =>
            other.type ===
              memory.type &&
            other.src ===
              memory.src
        )
    );
  }, [song]);

  /*
  |--------------------------------------------------------------------------
  | SPLIT INTO GROUPS OF 3
  |--------------------------------------------------------------------------
  |
  | Example:
  |
  | 7 memories:
  |
  | Page 1 = 1,2,3
  | Page 2 = 4,5,6
  | Page 3 = 7
  |
  */

  const memoryPages = useMemo(() => {
    const pages = [];

    for (
      let index = 0;
      index < memories.length;
      index += 3
    ) {
      pages.push(
        memories.slice(
          index,
          index + 3
        )
      );
    }

    return pages;
  }, [memories]);

  /*
  |--------------------------------------------------------------------------
  | CURRENT THREE MEMORIES
  |--------------------------------------------------------------------------
  */

  const currentMemories =
    memoryPages[memoryPage] || [];

  /*
  |--------------------------------------------------------------------------
  | PAGINATION
  |--------------------------------------------------------------------------
  */

  function previousPage() {
    if (
      memoryPages.length <= 1
    ) {
      return;
    }

    setMemoryPage(
      (current) =>
        current === 0
          ? memoryPages.length - 1
          : current - 1
    );
  }

  function nextPage() {
    if (
      memoryPages.length <= 1
    ) {
      return;
    }

    setMemoryPage(
      (current) =>
        current ===
        memoryPages.length - 1
          ? 0
          : current + 1
    );
  }

  function openMemory(index) {
    if (index < 0 || index >= memories.length) {
      return;
    }

    setLightboxIndex(index);
  }

  function closeLightbox() {
    setLightboxIndex(null);
  }

  function previousLightboxMemory() {
    setLightboxIndex((current) => {
      if (current === null || memories.length <= 1) {
        return current;
      }

      return current === 0
        ? memories.length - 1
        : current - 1;
    });
  }

  function nextLightboxMemory() {
    setLightboxIndex((current) => {
      if (current === null || memories.length <= 1) {
        return current;
      }

      return current === memories.length - 1
        ? 0
        : current + 1;
    });
  }

  useEffect(() => {
    if (lightboxIndex === null) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        closeLightbox();
      } else if (event.key === "ArrowLeft") {
        previousLightboxMemory();
      } else if (event.key === "ArrowRight") {
        nextLightboxMemory();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxIndex, memories.length]);

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <main className="fixed inset-0 flex items-center justify-center bg-[#2b1b10]">

        <div className="rounded-full bg-[#ffe6b5] px-8 py-4 text-[#634322] shadow-xl">
          Loading memory…
        </div>

      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | NOT FOUND
  |--------------------------------------------------------------------------
  */

  if (!song) {
    return (
      <main className="fixed inset-0 flex items-center justify-center bg-[#2b1b10]">

        <div className="text-center text-white">

          <p className="mb-5 text-3xl">
            Song Not Found
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/favorite-songs"
              )
            }
            className="rounded-full bg-[#76502f] px-7 py-3"
          >
            Back to Favourite Songs
          </button>

        </div>

      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | MAIN PAGE
  |--------------------------------------------------------------------------
  */

  return (
    <main className="fixed inset-0 overflow-hidden bg-[#2b1b10]">

      {/*
      ========================================================================
      RESPONSIVE 16:9 SCENE
      ========================================================================
      */}

      <div
        className="absolute left-1/2 top-1/2"
        style={{
          width: "100vw",
          aspectRatio:
            `${SCENE_WIDTH} / ${SCENE_HEIGHT}`,
          transform:
            "translate(-50%, -50%)",
        }}
      >

        {/*
        ======================================================================
        THE SUPPLIED ARTWORK
        ======================================================================
        */}

        <img
          src={background}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 z-0 h-full w-full object-fill select-none"
          draggable="false"
        />

        {/*
        ======================================================================
        SMALL BACK BUTTON
        ======================================================================
        */}

        <button
          type="button"
          onClick={() =>
            navigate(
              "/favorite-songs"
            )
          }
          aria-label="Back to Favourite Songs"
          className="absolute z-50 flex items-center justify-center rounded-full bg-[#ffe1ae]/95 text-[#57371e] shadow-[0_3px_8px_rgba(0,0,0,0.25)] transition-transform hover:scale-105"
          style={
            POSITIONS.backButton
          }
        >

          <FaArrowLeft className="text-[clamp(10px,1.1vw,22px)]" />

        </button>

        {/*
        ======================================================================
        SONG TITLE
        ======================================================================
        */}

        <div
          className="absolute z-20 flex items-center justify-center overflow-hidden text-center"
          style={
            POSITIONS.title
          }
        >

          <h1
            className="w-full truncate text-[clamp(18px,2.25vw,45px)] leading-none text-[#432b18]"
            style={{
              fontFamily:
                "Baloo 2",
            }}
          >
            {song.title}
          </h1>

        </div>

        {/*
        ======================================================================
        MEMORY COUNT
        ======================================================================
        */}

        <div
          className="absolute z-20 flex items-center justify-center text-center"
          style={
            POSITIONS.memoryCount
          }
        >

          <span className="text-[clamp(8px,0.9vw,17px)] font-semibold text-[#4c301a]">

            ♥ {memories.length} Memories ♪

          </span>

        </div>

        {/*
        ======================================================================
        LARGE COVER PHOTO
        ======================================================================
        |
        | This is ONLY the cover.
        |
        */}

        <div
          className="absolute z-20 overflow-hidden"
          style={
            POSITIONS.cover
          }
        >

          {song.cover ? (
            <RusticFrame isCover>
              <img
                src={song.cover}
                alt={
                  song.title ||
                  "Cover"
                }
                className="block h-full w-full object-cover"
                draggable="false"
              />
            </RusticFrame>
          ) : (
            <RusticFrame isCover>
              <div className="flex h-full w-full items-center justify-center text-[#725333]">
                <span className="text-[clamp(8px,0.8vw,15px)]">
                  No cover photo
                </span>
              </div>
            </RusticFrame>
          )}

        </div>

        {/*
        ======================================================================
        STORY
        ======================================================================
        */}

        <div
          className="absolute z-20 overflow-hidden"
          style={
            POSITIONS.story
          }
        >

          <div className="h-full w-full px-[3%]">

            <h2
              className="mb-[4%] text-[clamp(12px,1.2vw,24px)] leading-tight text-[#4b301b]"
              style={{
                fontFamily:
                  "Baloo 2",
              }}
            >
              {song.storyTitle ||
                "My Little Star"}{" "}
              <span>☆</span>
            </h2>

            <p className="whitespace-pre-line text-[clamp(7px,0.72vw,14px)] leading-[1.5] text-[#4b301b]">
              {song.story ||
                "A beautiful memory from a very special moment."}
            </p>

          </div>

        </div>

        {/*
        ======================================================================
        MEMORY 1
        ======================================================================
        */}

        <div
          className="absolute z-20 overflow-hidden"
          style={
            POSITIONS.memoryOne
          }
        >

          <MemoryCard
            memory={
              currentMemories[0]
            }
            title={song.title}
            onOpen={() => {
              const memory = currentMemories[0];
              if (!memory) return;

              const index = memories.findIndex(
                (item) =>
                  item.type === memory.type &&
                  item.src === memory.src
              );

              openMemory(index);
            }}
          />

        </div>

        {/*
        ======================================================================
        MEMORY 2
        ======================================================================
        */}

        <div
          className="absolute z-20 overflow-hidden"
          style={
            POSITIONS.memoryTwo
          }
        >

          <MemoryCard
            memory={
              currentMemories[1]
            }
            title={song.title}
            onOpen={() => {
              const memory = currentMemories[1];
              if (!memory) return;

              const index = memories.findIndex(
                (item) =>
                  item.type === memory.type &&
                  item.src === memory.src
              );

              openMemory(index);
            }}
          />

        </div>

        {/*
        ======================================================================
        MEMORY 3
        ======================================================================
        */}

        <div
          className="absolute z-20 overflow-hidden"
          style={
            POSITIONS.memoryThree
          }
        >

          <MemoryCard
            memory={
              currentMemories[2]
            }
            title={song.title}
            onOpen={() => {
              const memory = currentMemories[2];
              if (!memory) return;

              const index = memories.findIndex(
                (item) =>
                  item.type === memory.type &&
                  item.src === memory.src
              );

              openMemory(index);
            }}
          />

        </div>

        {/*
        ======================================================================
        PREVIOUS
        ======================================================================
        */}

        {memoryPages.length > 1 && (
          <button
            type="button"
            onClick={
              previousPage
            }
            aria-label="Previous memories"
            className="absolute z-40 flex items-center justify-center rounded-full bg-[#76502f]/90 text-white shadow-lg transition-transform hover:scale-105"
            style={
              POSITIONS.previous
            }
          >

            <FaChevronLeft />

          </button>
        )}

        {/*
        ======================================================================
        NEXT
        ======================================================================
        */}

        {memoryPages.length > 1 && (
          <button
            type="button"
            onClick={
              nextPage
            }
            aria-label="Next memories"
            className="absolute z-40 flex items-center justify-center rounded-full bg-[#76502f]/90 text-white shadow-lg transition-transform hover:scale-105"
            style={
              POSITIONS.next
            }
          >

            <FaChevronRight />

          </button>
        )}

        {/*
        ======================================================================
        PAGINATION
        ======================================================================
        */}

        {memoryPages.length > 1 && (
          <div
            className="absolute z-40 flex items-center justify-center gap-[2%]"
            style={
              POSITIONS.pagination
            }
          >

            {memoryPages.map(
              (_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() =>
                    setMemoryPage(
                      index
                    )
                  }
                  aria-label={`Memory page ${index + 1}`}
                  className={`h-[45%] w-[4%] rounded-full transition-all ${
                    index ===
                    memoryPage
                      ? "scale-125 bg-[#6c4727]"
                      : "bg-[#b98a52]/60 hover:bg-[#8e673d]"
                  }`}
                />
              )
            )}

          </div>
        )}

        {/*
        ======================================================================
        HIGHLIGHTS
        ======================================================================
        |
        | No hard-coded "Sweet Moments" heading.
        | Only admin-entered highlights are shown.
        |
        */}

        <div
          className="absolute z-20 overflow-hidden"
          style={
            POSITIONS.highlights
          }
        >

          <div className="space-y-[5%] px-[2%]">

            {(song.highlights || [])
              .slice(0, 4)
              .map(
                (
                  highlight,
                  index
                ) => (
                  <div
                    key={`${highlight}-${index}`}
                    className="flex items-start gap-[4%] text-[clamp(7px,0.65vw,13px)] leading-[1.3] text-[#4b301b]"
                  >

                    <FaHeart className="mt-[1%] shrink-0 text-[clamp(6px,0.5vw,10px)] text-[#a45b3d]" />

                    <span>
                      {highlight}
                    </span>

                  </div>
                )
              )}

          </div>

        </div>

      </div>
      

      {lightboxIndex !== null && memories[lightboxIndex] && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#2D2118]/85 p-6 backdrop-blur-sm"
          onClick={closeLightbox}
        >
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              closeLightbox();
            }}
            aria-label="Close memory"
            className="absolute right-6 top-4 z-[10001] text-5xl leading-none text-white transition hover:scale-110"
          >
            ×
          </button>

          {memories.length > 1 && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                previousLightboxMemory();
              }}
              aria-label="Previous memory"
              className="absolute left-4 z-[10001] text-6xl text-white transition hover:scale-110 md:left-8 md:text-7xl"
            >
              ‹
            </button>
          )}

          <div
            className="relative flex max-h-[90vh] max-w-[92vw] items-center justify-center rounded-[24px] bg-[#FFF9ED] p-3 shadow-2xl md:p-4"
            onClick={(event) => event.stopPropagation()}
          >
            {memories[lightboxIndex].type === "image" ? (
              <img
                src={memories[lightboxIndex].src}
                alt={`Memory ${lightboxIndex + 1}`}
                className="max-h-[84vh] max-w-[88vw] rounded-[12px] object-contain"
              />
            ) : getYouTubeEmbed(memories[lightboxIndex].src) ? (
              <iframe
                src={getYouTubeEmbed(memories[lightboxIndex].src)}
                title="Memory video"
                className="h-[70vh] w-[82vw] max-h-[84vh] max-w-[88vw] rounded-[12px] border-0 bg-black"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : getVimeoEmbed(memories[lightboxIndex].src) ? (
              <iframe
                src={getVimeoEmbed(memories[lightboxIndex].src)}
                title="Memory video"
                className="h-[70vh] w-[82vw] max-h-[84vh] max-w-[88vw] rounded-[12px] border-0 bg-black"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                key={memories[lightboxIndex].src}
                src={memories[lightboxIndex].src}
                controls
                autoPlay
                playsInline
                className="max-h-[84vh] max-w-[88vw] rounded-[12px] bg-black object-contain"
              />
            )}
          </div>

          {memories.length > 1 && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                nextLightboxMemory();
              }}
              aria-label="Next memory"
              className="absolute right-4 z-[10001] text-6xl text-white transition hover:scale-110 md:right-8 md:text-7xl"
            >
              ›
            </button>
          )}

          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-black/45 px-4 py-2 text-sm font-semibold text-white">
            {lightboxIndex + 1} / {memories.length}
          </div>
        </div>
      )}
    </main>
  );
}