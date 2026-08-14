import { motion } from "framer-motion";
import { FaPlay, FaCalendarAlt } from "react-icons/fa";

import heart from "../../assets/illustrations/dancing-heart.webp";
import note1 from "../../assets/illustrations/music-note-1.webp";
import note2 from "../../assets/illustrations/music-note-2.webp";
import note3 from "../../assets/illustrations/music-note-3.webp";
import cloud from "../../assets/illustrations/cloud.webp";

export default function FeaturedSong() {
  return (
    <section className="relative mt-8 overflow-hidden rounded-[40px] border border-[#F4EFE6] bg-white p-6 shadow-lg">

      {/* Decorations */}

      <img
        src={cloud}
        alt=""
        className="absolute right-56 top-10 w-24 opacity-60"
      />

      <img
        src={note1}
        alt=""
        className="absolute right-16 top-16 w-8"
      />

      <img
        src={note2}
        alt=""
        className="absolute right-44 bottom-16 w-7"
      />

      <img
        src={note3}
        alt=""
        className="absolute right-8 bottom-32 w-6"
      />

      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8">

        {/* Video */}

        <div className="relative overflow-hidden rounded-[30px]">

          <img
            src="/pics/azain-song.jpg"
            alt="Favorite Song"
            className="h-[420px] w-full object-cover"
          />

          {/* Play Button */}

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-xl"
          >
            <FaPlay
              className="ml-1"
              size={34}
              color="#7FA26A"
            />
          </motion.button>

          {/* Duration */}

          <div className="absolute bottom-5 left-5 rounded-full bg-black/60 px-4 py-2 text-white">
            0:21
          </div>

        </div>
                {/* Song Details */}

        <div className="relative flex flex-col justify-center">

          {/* Current Favourite */}

          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#FFF4EF] px-5 py-2 text-sm font-semibold text-[#E07A5F] shadow-sm">
            ❤️ Current Favorite
          </span>

          {/* Song Name */}

          <h2
            className="mt-6 text-6xl text-[#414141]"
            style={{
              fontFamily: "Baloo 2",
            }}
          >
            Aapate
          </h2>

          {/* Artist */}

          <p
            className="mt-2 text-2xl text-gray-500"
            style={{
              fontFamily: "Nunito",
            }}
          >
            By Traditional Marathi Song
          </p>

          {/* Story */}

          <p
            className="mt-8 max-w-md text-[20px] leading-10 text-gray-600"
            style={{
              fontFamily: "Nunito",
            }}
          >
            Every time this song started playing,
            Azain stopped everything, smiled,
            and began dancing with Mommy.
          </p>

          {/* Date */}

          <div className="mt-10 flex items-center gap-3 text-lg text-[#6F6F6F]">

            <FaCalendarAlt />

            <span>September 2025</span>

            <span>•</span>

            <span>11 Months Old</span>

          </div>

          {/* Decorative Heart */}

          <motion.img
            src={heart}
            alt=""
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
            }}
            className="absolute right-8 top-20 w-52 opacity-90"
          />

        </div>

      </div>

    </section>
  );
}