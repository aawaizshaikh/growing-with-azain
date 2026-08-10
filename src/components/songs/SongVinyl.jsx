import { useNavigate } from "react-router-dom";

import vinyl from "../../assets/illustrations/favsongs/vinyl.png";

function createSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function SongVinyl({ song, position }) {
  const navigate = useNavigate();

  const songSlug =
    song?.slug ||
    createSlug(song?.title);

  const hasSong = Boolean(songSlug);

  console.log("VINYL CLICK DATA:", {
    title: song?.title,
    slug: song?.slug,
    generatedSlug: songSlug,
    hasSong,
  });

  function handleClick() {
    console.log("VINYL CLICKED:", {
      title: song?.title,
      slug: song?.slug,
      generatedSlug: songSlug,
      target: `/favorite-songs/${songSlug}`,
    });

    if (!hasSong) {
      console.log("VINYL CLICK BLOCKED: No valid song slug.");
      return;
    }

    navigate(`/favorite-songs/${songSlug}`);
  }

  return (
    <div
      className="absolute"
      style={{
        left: position.left,
        top: position.top,
        width: position.width,
        position: "absolute",
        zIndex: position.zIndex ?? 20,
        containerType: "inline-size",
        pointerEvents: "auto",
      }}
    >
      <div
        role={hasSong ? "button" : undefined}
        tabIndex={hasSong ? 0 : -1}
        aria-label={
          hasSong
            ? `Open memory for ${song.title}`
            : "Empty song record"
        }
        onClick={hasSong ? handleClick : undefined}
        onKeyDown={(event) => {
          if (!hasSong) return;

          if (
            event.key === "Enter" ||
            event.key === " "
          ) {
            event.preventDefault();
            handleClick();
          }
        }}
        className={`
          group
          relative
          block
          w-full
          select-none
          ${hasSong ? "cursor-pointer" : "cursor-default"}
        `}
      >
        {/* =====================================================
            VINYL IMAGE
            ===================================================== */}

        <img
          src={vinyl}
          alt=""
          draggable="false"
          className="
            block
            w-full
            h-auto
            select-none
            pointer-events-none
          "
        />

        {/* =====================================================
            ADMIN SONG TITLE
            ===================================================== */}

        {hasSong && (
          <span
            className="
              absolute
              z-10
              flex
              items-center
              justify-center
              text-center
              leading-[1.05]
              pointer-events-none
              select-none
            "
            style={{
              left: "50%",
              top: "50%",
              width: "38%",
              height: "38%",
              transform: "translate(-50%, -50%)",
              fontSize: "9cqw",
              fontWeight: 800,
              color: "#111111",
              fontFamily: "Nunito, sans-serif",
              overflowWrap: "break-word",
              wordBreak: "normal",
            }}
          >
            {song.title}
          </span>
        )}

        {/* =====================================================
            SUBTLE HOVER EFFECT
            ===================================================== */}

        {hasSong && (
          <span
            className="
              absolute
              inset-0
              rounded-full
              opacity-0
              group-hover:opacity-100
              transition-opacity
              duration-200
              pointer-events-none
            "
            style={{
              boxShadow:
                "0 0 0 0.35cqw rgba(255, 244, 190, 0.75)",
            }}
          />
        )}
      </div>
    </div>
  );
}