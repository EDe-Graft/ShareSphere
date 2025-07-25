import { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import SharedInfoCard from "./SharedInfoCard";
import DonateItemDialog from "./DonateItemDialog";
import { motion } from "framer-motion";
import { useMediaQuery } from "@/hooks/use-mobile";
import { Circle, CircleDot, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CategoryCarousel({ items, isVisible }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 640px)");
  const isTablet = useMediaQuery("(min-width: 641px) and (max-width: 1024px)");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [api, setApi] = useState(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [autoPlayInterval, setAutoPlayInterval] = useState(null);

  // Auto-play configuration
  const AUTO_PLAY_DELAY = 4000; // 4 seconds
  const PAUSE_ON_INTERACTION_DELAY = 8000; // 8 seconds before resuming

  // Set up carousel API to track current slide
  useEffect(() => {
    if (!api) return;

    const handleSelect = () => {
      setCurrentIndex(api.selectedScrollSnap());
    };

    api.on("select", handleSelect);

    // Initial position
    setCurrentIndex(api.selectedScrollSnap());

    return () => {
      api.off("select", handleSelect);
    };
  }, [api]);

  // Auto-play functionality
  useEffect(() => {
    if (!api || !isAutoPlaying || items.length <= 1) return;

    const interval = setInterval(() => {
      api.scrollNext();
    }, AUTO_PLAY_DELAY);

    setAutoPlayInterval(interval);

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [api, isAutoPlaying, items.length]);

  // Pause auto-play on user interaction and resume after delay
  const handleUserInteraction = () => {
    if (autoPlayInterval) {
      clearInterval(autoPlayInterval);
    }
    setIsAutoPlaying(false);

    // Resume auto-play after delay
    setTimeout(() => {
      setIsAutoPlaying(true);
    }, PAUSE_ON_INTERACTION_DELAY);
  };

  // Pause auto-play when hovering over carousel
  const handleMouseEnter = () => {
    if (autoPlayInterval) {
      clearInterval(autoPlayInterval);
    }
  };

  // Resume auto-play when mouse leaves carousel
  const handleMouseLeave = () => {
    if (isAutoPlaying && api && items.length > 1) {
      const interval = setInterval(() => {
        api.scrollNext();
      }, AUTO_PLAY_DELAY);
      setAutoPlayInterval(interval);
    }
  };

  // Clean up intervals on unmount
  useEffect(() => {
    return () => {
      if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
      }
    };
  }, [autoPlayInterval]);

  // Determine how many items to show based on screen size
  const getItemsPerSlide = () => {
    if (isMobile) return 1;
    if (isTablet) return 2;
    return 3;
  };

  const handleDonateClick = () => {
    setIsDialogOpen(true);
  };

  const goToSlide = (index) => {
    if (api) {
      api.scrollTo(index);
      handleUserInteraction();
    }
  };

  const handlePrevious = () => {
    if (api) {
      api.scrollPrev();
      handleUserInteraction();
    }
  };

  const handleNext = () => {
    if (api) {
      api.scrollNext();
      handleUserInteraction();
    }
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  return (
    <>
      <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
          setApi={setApi}
        >
          <CarouselContent className="-ml-2 md:-ml-4 py-2 px-[0.18rem]">
            {items.map((item, index) => (
              <CarouselItem
                key={index}
                className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={
                    isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                  }
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="h-full"
                >
                  <SharedInfoCard
                    itemCategory={item.category}
                    itemViewRoute={item.viewRoute}
                    itemUploadRoute={item.uploadRoute}
                    name={item.details.name}
                    description={item.details.description}
                    imageUrl={item.details.imageUrl}
                    isAllCategories={item.category === "All Categories"}
                    onDonateClick={
                      item.category === "All Categories"
                        ? handleDonateClick
                        : undefined
                    }
                  />
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Navigation Controls */}
          <div className="flex flex-col items-center gap-4 mt-6">
            <div className="flex justify-center items-center gap-4">
              <CarouselPrevious
                className="relative sm:absolute"
                onClick={handlePrevious}
              />

              {/* Auto-play toggle button */}
              <Button
                variant="outline"
                size="icon"
                onClick={toggleAutoPlay}
                className="h-8 w-8 rounded-full"
                aria-label={
                  isAutoPlaying ? "Pause auto-play" : "Resume auto-play"
                }
              >
                {isAutoPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>

              <CarouselNext
                className="relative sm:absolute"
                onClick={handleNext}
              />
            </div>

            {/* Pagination Dots */}
            <div className="flex items-center justify-center gap-2 mt-2">
              {items.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={cn(
                    "transition-all focus:outline-none",
                    currentIndex === index ? "scale-125" : "opacity-70"
                  )}
                  aria-label={`Go to slide ${index + 1}`}
                >
                  {currentIndex === index ? (
                    <CircleDot className="h-4 w-4 text-primary" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </Carousel>
      </div>

      {/* DonateItemDialog Component */}
      <DonateItemDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </>
  );
}
