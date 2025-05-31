import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import SharedInfoCard from "./SharedInfoCard";
import { motion } from "framer-motion";
import { useMediaQuery } from "@/hooks/use-mobile";

export function CategoryCarousel({ items, isVisible }) {
  const isMobile = useMediaQuery("(max-width: 640px)");
  const isTablet = useMediaQuery("(min-width: 641px) and (max-width: 1024px)");

  // Determine how many items to show based on screen size
  const getItemsPerSlide = () => {
    if (isMobile) return 1;
    if (isTablet) return 2;
    return 3;
  };

  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      className="w-full"
    >
      <CarouselContent className="-ml-2 md:-ml-4 py-2 px-[0.18rem]">
        {items.map((item, index) => (
          <CarouselItem
            key={index}
            className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="h-full"
            >
              <SharedInfoCard
                itemCategory={item.category}
                itemViewRoute = {item.viewRoute}
                itemUploadRoute = {item.uploadRoute}
                name={item.details.name}
                description={item.details.description}
                imageUrl={item.details.imageUrl}
              />
            </motion.div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="flex justify-center mt-6 gap-2">
        <CarouselPrevious className="relative  sm:absolute" />
        <CarouselNext className="relative sm:absolute" />
      </div>
    </Carousel>
  );
}
