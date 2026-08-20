import {
  FaEdit,
  FaTrash,
  FaStar,
  FaRegStar,
  FaCalendarAlt,
} from "react-icons/fa";

import { getCardImageUrl } from "../../utils/supabaseImageUrl";

export default function MemoryCard({
  memory,
  onEdit,
  onDelete,
}) {
  return (
    <div className="bg-white rounded-[32px] overflow-hidden shadow-xl">

      {/* ==========================
          COVER
      ========================== */}

      <div className="relative">

        <img
          src={
            memory.cover_image
              ? getCardImageUrl(memory.cover_image)
              : "https://placehold.co/1200x700?text=No+Cover"
          }
          alt={memory.title}
          className="w-full h-72 object-cover"
        />

        {/* Chapter */}

        <div className="absolute top-5 left-5">

          <span className="bg-white/90 backdrop-blur px-4 py-2 rounded-full text-sm font-semibold text-[#7B9A67] capitalize">
            {memory.category}
          </span>

        </div>

        {/* Favourite */}

        <div className="absolute top-5 right-5">

          {memory.favorite ? (
            <div className="bg-yellow-400 rounded-full p-3 shadow-lg">
              <FaStar className="text-white text-lg" />
            </div>
          ) : (
            <div className="bg-white/80 rounded-full p-3 shadow-lg">
              <FaRegStar className="text-gray-500 text-lg" />
            </div>
          )}

        </div>

      </div>

      {/* ==========================
          CONTENT
      ========================== */}

      <div className="p-7">

        <h2
          className="text-4xl text-[#4E463F]"
          style={{
            fontFamily: "Baloo 2",
          }}
        >
          {memory.title}
        </h2>

        {/* Date */}

        <div className="flex items-center gap-2 mt-4 text-gray-500">

          <FaCalendarAlt />

          <span>{memory.date}</span>

        </div>

        {/* Age */}

        {memory.age && (

          <div className="mt-3 inline-block bg-[#EEF7E8] text-[#6E8D5C] px-4 py-2 rounded-full text-sm font-semibold">

            🍼 {memory.age}

          </div>

        )}

        {/* Memory Type */}

        <div className="mt-3">

          <span className="inline-block bg-[#FFF5E8] text-[#B58A5A] px-4 py-2 rounded-full text-sm font-semibold capitalize">

            {memory.memory_type}

          </span>

        </div>

        {/* Published */}

        <div className="mt-3">

          <span
            className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
              memory.published
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-600"
            }`}
          >
            {memory.published
              ? "Published"
              : "Draft"}
          </span>

        </div>

        {/* Description */}

        <p className="mt-5 text-gray-600 leading-7 line-clamp-3">

          {memory.description}

        </p>

        {/* Buttons */}

        <div className="flex gap-4 mt-8">

          <button
            onClick={() => onEdit?.(memory)}
            className="flex-1 bg-[#8FAE7A] hover:bg-[#789961] text-white rounded-full py-4 flex justify-center items-center gap-3 font-semibold transition"
          >
            <FaEdit />
            Edit
          </button>

          <button
            onClick={() => onDelete?.(memory)}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-full py-4 flex justify-center items-center gap-3 font-semibold transition"
          >
            <FaTrash />
            Delete
          </button>

        </div>

      </div>

    </div>
  );
}