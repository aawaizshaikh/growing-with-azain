    import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaCalendarAlt, FaPlay } from "react-icons/fa";

export default function SongCard({ song }) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative flex gap-8 items-start"
    >

      {/* Timeline Circle */}

      <div className="relative z-20 flex-shrink-0">

        <div className="w-[110px] h-[110px] rounded-full bg-[#FFF5E8] border-[8px] border-white shadow-xl flex items-center justify-center">

          <FaPlay
            size={36}
            className="text-[#8FAE7A] ml-1"
          />

        </div>

      </div>

      {/* Card */}

      <motion.div
        whileHover={{ y: -6 }}
        className="flex-1 bg-white rounded-[36px] shadow-xl overflow-hidden border border-[#F1EEE8]"
      >

        <div className="grid lg:grid-cols-[330px_1fr]">

          {/* Thumbnail */}

          <div className="relative overflow-hidden bg-[#F8F6F2]">

            <img
              src={song.cover}
              alt={song.title}
              className="w-full h-full object-cover min-h-[280px]"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

            {/* Play Button */}

            <div className="absolute inset-0 flex items-center justify-center">

              <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center shadow-lg">

                <FaPlay
                  className="ml-1 text-[#8FAE7A]"
                  size={28}
                />

              </div>

            </div>

          </div>
                    {/* Content */}

          <div className="p-10 flex flex-col justify-between">

            <div>

              {/* Date */}

              <div className="flex items-center gap-3 text-[#8FAE7A]">

                <FaCalendarAlt />

                <span className="text-sm font-semibold">
                  {song.month}
                </span>

                <span className="text-gray-400">•</span>

                <span className="text-sm text-gray-500">
                  {song.age}
                </span>

              </div>

              {/* Song Title */}

              <h2
                className="mt-6 text-4xl text-[#414141]"
                style={{
                  fontFamily: "Baloo 2",
                }}
              >
                {song.title}
              </h2>

              {/* Story */}

              <p
                className="mt-6 leading-8 text-[17px] text-gray-600"
                style={{
                  fontFamily: "Nunito",
                }}
              >
                {song.story}
              </p>

            </div>

            {/* Bottom */}

            <div className="mt-10 flex flex-wrap items-center justify-between gap-5">

              <div className="flex flex-wrap gap-3">

                <span className="px-4 py-2 rounded-full bg-[#FFF4DB] text-[#8A6B00] text-sm font-medium">
                  {song.month}
                </span>

                <span className="px-4 py-2 rounded-full bg-[#EEF7E8] text-[#5E8752] text-sm font-medium">
                  {song.age}
                </span>

              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() =>
                  navigate(`/favorite-songs/${song.slug}`)
                }
                className="px-6 py-3 rounded-full bg-[#8FAE7A] hover:bg-[#7B9A67] text-white font-semibold shadow-lg transition-all duration-300"
              >
                Watch Memory
              </motion.button>

            </div>

          </div>

        </div>

      </motion.div>

    </motion.div>
  );
}