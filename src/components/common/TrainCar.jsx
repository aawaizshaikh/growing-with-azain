import { motion } from "framer-motion";

export default function TrainCar({
  image,
  animation = "bounce",
  delay = 0,
}) {
  const animations = {
    bounce: {
      y: [0, -4, 0],
      rotate: [-0.4, 0.4, -0.4],
    },

    sway: {
      rotate: [-1.4, 1.4, -1.4],
      y: [0, -2, 0],
    },

    heart: {
      scale: [1, 1.025, 1],
      y: [0, -2, 0],
    },
  };

  return (
    <motion.div
      animate={animations[animation]}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
      className="relative flex items-end shrink-0"
    >
      <img
        src={image}
        alt=""
        draggable={false}
        className="
          w-[180px]
          md:w-[190px]
          lg:w-[200px]
          select-none
          pointer-events-none
        "
      />
    </motion.div>
  );
}