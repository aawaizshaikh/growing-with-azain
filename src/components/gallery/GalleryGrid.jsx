import { useMemo, useState } from "react";

import GalleryCard from "./GalleryCard";
import GalleryVideoCard from "./GalleryVideoCard";
import GalleryFilters from "./GalleryFilters";

import Lightbox from "../memory/Lightbox";

export default function GalleryGrid({ items = [] }) {
  const [activeFilter, setActiveFilter] = useState("all");

  const [lightboxOpen, setLightboxOpen] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);

  const imageItems = useMemo(
    () => items.filter((item) => item.mediaType === "image"),
    [items]
  );

  const filteredItems = useMemo(() => {
    switch (activeFilter) {
      case "timeline":
        return items.filter(
          (item) => item.type === "timeline"
        );

      case "milestone":
        return items.filter(
          (item) => item.type === "milestone"
        );

      case "song":
        return items.filter(
          (item) => item.type === "song"
        );

      case "image":
        return items.filter(
          (item) => item.mediaType === "image"
        );

      case "video":
        return items.filter(
          (item) => item.mediaType === "video"
        );

      default:
        return items;
    }
  }, [items, activeFilter]);

  function openImage(item) {
    const index = imageItems.findIndex(
      (img) => img.id === item.id
    );

    if (index >= 0) {
      setCurrentIndex(index);
      setLightboxOpen(true);
    }
  }

  return (
    <>
      <GalleryFilters
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
      />

      {filteredItems.length === 0 ? (
        <div className="text-center py-24 text-2xl text-gray-500">
          No media found.
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-4 gap-6">

          {filteredItems.map((item) =>

            item.mediaType === "video" ? (

              <GalleryVideoCard
                key={item.id}
                item={item}
              />

            ) : (

              <GalleryCard
                key={item.id}
                item={item}
                onOpen={openImage}
              />

            )
          )}

        </div>
      )}

      <Lightbox
        images={imageItems.map((item) => item.image)}
        currentIndex={currentIndex}
        setCurrentIndex={setCurrentIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}