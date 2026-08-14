import { useEffect, useState } from "react";

import boyDancing1 from "../../assets/illustrations/favsongs/boy-dancing-1.webp";
import boyDancing2 from "../../assets/illustrations/favsongs/boy-dancing-2.webp";
import boyDancing3 from "../../assets/illustrations/favsongs/boy-dancing-3.webp";
import boyDancing4 from "../../assets/illustrations/favsongs/boy-dancing-4.webp";

/*
===========================================================
DANCING BOY ANIMATION

Animation sequence:

1 → 2 → 3 → 4 → 3 → 2 → repeat

This creates a smooth side-to-side dancing motion
without a sudden jump from frame 4 back to frame 1.
===========================================================
*/

const FRAMES = [
  boyDancing1,
  boyDancing2,
  boyDancing3,
  boyDancing4,
  boyDancing3,
  boyDancing2,
];

const FRAME_DURATION = 180;

export default function AnimatedDancingBoy({ position }) {
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrameIndex((current) => (current + 1) % FRAMES.length);
    }, FRAME_DURATION);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="absolute pointer-events-none select-none"
      style={{
        left: position.left,
        top: position.top,
        width: position.width,
        zIndex: position.zIndex ?? 60,
      }}
    >
      <img
        src={FRAMES[frameIndex]}
        alt=""
        draggable="false"
        className="block w-full h-auto pointer-events-none select-none"
      />
    </div>
  );
}