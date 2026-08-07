import { motion } from "framer-motion";


import paper from "../assets/illustrations/paper-note.png";
import paper1 from "../assets/illustrations/paper-note1.png";

import leaf from "../assets/illustrations/tiny-leaves.png.png";

import stars from "../assets/illustrations/stars.png";
import sparkles from "../assets/illustrations/sparkles.png";

import music from "../assets/illustrations/music-notes.png";

import polaroid from "../assets/illustrations/polaroid-shadow.png";

import hearts from "../assets/illustrations/floating-hearts.png";

import heart from "../assets/illustrations/heart.png";



export default function FeatureCardDecoration({ type }) {


  const decoration = {

    Timeline: {
      image: paper,
      className: "top-2 right-3 w-16",
    },


    Milestones: {
      image: stars,
      className: "top-1 right-2 w-20",
    },


    "Favorite Songs": {
      image: music,
      className: "top-3 right-3 w-20",
    },


    Gallery: {
      image: polaroid,
      className: "top-3 right-3 w-20",
    },


    "About Azain": {
      image: hearts,
      className: "top-1 right-2 w-20",
    },


    Letters: {
      image: paper1,
      className: "top-3 right-3 w-16",
    },

  };



  const item = decoration[type];



  if (!item) return null;



  return (

    <motion.img

      src={item.image}

      alt=""

      draggable={false}

      animate={{

        y:[0,-6,0],

        rotate:[-3,3,-3],

        opacity:[0.65,0.9,0.65]

      }}

      transition={{

        duration:5,

        repeat:Infinity,

        ease:"easeInOut"

      }}

      className={`
        absolute
        pointer-events-none
        select-none
        opacity-70
        z-0
        ${item.className}
      `}

    />

  );

}