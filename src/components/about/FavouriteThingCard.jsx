import { motion } from "framer-motion";

import glassHighlight from "../../assets/illustrations/glass-highlight.webp";
import paperTexture from "../../assets/illustrations/paper-note.webp";
import sparkles from "../../assets/illustrations/sparkles.webp";
import musicNotes from "../../assets/illustrations/music-notes.webp";
import steam from "../../assets/illustrations/steam.webp";

const animations = {
  float: {
    y: [-10, 10, -10],
  },

  sway: {
    rotate: [-5, 5, -5],
  },

  heartbeat: {
    scale: [1, 1.08, 1],
  },

  bounce: {
    y: [0, -10, 0],
  },
};

export default function FavouriteThingCard({
  icon,
  title,
  value,
  color,
  animation,
}) {
  return (
    <motion.div
      whileHover={{
        y: -12,
        scale: 1.03,
      }}
      transition={{
        duration: .3,
      }}
      className="text-center group"
    >
      {/* Circle */}

      <motion.div
        animate={animations[animation]}
        transition={{
          repeat: Infinity,
          duration: 3,
          ease: "easeInOut",
        }}
        className="relative overflow-hidden w-52 h-52 mx-auto rounded-full border-[8px] border-white shadow-[0_25px_60px_rgba(0,0,0,.12)] flex items-center justify-center"
        style={{
          background: color,
        }}
      >
        {/* Watercolor Texture */}

        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `url(${paperTexture})`,
            backgroundSize: "250px",
          }}
        />

        {/* Glass Reflection */}

        <motion.img
          src={glassHighlight}
          alt=""
          animate={{
            x: [-250, 250],
          }}
          transition={{
            repeat: Infinity,
            duration: 6,
            ease: "linear",
          }}
          className="absolute top-0 left-0 h-full opacity-30"
        />

        {/* Sparkles */}

        <motion.img
          src={sparkles}
          alt=""
          animate={{
            opacity: [.3, .8, .3],
          }}
          transition={{
            repeat: Infinity,
            duration: 4,
          }}
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />

        {/* Steam for Halwa */}

        {title === "Favourite Food" && (
          <motion.img
            src={steam}
            alt=""
            animate={{
              y: [10, -20],
              opacity: [0, 1, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 2.5,
            }}
            className="absolute top-8 w-14"
          />
        )}

        {/* Music Notes */}

        {title === "Favourite Song" && (
          <motion.img
            src={musicNotes}
            alt=""
            animate={{
              y: [-10, -30],
              opacity: [0, 1, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 3,
            }}
            className="absolute right-10 top-8 w-12"
          />
        )}

        {/* Blue Glow */}

        {title === "Favourite Colour" && (
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              repeat: Infinity,
              duration: 3,
            }}
            className="absolute w-36 h-36 rounded-full bg-blue-300 blur-3xl opacity-25"
          />
        )}

        {/* Icon */}

        <motion.img
          src={icon}
          alt=""
          whileHover={{
            rotate: 6,
            scale: 1.08,
          }}
          className="relative z-20 w-28 h-28 object-contain"
        />
      </motion.div>

      {/* Title */}

      <h3
        className="mt-8 text-3xl"
        style={{
          fontFamily: "Baloo 2",
          color: "#4D433C",
        }}
      >
        {title}
      </h3>

      {/* Value */}

      <p
        className="mt-2 text-lg text-gray-500"
        style={{
          fontFamily: "Nunito",
        }}
      >
        {value}
      </p>
    </motion.div>
  );
}