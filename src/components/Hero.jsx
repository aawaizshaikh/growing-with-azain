import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";



import azain from "../assets/images/azain.jpg";

import balloon from "../assets/illustrations/balloon.png";
import teddy from "../assets/illustrations/teddy.png";
import cloud from "../assets/illustrations/cloud.png";
import leaf from "../assets/illustrations/leaf.png";
import star from "../assets/illustrations/star.png";
import heart from "../assets/illustrations/heart.png";

import birdFlock1 from "../assets/illustrations/bird-flock-1.png";
import birdFlock2 from "../assets/illustrations/bird-flock-2.png";
import birdFlock3 from "../assets/illustrations/bird-flock-3.png";



export default function Hero() {


  const navigate = useNavigate();



  const birdFrames = [

    birdFlock1,
    birdFlock2,
    birdFlock3,

  ];



  const [birdFrame, setBirdFrame] = useState(0);



  useEffect(() => {


    birdFrames.forEach((src)=>{

      const img = new Image();

      img.src = src;

    });



    const flap = setInterval(()=>{


      setBirdFrame((prev)=>

        (prev + 1) % birdFrames.length

      );


    },400);



    return ()=>clearInterval(flap);



  },[]);





  return (

    <section
      className="
        relative
        overflow-hidden
        px-6
        lg:px-20
        pt-24
        pb-20
      "
    >



      




      {/* Flying Bird Flock */}



      <motion.img

        src={birdFrames[birdFrame]}

        alt=""

        draggable={false}



        initial={{

          x:"-30vw",

          y:0,

          opacity:0

        }}



        animate={{


          x:"130vw",


          y:[

            0,

            -25,

            10,

            -15,

            0

          ],



          opacity:[

            0,

            0.75,

            0.75,

            0.75,

            0

          ]



        }}



        transition={{


          x:{

            duration:35,

            repeat:Infinity,

            repeatDelay:12,

            ease:"linear"

          },



          y:{

            duration:6,

            repeat:Infinity,

            ease:"easeInOut"

          },



          opacity:{

            duration:35,

            repeat:Infinity,

            repeatDelay:12

          }



        }}



        className="
          absolute
          top-[8%]
          left-0
          w-72
          lg:w-[600px]
          opacity-75
          pointer-events-none
          z-10
        "


      />



      {/* Clouds */}
            <motion.img

        src={cloud}

        alt=""

        animate={{
          y:[0,-10,0]
        }}

        transition={{
          duration:6,
          repeat:Infinity
        }}

        className="
          absolute
          left-10
          top-20
          w-24
          lg:w-58
          opacity-80
        "

      />



      <motion.img

        src={cloud}

        alt=""

        animate={{
          y:[0,-8,0]
        }}

        transition={{
          duration:5,
          repeat:Infinity
        }}

        className="
          absolute
          left-[44%]
          top-4
          w-24
          lg:w-58
          opacity-80
        "

      />



      <motion.img

        src={cloud}

        alt=""

        animate={{
          y:[0,-12,0]
        }}

        transition={{
          duration:7,
          repeat:Infinity
        }}

        className="
          absolute
          right-10
          top-24
          w-24
          lg:w-58
          opacity-70
        "

      />





      {/* Stars */}



      <motion.img

        src={star}

        alt=""

        animate={{
          rotate:[0,15,0]
        }}

        transition={{
          duration:5,
          repeat:Infinity
        }}

        className="
          absolute
          left-[18%]
          top-16
          w-7
          lg:w-8
        "

      />



      <motion.img

        src={star}

        alt=""

        animate={{
          rotate:[0,-15,0]
        }}

        transition={{
          duration:6,
          repeat:Infinity
        }}

        className="
          absolute
          left-[46%]
          top-32
          w-6
          lg:w-7
        "

      />



      <motion.img

        src={star}

        alt=""

        animate={{
          rotate:[0,12,0]
        }}

        transition={{
          duration:7,
          repeat:Infinity
        }}

        className="
          absolute
          right-8
          bottom-24
          w-7
          lg:w-8
        "

      />





      <div
        className="
          grid
          lg:grid-cols-[0.9fr_1.1fr]
          items-center
          gap-10
          lg:pt-8
          
        "
      >




        {/* LEFT SIDE */}



        <motion.div

          initial={{
            opacity:0,
            x:-40
          }}

          animate={{
            opacity:1,
            x:0
          }}

          transition={{
            duration:0.8
          }}

        >



          <h2

            className="
              text-5xl
              lg:text-[82px]
              leading-tight
              lg:leading-[84px]
            "

            style={{
              fontFamily:"Baloo 2",
              color:"#2F2F2F"
            }}

          >

            Our Little Miracle,

          </h2>




          <h1

            className="
              text-7xl
              lg:text-[170px]
              leading-none
            "

            style={{
              fontFamily:"Baloo 2",
              color:"#8FAE7A"
            }}

          >

            Azain

          </h1>




          <div className="my-8">

            <img

              src={heart}

              alt=""

              className="w-84 lg:w-60"

            />

          </div>




          <p

            className="
              max-w-xl
              text-lg
              lg:text-[22px]
              leading-8
              lg:leading-10
              text-[#555]
            "

            style={{
              fontFamily:"Nunito"
            }}

          >

            A digital book to cherish every beautiful moment,
            every little smile, every laugh, and every milestone
            as you grow.

          </p>




          <motion.button

            whileHover={{
              scale:1.05
            }}

            whileTap={{
              scale:0.95
            }}

            onClick={() =>
              navigate("/timeline")
            }

            className="
              mt-10
              rounded-full
              bg-[#8FAE7A]
              px-8
              lg:px-10
              py-4
              lg:py-5
              text-xl
              lg:text-[28px]
              font-semibold
              text-white
              shadow-xl
              hover:bg-[#7B9C67]
            "

          >

            Start the Journey →

          </motion.button>



        </motion.div>
                {/* RIGHT SIDE */}



        <motion.div

          initial={{
            opacity:0,
            scale:0.9
          }}

          animate={{
            opacity:1,
            scale:1
          }}

          transition={{
            duration:0.8
          }}

          className="
            relative
            flex
            items-center
            justify-center
          "

        >




          {/* Balloon */}



          <motion.img

            src={balloon}

            alt=""

            animate={{
              y:[0,-12,0]
            }}

            transition={{
              duration:6,
              repeat:Infinity
            }}

            className="
              absolute
              -top-6
              lg:-top-12
              right-2
              w-44
              lg:w-72
              z-40
            "

          />





          {/* Leaf */}



          <img

            src={leaf}

            alt=""

            className="
              absolute
              -left-6
              lg:-left-10
              bottom-10
              w-36
              lg:w-56
              z-20
            "

          />





          {/* Teddy */}



          <motion.img

            src={teddy}

            alt=""

            animate={{
              y:[0,-8,0],
              rotate:[-2,2,-2]
            }}

            transition={{
              duration:5,
              repeat:Infinity
            }}

            className="
              absolute
              -right-3
              lg:-right-8
              bottom-2
              w-40
              lg:w-64
              z-50
            "

          />





          <div className="relative">



            {/* Soft Golden Glow */}



            <motion.div

              animate={{
                opacity:[0.15,0.35,0.15],
                scale:[1,1.05,1]
              }}

              transition={{
                duration:6,
                repeat:Infinity,
                ease:"easeInOut"
              }}

              className="
                absolute
                inset-10
                rounded-full
                bg-[#F7D98A]
                blur-3xl
              "

            />





            {/* Outer Ring */}



            <div className="
              relative
              flex
              h-[320px]
              w-[320px]
              lg:h-[690px]
              lg:w-[690px]
              items-center
              justify-center
              rounded-full
              border-2
              border-[#F1CF76]
            ">



              {/* Inner Ring */}



              <div className="
                flex
                h-[300px]
                w-[300px]
                lg:h-[665px]
                lg:w-[665px]
                items-center
                justify-center
                rounded-full
                border-[8px]
                border-[#F7D98A]
                bg-white
              ">




                {/* Breathing Photo */}



                <motion.div

                  animate={{
                    scale:[1,1.025,1]
                  }}

                  transition={{
                    duration:8,
                    repeat:Infinity,
                    ease:"easeInOut"
                  }}

                  className="
                    h-[280px]
                    w-[280px]
                    lg:h-[635px]
                    lg:w-[635px]
                    overflow-hidden
                    rounded-full
                    shadow-2xl
                  "

                >



                  <img

                    src={azain}

                    alt="Azain"

                    className="
                      h-full
                      w-full
                      object-cover
                    "

                  />



                </motion.div>




              </div>




            </div>




          </div>




        </motion.div>




      </div>




    </section>


  );


}