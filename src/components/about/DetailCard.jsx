import { motion } from "framer-motion";
import { FaClock } from "react-icons/fa";

export default function DetailCard({
  icon,
  title,
  value,
  color = "#FFFDF8",
  clock = false,
}) {
  return (
    <motion.div
      whileHover={{
        y: -8,
        scale: 1.03,
      }}
      transition={{
        duration: 0.25,
      }}
      className="relative bg-white rounded-[34px] border border-[#F2ECE4] shadow-xl p-8 text-center overflow-hidden"
    >
      <div
        className="absolute w-40 h-40 rounded-full blur-3xl opacity-30"
        style={{
          background: color,
          top: -40,
          left: "50%",
          transform: "translateX(-50%)",
        }}
      />

      {clock ? (
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="relative z-10 w-20 h-20 mx-auto rounded-full bg-[#EEF7E8] flex items-center justify-center shadow-lg"
        >
          <FaClock
            size={36}
            className="text-[#87A66E]"
          />
        </motion.div>
      ) : (
        <img
          src={icon}
          alt=""
          className="relative z-10 w-20 h-20 object-contain mx-auto"
        />
      )}

      <p
        className="mt-6 text-[18px]"
        style={{
          fontFamily: "Baloo 2",
          color: "#87A66E",
        }}
      >
        {title}
      </p>

      <h3
        className="mt-2 text-[30px] leading-tight"
        style={{
          fontFamily: "Baloo 2",
          color: "#4D4037",
        }}
      >
        {value}
      </h3>
    </motion.div>
  );
}