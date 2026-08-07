import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaPlay } from "react-icons/fa";

export default function GalleryVideoCard({ item }) {
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
        className="relative cursor-pointer group"
        onClick={() => navigate(item.url)}
      >
        <img
          src={item.image}
          alt={item.title}
          className="w-full object-cover transition duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition" />

        <div className="absolute inset-0 flex items-center justify-center">

          <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center shadow-xl">

            <FaPlay
              size={28}
              className="text-[#8FAE7A] ml-1"
            />

          </div>

        </div>

        <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
          VIDEO
        </div>

      </div>

      <div className="p-5">

        <div className="flex items-center justify-between">

          <span className="inline-block px-3 py-1 rounded-full bg-[#EEF7E8] text-[#5A8A4A] text-xs font-semibold">
            Favourite Song
          </span>

          <span className="text-xs text-gray-400">
            🎥
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
          Watch Memory
        </button>

      </div>
    </motion.div>
  );
}