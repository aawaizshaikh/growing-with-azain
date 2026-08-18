import { motion } from "framer-motion";

export default function GalleryCard({
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
      className="overflow-hidden rounded-[24px] bg-white shadow-lg break-inside-avoid mb-5 cursor-pointer"
      onClick={() =>
        onOpen(item)
      }
    >
      <img
        src={item.image}
        alt=""
        className="w-full h-auto block object-cover transition-transform duration-500 hover:scale-[1.02]"
      />
    </motion.div>
  );
}