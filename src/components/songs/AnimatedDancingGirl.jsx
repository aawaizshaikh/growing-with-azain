import { useEffect, useState } from "react";

import frame1 from "../../assets/illustrations/favsongs/girl-dancing-1.png";
import frame2 from "../../assets/illustrations/favsongs/girl-dancing-2.png";
import frame3 from "../../assets/illustrations/favsongs/girl-dancing-3.png";
import frame4 from "../../assets/illustrations/favsongs/girl-dancing-4.png";

/*
  Dancing sequence:

  1 → 2 → 3 → 4 → 3 → 2 → repeat

  Using the reverse frames on the way back creates
  a smoother continuous dancing motion.
*/

const frames = [
  frame1,
  frame2,
  frame3,
  frame4,
  frame3,
  frame2,
];

export default function AnimatedDancingGirl({ position }) {
  const [currentFrame, setCurrentFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame((previousFrame) => {
        return (previousFrame + 1) % frames.length;
      });
    }, 280);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div
      className="absolute pointer-events-none select-none"
      style={{
        left: position.left,
        top: position.top,
        width: position.width,

        /*
          Keep the animation container proportional
          to the original PNG artwork.
        */
        aspectRatio: "1024 / 1536",

        zIndex: position.zIndex ?? 60,

        transform: position.flip
          ? "scaleX(-1)"
          : "scaleX(1)",

        transformOrigin: "center center",
      }}
    >
      <img
        src={frames[currentFrame]}
        alt=""
        draggable="false"
        className="
          absolute
          inset-0
          w-full
          h-full
          object-contain
          pointer-events-none
          select-none
        "
      />
    </div>
  );
}