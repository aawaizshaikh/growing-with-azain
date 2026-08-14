import { useMemo, useState } from "react";
import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
} from "framer-motion";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import azainPhoto from "../assets/images/azain.jpg";

import nurseryRoom from "../assets/illustrations/about-nursery-room-background.webp";
import nurseryBed from "../assets/illustrations/about-nursery-bed.webp";
import nurseryRug from "../assets/illustrations/about-nursery-rug.webp";

import memoryWall from "../assets/illustrations/about-memory-wall.webp";
import woodenFrame from "../assets/illustrations/about-wooden-frame.webp";

import growthChart from "../assets/illustrations/about-growth-chart.webp";
import babyScale from "../assets/illustrations/about-baby-scale.webp";

import toyShelf from "../assets/illustrations/about-toy-shelf.webp";
import toyTrain from "../assets/illustrations/toy-train.webp";
import halwaBowl from "../assets/illustrations/about-halwa-bowl.webp";
import blueToy from "../assets/illustrations/about-blue-toy.webp";
import musicBox from "../assets/illustrations/about-music-box.webp";
import dog from "../assets/illustrations/about-dog.webp";

import tractor from "../assets/illustrations/about-tractor.webp";
import papad from "../assets/illustrations/about-papad.webp";
import toothbrush from "../assets/illustrations/about-brush.webp";
import roti from "../assets/illustrations/about-roti.webp";
import fries from "../assets/illustrations/about-fries.webp";
import pancakes from "../assets/illustrations/about-pancakes.webp";
import truck from "../assets/illustrations/about-truck.webp";
import car from "../assets/illustrations/about-car.webp";
import teletubies from "../assets/illustrations/about-teletubies.webp";
import guitar from "../assets/illustrations/about-guitar.webp";
import airplane from "../assets/illustrations/about-airplane.webp";
import tricycle from "../assets/illustrations/about-tricycle.webp";

import nightRoom from "../assets/illustrations/about-bedroom-night-background.webp";
import bedsideLamp from "../assets/illustrations/about-bedside-lamp.webp";
import moon from "../assets/illustrations/about-moon.webp";
import goodnightWindow from "../assets/illustrations/about-goodnight-window.webp";

import star from "../assets/illustrations/star.webp";
import hearts from "../assets/illustrations/floating-hearts.webp";
import particles from "../assets/illustrations/floating-particles.webp";
import paperTexture from "../assets/illustrations/paper-note.webp";
import glassHighlight from "../assets/illustrations/glass-highlight.webp";
import polaroidShadow from "../assets/illustrations/polaroid-shadow.webp";

/* =========================================================
   MEMORY BOARD DETAILS

   You can independently control each card's:
   - position
   - width
   - height
   - rotation
   - background color
========================================================= */

const details = [
  {
    title: "My Name",
    value: "Azain Shaikh",
    position: "top-[19%] left-[0.2%] rotate-[7deg]",
    color: "#F8F1DE",
    width: "22%",
    height: "165px",
  },
  {
    title: "Nickname",
    value: "Azu ❤️",
    position: "top-[28%] right-[-1%] rotate-[7deg]",
    color: "#EAF1F5",
    width: "14%",
    height: "160px",
  },
  {
    title: "Birthday",
    value: "14 September 2024",
    position: "top-[24%] left-[27%] rotate-[1deg]",
    color: "#F8F1DE",
    width: "28%",
    height: "165px",
    borderRadius: "50%"
  },
  {
    title: "Born At",
    value: "3:30 PM",
    position: "top-[23%] right-[18.5%] rotate-[4deg]",
    color: "#EAF1F5",
    width: "20%",
    height: "160px",
  },
  {
    title: "Birth Weight",
    value: "2.8 kg",
    position: "bottom-[8%] left-[3%] rotate-[-5deg]",
    color: "#F2F5E9",
    width: "16%",
    height: "175px",
  },
  {
    title: "Birth Height",
    value: "50 cm",
    position: "bottom-[4.5%] left-[25.3%] rotate-[4deg]",
    color: "#F8F1DE",
    width: "19%",
    height: "170px",
  },
  {
    title: "Eye Colour",
    value: "Brown",
    position: "bottom-[8%] right-[20.5%] rotate-[1.5deg]",
    color: "#EAF1F5",
    width: "26%",
    height: "150px",
  },
  {
    title: "Hair Colour",
    value: "Black",
    position: "bottom-[11%] right-[-2%] rotate-[7.5deg]",
    color: "#F2F5E9",
    width: "17%",
    height: "145px",
  },
];

const favourites = [
  {
    title: "Favourite Toy",
    value: "Toy Train",
    image: toyTrain,
    className:
      "left-[15%] bottom-[45%] w-[25%] max-w-[210px] rotate-[-2deg]",
    delay: 0,
  },
  {
    title: "Favourite Toy",
    value: "Tractor",
    image: tractor,
    className:
      "left-[58%] bottom-[48%] w-[21%] max-w-[175px] rotate-[-2deg]",
    delay: 0.08,
  },
  {
    title: "Favourite Toy",
    value: "Truck",
    image: truck,
    className:
      "left-[31%] bottom-[46%] w-[18%] max-w-[155px] rotate-[1deg]",
    delay: 0.16,
  },
  {
    title: "Favourite Toy",
    value: "Car",
    image: car,
    className:
      "right-[10%] bottom-[46%] w-[21%] max-w-[175px] rotate-[2deg]",
    delay: 0.24,
  },
  {
    title: "Favourite Characters",
    value: "Teletubies",
    image: teletubies,
    className:
      "left-[38%] bottom-[25%] w-[25%] max-w-[200px] rotate-[1deg]",
    delay: 0.32,
  },
  {
    title: "Favourite Toy",
    value: "Toy Airplane",
    image: airplane,
    className:
      "right-[20.5%] bottom-[25%] w-[18%] max-w-[155px] rotate-[-2deg]",
    delay: 0.4,
  },
  {
    title: "Favourite Toy",
    value: "Tricycle",
    image: tricycle,
    className:
      "right-[41%] bottom-[47%] w-[18%] max-w-[155px] rotate-[2deg]",
    delay: 0.44,
  },
  {
    title: "Favourite Food",
    value: "Halwa",
    image: halwaBowl,
    className:
      "left-[18%] bottom-[70%] w-[15%] max-w-[135px] rotate-[1deg]",
    delay: 0.48,
  },
  {
    title: "Favourite Food",
    value: "Pancakes",
    image: pancakes,
    className:
      "left-[45%] bottom-[70%] w-[18%] max-w-[150px] rotate-[-1deg]",
    delay: 0.56,
  },
  {
    title: "Favourite Food",
    value: "Fries",
    image: fries,
    className:
      "right-[15%] bottom-[70%] w-[13%] max-w-[115px] rotate-[2deg]",
    delay: 0.64,
  },
  {
    title: "Favourite Food",
    value: "Roti",
    image: roti,
    className:
      "right-[57%] bottom-[70%] w-[14%] max-w-[120px] rotate-[-2deg]",
    delay: 0.72,
  },
  {
    title: "Favourite Snack",
    value: "Papad",
    image: papad,
    className:
      "right-[28%] bottom-[70%] w-[14%] max-w-[120px] rotate-[1deg]",
    delay: 0.8,
  },
  
  {
    title: "Favourite Colour",
    value: "Blue",
    image: blueToy,
    className:
      "right-[34%] bottom-[27%] w-[15%] max-w-[130px] rotate-[-2deg]",
    delay: 0.96,
  },
  {
    title: "Favourite Song",
    value: "Aa Pate Pate",
    image: musicBox,
    className:
      "right-[8%] bottom-[25%] w-[18%] max-w-[155px] rotate-[2deg]",
    delay: 1.04,
  },
  {
    title: "Favourite Animal",
    value: "Dog",
    image: dog,
    className:
      "left-[25%] bottom-[27%] w-[14%] max-w-[125px] rotate-[2deg]",
    delay: 1.12,
  },
  {
    title: "Favourite Instrument",
    value: "Guitar",
    image: guitar,
    className:
      "left-[12%] bottom-[25%] w-[14%] max-w-[120px] rotate-[-4deg]",
    delay: 1.2,
  },
];

function SectionTitle({ eyebrow, title, description, light = false }) {
  return (
    <div className="relative z-20 mx-auto max-w-3xl text-center">
      <p
        className={`text-xs sm:text-sm font-bold uppercase tracking-[0.28em] ${
          light ? "text-[#EBCB82]" : "text-[#88A56C]"
        }`}
      >
        {eyebrow}
      </p>

      <h2
        className={`mt-3 text-4xl sm:text-5xl lg:text-6xl font-bold ${
          light ? "text-[#FFF9ED]" : "text-[#5E574F]"
        }`}
        style={{ fontFamily: "Baloo 2" }}
      >
        {title}
      </h2>

      {description && (
        <p
          className={`mx-auto mt-4 max-w-2xl text-base sm:text-lg leading-8 ${
            light ? "text-[#EDE8DE]" : "text-[#766E65]"
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}

/* =========================================================
   MEMORY BOARD CARD

   Width and height now come from each item in `details`.
========================================================= */

function PaperDetail({ item }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 15 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      whileHover={{
        y: -5,
        rotate: 0,
        scale: 1.025,
      }}
      transition={{
        duration: 0.45,
        ease: "easeOut",
      }}
      className={`absolute ${item.position} z-30 rounded-[8px] border border-[#D9CCB5]/70 p-4 sm:p-5 shadow-[0_10px_25px_rgba(93,75,51,.12)]`}
      style={{
        backgroundColor: item.color,
        width: item.width,
        height: item.height,
        borderRadius: item.borderRadius || "8px",
      }}
    >
      <img
        src={paperTexture}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-[0.07] pointer-events-none rounded-[8px]"
      />

      <div className="relative z-10 flex h-full w-full items-center justify-center text-center px-3">
  <div className="flex flex-col items-center justify-center">
    <p
      className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] text-[#8A7B68]"
      style={{ fontFamily: "Nunito" }}
    >
      {item.title}
    </p>

    <p
      className="mt-2 text-sm sm:text-lg font-bold text-[#5D554D]"
      style={{ fontFamily: "Baloo 2" }}
    >
      {item.value}
    </p>
  </div>
</div>

      <div className="absolute -top-3 left-1/2 -translate-x-1/2 h-6 w-6 rounded-full bg-[#C98F53] border-[3px] border-[#F7E8CB] shadow-[0_3px_6px_rgba(70,50,30,.18)]" />
    </motion.div>
  );
}

function FavouriteObject({ item, onSelect }) {
  return (
    <motion.button
      type="button"
      onClick={() => onSelect(item)}
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      whileHover={{
        y: -10,
        scale: 1.05,
      }}
      whileTap={{
        scale: 0.96,
      }}
      transition={{
        duration: 0.5,
        delay: item.delay,
      }}
      className={`absolute ${item.className} z-20 cursor-pointer`}
      aria-label={`${item.title}: ${item.value}`}
    >
      <motion.img
        src={item.image}
        alt=""
        className="relative z-10 w-full h-auto drop-shadow-[0_14px_14px_rgba(70,50,30,.18)]"
        animate={{
          y: [0, -4, 0],
        }}
        transition={{
          duration: 4 + item.delay,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <span className="pointer-events-none absolute -bottom-2 left-1/2 h-3 w-[70%] -translate-x-1/2 rounded-full bg-black/10 blur-md" />
    </motion.button>
  );
}

export default function AboutAzain() {
  const [selectedFavourite, setSelectedFavourite] = useState(null);

  const { scrollYProgress } = useScroll();

  const nightOpacity = useTransform(
    scrollYProgress,
    [0.58, 0.72],
    [0, 1]
  );

  const pageBackground = useTransform(
    scrollYProgress,
    [0.58, 0.72],
    ["#FBF5E9", "#27334C"]
  );

  const moonY = useTransform(
    scrollYProgress,
    [0.65, 0.9],
    [30, -25]
  );

  const roomScale = useTransform(
    scrollYProgress,
    [0.55, 0.75],
    [1, 1.035]
  );

  const floatingStars = useMemo(
    () => [
      { left: "8%", top: "18%", size: 22, delay: 0 },
      { left: "88%", top: "16%", size: 17, delay: 1 },
      { left: "14%", top: "70%", size: 14, delay: 2 },
      { left: "82%", top: "72%", size: 20, delay: 1.5 },
      { left: "50%", top: "12%", size: 13, delay: 0.7 },
    ],
    []
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#FBF5E9]">
      <Navbar />

      {/* =========================================================
          HERO — AZAIN'S ROOM
      ========================================================= */}

      <section className="relative min-h-[820px] sm:min-h-[900px] overflow-hidden">
        <img
          src={nurseryRoom}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-[#FBF5E9]/25" />

        {/* Existing ambient particles */}
        <motion.img
          src={particles}
          alt=""
          className="absolute inset-0 z-10 h-full w-full object-cover opacity-25 pointer-events-none"
          animate={{
            y: [-8, 8, -8],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Rug */}
        <img
          src={nurseryRug}
          alt=""
          className="absolute bottom-[-7%] left-1/2 w-[66%] max-w-[900px] -translate-x-1/2 opacity-80 pointer-events-none"
        />

        {/* Hero text */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute left-1/2 top-[15%] z-30 w-[90%] -translate-x-1/2 text-center sm:top-[17%]"
        >
          <p
            className="text-xs sm:text-sm font-bold uppercase tracking-[0.3em] text-[#78945F]"
            style={{ fontFamily: "Nunito" }}
          >
            A little peek into my world
          </p>

          <h1
            className="mt-3 text-5xl sm:text-7xl lg:text-[88px] font-bold leading-none text-[#5B554E]"
            style={{ fontFamily: "Baloo 2" }}
          >
            About Azain
          </h1>

          <p
            className="mx-auto mt-4 max-w-lg text-base sm:text-xl leading-8 text-[#70675E]"
            style={{ fontFamily: "Nunito" }}
          >
            Come inside my little room and discover the tiny things that
            make me, me.
          </p>
        </motion.div>

        {/* Photo frame */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 35 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            duration: 0.9,
            delay: 0.25,
            type: "spring",
            stiffness: 90,
            damping: 16,
          }}
          className="absolute left-1/2 top-[42%] z-40 w-[64%] max-w-[520px] -translate-x-1/2 sm:top-[40%] sm:w-[45%] lg:left-[50%] lg:top-[39%] lg:w-[34%]"
        >
          <div className="relative">
            <img
              src={polaroidShadow}
              alt=""
              className="absolute inset-0 w-full scale-[1.02] opacity-40 pointer-events-none"
            />

            <div className="absolute left-[13%] right-[13%] top-[16%] bottom-[16%] overflow-hidden rounded-[4px] bg-[#F1E6D2]">
              <img
                src={azainPhoto}
                alt="Azain"
                className="h-full w-full object-cover"
              />
            </div>

            <img
              src={woodenFrame}
              alt=""
              className="relative z-20 w-full"
            />

            <motion.img
              src={star}
              alt=""
              className="absolute -right-[7%] -top-[7%] z-30 w-[17%]"
              animate={{
                rotate: [-6, 6, -6],
                y: [-4, 4, -4],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
        </motion.div>

        {/* Small floating hearts */}
        <motion.img
          src={hearts}
          alt=""
          className="absolute right-[4%] top-[32%] z-20 hidden lg:block w-[180px] opacity-35 pointer-events-none"
          animate={{
            y: [-12, 12, -12],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
          }}
        />

        <div className="absolute bottom-0 left-1/2 z-40 -translate-x-1/2 text-center">
          <p
            className="text-xl font-bold uppercase tracking-[0.2em] text-[#5E574F]"
            style={{ fontFamily: "Nunito" }}
          >
            Scroll to explore
          </p>

          <motion.div
            className="mx-auto mt-2 h-10 w-[1px] bg-[#8FA67A]"
            animate={{
              scaleY: [0.5, 1, 0.5],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
            }}
          />
        </div>
      </section>

      {/* =========================================================
          LITTLE DETAILS / MEMORY BOARD
      ========================================================= */}

      <section className="relative overflow-hidden bg-[#FBF5E9] px-4 py-24 sm:px-8 lg:py-32">
        <div className="absolute left-[-15%] top-[20%] h-[500px] w-[500px] rounded-full bg-[#DDE8D0]/30 blur-[100px]" />

        <div className="absolute right-[-15%] bottom-[5%] h-[500px] w-[500px] rounded-full bg-[#E9D9C0]/30 blur-[110px]" />

        <SectionTitle
          eyebrow="Little things about me"
          title="Pinned in my little corner"
          description="A few tiny details that make up the beginning of my story."
        />

        <div className="relative mx-auto mt-14 w-full max-w-[1200px]">
          <div className="relative mx-auto aspect-[1.48] w-full">
            <img
              src={memoryWall}
              alt=""
              className="absolute inset-0 h-full w-full object-contain"
            />

            <div className="absolute inset-[15%_13%_14%_13%]">
              {details.map((item) => (
                <PaperDetail key={item.title} item={item} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          GROWTH CORNER
      ========================================================= */}

      <section className="relative overflow-hidden bg-[#F3EADB] px-4 py-24 sm:px-8 lg:py-32">
        <SectionTitle
          eyebrow="My very first numbers"
          title="When I was tiny"
          description="The little measurements that marked the very beginning."
        />

        <div className="relative mx-auto mt-16 min-h-[720px] max-w-[1250px]">
          {/* Soft nursery bed atmosphere */}
          <img
            src={nurseryBed}
            alt=""
            className="absolute bottom-[-2%] left-1/2 w-[75%] max-w-[850px] -translate-x-1/2 opacity-15 blur-[0.3px]"
          />

          {/* Height chart */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.7 }}
            className="absolute left-[2%] top-4 w-[25%] max-w-[270px] sm:left-[7%] sm:w-[22%]"
          >
            <img
              src={growthChart}
              alt=""
              className="w-full drop-shadow-[0_18px_20px_rgba(86,67,44,.15)]"
            />

            <div className="absolute left-[35%] top-[43%] -translate-y-1/2 whitespace-nowrap">
              <div className="rounded-full border-2 border-[#D1A35B] bg-[#FFF9ED]/90 px-4 py-2 shadow-md">
                <span
                  className="text-lg sm:text-2xl font-bold text-[#6A5A48]"
                  style={{ fontFamily: "Baloo 2" }}
                >
                  50 cm
                </span>
              </div>
            </div>
          </motion.div>

          {/* Centre story */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="absolute left-1/2 top-[25%] z-20 w-[46%] -translate-x-1/2 text-center"
          >
            <div className="mx-auto max-w-md rounded-[30px] border border-[#E2D3BD] bg-[#FFFDF7]/85 px-6 py-7 shadow-[0_20px_50px_rgba(80,60,40,.10)] backdrop-blur-sm sm:px-10">
              <p
                className="text-xs font-bold uppercase tracking-[0.25em] text-[#88A56C]"
                style={{ fontFamily: "Nunito" }}
              >
                14 September 2024
              </p>

              <h3
                className="mt-3 text-3xl sm:text-4xl font-bold text-[#62584E]"
                style={{ fontFamily: "Baloo 2" }}
              >
                And then, there was me.
              </h3>

              <p
                className="mt-4 text-sm sm:text-base leading-7 text-[#7B7167]"
                style={{ fontFamily: "Nunito" }}
              >
                A tiny little beginning, measured in centimetres and
                kilograms, but already big enough to change everything.
              </p>
            </div>
          </motion.div>

          {/* Scale */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.7 }}
            className="absolute right-[2%] top-[8%] w-[28%] max-w-[330px] sm:right-[7%] sm:w-[25%]"
          >
            <motion.img
              src={babyScale}
              alt=""
              className="w-full drop-shadow-[0_18px_20px_rgba(86,67,44,.15)]"
              animate={{
                rotate: [-1, 1, -1],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            <div className="absolute left-1/2 top-[54%] -translate-x-1/2 whitespace-nowrap">
              <div className="rounded-full border-2 border-[#9EB1C1] bg-[#FFF9ED]/90 px-4 py-2 shadow-md">
                <span
                  className="text-lg sm:text-2xl font-bold text-[#5E6170]"
                  style={{ fontFamily: "Baloo 2" }}
                >
                  2.8 kg
                </span>
              </div>
            </div>
          </motion.div>

         {/* Extra facts */}
<div className="absolute bottom-[4%] left-1/2 z-30 flex -translate-x-1/2 flex-wrap justify-center gap-4">
  <span className="rounded-full border border-[#D9CCB6] bg-[#FFFDF7]/80 px-7 py-3 text-lg font-semibold text-[#5E574F] shadow-md">
    👀 Brown eyes
  </span>

  <span className="rounded-full border border-[#D9CCB6] bg-[#FFFDF7]/80 px-7 py-3 text-lg font-semibold text-[#5E574F] shadow-md">
    🖤 Black hair
  </span>

  <span className="rounded-full border border-[#D9CCB6] bg-[#FFFDF7]/80 px-7 py-3 text-lg font-semibold text-[#5E574F] shadow-md">
    🕞 3:30 PM
  </span>
  </div>
  </div>
</section>
      {/* =========================================================
          FAVOURITE THINGS
      ========================================================= */}

      <section className="relative overflow-hidden bg-[#F8F2E7] px-4 py-24 sm:px-8 lg:py-32">
        <SectionTitle
          eyebrow="Things I love"
          title="A shelf full of favourites"
          description="If you opened my little shelf, these are the treasures you'd find."
        />

        <div className="relative mx-auto mt-16 aspect-[1.08] w-full max-w-[1050px]">
          <img
            src={toyShelf}
            alt=""
            className="absolute inset-0 -translate-y-[80px] h-full w-full object-contain"
          />

          {favourites.map((item) => (
            <FavouriteObject
              key={item.title}
              item={item}
              onSelect={setSelectedFavourite}
            />
          ))}

          {/* Shelf label */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="absolute left-1/2 top-[-6%] z-30 -translate-x-1/2"
          >
            <div className="rounded-full border border-[#D6C4A8] bg-[#FFF9ED]/90 px-5 py-2 shadow-md backdrop-blur-sm">
              <span
                className="text-xs sm:text-sm font-bold uppercase tracking-[0.18em] text-[#796B5B]"
                style={{ fontFamily: "Nunito" }}
              >
                Azu's little favourites
              </span>
            </div>
          </motion.div>
        </div>

        {/* Favourite modal */}
        <AnimatePresence>
          {selectedFavourite && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-[#2E2A25]/35 p-5 backdrop-blur-sm"
              onClick={() => setSelectedFavourite(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.88, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.88, y: 20 }}
                transition={{
                  type: "spring",
                  stiffness: 220,
                  damping: 20,
                }}
                onClick={(event) => event.stopPropagation()}
                className="relative w-full max-w-md overflow-hidden rounded-[32px] border border-[#E5D8C5] bg-[#FFFDF7] p-7 shadow-[0_30px_90px_rgba(0,0,0,.20)]"
              >
                <img
                  src={paperTexture}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover opacity-[0.05] pointer-events-none"
                />

                <button
                  type="button"
                  onClick={() => setSelectedFavourite(null)}
                  className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-[#EEF3E8] text-[#647658] transition hover:scale-105"
                  aria-label="Close"
                >
                  ×
                </button>

                <img
                  src={selectedFavourite.image}
                  alt=""
                  className="relative mx-auto h-52 w-auto max-w-[75%] object-contain drop-shadow-xl"
                />

                <div className="relative mt-4 text-center">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#88A56C]">
                    {selectedFavourite.title}
                  </p>

                  <h3
                    className="mt-2 text-3xl font-bold text-[#5D554D]"
                    style={{ fontFamily: "Baloo 2" }}
                  >
                    {selectedFavourite.value}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[#81766C]">
                    One of the little things that makes my world happier.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* =========================================================
          DAY → NIGHT TRANSITION
      ========================================================= */}

      <motion.section
        style={{ backgroundColor: pageBackground }}
        className="relative min-h-[1050px] overflow-hidden"
      >
        {/* Day room */}
        <motion.img
          src={nurseryRoom}
          alt=""
          style={{ scale: roomScale }}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        {/* Night room crossfade */}
        <motion.img
          src={nightRoom}
          alt=""
          style={{
            opacity: nightOpacity,
            scale: roomScale,
          }}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        {/* Darkening layer */}
        <motion.div
          style={{ opacity: nightOpacity }}
          className="absolute inset-0 bg-[#17233C]/30"
        />

        {/* Moon */}
        <motion.img
          src={moon}
          alt=""
          style={{
            y: moonY,
            opacity: nightOpacity,
          }}
          className="absolute right-[9%] top-[10%] z-20 w-[130px] sm:w-[180px] lg:w-[230px] drop-shadow-[0_0_30px_rgba(255,226,148,.35)]"
        />

        {/* Lamp */}
        <motion.img
          src={bedsideLamp}
          alt=""
          style={{ opacity: nightOpacity }}
          className="absolute bottom-[15%] left-[7%] z-30 hidden sm:block w-[150px] lg:w-[190px]"
        />

        {/* Night stars */}
        {floatingStars.map((item, index) => (
          <motion.img
            key={index}
            src={star}
            alt=""
            className="absolute z-20 opacity-0"
            style={{
              left: item.left,
              top: item.top,
              width: item.size,
              opacity: nightOpacity,
            }}
            animate={{
              y: [-5, 5, -5],
              rotate: [-5, 5, -5],
            }}
            transition={{
              duration: 4 + item.delay,
              repeat: Infinity,
              delay: item.delay,
            }}
          />
        ))}

        {/* Story panel */}
        <div className="absolute inset-x-0 top-[25%] z-40 flex justify-center px-5">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-[700px]"
          >
            <div className="rounded-[38px] border border-white/20 bg-[#18243A]/55 p-8 text-center shadow-[0_25px_80px_rgba(0,0,0,.25)] backdrop-blur-[3px] sm:p-12">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#EBCB82]">
                Our little miracle
              </p>

              <h2
                className="mt-3 text-4xl sm:text-6xl font-bold text-[#FFF8E9]"
                style={{ fontFamily: "Baloo 2" }}
              >
                From the very first heartbeat
              </h2>

              <div className="mx-auto mt-6 h-px w-24 bg-[#EBCB82]/70" />

              <p className="mt-7 text-base sm:text-xl leading-8 text-[#F1ECE3]">
                From the very first heartbeat, our world changed forever.
              </p>

              <p className="mt-5 text-base sm:text-xl leading-8 text-[#E4DED3]">
                Every smile, every cuddle, every tiny achievement has
                become a memory we treasure with all our hearts.
              </p>

              <p className="mt-5 text-base sm:text-xl leading-8 text-[#E4DED3]">
                Watching you grow is the greatest privilege of our lives.
              </p>

              <motion.div
                className="mx-auto mt-8 text-3xl"
                animate={{
                  scale: [1, 1.12, 1],
                }}
                transition={{
                  duration: 2.4,
                  repeat: Infinity,
                }}
              >
                ❤️
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* =========================================================
          GOODNIGHT
      ========================================================= */}

      <section className="relative overflow-hidden bg-[#1D2942] px-4 py-24 sm:px-8 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1D2942] via-[#263550] to-[#172238]" />

        <div className="relative z-20 mx-auto max-w-[1150px] text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#EBCB82]">
            Until tomorrow
          </p>

          <h2
            className="mt-3 text-5xl sm:text-7xl font-bold text-[#FFF9ED]"
            style={{ fontFamily: "Baloo 2" }}
          >
            Goodnight, Azu.
          </h2>

          <p className="mx-auto mt-4 max-w-lg text-base sm:text-lg leading-8 text-[#D8D4CB]">
            The room gets quiet, the stars come out, and another little
            chapter comes to an end.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative mx-auto mt-12 max-w-[950px]"
          >
            <motion.img
              src={goodnightWindow}
              alt=""
              className="mx-auto w-full drop-shadow-[0_25px_60px_rgba(0,0,0,.35)]"
              animate={{
                y: [-4, 4, -4],
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            <motion.img
              src={moon}
              alt=""
              className="pointer-events-none absolute right-[20%] top-[16%] w-[90px] sm:w-[125px] opacity-70"
              animate={{
                y: [-5, 5, -5],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
              }}
            />
          </motion.div>
        </div>
      </section>

      
    </div>
  );
}