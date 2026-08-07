import { motion } from "framer-motion";
import {
  FaCalendarAlt,
  FaFilter,
  FaHeart,
  FaBaby,
  FaStar,
  FaCamera,
} from "react-icons/fa";

import Azain from "../../assets/images/azain.jpg";
import Balloon from "../../assets/illustrations/balloon.png";
import Cloud from "../../assets/illustrations/cloud.png";
import Leaf from "../../assets/illustrations/leaf.png";
import Star from "../../assets/illustrations/star.png";
import Heart from "../../assets/illustrations/heart.png";

const filters = [
  { icon: <FaBaby />, title: "Birth", color: "bg-[#FFF2D9]" },
  { icon: <FaStar />, title: "Milestones", color: "bg-[#EAF7E5]" },
  { icon: <FaCamera />, title: "Photos", color: "bg-[#EAF5FF]" },
];

export default function TimelineSidebar() {
  return (
    <aside className="relative">
      <motion.img
        animate={{ y: [0, -15, 0] }}
        transition={{ repeat: Infinity, duration: 6 }}
        src={Cloud}
        alt=""
        className="absolute -top-8 -left-4 lg:-top-10 lg:-left-8 w-20 lg:w-28 opacity-60 pointer-events-none"
      />

      <motion.img
        animate={{ y: [0, 15, 0] }}
        transition={{ repeat: Infinity, duration: 5 }}
        src={Cloud}
        alt=""
        className="absolute top-44 -right-4 lg:top-52 lg:-right-10 w-16 lg:w-20 opacity-60 pointer-events-none"
      />

      <motion.img
        animate={{ rotate: [-4, 4, -4] }}
        transition={{ repeat: Infinity, duration: 5 }}
        src={Balloon}
        alt=""
        className="absolute top-8 right-0 lg:top-10 lg:-right-5 w-12 lg:w-16 pointer-events-none"
      />

      <motion.img
        animate={{ rotate: [-5, 5, -5] }}
        transition={{ repeat: Infinity, duration: 7 }}
        src={Leaf}
        alt=""
        className="absolute top-64 -left-3 lg:top-72 lg:-left-5 w-14 lg:w-20 opacity-80 pointer-events-none"
      />

      <motion.img
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 4 }}
        src={Star}
        alt=""
        className="absolute top-16 left-12 lg:top-20 lg:left-16 w-6 lg:w-8 opacity-90 pointer-events-none"
      />

      <div className="bg-white rounded-[32px] lg:rounded-[38px] shadow-xl border border-[#F2EFE8] p-6 lg:p-8 sticky top-8 overflow-hidden">
        <img src={Heart} alt="" className="absolute top-5 right-5 w-7 lg:w-8 opacity-70" />

        <div className="relative flex justify-center">
          <div className="absolute inset-0 rounded-full bg-[#F7F0DD] scale-105 blur-lg opacity-50" />
          <img
            src={Azain}
            alt="Azain"
            className="relative w-40 h-40 lg:w-48 lg:h-48 rounded-full object-cover border-[8px] border-[#FFF6E5] shadow-xl"
          />
        </div>

        <h2 className="text-center mt-6 lg:mt-8 text-3xl lg:text-4xl text-[#7D9C69]" style={{fontFamily:"Baloo 2"}}>
          Azain
        </h2>

        <p className="text-center mt-2 text-gray-500" style={{fontFamily:"Nunito"}}>
          Our Little Miracle
        </p>

        <div className="mt-8 rounded-3xl bg-[#FFF9EF] p-5 border border-[#F2E6C5]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#F7E7B5] flex items-center justify-center text-[#8FAE7A]">
              <FaCalendarAlt />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500">Born</p>
              <h4 className="text-lg" style={{fontFamily:"Baloo 2"}}>14 September 2024</h4>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <h4 className="text-xl text-[#8FAE7A]" style={{fontFamily:"Baloo 2"}}>
            Little Moments,<br/>Big Memories
          </h4>
          <p className="mt-3 text-[15px] text-gray-500 leading-7" style={{fontFamily:"Nunito"}}>
            Every smile, every cuddle and every tiny adventure deserves to be remembered forever.
          </p>
        </div>

        <div className="my-8 flex justify-center">
          <div className="w-24 h-[3px] rounded-full bg-[#E8D8A2]" />
        </div>

        <div>
          <div className="flex items-center gap-3 mb-5">
            <FaFilter className="text-[#8FAE7A]" />
            <h3 className="text-2xl" style={{fontFamily:"Baloo 2"}}>Timeline Filters</h3>
          </div>

          <div className="space-y-4">
            {filters.map((filter, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`w-full rounded-2xl px-5 py-4 flex items-center justify-between ${filter.color}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center shadow">
                    {filter.icon}
                  </div>
                  <span style={{fontFamily:"Nunito"}}>{filter.title}</span>
                </div>
                <span>→</span>
              </motion.button>
            ))}
          </div>
        </div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="mt-10 rounded-3xl bg-[#FFF3F5] border border-pink-100 p-5"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white shadow flex items-center justify-center text-pink-500">
              <FaHeart />
            </div>
            <div>
              <h4 className="text-xl" style={{fontFamily:"Baloo 2"}}>Favourite Memories</h4>
              <p className="text-sm text-gray-500">Mark your most precious moments.</p>
            </div>
          </div>
        </motion.div>

        <motion.img
          animate={{ y: [0, -12, 0] }}
          transition={{ repeat: Infinity, duration: 4 }}
          src={Teddy}
          alt=""
          className="mx-auto mt-10 w-28 lg:w-36"
        />
      </div>
    </aside>
  );
}