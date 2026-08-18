import { useState } from "react";

import GalleryCard from "./GalleryCard";
import GalleryVideoCard from "./GalleryVideoCard";
import MemoryGalaxy from "./MemoryGalaxy";
import Lightbox from "../memory/Lightbox";

export default function GalleryGrid({
  items = [],
}) {
  const [
    lightboxOpen,
    setLightboxOpen,
  ] = useState(false);

  const [
    currentIndex,
    setCurrentIndex,
  ] = useState(0);

  /*
  ==========================================================
  OPEN MEDIA
  ==========================================================

  The Gallery uses one unified media array containing:

    - photos
    - videos

  Clicking either type opens the existing Lightbox
  directly on the Gallery page.

  We intentionally do NOT navigate to the individual
  memory page.
  ==========================================================
  */

  function openMedia(item) {
    const index =
      items.findIndex(
        (media) =>
          media.id === item.id
      );

    if (index < 0) {
      return;
    }

    setCurrentIndex(index);
    setLightboxOpen(true);
  }

  /*
  ==========================================================
  EMPTY STATE
  ==========================================================
  */

  if (items.length === 0) {
    return (
      <div className="text-center py-24 text-2xl text-gray-500">
        No memories found.
      </div>
    );
  }

  return (
    <>
      {/* ====================================================
          AZAIN MEMORY GALAXY

          The old BabyMemoryMosaic has intentionally been
          removed from the Gallery render tree.

          We are NOT deleting the old mosaic files yet.
          They simply aren't being executed anymore.

          MemoryGalaxy receives the SAME unified `items`
          array used by the existing Gallery.

          Therefore:

              Admin adds memory
                    ↓
              Gallery fetches it
                    ↓
              galleryHelpers includes it
                    ↓
              items updates
                    ↓
              MemoryGalaxy automatically includes it
      ==================================================== */}

      <MemoryGalaxy
        items={items}
        onOpen={openMedia}
      />

      {/* ====================================================
          NORMAL GALLERY

          Keep the existing Gallery below the Galaxy.

          This remains useful because:

          1. The Galaxy provides the visual experience.
          2. The normal Gallery provides a complete,
             easy-to-browse collection.
          3. Existing photo/video functionality remains intact.
          4. Existing Lightbox remains intact.
      ==================================================== */}

      <div className="columns-1 sm:columns-2 lg:columns-4 gap-6">
        {items.map((item) =>
          item.mediaType ===
          "video" ? (
            <GalleryVideoCard
              key={item.id}
              item={item}
              onOpen={openMedia}
            />
          ) : (
            <GalleryCard
              key={item.id}
              item={item}
              onOpen={openMedia}
            />
          )
        )}
      </div>

      {/* ====================================================
          EXISTING LIGHTBOX

          IMPORTANT:

          We pass the COMPLETE `items` array.

          This is what allows the Lightbox to navigate
          correctly between BOTH photos and videos.

          Example:

            Photo
            Photo
            Video
            Photo
            Video

          Arrow navigation continues through the entire
          unified Gallery collection.

          We deliberately retain the existing Lightbox
          instead of creating another one.
      ==================================================== */}

      <Lightbox
        items={items}
        images={items
          .filter(
            (item) =>
              item.mediaType ===
              "image"
          )
          .map(
            (item) =>
              item.image
          )}
        currentIndex={
          currentIndex
        }
        setCurrentIndex={
          setCurrentIndex
        }
        isOpen={
          lightboxOpen
        }
        onClose={() =>
          setLightboxOpen(
            false
          )
        }
      />
    </>
  );
}