const TILE_REFERENCE_SIZE = 24;

/*
===============================================================================
AZAIN MOSAIC
===============================================================================

The PNG is the visual source of truth.

We do NOT recreate AZAIN with a font.

The PNG supplies:

    - exact letter placement
    - exact proportions
    - exact spacing
    - exact background
    - exact decorative artwork

The memory canvas is transparent and sits over the PNG.

===============================================================================
*/

const BACKGROUND_WIDTH =
  1842;

const BACKGROUND_HEIGHT =
  1024;

/*
===============================================================================
LETTER REGIONS

These are the measured AZAIN regions in the supplied artwork.

They are used as a first-pass safety boundary.

The actual letter mask is then extracted from the PNG pixels inside
these regions.

===============================================================================
*/

const LETTER_REGIONS = [
  {
    name: "A",
    x: 252,
    y: 312,
    width: 266,
    height: 350,
  },

  {
    name: "Z",
    x: 558,
    y: 312,
    width: 242,
    height: 350,
  },

  {
    name: "A",
    x: 840,
    y: 312,
    width: 266,
    height: 350,
  },

  {
    name: "I",
    x: 1146,
    y: 312,
    width: 94,
    height: 350,
  },

  {
    name: "N",
    x: 1280,
    y: 312,
    width: 226,
    height: 350,
  },
];

/*
===============================================================================
CANVAS
===============================================================================
*/

function createCanvas(
  width,
  height
) {
  const canvas =
    document.createElement(
      "canvas"
    );

  canvas.width =
    width;

  canvas.height =
    height;

  return canvas;
}

/*
===============================================================================
IMAGE LOADING
===============================================================================
*/

function loadImage(url) {
  return new Promise(
    (resolve, reject) => {
      const image =
        new Image();

      image.crossOrigin =
        "anonymous";

      image.decoding =
        "async";

      image.onload = () =>
        resolve(image);

      image.onerror = () =>
        reject(
          new Error(
            `Unable to load image: ${url}`
          )
        );

      image.src = url;
    }
  );
}

/*
===============================================================================
VIDEO FRAME
===============================================================================
*/

function waitForVideoEvent(
  video,
  eventName
) {
  return new Promise(
    (resolve, reject) => {
      const handleEvent =
        () => {
          cleanup();
          resolve();
        };

      const handleError =
        () => {
          cleanup();

          reject(
            new Error(
              "Unable to load video."
            )
          );
        };

      function cleanup() {
        video.removeEventListener(
          eventName,
          handleEvent
        );

        video.removeEventListener(
          "error",
          handleError
        );
      }

      video.addEventListener(
        eventName,
        handleEvent,
        {
          once: true,
        }
      );

      video.addEventListener(
        "error",
        handleError,
        {
          once: true,
        }
      );
    }
  );
}

async function loadVideoFrame(
  url
) {
  const video =
    document.createElement(
      "video"
    );

  video.crossOrigin =
    "anonymous";

  video.muted = true;

  video.playsInline =
    true;

  video.preload =
    "metadata";

  video.src = url;

  try {
    await waitForVideoEvent(
      video,
      "loadedmetadata"
    );

    const duration =
      Number.isFinite(
        video.duration
      )
        ? video.duration
        : 0;

    const targetTime =
      duration > 0
        ? Math.min(
            duration * 0.2,
            Math.max(
              0,
              duration - 0.1
            )
          )
        : 0;

    if (
      targetTime > 0
    ) {
      video.currentTime =
        targetTime;

      await waitForVideoEvent(
        video,
        "seeked"
      );
    } else if (
      video.readyState < 2
    ) {
      await waitForVideoEvent(
        video,
        "loadeddata"
      );
    }

    const canvas =
      createCanvas(
        TILE_REFERENCE_SIZE,
        TILE_REFERENCE_SIZE
      );

    const context =
      canvas.getContext(
        "2d",
        {
          willReadFrequently:
            true,
        }
      );

    drawCover(
      context,
      video,
      0,
      0,
      TILE_REFERENCE_SIZE,
      TILE_REFERENCE_SIZE
    );

    return canvas;
  } finally {
    video.pause();

    video.removeAttribute(
      "src"
    );

    video.load();
  }
}

/*
===============================================================================
DRAW COVER
===============================================================================
*/

function drawCover(
  context,
  source,
  x,
  y,
  width,
  height
) {
  const sourceWidth =
    source.videoWidth ||
    source.naturalWidth ||
    source.width;

  const sourceHeight =
    source.videoHeight ||
    source.naturalHeight ||
    source.height;

  if (
    !sourceWidth ||
    !sourceHeight
  ) {
    return;
  }

  const sourceRatio =
    sourceWidth /
    sourceHeight;

  const targetRatio =
    width /
    height;

  let sx = 0;
  let sy = 0;

  let sw =
    sourceWidth;

  let sh =
    sourceHeight;

  if (
    sourceRatio >
    targetRatio
  ) {
    sw =
      sourceHeight *
      targetRatio;

    sx =
      (sourceWidth -
        sw) /
      2;
  } else {
    sh =
      sourceWidth /
      targetRatio;

    sy =
      (sourceHeight -
        sh) /
      2;
  }

  context.drawImage(
    source,
    sx,
    sy,
    sw,
    sh,
    x,
    y,
    width,
    height
  );
}

/*
===============================================================================
AVERAGE COLOR
===============================================================================
*/

function getAverageColor(
  canvas
) {
  const context =
    canvas.getContext(
      "2d",
      {
        willReadFrequently:
          true,
      }
    );

  const data =
    context.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    ).data;

  let r = 0;
  let g = 0;
  let b = 0;
  let count = 0;

  for (
    let index = 0;
    index <
    data.length;
    index += 4
  ) {
    if (
      data[index + 3] <
      10
    ) {
      continue;
    }

    r += data[index];
    g +=
      data[index + 1];

    b +=
      data[index + 2];

    count += 1;
  }

  if (!count) {
    return {
      r: 128,
      g: 128,
      b: 128,
    };
  }

  return {
    r: r / count,
    g: g / count,
    b: b / count,
  };
}

/*
===============================================================================
CREATE MEDIA THUMBNAIL
===============================================================================
*/

function createThumbnail(
  source
) {
  const canvas =
    createCanvas(
      TILE_REFERENCE_SIZE,
      TILE_REFERENCE_SIZE
    );

  const context =
    canvas.getContext(
      "2d",
      {
        willReadFrequently:
          true,
      }
    );

  drawCover(
    context,
    source,
    0,
    0,
    TILE_REFERENCE_SIZE,
    TILE_REFERENCE_SIZE
  );

  return {
    canvas,

    average:
      getAverageColor(
        canvas
      ),
  };
}

async function createMediaThumbnail(
  item
) {
  try {
    if (
      item.mediaType ===
        "video" &&
      item.video
    ) {
      const frame =
        await loadVideoFrame(
          item.video
        );

      return createThumbnail(
        frame
      );
    }

    if (
      item.image
    ) {
      const image =
        await loadImage(
          item.image
        );

      return createThumbnail(
        image
      );
    }
  } catch (error) {
    console.warn(
      "Skipping mosaic media:",
      error
    );
  }

  return null;
}

/*
===============================================================================
PIXEL HELPERS
===============================================================================
*/

function colorDistance(
  r1,
  g1,
  b1,
  r2,
  g2,
  b2
) {
  return Math.sqrt(
    Math.pow(
      r1 - r2,
      2
    ) +
      Math.pow(
        g1 - g2,
        2
      ) +
      Math.pow(
        b1 - b2,
        2
      )
  );
}

/*
===============================================================================
LETTER MASK EXTRACTION
===============================================================================

The PNG is read at its native 1842 x 1024 coordinate system.

We look only inside the five measured letter regions.

The important part is that we don't use a font.

Instead, we detect the actual interior of the artwork.

The detection intentionally excludes:

    - background
    - decorative objects
    - clouds
    - stars
    - surrounding artwork

===============================================================================
*/

function buildLetterMask(
  backgroundImage
) {
  const canvas =
    createCanvas(
      BACKGROUND_WIDTH,
      BACKGROUND_HEIGHT
    );

  const context =
    canvas.getContext(
      "2d",
      {
        willReadFrequently:
          true,
      }
    );

  context.drawImage(
    backgroundImage,
    0,
    0,
    BACKGROUND_WIDTH,
    BACKGROUND_HEIGHT
  );

  const imageData =
    context.getImageData(
      0,
      0,
      BACKGROUND_WIDTH,
      BACKGROUND_HEIGHT
    );

  const mask =
    new Uint8Array(
      BACKGROUND_WIDTH *
        BACKGROUND_HEIGHT
    );

  /*
   * We sample the central portions of
   * each measured letter region to learn
   * the dominant letter-interior colour.
   */

  const samples = [];

  LETTER_REGIONS.forEach(
    (region) => {
      const insetX =
        Math.round(
          region.width *
            0.20
        );

      const insetY =
        Math.round(
          region.height *
            0.12
        );

      for (
        let y =
          region.y +
          insetY;
        y <
        region.y +
          region.height -
            insetY;
        y += 8
      ) {
        for (
          let x =
            region.x +
            insetX;
          x <
          region.x +
            region.width -
              insetX;
          x += 8
        ) {
          const offset =
            (y *
              BACKGROUND_WIDTH +
              x) *
            4;

          samples.push({
            r:
              imageData
                .data[
                offset
              ],

            g:
              imageData
                .data[
                offset + 1
              ],

            b:
              imageData
                .data[
                offset + 2
              ],
          });
        }
      }
    }
  );

  /*
   * Build a colour histogram.

   * We use quantized colours so that
   * small anti-aliasing differences don't
   * create separate groups.
   */

  const histogram =
    new Map();

  samples.forEach(
    ({
      r,
      g,
      b,
    }) => {
      const qr =
        Math.round(
          r / 16
        ) * 16;

      const qg =
        Math.round(
          g / 16
        ) * 16;

      const qb =
        Math.round(
          b / 16
        ) * 16;

      const key =
        `${qr},${qg},${qb}`;

      histogram.set(
        key,
        (histogram.get(
          key
        ) || 0) + 1
      );
    }
  );

  /*
   * The most frequent light colour
   * inside the letter regions is our
   * initial interior candidate.
   */

  const sortedColours =
    [...histogram.entries()]
      .sort(
        (a, b) =>
          b[1] - a[1]
      )
      .slice(
        0,
        12
      )
      .map(
        ([key]) =>
          key
            .split(",")
            .map(Number)
      );

  /*
   * Evaluate each pixel only inside
   * the measured AZAIN regions.
   */

  LETTER_REGIONS.forEach(
    (region) => {
      for (
        let y =
          region.y;
        y <
        region.y +
          region.height;
        y++
      ) {
        for (
          let x =
            region.x;
          x <
          region.x +
            region.width;
          x++
        ) {
          const offset =
            (y *
              BACKGROUND_WIDTH +
              x) *
            4;

          const r =
            imageData
              .data[
              offset
            ];

          const g =
            imageData
              .data[
              offset + 1
            ];

          const b =
            imageData
              .data[
              offset + 2
            ];

          /*
           * Find whether this pixel is
           * close to one of the dominant
           * interior colours.
           */

          let nearest =
            Infinity;

          for (
            const colour of
              sortedColours
          ) {
            nearest =
              Math.min(
                nearest,
                colorDistance(
                  r,
                  g,
                  b,
                  colour[0],
                  colour[1],
                  colour[2]
                )
              );
          }

          /*
           * Fairly strict threshold.

           * This prevents the surrounding
           * artwork from becoming part of
           * the mosaic.
           */
          if (
            nearest <
            42
          ) {
            mask[
              y *
                BACKGROUND_WIDTH +
                x
            ] = 1;
          }
        }
      }
    }
  );

  return {
    mask,
    backgroundCanvas:
      canvas,
  };
}

/*
===============================================================================
BUILD TILE POSITIONS
===============================================================================
*/

function buildTilePositions(
  mask,
  mediaCount
) {
  /*
   * Start with a small tile size.
   *
   * If we have more memories than
   * available cells, we decrease the
   * sampling step.
   */

  let step = 9;

  let positions = [];

  for (
    let attempt = 0;
    attempt < 10;
    attempt++
  ) {
    positions = [];

    for (
      let y = 0;
      y <
      BACKGROUND_HEIGHT;
      y += step
    ) {
      for (
        let x = 0;
        x <
        BACKGROUND_WIDTH;
        x += step
      ) {
        const centerX =
          Math.min(
            BACKGROUND_WIDTH -
              1,
            Math.round(
              x +
                step / 2
            )
          );

        const centerY =
          Math.min(
            BACKGROUND_HEIGHT -
              1,
            Math.round(
              y +
                step / 2
            )
          );

        if (
          mask[
            centerY *
              BACKGROUND_WIDTH +
              centerX
          ]
        ) {
          positions.push({
            x,
            y,
          });
        }
      }
    }

    if (
      positions.length >=
      mediaCount
    ) {
      break;
    }

    step = Math.max(
      3,
      step - 1
    );
  }

  /*
   * If we have more positions than
   * memories, distribute the memories
   * across the entire word rather than
   * clustering them in one area.
   */

  if (
    positions.length >
    mediaCount
  ) {
    const selected = [];

    const spacing =
      positions.length /
      mediaCount;

    for (
      let index = 0;
      index <
      mediaCount;
      index++
    ) {
      selected.push(
        positions[
          Math.min(
            positions.length -
              1,
            Math.floor(
              index *
                spacing
            )
          )
        ]
      );
    }

    positions =
      selected;
  }

  return {
    positions,
    step,
  };
}

/*
===============================================================================
DRAW MEMORY TILE
===============================================================================
*/

function drawTile(
  context,
  source,
  x,
  y,
  size
) {
  context.drawImage(
    source.canvas,
    x,
    y,
    size,
    size
  );
}

/*
===============================================================================
BUILD MEMORY MOSAIC
===============================================================================
*/

export async function buildMemoryMosaic({
  items = [],
  canvas,
  backgroundImage,
  signal,
  onProgress,
}) {
  if (
    !canvas ||
    !backgroundImage ||
    !items.length
  ) {
    return {
      tiles: [],
      mediaItems: [],
    };
  }

  /*
   * Keep the maximum media pool.

   * No duplicate removal.
   */

  const usableItems =
    items.filter(
      (item) =>
        item.mediaType ===
        "video"
          ? Boolean(
              item.video
            )
          : Boolean(
              item.image
            )
    );

  if (
    !usableItems.length
  ) {
    return {
      tiles: [],
      mediaItems: [],
    };
  }

  /*
   * Prepare thumbnails.
   */

  const sources = [];

  for (
    let index = 0;
    index <
    usableItems.length;
    index++
  ) {
    if (
      signal?.aborted
    ) {
      return null;
    }

    const item =
      usableItems[index];

    const thumbnail =
      await createMediaThumbnail(
        item
      );

    if (thumbnail) {
      sources.push({
        ...thumbnail,
        item,
      });
    }

    onProgress?.({
      phase:
        "preparing",

      current:
        index + 1,

      total:
        usableItems.length,
    });
  }

  if (
    signal?.aborted
  ) {
    return null;
  }

  /*
   * Create exact PNG letter mask.
   */

  const {
    mask,
  } =
    buildLetterMask(
      backgroundImage
    );

  /*
   * Determine where the memory tiles
   * can actually go.
   */

  const {
    positions,
    step,
  } =
    buildTilePositions(
      mask,
      sources.length
    );

  /*
   * Canvas uses the EXACT same coordinate
   * system as the background PNG.
   */

  canvas.width =
    BACKGROUND_WIDTH;

  canvas.height =
    BACKGROUND_HEIGHT;

  const context =
    canvas.getContext(
      "2d"
    );

  context.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  /*
   * Randomize memory order slightly.
   *
   * Every memory remains represented.
   */

  const shuffledSources =
    [...sources];

  for (
    let index =
      shuffledSources.length -
      1;
    index > 0;
    index--
  ) {
    const randomIndex =
      Math.floor(
        Math.random() *
          (index + 1)
      );

    [
      shuffledSources[
        index
      ],
      shuffledSources[
        randomIndex
      ],
    ] = [
      shuffledSources[
        randomIndex
      ],
      shuffledSources[
        index
      ],
    ];
  }

  const tiles = [];

  /*
   * Put each memory into one of the
   * actual letter-interior positions.
   */

  for (
    let index = 0;
    index <
      shuffledSources.length &&
    index <
      positions.length;
    index++
  ) {
    if (
      signal?.aborted
    ) {
      return null;
    }

    const source =
      shuffledSources[
        index
      ];

    const position =
      positions[index];

    drawTile(
      context,
      source,
      position.x,
      position.y,
      step + 0.5
    );

    tiles.push({
      x:
        position.x,

      y:
        position.y,

      width:
        step,

      height:
        step,

      item:
        source.item,
    });

    onProgress?.({
      phase:
        "building",

      current:
        index + 1,

      total:
        shuffledSources.length,
    });
  }

  return {
    tiles,

    mediaItems:
      shuffledSources.map(
        (source) =>
          source.item
      ),
  };
}