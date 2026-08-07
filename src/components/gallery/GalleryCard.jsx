import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function GalleryCard({ item, onOpen }) {
  const navigate = useNavigate();

  return (
    <motion.div
      layout
      whileHover={{
        y: -6,
        scale: 1.02,
      }}
      transition={{
        duration: 0.25,
      }}
      className="overflow-hidden rounded-[28px] bg-white shadow-xl break-inside-avoid mb-6"
    >
      <div
        className="cursor-pointer"
        onClick={() => onOpen(item)}
      >
        <img
          src={item.image}
          alt={item.title}
          className="w-full object-cover hover:scale-105 transition duration-500"
        />
      </div>

      <div className="p-5">

        <div className="flex items-center justify-between">

          <span className="inline-block px-3 py-1 rounded-full bg-[#FFF3DA] text-[#8B6A35] text-xs font-semibold">
            {item.category}
          </span>

          <span className="text-xs text-gray-400">
            {item.type === "timeline"
              ? "📖"
              : item.type === "milestone"
              ? "🌱"
              : "🎵"}
          </span>

        </div>

        <h3
          className="mt-4 text-2xl text-[#454545]"
          style={{
            fontFamily: "Baloo 2",
          }}
        >
          {item.title}
        </h3>

        <p className="text-gray-500 mt-1">
          {item.date}
        </p>

        <button
          onClick={() => navigate(item.url)}
          className="mt-5 w-full rounded-full bg-[#8FAE7A] hover:bg-[#789961] text-white py-3 font-semibold transition"
        >
          View Memory
        </button>

      </div>
    </motion.div>
  );
}