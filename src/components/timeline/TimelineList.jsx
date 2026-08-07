import React, { useState } from "react";

export const TimelineList = ({ selectedBook, memories = [] }) => {
  const [activeFilter, setActiveFilter] = useState("All");

  if (!selectedBook) return null;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 mt-6">
      {/* Active Chapter Header */}
      <div className="bg-[#fff9ef] rounded-3xl p-6 border border-[#eedfcc] shadow-sm mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-full bg-[#f4ebe1] flex items-center justify-center text-2xl border border-[#e0d0c0]">
              👶
            </div>
            <div>
              <h2 className="text-2xl font-serif text-[#3b2d27] font-bold flex items-center gap-2">
                {selectedBook.title} <span className="text-emerald-600 text-lg">♥</span>
              </h2>
              <p className="text-xs text-[#7c6a5d] font-medium mt-0.5">
                {selectedBook.subtitle} • {memories.length} memories
              </p>
            </div>
          </div>
        </div>

        {/* Sub-Filters */}
        {selectedBook.subFilters && (
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
            <span className="text-xs font-semibold text-[#8c7a6b] mr-2">Filter</span>
            {selectedBook.subFilters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  activeFilter === filter
                    ? "bg-[#586b4d] text-white shadow-sm"
                    : "bg-white text-[#6b5e52] border border-[#e5d8ca] hover:bg-[#f7efe5]"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Dynamic Memories Grid from Admin Panel Data */}
      {memories.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {memories.map((item) => (
            <div
              key={item._id || item.id}
              className="bg-[#fffcf7] rounded-2xl p-4 border border-[#eee4d8] shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between"
            >
              <div>
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-32 object-cover rounded-xl mb-3"
                  />
                )}
                <h3 className="font-serif font-bold text-[#3b2d27] text-sm mb-1">
                  {item.title}
                </h3>
                <p className="text-[11px] text-[#8c7b6e] mb-3">{item.date}</p>
                {item.description && (
                  <p className="text-xs text-[#6b584a] mb-3 line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>
              {item.tag && (
                <span className="inline-block self-start text-[10px] font-medium px-2.5 py-1 rounded-full bg-[#f4ece1] text-[#6b584a]">
                  {item.tag}
                </span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-[#fffcf7] rounded-2xl border border-[#eee4d8]">
          <p className="text-[#8c7b6e] text-sm font-medium">
            No memories added yet in this chapter.
          </p>
        </div>
      )}
    </div>
  );
};

export default TimelineList;