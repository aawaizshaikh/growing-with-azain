import { useEffect, useMemo, useState } from "react";

import backgroundImage from "../../assets/illustrations/space/space-memory-galaxy.webp";
import earthImage from "../../assets/illustrations/space/planet-earth.webp";
import jupiterImage from "../../assets/illustrations/space/planet-jupiter.webp";
import saturnImage from "../../assets/illustrations/space/planet-saturn.webp";
import moonImage from "../../assets/illustrations/space/moon.webp";
import astronautImage from "../../assets/illustrations/space/astronaut.webp";
import rocketImage from "../../assets/illustrations/space/rocket.webp";


/* ======================================================
   SPACE ILLUSTRATIONS

   Every illustration is positioned as a percentage
   of the actual Space artwork.

   They remain completely independent from the
   memory layer.
====================================================== */

const PLANETS = [
  {
    id: "earth",
    src: earthImage,
    className: "galaxy-planet-earth",
    style: {
      left: "8%",
      top: "20%",
      width: "15%",
    },
  },

  {
    id: "jupiter",
    src: jupiterImage,
    className: "galaxy-planet-jupiter",
    style: {
      left: "90%",
      top: "18%",
      width: "25%",
    },
  },

  {
    id: "saturn",
    src: saturnImage,
    className: "galaxy-planet-saturn",
    style: {
      left: "90%",
      top: "88%",
      width: "19%",
    },
  },

  {
    id: "moon",
    src: moonImage,
    className: "galaxy-planet-moon",
    style: {
      left: "10%",
      top: "72%",
      width: "10%",
    },
  },
];


/* ======================================================
   GALLERY IMAGE SOURCE

   Media is now delivered through the Cloudflare R2
   media Worker.

   R2 does not use the old Supabase Storage image
   transformation endpoint, so the database/media URL
   must be used directly.

   The images themselves are already optimized by the
   existing global image-upload/migration pipeline.
====================================================== */

function getGalleryImageSource(source) {
  if (
    typeof source !== "string" ||
    !source.trim()
  ) {
    return null;
  }

  return source.trim();
}


/* ======================================================
   MEDIA VALIDATION

   Only memories that actually contain usable media
   are allowed into the Space scene.

   This is important because previously the layout
   created positions for items that had no image/video,
   which resulted in the large cream circles.
====================================================== */

function hasUsableMedia(item) {
  if (!item) {
    return false;
  }

  const hasImage =
    typeof item.image === "string" &&
    item.image.trim().length > 0;

  const hasVideo =
    typeof item.video === "string" &&
    item.video.trim().length > 0;

  return hasImage || hasVideo;
}


/* ======================================================
   MEMORY ORBIT LAYOUT

   The memories are distributed around AZAIN.

   The layout uses percentage coordinates relative to
   the Space artwork.

   No canvas.
   No generated mosaic.
   No image processing.

   Every memory remains an ordinary HTML element.
====================================================== */

function createOrbitLayout(items) {
  const mediaItems =
    items.filter(hasUsableMedia);

  if (!mediaItems.length) {
    return [];
  }

  /*
   * Keep the centre clear for AZAIN.
   *
   * The first ring starts far enough away from the
   * centre so memories don't cover the name.
   */
  const MIN_RADIUS = 18;

  /*
   * Maximum horizontal distance from the centre.
   *
   * Keeping this below 45% ensures memories remain
   * inside the Space artwork.
   */
  const MAX_RADIUS = 42;

  /*
   * Number of rings adapts to the number of memories.
   *
   * More memories = more rings.
   *
   * The maximum is deliberately capped so the Space
   * scene does not become unusably dense.
   */
  const ringCount = Math.max(
    1,
    Math.min(
      9,
      Math.ceil(
        mediaItems.length / 65
      )
    )
  );

  /*
   * Create evenly spaced radii.
   *
   * Example:
   *
   * 1 ring  -> 42%
   * 2 rings -> 18%, 42%
   * 3 rings -> 18%, 30%, 42%
   */
  const radii = Array.from(
    { length: ringCount },
    (_, index) => {
      if (ringCount === 1) {
        return MAX_RADIUS;
      }

      return (
        MIN_RADIUS +
        (
          (MAX_RADIUS - MIN_RADIUS) *
          index
        ) /
        (ringCount - 1)
      );
    }
  );

  /*
   * Give larger rings more memories because they
   * physically have more circumference.
   */
  const radiusWeights =
    radii.map(
      (radius) => radius
    );

  const totalWeight =
    radiusWeights.reduce(
      (sum, value) =>
        sum + value,
      0
    );

  const counts =
    radii.map(
      (radius) =>
        Math.floor(
          (
            mediaItems.length *
            radius
          ) /
          totalWeight
        )
    );

  /*
   * Make sure every memory gets a position.
   */
  let remaining =
    mediaItems.length -
    counts.reduce(
      (sum, value) =>
        sum + value,
      0
    );

  let ringIndexForRemaining =
    counts.length - 1;

  while (remaining > 0) {
    counts[
      ringIndexForRemaining
    ] += 1;

    remaining -= 1;

    ringIndexForRemaining -= 1;

    if (
      ringIndexForRemaining < 0
    ) {
      ringIndexForRemaining =
        counts.length - 1;
    }
  }

  const positions = [];

  let itemIndex = 0;

  /*
   * Slightly stagger every second ring.
   *
   * This prevents all the memories from lining up
   * vertically across every ring.
   */
  radii.forEach(
    (
      radius,
      currentRingIndex
    ) => {
      const count =
        counts[currentRingIndex];

      if (!count) {
        return;
      }

      const stagger =
        currentRingIndex % 2 === 0
          ? 0
          : Math.PI / count;

      for (
        let positionIndex = 0;
        positionIndex < count;
        positionIndex += 1
      ) {
        const angle =
          (
            positionIndex /
            count
          ) *
          Math.PI *
          2 -
          Math.PI / 2 +
          stagger;

        /*
         * Horizontal position.
         *
         * 50% is the centre of the Space artwork.
         */
        const x =
          50 +
          Math.cos(angle) *
          radius;

        /*
         * The background is 16:9, therefore the
         * vertical orbit needs compression.
         *
         * This keeps the orbit visually circular/
         * elliptical inside the actual artwork.
         */
        const y =
          50 +
          Math.sin(angle) *
          radius *
          0.60;

        positions.push({
          item:
            mediaItems[itemIndex],
          x,
          y,
          ringIndex:
            currentRingIndex,
          angle,
        });

        itemIndex += 1;
      }
    }
  );

  return positions;
}


/* ======================================================
   INDIVIDUAL MEMORY

   Each memory is a real HTML element.

   No placeholder element is created when media is
   unavailable.
====================================================== */

function MemoryOrbitItem({
  entry,
  onOpen,
  memorySize,
}) {
  const {
    item,
    x,
    y,
  } = entry;

  const isVideo =
    item.mediaType === "video" ||
    (
      !item.image &&
      typeof item.video === "string" &&
      item.video.trim().length > 0
    );

  const imageSource =
    typeof item.image === "string" &&
    item.image.trim().length > 0
      ? item.image
      : null;

  const videoSource =
    typeof item.video === "string" &&
    item.video.trim().length > 0
      ? item.video
      : null;

  /*
   * This should never happen because createOrbitLayout
   * filters invalid media first.
   *
   * The guard is kept here as an additional safety net.
   */
  if (
    !imageSource &&
    !videoSource
  ) {
    return null;
  }

  const galleryImageSource =
    imageSource
      ? getGalleryImageSource(
          imageSource
        )
      : null;

  return (
    <button
      type="button"
      className="memory-galaxy-item"
      style={{
        position: "absolute",

        /*
         * Percentage positioning relative to the
         * Space artwork.
         */
        left: `${x}%`,
        top: `${y}%`,

        /*
         * The memory itself is centred on the
         * calculated orbit coordinate.
         */
        transform:
          "translate(-50%, -50%)",

        width: memorySize,
        height: memorySize,

        /*
         * IMPORTANT:
         *
         * The old cream circles came from the
         * memory item styling.
         *
         * Explicitly remove every visual surface
         * from the button itself.
         */
        padding: 0,
        margin: 0,
        border: "none",
        outline: "none",
        background: "transparent",
        boxShadow: "none",

        /*
         * The media itself provides the visual.
         */
        borderRadius: "50%",
        overflow: "hidden",

        /*
         * Make sure it stays above the artwork.
         */
        zIndex: 20,

        /*
         * Preserve the existing interaction.
         */
        cursor: "pointer",
      }}
      onClick={(event) => {
        event.stopPropagation();
        onOpen?.(item);
      }}
      aria-label={
        isVideo
          ? "Open memory video"
          : "Open memory photo"
      }
    >
      {isVideo && videoSource ? (
        /*
         * If the video has a supplied image/thumbnail,
         * use that as the visible thumbnail.
         *
         * Otherwise show the video itself.
         */
        galleryImageSource ? (
          <img
            src={galleryImageSource}
            alt=""
            className="memory-galaxy-media"
            draggable="false"
            loading="lazy"
            decoding="async"
            style={{
              display: "block",
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "50%",
            }}
          />
        ) : (
          <video
            src={videoSource}
            muted
            playsInline
            preload="metadata"
            className="memory-galaxy-media"
            style={{
              display: "block",
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "50%",
            }}
          />
        )
      ) : (
        <img
          src={galleryImageSource}
          alt=""
          className="memory-galaxy-media"
          draggable="false"
          loading="lazy"
          decoding="async"
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "50%",
          }}
        />
      )}

      {isVideo && (
        <span
          className="memory-galaxy-video-badge"
          style={{
            position: "absolute",
            right: "4%",
            bottom: "4%",

            width: "28%",
            height: "28%",

            display: "flex",
            alignItems: "center",
            justifyContent: "center",

            borderRadius: "50%",

            background:
              "rgba(255,255,255,0.90)",

            color: "#27415c",

            fontSize:
              "clamp(7px, 0.7vw, 12px)",
            lineHeight: 1,

            pointerEvents: "none",

            boxShadow:
              "0 2px 6px rgba(0,0,0,0.20)",
          }}
        >
          ▶
        </span>
      )}
    </button>
  );
}


/* ======================================================
   MAIN MEMORY GALAXY

   STRUCTURE:

   ┌─────────────────────────────────────────────┐
   │                                             │
   │        ACTUAL SPACE IMAGE                  │
   │                                             │
   │    planets / stars / astronaut / rocket     │
   │                                             │
   │              memory orbit                  │
   │                  AZAIN                     │
   │                                             │
   └─────────────────────────────────────────────┘

   The Space PNG is an actual image element.

   Everything else is positioned above it.
====================================================== */

export default function MemoryGalaxy({
  items = [],
  onOpen,
}) {
  /*
   * Only usable image/video memories are included.
   */
  const mediaItems = useMemo(
    () =>
      items.filter(
        hasUsableMedia
      ),
    [items]
  );

  /*
   * Calculate the orbit positions.
   *
   * This recalculates only when the actual memory
   * collection changes.
   */
  const orbitItems = useMemo(
    () =>
      createOrbitLayout(
        mediaItems
      ),
    [mediaItems]
  );

  /*
  ====================================================
  PROGRESSIVE MEMORY LOADING

  The complete memory collection is still retained.

  We only mount the memories in batches so the browser
  does not try to create/load hundreds of image
  elements at the exact same moment.

  First batch:
      100 memories

  Following batches:
      100 memories every 300ms

  This is NOT a limit. Eventually every memory is
  rendered.
  ====================================================
  */

  const MEMORY_BATCH_SIZE = 100;
  const MEMORY_BATCH_DELAY = 300;

  const [visibleMemoryCount, setVisibleMemoryCount] =
    useState(
      Math.min(
        MEMORY_BATCH_SIZE,
        orbitItems.length
      )
    );

  useEffect(() => {

    setVisibleMemoryCount(
      Math.min(
        MEMORY_BATCH_SIZE,
        orbitItems.length
      )
    );

    if (
      orbitItems.length <= MEMORY_BATCH_SIZE
    ) {
      return undefined;
    }

    let cancelled = false;
    let timeoutId;

    const loadNextBatch = () => {

      if (cancelled) {
        return;
      }

      setVisibleMemoryCount((currentCount) => {

        if (
          currentCount >= orbitItems.length
        ) {
          return currentCount;
        }

        const nextCount =
          Math.min(
            currentCount +
              MEMORY_BATCH_SIZE,
            orbitItems.length
          );

        if (
          nextCount < orbitItems.length
        ) {
          timeoutId = setTimeout(
            loadNextBatch,
            MEMORY_BATCH_DELAY
          );
        }

        return nextCount;

      });

    };

    timeoutId = setTimeout(
      loadNextBatch,
      MEMORY_BATCH_DELAY
    );

    return () => {

      cancelled = true;

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

    };

  }, [orbitItems.length]);

  const visibleOrbitItems =
    orbitItems.slice(
      0,
      visibleMemoryCount
    );

  /* ====================================================
     MEMORY SIZE

     The thumbnails become progressively smaller as
     the collection becomes larger.

     This means adding memories does not cause the
     scene to overflow immediately.
  ==================================================== */

  const memorySize =
    mediaItems.length > 1200
      ? "clamp(15px, 1.35vw, 23px)"
      : mediaItems.length > 900
        ? "clamp(17px, 1.5vw, 25px)"
        : mediaItems.length > 600
          ? "clamp(19px, 1.7vw, 28px)"
          : mediaItems.length > 400
            ? "clamp(21px, 1.9vw, 31px)"
            : mediaItems.length > 250
              ? "clamp(23px, 2vw, 34px)"
              : mediaItems.length > 100
                ? "clamp(25px, 2.15vw, 37px)"
                : "clamp(27px, 2.3vw, 41px)";

  return (
    <div
      className="memory-galaxy-stage"
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* =================================================
          ACTUAL SPACE BACKGROUND

          This is an IMAGE element.

          It is NOT a CSS background.

          Everything else is layered over it.
      ================================================== */}

      <img
        src={backgroundImage}
        alt=""
        className="memory-galaxy-background"
        draggable="false"
        loading="eager"
        fetchPriority="high"
        decoding="async"
        style={{
          position: "absolute",
          inset: 0,

          width: "100%",
          height: "100%",

          objectFit: "cover",

          display: "block",

          zIndex: 0,

          pointerEvents: "none",
          userSelect: "none",
        }}
      />


      {/* =================================================
          PLANETS / MOON

          These remain completely independent from
          the memory orbit.

          Their existing CSS animations can continue
          to control them.
      ================================================== */}

      {PLANETS.map((planet) => (
        <div
          key={planet.id}
          className={
            `memory-galaxy-illustration ${planet.className}`
          }
          style={{
            position: "absolute",

            ...planet.style,

            zIndex: 5,

            pointerEvents: "none",
          }}
        >
          <img
            src={planet.src}
            alt=""
            className="memory-galaxy-illustration-image"
            draggable="false"
            loading="eager"
            decoding="async"
            style={{
              display: "block",
              width: "100%",
              height: "auto",
            }}
          />
        </div>
      ))}


      {/* =================================================
          AZAIN CENTRE

          Static.

          The memory orbit is calculated around this
          centre point.
      ================================================== */}

      <div
        className="memory-galaxy-center"
        style={{
          position: "absolute",

          left: "50%",
          top: "50%",

          transform:
            "translate(-50%, -50%)",

          zIndex: 12,

          textAlign: "center",

          pointerEvents: "none",

          whiteSpace: "nowrap",
        }}
      >
        <div className="memory-galaxy-center-name">
          AZAIN
        </div>

        <div className="memory-galaxy-center-line">
          A little life made of a
          thousand little moments.
        </div>
      </div>


      {/* =================================================
          MEMORY LAYER

          Every photo/video is placed directly on the
          Space artwork.

          There is:

          NO canvas
          NO mosaic generation
          NO separate gallery
          NO lower image section
          NO placeholder circles
      ================================================== */}

      <div
        className="memory-galaxy-memory-layer"
        aria-label="AZAIN memories"
        style={{
          position: "absolute",

          inset: 0,

          zIndex: 20,

          pointerEvents: "none",
        }}
      >
        {visibleOrbitItems.map((entry) => (
          <div
            key={entry.item.id}
            style={{
              position: "absolute",

              left: 0,
              top: 0,

              width: "100%",
              height: "100%",

              pointerEvents: "none",
            }}
          >
            <div
              style={{
                position: "absolute",

                left: `${entry.x}%`,
                top: `${entry.y}%`,

                width: memorySize,
                height: memorySize,

                transform:
                  "translate(-50%, -50%)",

                pointerEvents: "auto",
              }}
            >
              <MemoryOrbitItem
                entry={{
                  ...entry,

                  /*
                   * The inner MemoryOrbitItem receives
                   * the same percentage position.
                   */
                  x: 0,
                  y: 0,
                }}
                onOpen={onOpen}
                memorySize="100%"
              />
            </div>
          </div>
        ))}
      </div>


      {/* =================================================
          ROCKET

          Independent decorative element.
      ================================================== */}

      <img
        src={rocketImage}
        alt=""
        className="memory-galaxy-rocket"
        draggable="false"
        loading="eager"
        decoding="async"
        style={{
          position: "absolute",
          zIndex: 7,
          pointerEvents: "none",
          userSelect: "none",
        }}
      />


      {/* =================================================
          ASTRONAUT

          Independent slow-flight element.

          Existing CSS animation can control the
          movement.
      ================================================== */}

      <img
        src={astronautImage}
        alt=""
        className="memory-galaxy-astronaut"
        draggable="false"
        loading="eager"
        decoding="async"
        style={{
          position: "absolute",
          zIndex: 25,
          pointerEvents: "none",
          userSelect: "none",
        }}
      />
    </div>
  );
}