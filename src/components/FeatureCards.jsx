import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import {
  HiOutlineCalendar,
  HiOutlinePhotograph,
  HiOutlineHeart,
} from "react-icons/hi";

import {
  HiOutlineMusicalNote,
} from "react-icons/hi2";

import { FaRegStar } from "react-icons/fa";
import { MdOutlineMailOutline } from "react-icons/md";

import FeatureDecorations from "./FeatureDecorations";
import FeatureCardDecoration from "./FeatureCardDecoration";


const cards = [

  {
    title: "Timeline",
    subtitle: "Every day from birth until today.",
    color: "#F7F0D9",
    icon: <HiOutlineCalendar size={42} />,
    path: "/timeline",
  },

  {
    title: "Milestones",
    subtitle: "Every first smile, crawl & step.",
    color: "#EAF5E5",
    icon: <FaRegStar size={38} />,
    path: "/milestones",
  },

  {
    title: "Favorite Songs",
    subtitle: "The soundtrack of childhood.",
    color: "#FFF3E7",
    icon: <HiOutlineMusicalNote size={42} />,
    path: "/favorite-songs",
  },

  {
    title: "Gallery",
    subtitle: "Photos and videos through the years.",
    color: "#EAF4FB",
    icon: <HiOutlinePhotograph size={42} />,
    path: "/gallery",
  },

  {
    title: "About Azain",
    subtitle: "Favorite things, personality & more.",
    color: "#F8EEF5",
    icon: <HiOutlineHeart size={42} />,
    path: "/about",
  },

  {
    title: "Letters",
    subtitle: "Messages from Mommy & Daddy.",
    color: "#FBF2DA",
    icon: <MdOutlineMailOutline size={42} />,
    path: "/about",
  },

];



export default function FeatureCards() {

  const navigate = useNavigate();


  return (

    <section
      className="
        relative
        overflow-hidden
        px-8
        lg:px-12
        pb-16
      "
    >

      {/* Background Decorations */}

      <FeatureDecorations />



      {/* Cards */}

      <div
        className="
          relative
          z-10
          grid
          gap-6
          md:grid-cols-2
          xl:grid-cols-3
        "
      >

        {cards.map((card) => (

          <motion.div

            key={card.title}

            whileHover={{
              y:-8,
              scale:1.03,
            }}

            whileTap={{
              scale:0.98,
            }}

            transition={{
              duration:0.25,
            }}

            onClick={() =>
              navigate(card.path)
            }

            className="
              relative
              overflow-hidden
              rounded-[34px]
              shadow-xl
              p-8
              cursor-pointer
            "

            style={{
              background:card.color,
            }}

          >


            {/* Card Specific Decoration */}

            <FeatureCardDecoration
              type={card.title}
            />



            {/* Card Content */}

            <div
              className="
                relative
                z-10
                flex
                flex-col
                items-center
                text-center
              "
            >


              {/* Icon */}

              <motion.div

                whileHover={{
                  rotate:8,
                  scale:1.08
                }}

                className="
                  w-20
                  h-20
                  rounded-full
                  bg-white
                  shadow-md
                  flex
                  items-center
                  justify-center
                  text-[#89A66D]
                  mb-5
                "

              >

                {card.icon}

              </motion.div>



              <h3

                className="
                  text-[32px]
                  leading-none
                "

                style={{
                  fontFamily:"Baloo 2",
                  color:"#303030",
                }}

              >

                {card.title}

              </h3>



              <p

                className="
                  mt-4
                  text-[17px]
                  leading-7
                  text-[#666]
                "

                style={{
                  fontFamily:"Nunito",
                }}

              >

                {card.subtitle}

              </p>


            </div>


          </motion.div>

        ))}


      </div>


    </section>

  );

}