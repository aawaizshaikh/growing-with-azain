import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect } from "react";

import hero from "../../assets/images/azain.jpg";

import teddy from "../../assets/illustrations/teddy.png";
import train from "../../assets/illustrations/toy-train.png";
import wheel from "../../assets/illustrations/train-wheel.png";

import leaves from "../../assets/illustrations/leaf.png";
import heart from "../../assets/illustrations/heart-new.png";

import paperTexture from "../../assets/illustrations/paper-note.png";
import glassHighlight from "../../assets/illustrations/glass-highlight.png";

export default function HeroPhoto() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(mouseY, {
    stiffness: 70,
    damping: 18,
  });

  const rotateY = useSpring(mouseX, {
    stiffness: 70,
    damping: 18,
  });

  useEffect(() => {
    function move(e) {
      const x = (e.clientX - window.innerWidth / 2) / 70;
      const y = -(e.clientY - window.innerHeight / 2) / 70;

      mouseX.set(x);
      mouseY.set(y);
    }

    window.addEventListener("mousemove", move);

    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <div className="relative flex justify-center">

      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        animate={{
          y: [-6, 6, -6],
        }}
        transition={{
          y: {
            repeat: Infinity,
            duration: 7,
            ease: "easeInOut",
          },
        }}
        whileHover={{
          scale: 1.02,
        }}
        className="relative"
      >

        {/* Glow */}

        <div className="absolute -inset-10 rounded-full bg-[#FFF8EA] blur-3xl opacity-60" />

        {/* Outer Ring */}

        <div className="relative rounded-full p-[7px] bg-gradient-to-br from-[#E7C87E] via-white to-[#AFCB92] shadow-[0_30px_80px_rgba(0,0,0,.12)]">

          {/* Inner Ring */}

          <div className="rounded-full p-3 bg-white relative overflow-hidden">

            <div
              className="absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage: `url(${paperTexture})`,
                backgroundSize: "500px",
              }}
            />

            <motion.img
              src={glassHighlight}
              alt=""
              animate={{
                x: [-500, 500],
              }}
              transition={{
                repeat: Infinity,
                duration: 8,
                ease: "linear",
              }}
              className="absolute top-0 left-0 h-full opacity-30"
            />

            <img
              src={hero}
              alt="Azain"
              className="w-[520px] h-[520px] rounded-full object-cover relative z-10"
            />

          </div>

        </div>

        {/* Heart */}

        <motion.img
          src={heart}
          alt=""
          animate={{
            scale: [1, 1.08, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 1.8,
          }}
          className="absolute left-1/2 -translate-x-1/2 -top-6 w-14 z-30"
        />

        {/* Teddy */}

        <motion.img
          src={teddy}
          alt=""
          animate={{
            y: [-5, 5, -5],
            scale: [1, 1.03, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 4,
          }}
          className="absolute -left-12 bottom-8 w-44 z-20"
        />

        {/* Train */}

        <motion.div
          animate={{
            x: [-12, 12, -12],
          }}
          transition={{
            repeat: Infinity,
            duration: 6,
          }}
          className="absolute -right-8 bottom-2 w-44 z-20"
        >

          <img
            src={train}
            alt=""
            className="w-full"
          />

          <motion.img
            src={wheel}
            alt=""
            animate={{
              rotate: 360,
            }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: "linear",
            }}
            className="absolute bottom-[9px] left-[28px] w-7"
          />

          <motion.img
            src={wheel}
            alt=""
            animate={{
              rotate: 360,
            }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: "linear",
            }}
            className="absolute bottom-[9px] right-[30px] w-7"
          />

        </motion.div>

        {/* Leaves */}

        <motion.img
          src={leaves}
          alt=""
          animate={{
            rotate: [90, 96, 90],
          }}
          transition={{
            repeat: Infinity,
            duration: 5,
          }}
          className="absolute -left-12 top-40 w-24"
        />

        <motion.img
          src={leaves}
          alt=""
          animate={{
            rotate: [-90, -96, -90],
          }}
          transition={{
            repeat: Infinity,
            duration: 5,
          }}
          className="absolute -right-12 top-40 w-24"
        />

      </motion.div>

    </div>
  );
}