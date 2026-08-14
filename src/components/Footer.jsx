import { motion } from "framer-motion";

import leaf from "../assets/illustrations/leaf.webp";
import hearts from "../assets/illustrations/floating-hearts.webp";
import sparkles from "../assets/illustrations/sparkles.webp";


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



      {/* Footer Message */}

      <div
        className="
          relative
          z-10
          flex
          items-center
          justify-center
          gap-3
          mt-35
        "
      >


        


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



       

      </div>


    </footer>

  );

}