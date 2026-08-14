import { motion } from "framer-motion";
import { FaHeart } from "react-icons/fa";

import glassHighlight from "../../assets/illustrations/glass-highlight.webp";
import paperTexture from "../../assets/illustrations/paper-note.webp";
import sparkles from "../../assets/illustrations/sparkles.webp";

export default function QuoteCard() {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 40,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
      }}
      whileHover={{
        y: -8,
        scale: 1.01,
      }}
      transition={{
        duration: 0.45,
      }}
      className="relative overflow-hidden max-w-xl rounded-[42px] border border-white/40 bg-white/55 backdrop-blur-xl shadow-[0_25px_70px_rgba(0,0,0,.10)] p-10"
    >
      {/* Paper Texture */}

      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `url(${paperTexture})`,
          backgroundSize: "420px",
        }}
      />

      {/* Glass Shine */}

      <motion.img
        src={glassHighlight}
        alt=""
        animate={{
          x: [-500, 600],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-0 left-0 h-full opacity-30 pointer-events-none"
      />

      {/* Sparkles */}

      <motion.img
        src={sparkles}
        alt=""
        animate={{
          opacity: [0.25, 0.8, 0.25],
          scale: [0.95, 1.05, 0.95],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
        }}
        className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
      />

      {/* Decorative Heart */}

      <motion.div
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
        className="absolute -top-5 left-10 w-14 h-14 rounded-full bg-[#FFE8DB] shadow-xl flex items-center justify-center z-20"
      >
        <FaHeart
          className="text-[#E88C8C]"
          size={20}
        />
      </motion.div>

      {/* Quote Symbol */}

      <motion.div
        animate={{
          rotate: [-3, 3, -3],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
        }}
        className="absolute top-6 right-8 text-[90px] text-[#E8D8BE] opacity-30 leading-none"
      >
        ❝
      </motion.div>

      {/* Watercolor Glow */}

      <div className="absolute -right-10 -bottom-10 w-56 h-56 rounded-full bg-[#FFF7E6] blur-3xl opacity-60" />

      {/* Quote */}

      <p
        className="relative z-10 text-[22px] leading-[42px] text-[#5D564F]"
        style={{
          fontFamily: "Nunito",
        }}
      >
        You are our greatest adventure, our sweetest blessing, and
        the reason every ordinary day has become extraordinary.
        Every smile you share fills our hearts with a love we never
        knew could exist.
      </p>

      {/* Divider */}

      <motion.div
        animate={{
          scaleX: [0.95, 1, 0.95],
        }}
        transition={{
          repeat: Infinity,
          duration: 5,
        }}
        className="relative mt-8 h-[2px] w-full rounded-full bg-gradient-to-r from-transparent via-[#EBCB82] to-transparent"
      />

      {/* Footer */}

      <div className="relative z-10 mt-8 flex items-center gap-5">

        <motion.div
          animate={{
            rotate: [-4, 4, -4],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
          }}
          className="w-16 h-16 rounded-full bg-[#EEF6E9] shadow-lg flex items-center justify-center text-[28px]"
        >
          ❤️
        </motion.div>

        <div>

          <h4
            className="text-[26px]"
            style={{
              fontFamily: "Baloo 2",
              color: "#655A52",
            }}
          >
            Mommy & Daddy
          </h4>

          <p
            className="text-[#8B837D]"
            style={{
              fontFamily: "Nunito",
            }}
          >
            Forever cheering for you, every step of the way.
          </p>

        </div>

      </div>

    </motion.div>
  );
}