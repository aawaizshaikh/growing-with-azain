import { motion } from "framer-motion";

import divider from "../../assets/illustrations/leaf-divider.webp";
import QuoteCard from "./QuoteCard";

export default function HeroIntro() {
  return (
    <motion.div
      initial={{
        opacity: 0,
        x: -40,
      }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      transition={{
        duration: 0.8,
      }}
      className="relative z-20"
    >
      <motion.h3
        animate={{
          y: [-2, 2, -2],
        }}
        transition={{
          repeat: Infinity,
          duration: 5,
          ease: "easeInOut",
        }}
        className="text-5xl lg:text-6xl text-[#4E3929]"
        style={{
          fontFamily: "Baloo 2",
        }}
      >
        All About
      </motion.h3>

      <motion.h1
        animate={{
          y: [-4, 4, -4],
        }}
        transition={{
          repeat: Infinity,
          duration: 6,
          ease: "easeInOut",
        }}
        className="text-[110px] lg:text-[150px] leading-none mt-2"
        style={{
          fontFamily: "Baloo 2",
          color: "#86A46D",
        }}
      >
        Azain
      </motion.h1>

      <motion.img
        src={divider}
        alt=""
        className="w-[420px] mt-5"
        animate={{
          scale: [1, 1.02, 1],
        }}
        transition={{
          repeat: Infinity,
          duration: 6,
        }}
      />

      <motion.div
        className="mt-10"
        whileHover={{
          y: -5,
          scale: 1.01,
        }}
        transition={{
          duration: .25,
        }}
      >
        <QuoteCard />
      </motion.div>
    </motion.div>
  );
}