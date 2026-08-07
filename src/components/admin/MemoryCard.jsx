import { FaEdit, FaTrash, FaStar, FaRegStar, FaCalendarAlt } from "react-icons/fa";

export default function MemoryCard({
  memory,
  onEdit,
  onDelete,
}) {
  return (
    <div className="bg-white rounded-[30px] overflow-hidden shadow-xl hover:shadow-2xl transition duration-300">

      {/* Cover Image */}

      <div className="relative">

        <img
          src={
            memory.cover_image ||
            "https://placehold.co/1200x700?text=No+Cover"
          }
          alt={memory.title}
          className="w-full h-72 object-cover"
        />

        <div className="absolute top-5 left-5">

          <span className="bg-white/90 backdrop-blur px-4 py-2 rounded-full text-sm font-semibold text-[#7B9A67]">
            {memory.category}
          </span>

        </div>

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

      {/* Content */}

      <div className="p-7">

        <h2
          className="text-4xl text-[#4E463F]"
          style={{
            fontFamily: "Baloo 2",
          }}
        >
          {memory.title}
        </h2>

        <div className="flex items-center gap-2 mt-4 text-gray-500">

          <FaCalendarAlt />

          <span>
            {memory.date}
          </span>

        </div>

        {memory.age && (
          <div className="mt-3 inline-block bg-[#EEF7E8] text-[#6E8D5C] px-4 py-2 rounded-full text-sm font-semibold">
            🍼 {memory.age}
          </div>
        )}

        <p className="mt-5 text-gray-600 leading-7 line-clamp-3">
          {memory.description}
        </p>

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