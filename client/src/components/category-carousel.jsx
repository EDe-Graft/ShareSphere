import { useState } from "react";
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
import { useNavigate } from "react-router-dom";
import { BookOpen, Shirt, Sofa, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/components/AuthContext";

export function CategoryCarousel({ items, isVisible }) {
  const navigate = useNavigate();
  const { authSuccess, user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 640px)");
  const isTablet = useMediaQuery("(min-width: 641px) and (max-width: 1024px)");

  // Determine how many items to show based on screen size
  const getItemsPerSlide = () => {
    if (isMobile) return 1;
    if (isTablet) return 2;
    return 3;
  };

  const handleCategorySelection = (formPath) => {
    setIsDialogOpen(false);

    if (authSuccess && user) {
      navigate(formPath);
    } else {
      localStorage.setItem("redirectAfterLogin", formPath);
      navigate("/sign-in");
    }
  };

  const handleDonateClick = () => {
    setIsDialogOpen(true);
  };

  return (
    <>
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
        <div className="flex justify-center mt-6 gap-2">
          <CarouselPrevious className="relative sm:absolute" />
          <CarouselNext className="relative sm:absolute" />
        </div>
      </Carousel>

      {/* Donation Category Selection Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Choose Donation Category</DialogTitle>
            <DialogDescription>
              Select the category that best describes the item you want to
              donate.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3 py-4">
            <Button
              variant="outline"
              className="justify-start h-auto p-4 "
              onClick={() => handleCategorySelection("/books-form")}
            >
              <BookOpen className="mr-3 h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Books</div>
                <div className="text-sm text-muted-foreground">
                  Textbooks, novels, reference materials
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start h-auto p-4 "
              onClick={() => handleCategorySelection("/furniture-form")}
            >
              <Sofa className="mr-3 h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Furniture</div>
                <div className="text-sm text-muted-foreground">
                  Chairs, desks, tables, storage
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start h-auto p-4 "
              onClick={() => handleCategorySelection("/clothing-form")}
            >
              <Shirt className="mr-3 h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Clothing</div>
                <div className="text-sm text-muted-foreground">
                  Shirts, pants, jackets, accessories
                </div>
              </div>
            </Button>
            <Button
              variant="outline"
              className="justify-start h-auto p-4 "
              onClick={() => handleCategorySelection("/miscellaneous-form")}
            >
              <Package className="mr-3 h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Miscellaneous</div>
                <div className="text-sm text-muted-foreground">
                  Electronics, supplies, tools, other items
                </div>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
