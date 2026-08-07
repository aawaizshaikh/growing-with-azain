import { motion } from "framer-motion";

import leaf from "../assets/illustrations/leaf.png";
import hearts from "../assets/illustrations/floating-hearts.png";
import sparkles from "../assets/illustrations/sparkles.png";


export default function Footer() {

  return (

    <footer
      className="
        relative
        overflow-hidden
        pb-10
        pt-8
      "
    >


      {/* Floating Hearts */}

      <motion.img

        src={hearts}

        alt=""

        draggable={false}

        animate={{
          y:[0,-12,0],
          opacity:[0.35,0.7,0.35],
        }}

        transition={{
          duration:7,
          repeat:Infinity,
          ease:"easeInOut"
        }}

        className="
          absolute
          left-[15%]
          bottom-0
          w-24
          opacity-50
          pointer-events-none
        "

      />



      {/* Sparkles */}

      <motion.img

        src={sparkles}

        alt=""

        draggable={false}

        animate={{
          scale:[1,1.05,1],
          opacity:[0.3,0.8,0.3],
        }}

        transition={{
          duration:5,
          repeat:Infinity,
        }}

        className="
          absolute
          right-[18%]
          top-0
          w-24
          opacity-50
          pointer-events-none
        "

      />



      {/* Footer Message */}

      <div
        className="
          relative
          z-10
          flex
          items-center
          justify-center
          gap-5
        "
      >


        <img

          src={leaf}

          alt=""

          className="
            w-16
            rotate-180
            opacity-80
          "

        />



        <p

          className="
            text-[28px]
            text-center
          "

          style={{
            fontFamily:"Baloo 2",
            color:"#666",
          }}

        >

          Made with love by Mommy & Daddy


          <motion.span

            animate={{
              scale:[1,1.15,1]
            }}

            transition={{
              duration:2,
              repeat:Infinity
            }}

            className="
              inline-block
              ml-2
              text-[#F3A7A7]
            "

          >

            ❤

          </motion.span>


        </p>



        <img

          src={leaf}

          alt=""

          className="
            w-16
            opacity-80
          "

        />


      </div>


    </footer>

  );

}