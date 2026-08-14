import FavouriteThingCard from "./FavouriteThingCard";

import train from "../../assets/illustrations/toy-train.webp";
import heart from "../../assets/illustrations/heart-new.webp";
import rainbow from "../../assets/illustrations/rainbow.webp";
import balloon from "../../assets/illustrations/hot-air-baloon.webp";
import dog from "../../assets/illustrations/dog.webp";

import sparkles from "../../assets/illustrations/sparkles.webp";
import blob1 from "../../assets/illustrations/blob-1.webp";
import blob2 from "../../assets/illustrations/blob-2.webp";

import { motion } from "framer-motion";

export default function FavouriteThings() {
  const favourites = [
    {
      icon: train,
      title: "Favourite Toy",
      value: "Toy Train 🚂",
      color: "#EEF7E8",
      animation: "float",
    },

    {
      icon: heart,
      title: "Favourite Food",
      value: "Halwa 🥣",
      color: "#FFF3EA",
      animation: "heartbeat",
    },

    {
      icon: rainbow,
      title: "Favourite Colour",
      value: "Blue 💙",
      color: "#EEF5FF",
      animation: "sway",
    },

    {
      icon: balloon,
      title: "Favourite Song",
      value: "Aa Pate Pate 🎵",
      color: "#FFF7E2",
      animation: "float",
    },

    {
      icon: dog,
      title: "Favourite Animal",
      value: "Dog 🐶",
      color: "#F7F0FF",
      animation: "bounce",
    },
  ];

  return (
    <section className="relative py-28 overflow-hidden">

      {/* Background Blob */}

      <motion.img
        src={blob1}
        alt=""
        animate={{
          y: [-15, 15, -15],
          rotate: [-3, 3, -3],
        }}
        transition={{
          repeat: Infinity,
          duration: 18,
          ease: "easeInOut",
        }}
        className="absolute -left-40 top-0 w-[420px] opacity-30 pointer-events-none"
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
        className="absolute -right-40 bottom-0 w-[420px] opacity-25 pointer-events-none"
      />

      {/* Sparkles */}

      <motion.img
        src={sparkles}
        alt=""
        animate={{
          opacity: [0.25, 0.8, 0.25],
        }}
        transition={{
          repeat: Infinity,
          duration: 4,
        }}
        className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
      />

      <div className="relative z-20">

        {/* Heading */}

        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          className="text-center mb-20"
        >
          <h2
            className="text-[68px]"
            style={{
              fontFamily: "Baloo 2",
              color: "#87A66E",
            }}
          >
            Favourite Things
          </h2>

          <p
            className="mt-5 text-xl text-[#7D736C] max-w-2xl mx-auto leading-9"
            style={{
              fontFamily: "Nunito",
            }}
          >
            The little things that fill every day with laughter,
            curiosity and endless happiness.
          </p>
        </motion.div>

        {/* Cards */}

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-12">

          {favourites.map((item) => (
            <FavouriteThingCard
              key={item.title}
              {...item}
            />
          ))}

        </div>

      </div>

    </section>
  );
}