import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

export default function Lightbox({
  images,
  currentIndex,
  setCurrentIndex,
  isOpen,
  onClose,
}) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (!isOpen) return;

      if (e.key === "Escape") onClose();

      if (e.key === "ArrowRight")
        setCurrentIndex((prev) =>
          prev === images.length - 1 ? 0 : prev + 1
        );

      if (e.key === "ArrowLeft")
        setCurrentIndex((prev) =>
          prev === 0 ? images.length - 1 : prev - 1
        );
    }

    window.addEventListener("keydown", handleKeyDown);

    return () =>
      window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, images.length, onClose, setCurrentIndex]);

  if (!isOpen) return null;

  const nextImage = () => {
    setCurrentIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        {/* Close */}

        <button
          onClick={onClose}
          className="absolute top-8 right-8 text-white text-3xl"
        >
          <FaTimes />
        </button>

        {/* Previous */}

        <button
          onClick={(e) => {
            e.stopPropagation();
            prevImage();
          }}
          className="absolute left-8 text-white text-4xl"
        >
          <FaChevronLeft />
        </button>

        {/* Image */}

        <motion.img
          key={currentIndex}
          src={images[currentIndex]}
          alt=""
          initial={{
            scale: 0.85,
            opacity: 0,
          }}
          animate={{
            scale: 1,
            opacity: 1,
          }}
          exit={{
            scale: 0.85,
            opacity: 0,
          }}
          transition={{
            duration: 0.25,
          }}
          className="max-h-[90vh] max-w-[90vw] rounded-3xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />

        {/* Next */}

        <button
          onClick={(e) => {
            e.stopPropagation();
            nextImage();
          }}
          className="absolute right-8 text-white text-4xl"
        >
          <FaChevronRight />
        </button>

        {/* Counter */}

        <div className="absolute bottom-8 text-white text-lg">
          {currentIndex + 1} / {images.length}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}