import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  buildMemoryMosaic,
} from "../../utils/mosaicBuilder";

const BACKGROUND_IMAGE =
  "/azain-mosaic-background.png";

export default function BabyMemoryMosaic({
  items = [],
  onOpen,
}) {
  const containerRef =
    useRef(null);

  const canvasRef =
    useRef(null);

  const backgroundRef =
    useRef(null);

  const mosaicRef =
    useRef(null);

  const [status, setStatus] =
    useState("idle");

  const [progress, setProgress] =
    useState(0);

  const [message, setMessage] =
    useState("");

  /*
  ==========================================================
  GENERATE MOSAIC
  ==========================================================
  */

  useEffect(() => {
    let cancelled = false;

    const controller =
      new AbortController();

    async function generate() {
      if (
        !canvasRef.current ||
        !backgroundRef.current ||
        !items.length
      ) {
        setStatus("empty");
        return;
      }

      /*
       * Wait until the PNG has actually
       * loaded before reading its pixels.
       */

      if (
        !backgroundRef.current.complete
      ) {
        await new Promise(
          (resolve) => {
            backgroundRef.current.onload =
              resolve;
          }
        );
      }

      if (cancelled) {
        return;
      }

      setStatus("loading");
      setProgress(0);

      setMessage(
        "Preparing the memory mosaic..."
      );

      try {
        const result =
          await buildMemoryMosaic({
            items,

            canvas:
              canvasRef.current,

            backgroundImage:
              backgroundRef.current,

            signal:
              controller.signal,

            onProgress:
              ({
                phase,
                current,
                total,
              }) => {
                if (
                  cancelled
                ) {
                  return;
                }

                const percentage =
                  total
                    ? Math.round(
                        (current /
                          total) *
                          100
                      )
                    : 0;

                setProgress(
                  percentage
                );

                if (
                  phase ===
                  "preparing"
                ) {
                  setMessage(
                    `Preparing memory ${current.toLocaleString()} of ${total.toLocaleString()}...`
                  );
                } else {
                  setMessage(
                    `Placing memory ${current.toLocaleString()} of ${total.toLocaleString()}...`
                  );
                }
              },
          });

        if (
          cancelled ||
          !result
        ) {
          return;
        }

        mosaicRef.current =
          result;

        setProgress(100);

        setMessage(
          `${result.mediaItems.length.toLocaleString()} memories woven into AZAIN.`
        );

        setStatus("ready");
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "AZAIN mosaic error:",
          error
        );

        setStatus("error");

        setMessage(
          "The AZAIN memory mosaic could not be created yet."
        );
      }
    }

    generate();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [items]);

  /*
  ==========================================================
  CLICK A MEMORY TILE
  ==========================================================
  */

  function handleCanvasClick(
    event
  ) {
    if (
      !mosaicRef.current ||
      !canvasRef.current ||
      !onOpen
    ) {
      return;
    }

    const rect =
      canvasRef.current.getBoundingClientRect();

    if (
      !rect.width ||
      !rect.height
    ) {
      return;
    }

    const scaleX =
      canvasRef.current.width /
      rect.width;

    const scaleY =
      canvasRef.current.height /
      rect.height;

    const x =
      (event.clientX -
        rect.left) *
      scaleX;

    const y =
      (event.clientY -
        rect.top) *
      scaleY;

    /*
     * Find the memory tile
     * under the pointer.
     */

    const tile =
      mosaicRef.current.tiles.find(
        (candidate) =>
          x >= candidate.x &&
          x <=
            candidate.x +
              candidate.width &&
          y >= candidate.y &&
          y <=
            candidate.y +
              candidate.height
      );

    if (tile?.item) {
      onOpen(
        tile.item
      );
    }
  }

  if (
    status === "empty"
  ) {
    return null;
  }

  return (
    <section
      className="mb-16"
      ref={containerRef}
    >
      {/* ==================================================
          TITLE
      ================================================== */}

      <div className="text-center mb-7">
        <h2
          className="text-4xl sm:text-5xl lg:text-6xl text-[#8FAE7A]"
          style={{
            fontFamily:
              "Baloo 2",
          }}
        >
          AZAIN
        </h2>

        <p
          className="mt-2 text-base sm:text-lg text-gray-500"
          style={{
            fontFamily:
              "Nunito",
          }}
        >
          Every little moment comes together
          to make his name.
        </p>
      </div>

      {/* ==================================================
          EXACT PNG + TRANSPARENT MOSAIC CANVAS
      ================================================== */}

      <div className="relative w-full overflow-hidden rounded-[36px] shadow-xl bg-[#F6F0E6]">

        {/*

          This is the EXACT PNG supplied for the design.

          It remains completely untouched.

        */}

        <img
          ref={backgroundRef}
          src={BACKGROUND_IMAGE}
          alt="AZAIN memory artwork"
          className="block w-full h-auto select-none"
          draggable="false"
        />

        {/*

          Transparent canvas.

          The canvas is positioned over the PNG.

          It contains ONLY the actual memory tiles.

        */}

        <canvas
          ref={canvasRef}
          onClick={
            handleCanvasClick
          }
          className={`absolute inset-0 w-full h-full cursor-pointer transition-opacity duration-700 ${
            status === "ready"
              ? "opacity-100"
              : "opacity-30"
          }`}
          aria-label="AZAIN memory mosaic"
        />

        {/* ==================================================
            BUILDING MESSAGE
        ================================================== */}

        {status !== "ready" && (
          <div className="absolute inset-0 flex items-center justify-center">

            <div className="bg-white/90 backdrop-blur-md rounded-3xl px-7 py-5 text-center shadow-xl max-w-sm mx-4">

              <div
                className="text-2xl text-[#454545]"
                style={{
                  fontFamily:
                    "Baloo 2",
                }}
              >
                Building AZAIN...
              </div>

              <div className="mt-3 h-2 rounded-full bg-[#E9E3D8] overflow-hidden">

                <div
                  className="h-full bg-[#8FAE7A] transition-all duration-300"
                  style={{
                    width:
                      `${progress}%`,
                  }}
                />

              </div>

              <p className="mt-3 text-sm text-gray-500">
                {message}
              </p>

            </div>

          </div>
        )}

      </div>

      {/* ==================================================
          READY MESSAGE
      ================================================== */}

      {status === "ready" && (
        <p className="text-center mt-4 text-sm text-gray-400">
          Every photograph is a little piece of AZAIN.
          Click one to open the original memory.
        </p>
      )}
    </section>
  );
}