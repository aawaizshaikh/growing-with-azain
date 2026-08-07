import { motion } from "framer-motion";

import engine from "../../assets/illustrations/engine.png";
import heart from "../../assets/illustrations/wagon-heart.png";
import bunny from "../../assets/illustrations/wagon-bunny.png";
import teddy from "../../assets/illustrations/wagon-teddy.png";

import shadow from "../../assets/illustrations/invisible-track-shadow.png";

import TrainCar from "./TrainCar";
import TrainEffects from "./TrainEffects";


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

    repeatDelay:3,

  },

};



export default function StoryTrain() {


  return (

    <section

      className="
        relative
        h-[180px]
        sm:h-[220px]
        overflow-hidden
        pointer-events-none
        select-none
      "

    >



      {/* Track Shadow */}


      <img

        src={shadow}

        alt=""

        draggable={false}

        className="
          absolute
          bottom-8
          sm:bottom-10
          left-0
          w-full
          opacity-55
        "

      />




      {/* Whole Train */}


      <motion.div


        animate={trainMotion.animate}


        transition={trainMotion.transition}


        className="
          absolute
          bottom-2
          sm:bottom-8
          flex
          items-end
          scale-[0.45]
          sm:scale-[0.65]
          lg:scale-100
          origin-bottom-left
        "


      >



        {/* Engine */}



        <motion.div


          animate={{

            y:[
              0,
              -3,
              0
            ],

            rotate:[
              -0.5,
              0.5,
              -0.5
            ],

          }}


          transition={{

            duration:1.6,

            repeat:Infinity,

            ease:"easeInOut",

          }}


          className="
            relative
            shrink-0
            z-30
          "


        >



          <img


            src={engine}


            alt=""


            draggable={false}


            className="
              w-[235px]
              select-none
            "


            style={{

              transform:"scaleX(-1)",

            }}


          />



          <TrainEffects />



        </motion.div>





        {/* Heart Wagon */}



        <motion.div


          animate={{

            x:[
              -1,
              1,
              -1
            ],

          }}


          transition={{

            duration:2.1,

            repeat:Infinity,

            ease:"easeInOut",

            delay:0.08,

          }}


          className="-ml-6"


        >


          <TrainCar

            image={heart}

            animation="heart"

          />


        </motion.div>







        {/* Bunny Wagon */}



        <motion.div


          animate={{

            x:[
              -2,
              2,
              -2
            ],

          }}


          transition={{

            duration:2.2,

            repeat:Infinity,

            ease:"easeInOut",

            delay:0.16,

          }}


          className="-ml-8"


        >



          <TrainCar

            image={bunny}

            animation="sway"

          />



        </motion.div>







        {/* Teddy Wagon */}



        <motion.div


          animate={{

            x:[
              -3,
              3,
              -3
            ],

          }}


          transition={{

            duration:2.4,

            repeat:Infinity,

            ease:"easeInOut",

            delay:0.24,

          }}


          className="-ml-8"


        >



          <TrainCar

            image={teddy}

            animation="bounce"

          />



        </motion.div>




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