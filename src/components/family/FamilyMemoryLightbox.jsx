import { useEffect } from "react";
import { getDetailImageUrl } from "../../utils/supabaseImageUrl";

/**
 * FamilyMemoryLightbox
 *
 * Displays one family memory at a time.
 *
 * Supports:
 * - Photos
 * - Videos
 * - Previous / next navigation
 * - Keyboard navigation
 * - Escape to close
 * - Click outside to close
 * - Mobile responsive layout
 *
 * Expected memory shape:
 *
 * {
 *   id: "...",
 *   media_type: "photo" | "video",
 *   media_url: "...",
 *   caption: "...",
 * }
 */

export default function FamilyMemoryLightbox({
  memories = [],
  activeIndex = null,
  onClose,
  onPrevious,
  onNext,
}) {
  const isOpen =
    activeIndex !== null &&
    activeIndex !== undefined &&
    memories.length > 0;

  const activeMemory = isOpen
    ? memories[activeIndex]
    : null;

  /*
   * Prevent the background page from scrolling while
   * the lightbox is open.
   */
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const originalOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        originalOverflow;
    };
  }, [isOpen]);

  /*
   * Keyboard controls.
   */
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
        return;
      }

      if (event.key === "ArrowLeft") {
        onPrevious?.();
        return;
      }

      if (event.key === "ArrowRight") {
        onNext?.();
      }
    };

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
    isOpen,
    onClose,
    onPrevious,
    onNext,
  ]);

  /*
   * Don't render anything when closed.
   */
  if (!isOpen || !activeMemory) {
    return null;
  }

  const mediaType =
    activeMemory.media_type === "video"
      ? "video"
      : "photo";

  const hasPrevious = activeIndex > 0;
  const hasNext =
    activeIndex < memories.length - 1;

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose?.();
    }
  };

  return (
    <>
      <style>
        {`
          .family-lightbox {
            position: fixed;
            inset: 0;
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;

            background:
              radial-gradient(
                circle at center,
                rgba(83, 58, 35, 0.30) 0%,
                rgba(20, 14, 9, 0.78) 55%,
                rgba(10, 7, 4, 0.94) 100%
              );

            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);

            animation:
              familyLightboxFadeIn
              0.22s
              ease-out;
          }

          .family-lightbox__panel {
            position: relative;

            width: min(1100px, 94vw);
            max-height: 92vh;

            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;

            animation:
              familyLightboxScaleIn
              0.24s
              ease-out;
          }

          .family-lightbox__media-shell {
            position: relative;

            width: min(100%, 1040px);
            max-height: 82vh;

            display: flex;
            align-items: center;
            justify-content: center;

            padding: 14px;

            border-radius: 18px;

            background:
              linear-gradient(
                145deg,
                #f4e5c7 0%,
                #d9b77c 42%,
                #8d5a2f 100%
              );

            box-shadow:
              0 24px 70px rgba(0, 0, 0, 0.55),
              0 0 0 1px rgba(255, 232, 185, 0.25),
              inset 0 1px 0 rgba(255, 255, 255, 0.45);
          }

          .family-lightbox__media-inner {
            position: relative;

            width: 100%;
            max-height: calc(82vh - 28px);
            min-height: 180px;

            overflow: hidden;

            display: flex;
            align-items: center;
            justify-content: center;

            border-radius: 10px;

            background:
              radial-gradient(
                circle at center,
                #3b291b 0%,
                #1b120c 100%
              );
          }

          .family-lightbox__image {
            display: block;

            max-width: 100%;
            max-height: calc(82vh - 28px);

            width: auto;
            height: auto;

            object-fit: contain;

            border-radius: 6px;
          }

          .family-lightbox__video {
            display: block;

            width: 100%;
            max-height: calc(82vh - 28px);

            object-fit: contain;

            background: #120d08;

            border-radius: 6px;
          }

          .family-lightbox__close {
            position: absolute;

            top: -18px;
            right: -18px;

            z-index: 4;

            width: 46px;
            height: 46px;

            border: 2px solid
              rgba(255, 230, 182, 0.9);

            border-radius: 50%;

            display: flex;
            align-items: center;
            justify-content: center;

            cursor: pointer;

            color: #fff4dc;

            background:
              linear-gradient(
                145deg,
                #9f6b35,
                #5c371b
              );

            box-shadow:
              0 8px 20px rgba(0, 0, 0, 0.38),
              inset 0 1px 0
                rgba(255, 255, 255, 0.35);

            font-size: 25px;
            line-height: 1;

            transition:
              transform 0.2s ease,
              filter 0.2s ease;
          }

          .family-lightbox__close:hover {
            transform: scale(1.08);
            filter: brightness(1.12);
          }

          .family-lightbox__close:focus-visible,
          .family-lightbox__nav:focus-visible {
            outline:
              3px solid
              rgba(255, 218, 146, 0.95);

            outline-offset: 3px;
          }

          .family-lightbox__nav {
            position: absolute;

            top: 50%;

            z-index: 4;

            transform: translateY(-50%);

            width: 52px;
            height: 52px;

            border: 2px solid
              rgba(255, 230, 182, 0.82);

            border-radius: 50%;

            display: flex;
            align-items: center;
            justify-content: center;

            cursor: pointer;

            color: #fff4dc;

            background:
              linear-gradient(
                145deg,
                rgba(159, 107, 53, 0.96),
                rgba(92, 55, 27, 0.96)
              );

            box-shadow:
              0 8px 20px rgba(0, 0, 0, 0.36),
              inset 0 1px 0
                rgba(255, 255, 255, 0.3);

            font-size: 27px;
            line-height: 1;

            transition:
              transform 0.2s ease,
              opacity 0.2s ease,
              filter 0.2s ease;
          }

          .family-lightbox__nav:hover:not(:disabled) {
            filter: brightness(1.12);
          }

          .family-lightbox__nav--previous {
            left: -26px;
          }

          .family-lightbox__nav--previous:hover:not(:disabled) {
            transform:
              translate(-3px, -50%);
          }

          .family-lightbox__nav--next {
            right: -26px;
          }

          .family-lightbox__nav--next:hover:not(:disabled) {
            transform:
              translate(3px, -50%);
          }

          .family-lightbox__nav:disabled {
            opacity: 0.25;
            cursor: default;
          }

          .family-lightbox__caption {
            width: min(850px, 90vw);

            margin-top: 14px;

            padding: 9px 18px;

            border-radius: 999px;

            color: #f7e8c9;

            background:
              rgba(42, 27, 16, 0.76);

            border:
              1px solid
              rgba(224, 181, 111, 0.28);

            text-align: center;

            font-family: "Nunito", sans-serif;

            font-size: 14px;
            line-height: 1.45;

            box-shadow:
              0 8px 20px
              rgba(0, 0, 0, 0.22);
          }

          .family-lightbox__counter {
            margin-top: 8px;

            color:
              rgba(255, 238, 204, 0.75);

            font-family:
              "Nunito",
              sans-serif;

            font-size: 12px;

            letter-spacing: 0.08em;
          }

          @keyframes familyLightboxFadeIn {
            from {
              opacity: 0;
            }

            to {
              opacity: 1;
            }
          }

          @keyframes familyLightboxScaleIn {
            from {
              opacity: 0;
              transform: scale(0.97);
            }

            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          @media (max-width: 768px) {
            .family-lightbox {
              padding: 14px;
            }

            .family-lightbox__panel {
              width: 96vw;
              max-height: 94vh;
            }

            .family-lightbox__media-shell {
              width: 100%;
              max-height: 82vh;

              padding: 8px;

              border-radius: 13px;
            }

            .family-lightbox__media-inner {
              max-height:
                calc(82vh - 16px);

              min-height: 140px;

              border-radius: 7px;
            }

            .family-lightbox__image,
            .family-lightbox__video {
              max-height:
                calc(82vh - 16px);
            }

            .family-lightbox__close {
              top: -12px;
              right: -5px;

              width: 42px;
              height: 42px;

              font-size: 22px;
            }

            .family-lightbox__nav {
              position: fixed;

              top: auto;
              bottom: 22px;

              transform: none;

              width: 46px;
              height: 46px;

              font-size: 23px;
            }

            .family-lightbox__nav--previous {
              left: 24px;
            }

            .family-lightbox__nav--previous:hover:not(:disabled) {
              transform: translateY(-2px);
            }

            .family-lightbox__nav--next {
              right: 24px;
            }

            .family-lightbox__nav--next:hover:not(:disabled) {
              transform: translateY(-2px);
            }

            .family-lightbox__caption {
              width: 88vw;

              margin-top: 10px;

              padding: 8px 14px;

              font-size: 13px;
            }

            .family-lightbox__counter {
              margin-top: 6px;

              font-size: 11px;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .family-lightbox,
            .family-lightbox__panel {
              animation: none;
            }

            .family-lightbox__close,
            .family-lightbox__nav {
              transition: none;
            }
          }
        `}
      </style>

      <div
        className="family-lightbox"
        role="dialog"
        aria-modal="true"
        aria-label="Family memory viewer"
        onMouseDown={handleBackdropClick}
      >
        <div className="family-lightbox__panel">
          <button
            type="button"
            className="family-lightbox__close"
            onClick={onClose}
            aria-label="Close memory viewer"
          >
            ×
          </button>

          <button
            type="button"
            className="
              family-lightbox__nav
              family-lightbox__nav--previous
            "
            onClick={onPrevious}
            disabled={!hasPrevious}
            aria-label="Previous memory"
          >
            ‹
          </button>

          <div className="family-lightbox__media-shell">
            <div className="family-lightbox__media-inner">
              {mediaType === "video" ? (
                <video
                  key={
                    activeMemory.id ||
                    activeMemory.media_url
                  }
                  className="family-lightbox__video"
                  src={activeMemory.media_url}
                  controls
                  autoPlay
                  playsInline
                  preload="metadata"
                />
              ) : (
                <img
                  key={
                    activeMemory.id ||
                    activeMemory.media_url
                  }
                  className="family-lightbox__image"
                  src={getDetailImageUrl(activeMemory.media_url)}
                  alt={
                    activeMemory.caption ||
                    "Family memory"
                  }
                />
              )}
            </div>
          </div>

          <button
            type="button"
            className="
              family-lightbox__nav
              family-lightbox__nav--next
            "
            onClick={onNext}
            disabled={!hasNext}
            aria-label="Next memory"
          >
            ›
          </button>

          {activeMemory.caption ? (
            <div className="family-lightbox__caption">
              {activeMemory.caption}
            </div>
          ) : null}

          <div className="family-lightbox__counter">
            {activeIndex + 1} / {memories.length}
          </div>
        </div>
      </div>
    </>
  );
}