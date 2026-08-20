import { motion } from "framer-motion";

import {
  getGalleryThumbnailUrl,
} from "../../utils/supabaseImageUrl";

export default function GalleryCard({
  item,
  onOpen,
}) {
  /*
  ==========================================================
  OPTIMIZED GALLERY IMAGE

  The database still contains the original Supabase URL.

  We only transform the delivery URL used by the Gallery.

  Original:
      full-resolution image

  Gallery:
      600px optimized version
  ==========================================================
  */

  const imageSource =
    getGalleryThumbnailUrl(
      item.image
    );

  return (
    <motion.div
      layout
      whileHover={{
        scale: 1.02,
      }}
      transition={{
        duration: 0.25,
      }}
      className="
        overflow-hidden
        rounded-[24px]
        bg-white
        shadow-lg
        break-inside-avoid
        mb-5
        cursor-pointer
      "
      onClick={() =>
        onOpen(item)
      }
    >
      <img
        src={imageSource}
        alt=""
        loading="lazy"
        decoding="async"
        sizes="
          (max-width: 640px) 100vw,
          (max-width: 1024px) 50vw,
          25vw
        "
        className="
          w-full
          h-auto
          block
          object-cover
          transition-transform
          duration-500
          hover:scale-[1.02]
        "
      />
    </motion.div>
  );
}import { motion } from "framer-motion";

import {
  getGalleryThumbnailUrl,
} from "../../utils/supabaseImageUrl";

export default function GalleryCard({
  item,
  onOpen,
}) {
  /*
  ==========================================================
  OPTIMIZED GALLERY IMAGE

  The database still contains the original Supabase URL.

  We only transform the delivery URL used by the Gallery.

  Original:
      full-resolution image

  Gallery:
      600px optimized version
  ==========================================================
  */

  const imageSource =
    getGalleryThumbnailUrl(
      item.image
    );

  return (
    <motion.div
      layout
      whileHover={{
        scale: 1.02,
      }}
      transition={{
        duration: 0.25,
      }}
      className="
        overflow-hidden
        rounded-[24px]
        bg-white
        shadow-lg
        break-inside-avoid
        mb-5
        cursor-pointer
      "
      onClick={() =>
        onOpen(item)
      }
    >
      <img
        src={imageSource}
        alt=""
        loading="lazy"
        decoding="async"
        sizes="
          (max-width: 640px) 100vw,
          (max-width: 1024px) 50vw,
          25vw
        "
        className="
          w-full
          h-auto
          block
          object-cover
          transition-transform
          duration-500
          hover:scale-[1.02]
        "
      />
    </motion.div>
  );
}