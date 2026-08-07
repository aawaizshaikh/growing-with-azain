import { motion } from "framer-motion";

import steam from "../../assets/illustrations/train-steam.png";
import stars from "../../assets/illustrations/train-stars.png";

export default function TrainEffects() {
  return (
    <>
      {/* ==========================
             STEAM
      =========================== */}

      <motion.img
        src={steam}
        alt=""
        draggable={false}
        className="absolute left-[122px] -top-4 w-14 z-30 pointer-events-none"
        animate={{
          y: [0, -45],
          x: [0, -6],
          opacity: [0, 1, 0],
          scale: [0.4, 1.05],
        }}
        transition={{
          duration: 2.8,
          repeat: Infinity,
          ease: "easeOut",
        }}
      />

      <motion.img
        src={steam}
        alt=""
        draggable={false}
        className="absolute left-[130px] -top-1 w-12 z-30 pointer-events-none"
        animate={{
          y: [0, -58],
          x: [0, 8],
          opacity: [0, 1, 0],
          scale: [0.35, 1],
        }}
        transition={{
          duration: 2.8,
          delay: 0.9,
          repeat: Infinity,
          ease: "easeOut",
        }}
      />

      <motion.img
        src={steam}
        alt=""
        draggable={false}
        className="absolute left-[118px] top-2 w-10 z-30 pointer-events-none"
        animate={{
          y: [0, -72],
          x: [0, -4],
          opacity: [0, 1, 0],
          scale: [0.3, 0.9],
        }}
        transition={{
          duration: 2.8,
          delay: 1.8,
          repeat: Infinity,
          ease: "easeOut",
        }}
      />

      {/* ==========================
             TRAIN STARS
      =========================== */}

      <motion.img
        src={stars}
        alt=""
        draggable={false}
        className="absolute -left-24 top-4 w-24 opacity-70 pointer-events-none"
        animate={{
          opacity: [0.2, 1, 0.2],
          scale: [1, 1.08, 1],
          y: [0, -3, 0],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.img
        src={stars}
        alt=""
        draggable={false}
        className="absolute -left-6 top-8 w-16 opacity-50 pointer-events-none"
        animate={{
          opacity: [0.15, 0.8, 0.15],
          scale: [1, 1.12, 1],
          y: [0, 3, 0],
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </>
  );
}