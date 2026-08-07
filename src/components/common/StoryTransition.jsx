import { motion } from "framer-motion";

import leaves from "../../assets/illustrations/tiny-leaves.png.png";
import hearts from "../../assets/illustrations/floating-hearts.png";
import sparkles from "../../assets/illustrations/sparkles.png";


export default function StoryTransition() {


  return (

    <div
      className="
        absolute
        left-0
        right-0
        bottom-0
        h-32
        pointer-events-none
        overflow-hidden
      "
    >


      <motion.img

        src={leaves}

        alt=""

        animate={{
          x:[-20,20,-20],
          y:[0,-10,0],
        }}

        transition={{
          duration:10,
          repeat:Infinity,
          ease:"easeInOut",
        }}

        className="
          absolute
          left-8
          bottom-0
          w-36
          opacity-40
        "

      />



      <motion.img

        src={hearts}

        alt=""

        animate={{
          y:[0,-15,0],
          opacity:[0.4,0.8,0.4],
        }}

        transition={{
          duration:7,
          repeat:Infinity,
          ease:"easeInOut",
        }}

        className="
          absolute
          right-20
          top-4
          w-28
          opacity-50
        "

      />



      <motion.img

        src={sparkles}

        alt=""

        animate={{
          scale:[1,1.05,1],
          opacity:[0.3,0.7,0.3],
        }}

        transition={{
          duration:5,
          repeat:Infinity,
          ease:"easeInOut",
        }}

        className="
          absolute
          left-[45%]
          top-4
          w-20
          opacity-50
        "

      />


    </div>

  );

}