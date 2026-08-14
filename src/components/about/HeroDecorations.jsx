import { motion } from "framer-motion";

import sun from "../../assets/illustrations/sun.webp";
import rainbow from "../../assets/illustrations/rainbow.webp";
import balloon from "../../assets/illustrations/hot-air-baloon.webp";

import cloud from "../../assets/illustrations/cloud.webp";

import stars from "../../assets/illustrations/stars.webp";
import sparkles from "../../assets/illustrations/sparkles.webp";

import blob1 from "../../assets/illustrations/blob-1.webp";
import blob2 from "../../assets/illustrations/blob-2.webp";
import blob3 from "../../assets/illustrations/blob-3.webp";
import blob4 from "../../assets/illustrations/blob-4.webp";

export default function HeroDecorations() {
  return (
    <>
      {/* Watercolor Background Blobs */}

      <motion.img
        src={blob1}
        alt=""
        animate={{
          y: [-20, 20, -20],
          rotate: [-2, 2, -2],
        }}
        transition={{
          repeat: Infinity,
          duration: 18,
          ease: "easeInOut",
        }}
        className="absolute -left-40 -top-40 w-[650px] opacity-45 pointer-events-none"
      />

      <motion.img
        src={blob2}
        alt=""
        animate={{
          y: [15, -15, 15],
        }}
        transition={{
          repeat: Infinity,
          duration: 20,
          ease: "easeInOut",
        }}
        className="absolute right-[-180px] top-20 w-[600px] opacity-35 pointer-events-none"
      />

      <motion.img
        src={blob3}
        alt=""
        animate={{
          rotate: [0, 6, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 22,
          ease: "easeInOut",
        }}
        className="absolute -left-28 bottom-[-120px] w-[520px] opacity-30 pointer-events-none"
      />

      <motion.img
        src={blob4}
        alt=""
        animate={{
          y: [-10, 10, -10],
        }}
        transition={{
          repeat: Infinity,
          duration: 24,
          ease: "easeInOut",
        }}
        className="absolute -right-24 bottom-[-180px] w-[520px] opacity-35 pointer-events-none"
      />

      {/* Sun */}

      <motion.img
        src={sun}
        alt=""
        animate={{
          rotate: 360,
        }}
        transition={{
          repeat: Infinity,
          duration: 90,
          ease: "linear",
        }}
        className="absolute left-0 top-5 w-32 lg:w-40"
      />

      {/* Balloon */}

      <motion.img
        src={balloon}
        alt=""
        animate={{
          y: [-20, 20, -20],
          rotate: [-5, 5, -5],
        }}
        transition={{
          repeat: Infinity,
          duration: 8,
          ease: "easeInOut",
        }}
        className="absolute left-[44%] top-10 w-24 lg:w-32"
      />

      {/* Rainbow */}

      <motion.img
        src={rainbow}
        alt=""
        animate={{
          y: [-10, 10, -10],
        }}
        transition={{
          repeat: Infinity,
          duration: 8,
          ease: "easeInOut",
        }}
        className="absolute right-0 top-6 w-52 lg:w-72"
      />

      {/* Left Cloud */}

      <motion.img
        src={cloud}
        alt=""
        animate={{
          x: [-12, 12, -12],
        }}
        transition={{
          repeat: Infinity,
          duration: 12,
          ease: "easeInOut",
        }}
        className="absolute left-10 top-52 w-32 opacity-70"
      />

      {/* Right Cloud */}

      <motion.img
        src={cloud}
        alt=""
        animate={{
          x: [12, -12, 12],
        }}
        transition={{
          repeat: Infinity,
          duration: 14,
          ease: "easeInOut",
        }}
        className="absolute right-20 bottom-16 w-36 opacity-60"
      />

      {/* Stars */}

      <motion.img
        src={stars}
        alt=""
        animate={{
          opacity: [0.35, 1, 0.35],
          scale: [1, 1.04, 1],
        }}
        transition={{
          repeat: Infinity,
          duration: 4,
        }}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />

      {/* Sparkles */}

      <motion.img
        src={sparkles}
        alt=""
        animate={{
          opacity: [0.25, 0.8, 0.25],
          y: [-5, 5, -5],
        }}
        transition={{
          repeat: Infinity,
          duration: 5,
        }}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />
    </>
  );
}