import { motion } from "framer-motion";

export default function FloatingDecorations() {
  const items = [
    {
      emoji: "⭐",
      top: "4%",
      left: "6%",
      size: "text-4xl",
      duration: 6,
    },
    {
      emoji: "☁️",
      top: "10%",
      right: "8%",
      size: "text-5xl",
      duration: 8,
    },
    {
      emoji: "🧸",
      top: "34%",
      left: "2%",
      size: "text-6xl",
      duration: 7,
    },
    {
      emoji: "🎈",
      top: "42%",
      right: "5%",
      size: "text-5xl",
      duration: 6,
    },
    {
      emoji: "🌈",
      top: "68%",
      left: "7%",
      size: "text-6xl",
      duration: 9,
    },
    {
      emoji: "🌿",
      top: "72%",
      right: "4%",
      size: "text-5xl",
      duration: 8,
    },
    {
      emoji: "💛",
      top: "90%",
      left: "45%",
      size: "text-4xl",
      duration: 7,
    },
    {
      emoji: "✨",
      top: "26%",
      left: "52%",
      size: "text-3xl",
      duration: 5,
    },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">

      {items.map((item, index) => (

        <motion.div
          key={index}
          animate={{
            y: [-10, 10, -10],
            rotate: [-4, 4, -4],
          }}
          transition={{
            duration: item.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`absolute ${item.size} opacity-80 select-none`}
          style={{
            top: item.top,
            left: item.left,
            right: item.right,
          }}
        >
          {item.emoji}
        </motion.div>

      ))}

    </div>
  );
}