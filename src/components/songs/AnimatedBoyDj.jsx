import { useEffect, useState } from "react";

import djBoy1 from "../../assets/illustrations/favsongs/dj-boy-1.png";
import djBoy2 from "../../assets/illustrations/favsongs/dj-boy-2.png";
import djBoy3 from "../../assets/illustrations/favsongs/dj-boy-3.png";
import djBoy4 from "../../assets/illustrations/favsongs/dj-boy-4.png";

/*
===========================================================
DJ BOY ANIMATION

Animation sequence:

1 → 2 → 3 → 4 → 3 → 2 → repeat

This creates a continuous left/right DJ movement
without a sudden jump back to frame 1.
===========================================================
*/

const FRAMES = [
  djBoy1,
  djBoy2,
  djBoy3,
  djBoy4,
  djBoy3,
  djBoy2,
];

const FRAME_DURATION = 180;

export default function AnimatedBoyDj({ position }) {
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