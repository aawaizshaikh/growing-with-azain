import { motion } from "framer-motion";

import Leaf from "../../assets/illustrations/leaf.webp";
import Star from "../../assets/illustrations/star.webp";
import Heart from "../../assets/illustrations/heart.webp";

export default function TimelineIntro() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      className="relative overflow-hidden rounded-[32px] bg-[#FFFBF5] border border-[#F2E8D2] shadow-lg p-8 lg:p-10"
    >
      {/* Decorations */}

      <motion.img
        src={Leaf}
        alt=""
        className="absolute left-4 bottom-4 w-16 opacity-60"
        animate={{ rotate: [-5, 5, -5] }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      <motion.img
        src={Star}
        alt=""
        className="absolute right-6 top-6 w-8"
        animate={{ rotate: [0, 20, -20, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      <img
        src={Heart}
        alt=""
        className="absolute right-8 bottom-8 w-10 opacity-70"
      />

      {/* Heading */}

      <p
        className="uppercase tracking-[3px] text-sm text-[#9AA88D]"
        style={{
          fontFamily: "Nunito",
        }}
      >
        A Journey To Treasure
      </p>

      <h2
        className="mt-3 text-4xl lg:text-5xl text-[#8FAE7A] leading-tight"
        style={{
          fontFamily: "Baloo 2",
        }}
      >
        Every Memory Has A Story
      </h2>

      <p
        className="mt-6 text-[17px] leading-9 text-[#666]"
        style={{
          fontFamily: "Nunito",
        }}
      >
        Every memory tells a story, and every story begins with a single
        moment.
        <br />
        <br />
        This timeline is a collection of the little things that made our
        hearts smile—from your first breath to every tiny milestone, every
        adventure, every laugh, and every unforgettable day.
        <br />
        <br />
        As the years go by, these memories will become one of our greatest
        treasures, allowing us to relive the beautiful journey of watching
        you grow.
      </p>

      <p
        className="mt-8 text-lg text-[#8FAE7A]"
        style={{
          fontFamily: "Baloo 2",
        }}
      >
        With all our love, this story is for you, Azain ❤️
      </p>
    </motion.div>
  );
}