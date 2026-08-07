import { motion } from "framer-motion";

const filters = [
  {
    id: "all",
    label: "All",
  },
  {
    id: "timeline",
    label: "Timeline",
  },
  {
    id: "milestone",
    label: "Milestones",
  },
  {
    id: "song",
    label: "Songs",
  },
  {
    id: "image",
    label: "Photos",
  },
  {
    id: "video",
    label: "Videos",
  },
];

export default function GalleryFilters({
  activeFilter,
  setActiveFilter,
}) {
  return (
    <div className="flex flex-wrap justify-center gap-4 mb-14">

      {filters.map((filter) => (

        <motion.button
          key={filter.id}
          whileTap={{ scale: 0.96 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => setActiveFilter(filter.id)}
          className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
            activeFilter === filter.id
              ? "bg-[#8FAE7A] text-white shadow-lg"
              : "bg-white text-[#6D645C] shadow hover:bg-[#EEF7E8]"
          }`}
        >
          {filter.label}
        </motion.button>

      ))}

    </div>
  );
}