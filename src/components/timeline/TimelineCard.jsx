import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaHeart, FaRegHeart, FaCalendarAlt } from "react-icons/fa";
import { getCardImageUrl } from "../../utils/r2ImageUrl";

export default function TimelineCard({ item }) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative flex flex-col lg:flex-row gap-6 lg:gap-8 items-center lg:items-start"
    >
      {/* Timeline Circle */}
      <div className="relative z-20 flex-shrink-0">
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="w-20 h-20 lg:w-[110px] lg:h-[110px] rounded-full border-[6px] lg:border-[8px] border-white shadow-xl flex items-center justify-center"
          style={{ background: item.circleColor }}
        >
          <span className="text-3xl lg:text-5xl">{item.icon}</span>
        </motion.div>
      </div>

      {/* Card */}
      <motion.div
        whileHover={{ y: -6 }}
        className="w-full flex-1 bg-white rounded-[28px] lg:rounded-[36px] shadow-xl overflow-hidden border border-[#F1EEE8]"
      >
        <div className="grid grid-cols-1 lg:grid-cols-[330px_1fr]">
          {/* Image */}
          <div className="relative overflow-hidden bg-[#F8F6F2]">
            <img
              src={getCardImageUrl(item.coverImage)}
              alt={item.title}
              className="w-full h-64 lg:h-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

            <div className="absolute top-4 left-4">
              <span className="px-4 py-2 rounded-full bg-white/90 backdrop-blur text-xs lg:text-sm font-semibold">
                {item.category}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 lg:p-10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-[#8FAE7A] text-xs lg:text-sm">
                  <FaCalendarAlt />
                  <span className="font-semibold">{item.date}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-500">{item.age}</span>
                </div>

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.15 }}
                  className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-[#FFF5F7] flex items-center justify-center text-pink-500 shadow"
                >
                  {item.favorite ? <FaHeart /> : <FaRegHeart />}
                </motion.button>
              </div>

              <h2
                className="mt-4 lg:mt-6 text-2xl lg:text-4xl text-[#414141]"
                style={{ fontFamily: "Baloo 2" }}
              >
                {item.title}
              </h2>

              <p
                className="mt-4 leading-7 lg:leading-8 text-[16px] lg:text-[17px] text-gray-600"
                style={{ fontFamily: "Nunito" }}
              >
                {item.description}
              </p>
            </div>

            <div className="mt-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
              <div className="flex flex-wrap gap-3">
                <span className="px-4 py-2 rounded-full bg-[#FFF4DB] text-[#8A6B00] text-sm font-medium">
                  {item.category}
                </span>

                <span className="px-4 py-2 rounded-full bg-[#EEF7E8] text-[#5E8752] text-sm font-medium">
                  {item.age}
                </span>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(`/memory/${item.slug}`)}
                className="w-full lg:w-auto px-6 py-3 rounded-full bg-[#8FAE7A] hover:bg-[#7B9A67] text-white font-semibold shadow-lg transition-all duration-300"
              >
                View Memory
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}