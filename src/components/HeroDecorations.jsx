import { motion } from "framer-motion";

import birds from "../assets/illustrations/bird-pack.png";
import fairyDust from "../assets/illustrations/fairy-dust.png";


export default function HeroDecorations() {

  return (
    <>

      {/* Butterflies */}

      

      {/* Birds */}

      <motion.img

        src={birds}

        alt=""

        draggable={false}

        animate={{
          x:[-20,30,-20],
          y:[0,-10,0]
        }}

        transition={{
          duration:18,
          repeat:Infinity,
          ease:"easeInOut"
        }}

        className="
          absolute
          left-[40%]
          top-10
          w-28
          opacity-70
          pointer-events-none
          z-10
        "

      />


      {/* Fairy Dust */}

      <motion.img

        src={fairyDust}

        alt=""

        draggable={false}

        animate={{
          opacity:[0.3,0.9,0.3],
          scale:[1,1.08,1],
          y:[0,-15,0]
        }}

        transition={{
          duration:5,
          repeat:Infinity,
          ease:"easeInOut"
        }}

        className="
          absolute
          right-[35%]
          bottom-20
          w-40
          opacity-60
          pointer-events-none
          z-10
        "

      />

    </>
  );
}