import { motion } from "framer-motion";
import { FaPlay } from "react-icons/fa";

export default function GalleryVideoCard({
  item,
  onOpen,
}) {
  return (
    <motion.div
      layout
      whileHover={{
        scale: 1.02,
      }}
      transition={{
        duration: 0.25,
      }}
      className="relative overflow-hidden rounded-[24px] bg-black shadow-lg break-inside-avoid mb-5 cursor-pointer"
      onClick={() =>
        onOpen(item)
      }
    >
      {item.image ? (
        <img
          src={item.image}
          alt=""
          className="w-full h-auto block object-cover transition-transform duration-500 hover:scale-[1.02]"
        />
      ) : item.video ? (
        <video
          src={item.video}
          muted
          playsInline
          preload="metadata"
          className="w-full h-auto block object-cover"
        />
      ) : (
        <div className="w-full aspect-video bg-black" />
      )}

      {/* Play indicator only */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-16 h-16 rounded-full bg-white/85 flex items-center justify-center shadow-xl">
          <FaPlay
            size={22}
            className="text-[#8FAE7A] ml-1"
          />
        </div>
      </div>
    </motion.div>
  );
}