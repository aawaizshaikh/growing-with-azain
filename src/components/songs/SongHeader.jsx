import { motion } from "framer-motion";

import gramophone from "../../assets/illustrations/gramophone.webp";
import cloud from "../../assets/illustrations/cloud.webp";
import note1 from "../../assets/illustrations/music-note-1.webp";
import note2 from "../../assets/illustrations/music-note-2.webp";
import note3 from "../../assets/illustrations/music-note-3.webp";
import heart from "../../assets/illustrations/dancing-heart.webp";

export default function SongHeader() {
  return (
    <section className="relative overflow-hidden rounded-[40px] bg-white px-12 py-10 shadow-lg border border-[#F4EFE6]">

      {/* Floating Clouds */}

      <motion.img
        src={cloud}
        alt=""
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute left-[38%] top-20 w-24 opacity-80"
      />

      <motion.img
        src={cloud}
        alt=""
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 7, repeat: Infinity }}
        className="absolute right-52 top-14 w-24 opacity-80"
      />

      {/* Music Notes */}

      <motion.img
        src={note1}
        alt=""
        animate={{
          y: [0, -8, 0],
          rotate: [0, 12, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
        }}
        className="absolute right-80 top-8 w-8"
      />

      <motion.img
        src={note2}
        alt=""
        animate={{
          y: [0, -10, 0],
          rotate: [0, -10, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
        }}
        className="absolute right-24 top-28 w-7"
      />

      <motion.img
        src={note3}
        alt=""
        animate={{
          y: [0, -6, 0],
          rotate: [0, 10, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
        }}
        className="absolute right-44 top-40 w-6"
      />

      <div className="grid lg:grid-cols-[1fr_260px] gap-10 items-center">

        {/* Left Side */}

        <div>

          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-4 text-[52px] text-[#7FA26A]"
            style={{
              fontFamily: "Baloo 2",
            }}
          >
            <img src={note1} alt="" className="w-10" />

            Azain's Favorite Songs

            <img src={heart} alt="" className="w-9" />
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              delay: 0.2,
              duration: 0.6,
            }}
            className="mt-5 max-w-xl text-[22px] leading-10 text-gray-600"
            style={{
              fontFamily: "Nunito",
            }}
          >
            The tunes that stole his heart
            <br />
            and made every moment special.
          </motion.p>

        </div>
                {/* Right Side */}

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative flex items-center justify-end"
        >
          {/* Gramophone */}

          <motion.img
            src={gramophone}
            alt="Gramophone"
            animate={{
              y: [0, -6, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
            }}
            className="w-52"
          />

          {/* Floating Note */}

          <motion.img
            src={note2}
            alt=""
            animate={{
              y: [0, -10, 0],
              rotate: [0, 15, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
            }}
            className="absolute right-10 top-4 w-7"
          />
        </motion.div>
      </div>

      {/* Sort Button */}

      <div className="absolute right-10 bottom-8">
        <button className="rounded-full border border-[#E8E3D8] bg-white px-6 py-3 text-lg font-medium text-[#555] shadow-sm transition hover:shadow-md">
          Newest First ↓
        </button>
      </div>
    </section>
  );
}