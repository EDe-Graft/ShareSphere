import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Circle,
  BookOpen,
} from "lucide-react";
import LikeButton from "./LikeButton";

const ImageCarousel = ({ item, images, isLiked, likes, onLikeToggle }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [lastInteraction, setLastInteraction] = useState(Date.now());

  // Auto-play configuration
  const AUTO_PLAY_DELAY = 4000; // 4 seconds
  const RESUME_DELAY = 6000; // 6 seconds after last interaction

  // Auto-play functionality with smart pause/resume
  useEffect(() => {
    if (!images?.length || images.length <= 1 || isHovered) return;

    const interval = setInterval(() => {
      const timeSinceLastInteraction = Date.now() - lastInteraction;

      // Only auto-advance if enough time has passed since last interaction
      if (timeSinceLastInteraction >= RESUME_DELAY) {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      }
    }, AUTO_PLAY_DELAY);

    return () => clearInterval(interval);
  }, [images?.length, isHovered, lastInteraction]);

  // Handle user interactions
  const handleUserInteraction = () => {
    setLastInteraction(Date.now());
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    handleUserInteraction();
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    handleUserInteraction();
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
    handleUserInteraction();
  };

  if (!images?.length) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center bg-muted rounded-md">
        <BookOpen className="h-16 w-16 text-muted-foreground/50" />
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-[300px] md:h-[350px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="w-full h-full overflow-hidden rounded-md">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            alt={`Book image ${currentIndex + 1}`}
            className="w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          />
        </AnimatePresence>
      </div>

      {images.length > 1 && (
        <>
          {/* Navigation arrows */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/70 hover:bg-slate-800 text-white rounded-full h-8 w-8 transition-all duration-200"
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/70 hover:bg-slate-800 text-white rounded-full h-8 w-8 transition-all duration-200"
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          {/* Pagination dots */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  goToSlide(i);
                }}
                className="focus:outline-none transition-all duration-200 hover:scale-110"
              >
                {i === currentIndex ? (
                  <CircleDot className="h-4 w-4 text-white drop-shadow-md" />
                ) : (
                  <Circle className="h-4 w-4 text-white/70 drop-shadow-md hover:text-white/90" />
                )}
              </button>
            ))}
          </div>

          {/* Auto-play indicator - subtle dot that shows when auto-playing */}
          {!isHovered && Date.now() - lastInteraction >= RESUME_DELAY && (
            <div className="absolute top-3 left-3">
              <div className="w-2 h-2 bg-white/70 rounded-full animate-pulse drop-shadow-md"></div>
            </div>
          )}
        </>
      )}

      {/* Like button centered below the image */}
      <div className="mt-3 flex items-center justify-center">
        <LikeButton
          itemId={item.itemId}
          isLiked={isLiked}
          likes={likes}
          onLikeToggle={onLikeToggle}
        />
      </div>
    </div>
  );
};

export default ImageCarousel;
