import { motion } from "framer-motion";

import train from "../../assets/illustrations/home-train.png";
import trainTrack from "../../assets/illustrations/home-train-track.png";


const trainMotion = {

  animate: {
    x: [
      "105vw",
      "-160vw"
    ],
  },


  transition: {

    duration:28,

    ease:"linear",

    repeat:Infinity,

    repeatDelay:1,

  },

};



export default function StoryTrain() {


  return (

    <section

      className="
        relative
        h-[400px]
        sm:h-[320px]
        overflow-hidden
        pointer-events-none
        select-none
      "

    >



      {/* Track */}


      <img

        src={trainTrack}

        alt=""

        draggable={false}

        className="
  absolute
  bottom-10
  left-0
  w-full
  h-[250px]
  object-fill
  translate-y-[95px]
  select-none
  pointer-events-none
  z-10
"

      />




      {/* Whole Train */}


      <motion.div


        animate={trainMotion.animate}


        transition={trainMotion.transition}


         className="
  absolute
  bottom-[-40px]
  sm:bottom-[-40px]
  flex
  items-end
  scale-[0.30]
  sm:scale-[0.40]
  lg:scale-[0.62]
  origin-bottom-left
  z-30
"


      >


        <img


          src={train}


          alt=""


          draggable={false}


          className="
            w-[1000px]
sm:w-[1950px]
lg:w-[1900px]
            max-w-none
            select-none
            pointer-events-none
          "


        />


      </motion.div>





      {/* Soft Ground Glow */}



      <motion.div


        animate={{


          opacity:[

            0.15,

            0.3,

            0.15

          ],


          scaleX:[

            1,

            1.03,

            1

          ],


        }}


        transition={{


          duration:4,


          repeat:Infinity,


          ease:"easeInOut",


        }}



        className="
          absolute
          bottom-5
          sm:bottom-7
          left-0
          right-0
          mx-auto
          h-8
          w-[88%]
          rounded-full
          bg-gradient-to-r
          from-transparent
          via-[#EAE6DA]
          to-transparent
          blur-xl
          opacity-20
        "



      />


      {/* Ambient Motion Layer */}



      <motion.div


        animate={{


          opacity:[

            0.08,

            0.16,

            0.08

          ],


        }}


        transition={{


          duration:6,


          repeat:Infinity,


          ease:"easeInOut",


        }}



        className="
          absolute
          inset-0
          pointer-events-none
        "



      />


    </section>


  );


}