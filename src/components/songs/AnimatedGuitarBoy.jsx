import { useEffect, useState } from "react";

import frame1 from "../../assets/illustrations/favsongs/boy-with-guitar-1.png";
import frame2 from "../../assets/illustrations/favsongs/boy-with-guitar-2.png";
import frame3 from "../../assets/illustrations/favsongs/boy-with-guitar-3.png";
import frame4 from "../../assets/illustrations/favsongs/boy-with-guitar-4.png";

const frames = [
  frame1,
  frame2,
  frame3,
  frame4,
];

export default function AnimatedGuitarBoy({ position }) {
  const [currentFrame, setCurrentFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame((previous) => {
        return (previous + 1) % frames.length;
      });
    }, 320);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: position.left,
        top: position.top,
        width: position.width,
        aspectRatio: "1024 / 1536",
        zIndex: position.zIndex ?? 20,
      }}
    >
      <img
        src={frames[currentFrame]}
        alt=""
        draggable="false"
        className="absolute inset-0 w-full h-full object-contain select-none"
      />
    </div>
  );
}