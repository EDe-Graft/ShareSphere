import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CircleDot, Circle, BookOpen } from "lucide-react";
import LikeButton from "./LikeButton";

const ImageCarousel = ({ item, images, isLiked, likes, onLikeToggle }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () =>
    setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));

  const goToNext = () =>
    setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));

  const goToSlide = (index) => setCurrentIndex(index);

  if (!images?.length) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center bg-muted rounded-md">
        <BookOpen className="h-16 w-16 text-muted-foreground/50" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-[300px] md:h-[350px]">
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
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black hover:bg-slate-800 rounded-full h-8 w-8"
            onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black hover:bg-slate-800 rounded-full h-8 w-8"
            onClick={(e) => { e.stopPropagation(); goToNext(); }}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); goToSlide(i); }}
                className="focus:outline-none"
              >
                {i === currentIndex ? (
                  <CircleDot className="h-4 w-4 text-white drop-shadow-md" />
                ) : (
                  <Circle className="h-4 w-4 text-white/70 drop-shadow-md" />
                )}
              </button>
            ))}
          </div>
        </>
      )}

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