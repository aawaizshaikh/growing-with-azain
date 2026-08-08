import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import background from "../../assets/illustrations/animals/background.png";

import {
  ANIMALS,
  DESIGN_HEIGHT,
  DESIGN_WIDTH,
  getSignpostAnchor,
} from "./milestoneSceneData";

function AnimalLayer({ animal }) {
  return (
    <img
      src={animal.src}
      alt=""
      aria-hidden="true"
      draggable={false}
      className="absolute pointer-events-none select-none"
      style={{
        left: animal.left,
        top: animal.top,
        width: animal.width,
        height: "auto",
        zIndex: animal.zIndex,
        transform: `rotate(${animal.rotate}deg)`,
      }}
    />
  );
}

function MilestoneSignpost({ milestone, index }) {
  const anchor = getSignpostAnchor(index);

  return (
    <Link
      to={`/milestone/${milestone.slug}`}
      aria-label={`Open milestone: ${milestone.title}`}
      className="absolute block group focus:outline-none"
      style={{
        left: anchor.left,
        top: anchor.top,
        zIndex: 40 + index,
        width: 190,
        height: 190,
        transform: `translate(-50%, -100%) rotate(${anchor.rotation}deg)`,
      }}
    >
      <div
        className="absolute left-1/2 top-[72px] h-[116px] w-[17px] -translate-x-1/2 rounded-b-[12px] border-x border-[#6F4529] bg-gradient-to-r from-[#7B4E2D] via-[#A96F3E] to-[#6C4328] shadow-[3px_5px_7px_rgba(67,45,25,0.30)] transition-transform duration-300 group-hover:scale-[1.03]"
      />

      <div className="absolute left-1/2 top-[58px] h-[18px] w-[36px] -translate-x-1/2 rounded-[50%] bg-[#7A4D2D] opacity-90" />

      <div className="absolute left-1/2 top-0 w-[178px] -translate-x-1/2 rounded-[18px] border-[3px] border-[#70472C] bg-gradient-to-b from-[#F6E2B6] via-[#EED19D] to-[#D8B276] px-4 py-4 text-center shadow-[0_9px_16px_rgba(73,48,26,0.28)] transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-[0_14px_22px_rgba(73,48,26,0.34)] group-focus-visible:-translate-y-2">
        <div className="pointer-events-none absolute inset-[5px] rounded-[12px] border border-[#FFF2D4]/80" />

        <div className="relative">
          <p
            className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#80603F]"
            style={{ fontFamily: "Nunito, sans-serif" }}
          >
            {milestone.age || milestone.category || `Chapter ${index + 1}`}
          </p>

          <h2
            className="mt-1 text-[22px] leading-[1.02] font-bold text-[#5B3F2C]"
            style={{ fontFamily: "Cormorant Garamond, serif" }}
          >
            {milestone.title}
          </h2>

          {milestone.date && (
            <p
              className="mt-2 text-[10px] font-semibold tracking-wide text-[#876848]"
              style={{ fontFamily: "Nunito, sans-serif" }}
            >
              {milestone.date}
            </p>
          )}
        </div>
      </div>

      <div className="absolute left-1/2 top-[66px] h-[13px] w-[13px] -translate-x-1/2 rounded-full border-2 border-[#70472C] bg-[#E8B85E] shadow-[0_2px_4px_rgba(73,48,26,0.35)]" />

      <span
        className="absolute left-1/2 top-[154px] -translate-x-1/2 whitespace-nowrap rounded-full bg-[#FFF7E6]/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#76563A] opacity-0 shadow-sm transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
        style={{ fontFamily: "Nunito, sans-serif" }}
      >
        Open memory
      </span>
    </Link>
  );
}

function SceneHeader() {
  return (
    <>
      <div className="absolute left-[42px] top-[32px] z-[60] rounded-full border border-[#F7E8C6]/80 bg-[#FFF8E8]/75 px-5 py-2 shadow-[0_4px_14px_rgba(76,55,32,0.14)] backdrop-blur-[2px]">
        <span
          className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#76583B]"
          style={{ fontFamily: "Nunito, sans-serif" }}
        >
          Growing With Azain
        </span>
      </div>

      <div className="absolute left-1/2 top-[30px] z-[60] -translate-x-1/2 text-center pointer-events-none">
        <p
          className="text-[11px] font-bold uppercase tracking-[0.32em] text-[#6D684B]"
          style={{ fontFamily: "Nunito, sans-serif" }}
        >
          A little journey
        </p>

        <h1
          className="mt-[-2px] text-[48px] leading-none font-bold text-[#5D4734] drop-shadow-[0_2px_0_rgba(255,248,226,0.65)]"
          style={{ fontFamily: "Cormorant Garamond, serif" }}
        >
          Our Milestones
        </h1>
      </div>
    </>
  );
}

function SceneFooterHint() {
  return (
    <div
      className="absolute bottom-[22px] left-1/2 z-[60] -translate-x-1/2 rounded-full bg-[#FFF8E8]/70 px-5 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#806A53] shadow-sm pointer-events-none"
      style={{ fontFamily: "Nunito, sans-serif" }}
    >
      Tap a signpost to open the memory
    </div>
  );
}

export default function MilestoneScene({ milestones, loading, error }) {
  const [sceneScale, setSceneScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const nextScale = Math.min(
        viewportWidth / DESIGN_WIDTH,
        viewportHeight / DESIGN_HEIGHT
      );

      setSceneScale(Math.max(nextScale, 0.35));
    };

    updateScale();
    window.addEventListener("resize", updateScale);

    return () => window.removeEventListener("resize", updateScale);
  }, []);

  const scaledWidth = DESIGN_WIDTH * sceneScale;
  const scaledHeight = DESIGN_HEIGHT * sceneScale;

  return (
    <main className="fixed inset-0 overflow-hidden bg-[#E8D8B8] select-none">
      <div
        className="absolute"
        style={{
          width: DESIGN_WIDTH,
          height: DESIGN_HEIGHT,
          left: `calc(50% - ${scaledWidth / 2}px)`,
          top: `calc(50% - ${scaledHeight / 2}px)`,
          transform: `scale(${sceneScale})`,
          transformOrigin: "top left",
        }}
      >
        <img
          src={background}
          alt="Enchanted watercolor jungle milestone journey"
          draggable={false}
          className="absolute inset-0 h-full w-full object-fill pointer-events-none"
        />

        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#FFF8E8]/12 via-transparent to-[#6F5A38]/10" />

        <SceneHeader />

        {ANIMALS.map((animal) => (
          <AnimalLayer key={animal.id} animal={animal} />
        ))}

        {!loading &&
          !error &&
          milestones.map((milestone, index) => (
            <MilestoneSignpost
              key={milestone.id || milestone.slug || index}
              milestone={milestone}
              index={index}
            />
          ))}

        {loading && (
          <div className="absolute inset-0 z-[100] flex items-center justify-center bg-[#F8EBCF]/25">
            <div className="rounded-[28px] border border-[#E4C997] bg-[#FFF8E8]/90 px-10 py-7 text-center shadow-[0_12px_35px_rgba(72,51,30,0.20)]">
              <p
                className="text-[12px] font-bold uppercase tracking-[0.22em] text-[#80603F]"
                style={{ fontFamily: "Nunito, sans-serif" }}
              >
                Growing With Azain
              </p>

              <p
                className="mt-2 text-[28px] font-bold text-[#5D4734]"
                style={{ fontFamily: "Cormorant Garamond, serif" }}
              >
                Opening the memory path…
              </p>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="absolute left-1/2 top-1/2 z-[100] -translate-x-1/2 -translate-y-1/2 rounded-[30px] border border-[#E4C997] bg-[#FFF8E8]/95 px-12 py-8 text-center shadow-[0_14px_38px_rgba(72,51,30,0.20)]">
            <p
              className="text-[30px] font-bold text-[#5D4734]"
              style={{ fontFamily: "Cormorant Garamond, serif" }}
            >
              We could not open the memory path.
            </p>

            <p
              className="mt-2 text-sm text-[#806A53]"
              style={{ fontFamily: "Nunito, sans-serif" }}
            >
              Please refresh the page and try again.
            </p>
          </div>
        )}

        {!loading && !error && milestones.length === 0 && (
          <div className="absolute left-1/2 top-[455px] z-[70] -translate-x-1/2 -translate-y-1/2 rounded-[30px] border border-[#E4C997] bg-[#FFF8E8]/90 px-12 py-8 text-center shadow-[0_14px_38px_rgba(72,51,30,0.20)]">
            <p
              className="text-[30px] font-bold text-[#5D4734]"
              style={{ fontFamily: "Cormorant Garamond, serif" }}
            >
              The journey is waiting for its first memory.
            </p>

            <p
              className="mt-2 text-sm text-[#806A53]"
              style={{ fontFamily: "Nunito, sans-serif" }}
            >
              Published milestones added through Admin will appear here.
            </p>
          </div>
        )}

        <SceneFooterHint />
      </div>
    </main>
  );
}
