import { motion } from "framer-motion";

import teddy from "../assets/illustrations/teddy.png";
import balloon from "../assets/illustrations/balloon.png";
import cloud from "../assets/illustrations/cloud.png";
import leaf from "../assets/illustrations/Leaf.png";
import star from "../assets/illustrations/star.png";

export default function Decorations() {
  const floating = {
    animate: {
      y: [0, -12, 0],
    },
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  };

  return (
    <>
      {/* Balloon */}
      <motion.img
        {...floating}
        src={balloon}
        alt=""
        className="absolute top-16 right-20 w-44 z-20 pointer-events-none select-none"
      />

      {/* Teddy */}
      <motion.img
        animate={{
          y: [0, -8, 0],
          rotate: [-2, 2, -2],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
        }}
        src={teddy}
        alt=""
        className="absolute bottom-32 right-32 w-44 z-20 pointer-events-none select-none"
      />

      {/* Cloud 1 */}
      <motion.img
        {...floating}
        src={cloud}
        alt=""
        className="absolute top-28 left-16 w-40 opacity-90 pointer-events-none"
      />

      {/* Cloud 2 */}
      <motion.img
        {...floating}
        transition={{
          duration: 6,
          repeat: Infinity,
        }}
        src={cloud}
        alt=""
        className="absolute top-56 right-[28%] w-32 opacity-70 pointer-events-none"
      />

      {/* Cloud 3 */}
      <motion.img
        {...floating}
        transition={{
          duration: 7,
          repeat: Infinity,
        }}
        src={cloud}
        alt=""
        className="absolute bottom-44 left-1/3 w-36 opacity-60 pointer-events-none"
      />

      {/* Leaves Bottom Left */}
      <img
        src={leaf}
        alt=""
        className="absolute bottom-10 left-10 w-40 pointer-events-none"
      />

      {/* Leaves Top Right */}
      <img
        src={leaf}
        alt=""
        className="absolute top-24 right-[34%] w-28 rotate-[150deg] pointer-events-none"
      />

      {/* Star Top Left */}
      <motion.img
        animate={{
          rotate: [0, 8, 0],
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
        }}
        src={star}
        alt=""
        className="absolute top-24 left-[38%] w-12"
      />

      {/* Star Right */}
      <motion.img
        animate={{
          rotate: [0, -8, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
        }}
        src={star}
        alt=""
        className="absolute top-[48%] right-10 w-10"
      />

      {/* Star Bottom */}
      <motion.img
        animate={{
          rotate: [0, 12, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
        }}
        src={star}
        alt=""
        className="absolute bottom-28 left-[48%] w-10"
      />
    </>
  );
}