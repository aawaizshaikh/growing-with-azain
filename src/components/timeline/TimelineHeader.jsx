import { motion } from "framer-motion";
import { FaSortAmountDownAlt } from "react-icons/fa";

import Balloon from "../../assets/illustrations/balloon.png";
import Cloud from "../../assets/illustrations/cloud.png";
import Leaf from "../../assets/illustrations/leaf.png";
import Star from "../../assets/illustrations/star.png";

export default function TimelineHeader() {
  return (
    <section className="relative overflow-hidden rounded-[28px] lg:rounded-[36px] bg-[#FFFDF8] border border-[#F1EBDD] shadow-lg px-5 sm:px-8 lg:px-10 py-8 lg:py-10">

      {/* Decorations */}

      <motion.img
        src={Cloud}
        alt=""
        className="absolute top-3 left-3 sm:left-10 lg:left-16 w-16 sm:w-24 lg:w-28 opacity-50 pointer-events-none"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      <motion.img
        src={Cloud}
        alt=""
        className="absolute top-8 right-3 sm:right-10 lg:right-20 w-14 sm:w-16 lg:w-20 opacity-50 pointer-events-none"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
      />

      <motion.img
        src={Leaf}
        alt=""
        className="absolute left-2 bottom-2 lg:left-5 lg:bottom-4 w-12 sm:w-16 lg:w-20 opacity-70"
        animate={{ rotate: [-5, 5, -5] }}
        transition={{ duration: 7, repeat: Infinity }}
      />

      <motion.img
        src={Leaf}
        alt=""
        className="absolute right-2 top-2 lg:right-5 lg:top-6 w-12 sm:w-16 lg:w-20 opacity-70"
        animate={{ rotate: [5, -5, 5] }}
        transition={{ duration: 7, repeat: Infinity }}
      />

      <motion.img
        src={Balloon}
        alt=""
        className="absolute right-16 sm:right-24 lg:right-36 top-3 w-10 sm:w-12 lg:w-14"
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
      />

      <motion.img
        src={Star}
        alt=""
        className="absolute left-1/2 top-2 lg:top-3 w-5 sm:w-6 lg:w-8"
        animate={{ rotate: [0, 20, -20, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      {/* Header */}

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">

        <div className="max-w-3xl">

          <p
            className="uppercase tracking-[3px] text-xs sm:text-sm text-[#9AA88D]"
            style={{ fontFamily: "Nunito" }}
          >
            Growing with Azain
          </p>

          <h1
            className="mt-3 text-4xl sm:text-5xl lg:text-6xl text-[#8FAE7A] leading-tight"
            style={{ fontFamily: "Baloo 2" }}
          >
            Azain's Timeline
          </h1>

          <p
            className="mt-4 lg:mt-5 text-[16px] sm:text-lg text-gray-600 leading-7 lg:leading-8"
            style={{ fontFamily: "Nunito" }}
          >
            Every smile, every cuddle, every tiny achievement and every
            beautiful memory captured forever in one special place.
          </p>

        </div>

        {/* Sort */}

        <motion.div
          whileHover={{ scale: 1.03 }}
          className="flex items-center gap-4 bg-[#FFF7E8] border border-[#F2E7C7] rounded-2xl px-5 py-4 shadow-md w-full sm:w-auto"
        >

          <div className="w-11 h-11 rounded-full bg-white shadow flex items-center justify-center text-[#8FAE7A]">

            <FaSortAmountDownAlt size={18} />

          </div>

          <div className="flex-1">

            <p className="text-xs uppercase tracking-wider text-gray-500">
              Sort By
            </p>

            <select
              className="bg-transparent outline-none text-base lg:text-lg cursor-pointer w-full"
              style={{ fontFamily: "Nunito" }}
            >
              <option>Newest First</option>
              <option>Oldest First</option>
            </select>

          </div>

        </motion.div>

      </div>

      {/* Category Buttons */}

      <div className="relative z-10 mt-8 flex flex-wrap gap-3 lg:gap-4">

        <button className="px-5 py-2.5 rounded-full bg-[#8FAE7A] text-white shadow font-semibold">
          All
        </button>

        <button className="px-5 py-2.5 rounded-full bg-[#FFF3DA] hover:bg-[#F8EBC6] transition">
          Birth
        </button>

        <button className="px-5 py-2.5 rounded-full bg-[#EEF7E8] hover:bg-[#DDEFD6] transition">
          Milestones
        </button>

        <button className="px-5 py-2.5 rounded-full bg-[#EAF4FD] hover:bg-[#D8ECFA] transition">
          Photos
        </button>

        <button className="px-5 py-2.5 rounded-full bg-[#F8EEF8] hover:bg-[#F0DDF0] transition">
          Family
        </button>

      </div>

    </section>
  );
}