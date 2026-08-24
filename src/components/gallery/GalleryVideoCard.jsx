import { motion } from "framer-motion";
import { FaPlay } from "react-icons/fa";

import {
  getGalleryThumbnailUrl,
} from "../../utils/r2ImageUrl";

export default function GalleryVideoCard({
  item,
  onOpen,
}) {
  /*
  ==========================================================
  VIDEO POSTER / COVER

  If the video already has an image associated with it,
  use the optimized Supabase image transformation.

  We do NOT download the original cover image for the
  Gallery card.
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
        relative
        overflow-hidden
        rounded-[24px]
        bg-black
        shadow-lg
        break-inside-avoid
        mb-5
        cursor-pointer
      "
      onClick={() =>
        onOpen(item)
      }
    >

      {item.image ? (

        /*
        ======================================================
        OPTIMIZED VIDEO COVER IMAGE
        ======================================================
        */

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

      ) : item.video ? (

        /*
        ======================================================
        IMPORTANT VIDEO CHANGE

        Previously:

            preload="metadata"

        That can cause the browser to contact Supabase
        simply because the Gallery card exists.

        We now use:

            preload="none"

        The actual video will be loaded when the user
        opens it through the existing Lightbox.
        ======================================================
        */

        <video
          src={item.video}
          muted
          playsInline
          preload="none"
          className="
            w-full
            aspect-video
            block
            object-cover
            bg-black
          "
        />

      ) : (

        <div
          className="
            w-full
            aspect-video
            bg-black
          "
        />

      )}

      {/* ====================================================
          PLAY INDICATOR
      ==================================================== */}

      <div
        className="
          absolute
          inset-0
          flex
          items-center
          justify-center
          pointer-events-none
        "
      >
        <div
          className="
            w-16
            h-16
            rounded-full
            bg-white/85
            flex
            items-center
            justify-center
            shadow-xl
          "
        >
          <FaPlay
            size={22}
            className="
              text-[#8FAE7A]
              ml-1
            "
          />
        </div>
      </div>

    </motion.div>
  );
}