import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect } from "react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import HeroSection from "../components/about/HeroSection";
import LittleDetails from "../components/about/LittleDetails";
import FavouriteThings from "../components/about/FavouriteThings";
import OurMiracle from "../components/about/OurMiracle";

import paperTexture from "../assets/illustrations/paper-note.png";

import blob1 from "../assets/illustrations/blob-1.png";
import blob2 from "../assets/illustrations/blob-2.png";
import blob3 from "../assets/illustrations/blob-3.png";
import blob4 from "../assets/illustrations/blob-4.png";

import particles from "../assets/illustrations/floating-particles.png";
import mouseGlow from "../assets/illustrations/mouse-light.png";

export default function AboutAzain() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const x = useSpring(mouseX, {
    stiffness: 40,
    damping: 25,
  });

  const y = useSpring(mouseY, {
    stiffness: 40,
    damping: 25,
  });

  useEffect(() => {
    const move = (e) => {
      mouseX.set(e.clientX - 250);
      mouseY.set(e.clientY - 250);
    };

    window.addEventListener("mousemove", move);

    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <>
      <Navbar />

      <main className="relative overflow-hidden bg-[#FFFDF9]">

        {/* Paper Texture */}

        <div
          className="absolute inset-0 opacity-[0.08] pointer-events-none"
          style={{
            backgroundImage: `url(${paperTexture})`,
            backgroundSize: "700px",
          }}
        />

        {/* Mouse Glow */}

        <motion.img
          src={mouseGlow}
          alt=""
          style={{
            x,
            y,
          }}
          className="fixed top-0 left-0 w-[520px] pointer-events-none opacity-50 mix-blend-screen z-0"
        />

        {/* Blob 1 */}

        <motion.img
          animate={{
            y: [-25, 25, -25],
            rotate: [-3, 3, -3],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
          }}
          src={blob1}
          className="absolute -top-40 -left-40 w-[700px] opacity-45"
        />

        {/* Blob 2 */}

        <motion.img
          animate={{
            y: [20, -20, 20],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
          }}
          src={blob2}
          className="absolute top-[800px] right-[-200px] w-[700px] opacity-35"
        />

        {/* Blob 3 */}

        <motion.img
          animate={{
            rotate: [0, 6, 0],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
          }}
          src={blob3}
          className="absolute bottom-[500px] left-[-180px] w-[650px] opacity-30"
        />

        {/* Blob 4 */}

        <motion.img
          animate={{
            y: [-18, 18, -18],
          }}
          transition={{
            duration: 24,
            repeat: Infinity,
          }}
          src={blob4}
          className="absolute bottom-[-200px] right-[-120px] w-[650px] opacity-40"
        />

        {/* Floating Particles */}

        <motion.img
          animate={{
            y: [-15, 15, -15],
          }}
          transition={{
            repeat: Infinity,
            duration: 8,
          }}
          src={particles}
          className="absolute inset-0 w-full opacity-50 pointer-events-none"
        />

        {/* Content */}

        <div className="relative z-10 max-w-[1600px] mx-auto px-5 lg:px-10">

          <HeroSection />

          <LittleDetails />

          <FavouriteThings />

          <OurMiracle />

        </div>

      </main>

      <Footer />
    </>
  );
}