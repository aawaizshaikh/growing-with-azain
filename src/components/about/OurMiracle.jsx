import { motion } from "framer-motion";

import bunny from "../../assets/illustrations/bunny-heart.webp";
import frame from "../../assets/illustrations/blank-frame.webp";
import divider from "../../assets/illustrations/leaf-divider.webp";
import heart from "../../assets/illustrations/heart-new.webp";
import stars from "../../assets/illustrations/stars.webp";

import paperTexture from "../../assets/illustrations/paper-note.webp";
import glassHighlight from "../../assets/illustrations/glass-highlight.webp";
import floatingHearts from "../../assets/illustrations/floating-hearts.webp";
import polaroidShadow from "../../assets/illustrations/polaroid-shadow.webp";
import blob1 from "../../assets/illustrations/blob-1.webp";

import hero from "../../assets/images/azain.jpg";

export default function OurMiracle() {
  return (
    <section className="relative py-28 overflow-hidden">

      {/* Background Blob */}

      <motion.img
        src={blob1}
        alt=""
        animate={{
          y: [-18, 18, -18],
          rotate: [-3, 3, -3],
        }}
        transition={{
          repeat: Infinity,
          duration: 18,
          ease: "easeInOut",
        }}
        className="absolute -left-36 top-0 w-[460px] opacity-20 pointer-events-none"
      />

      {/* Floating Hearts */}

      <motion.img
        src={floatingHearts}
        alt=""
        animate={{
          y: [-10, 10, -10],
          opacity: [0.3, 0.75, 0.3],
        }}
        transition={{
          repeat: Infinity,
          duration: 5,
        }}
        className="absolute inset-0 w-full h-full object-cover opacity-25 pointer-events-none"
      />

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
        transition={{
          duration: .7,
        }}
        className="relative overflow-hidden rounded-[48px] border border-[#EFE7DA] bg-[#FCFCF8] shadow-[0_30px_90px_rgba(0,0,0,.10)] p-10 lg:p-16"
      >

        {/* Paper Texture */}

        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `url(${paperTexture})`,
            backgroundSize: "500px",
          }}
        />

        {/* Glass Reflection */}

        <motion.img
          src={glassHighlight}
          alt=""
          animate={{
            x: [-900, 900],
          }}
          transition={{
            repeat: Infinity,
            duration: 10,
            ease: "linear",
          }}
          className="absolute left-0 top-0 h-full opacity-25 pointer-events-none"
        />

        {/* Stars */}

        <img
          src={stars}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-35 pointer-events-none"
        />

        <div className="relative z-20 grid lg:grid-cols-[320px_1fr_340px] gap-12 items-center">

          {/* Bunny */}

          <motion.img
            src={bunny}
            alt=""
            animate={{
              y: [-8, 8, -8],
              scale: [1, 1.03, 1],
            }}
            transition={{
              repeat: Infinity,
              duration: 5,
            }}
            className="w-[270px] mx-auto"
          />

          {/* Story */}

          <div className="text-center">

            <img
              src={divider}
              alt=""
              className="mx-auto w-[400px]"
            />

            <h2
              className="text-[66px] -mt-5"
              style={{
                fontFamily: "Baloo 2",
                color: "#87A66E",
              }}
            >
              Our Little Miracle
            </h2>

            <p
              className="mt-8 text-[21px] leading-[42px] text-[#5D554F]"
              style={{
                fontFamily: "Nunito",
              }}
            >
              From the very first heartbeat,
              our world changed forever.

              <br /><br />

              Every smile, every cuddle,
              every tiny achievement has
              become a memory we treasure
              with all our hearts.

              <br /><br />

              Watching you grow is the
              greatest privilege of our lives.

            </p>

            <motion.img
              src={heart}
              alt=""
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
              }}
              className="mx-auto mt-8 w-11"
            />

          </div>

          {/* POLAROID STARTS HERE */}
                    <motion.div
            animate={{
              rotate: [-2, 2, -2],
              y: [-6, 6, -6],
            }}
            whileHover={{
              rotate: -5,
              scale: 1.05,
            }}
            transition={{
              rotate: {
                repeat: Infinity,
                duration: 7,
                ease: "easeInOut",
              },
              y: {
                repeat: Infinity,
                duration: 6,
                ease: "easeInOut",
              },
            }}
            className="relative flex justify-center"
          >

            {/* Floating Shadow */}

            <motion.img
              src={polaroidShadow}
              alt=""
              animate={{
                scale: [1, 1.06, 1],
                opacity: [0.45, 0.65, 0.45],
              }}
              transition={{
                repeat: Infinity,
                duration: 5,
              }}
              className="absolute bottom-[-24px] w-[290px] z-0 pointer-events-none"
            />

            {/* Watercolor Paper Layer */}

            <div
              className="absolute w-[305px] h-[365px] rounded-[16px] opacity-[0.08]"
              style={{
                backgroundImage: `url(${paperTexture})`,
                backgroundSize: "260px",
              }}
            />

            {/* Soft Glow */}

            <div className="absolute -inset-5 rounded-[28px] bg-[#FFF8E9] blur-3xl opacity-50" />

            {/* Polaroid Frame */}

            <img
              src={frame}
              alt=""
              className="relative w-[320px] z-20 drop-shadow-[0_25px_45px_rgba(0,0,0,.15)]"
            />

            {/* Photo */}

            <img
              src={hero}
              alt="Azain"
              className="absolute top-[48px] w-[220px] h-[260px] rounded-md object-cover z-10"
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
                duration: 7,
                ease: "linear",
              }}
              className="absolute top-0 left-0 h-full opacity-25 z-30 pointer-events-none"
            />

          </motion.div>

        </div>

      </motion.div>

    </section>
  );
}