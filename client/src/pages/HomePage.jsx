import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthContext";
import { CategoryCarousel } from "@/components/category-carousel";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ArrowDown,
  Heart,
  Users,
  Sparkles,
  BookOpen,
  Shirt,
  Sofa,
  Package,
} from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const HomePage = () => {
  const { authSuccess, user } = useAuth();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const categoriesSectionRef = useRef(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);
  const scrollToCategories = () => {
    categoriesSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };
  const phrases = [
    "share resources",
    "reduce waste",
    "save money",
    "build connections",
  ];

  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // typewrite effect using useEffect
  useEffect(() => {
    const currentPhrase = phrases[currentPhraseIndex];
    const typingSpeed = isDeleting ? 50 : 100;

    const timeout = setTimeout(() => {
      setDisplayedText((prev) =>
        isDeleting
          ? currentPhrase.slice(0, prev.length - 1)
          : currentPhrase.slice(0, prev.length + 1)
      );

      if (!isDeleting && displayedText === currentPhrase) {
        setTimeout(() => setIsDeleting(true), 1000); // pause before deleting
      } else if (isDeleting && displayedText === "") {
        setIsDeleting(false);
        setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting, currentPhraseIndex]);

  const handleCategorySelection = (formPath) => {
    if (authSuccess && user) {
      navigate(formPath);
    } else {
      localStorage.setItem("redirectAfterLogin", formPath);
      navigate("/sign-in");
    }
  };

  // Items consisting each item object and all categories
  const categories = [
    {
      category: "All Categories",
      viewRoute: "/all-categories",
      uploadRoute: "/",
      details: {
        name: "All Categories",
        description:
          "Browse all available items across books, furniture, clothing, and miscellaneous categories.",
        imageUrl:
          "https://images.unsplash.com/photo-1586953208448-b95a79798f07?q=80&w=2070&auto=format&fit=crop",
      },
    },
    {
      category: "Books",
      viewRoute: "/books",
      uploadRoute: "/books-form",
      details: {
        name: "Books",
        description:
          "A collection of educational books for all subjects and levels.",
        imageUrl:
          "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=2073&auto=format&fit=crop",
      },
    },
    {
      category: "Furniture",
      viewRoute: "/furniture",
      uploadRoute: "/furniture-form",
      details: {
        name: "Furniture",
        description:
          "Essential furniture pieces to create a comfortable study space.",
        imageUrl:
          "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=2070&auto=format&fit=crop",
      },
    },
    {
      category: "Clothing",
      viewRoute: "/clothing",
      uploadRoute: "/clothing-form",
      details: {
        name: "Clothing",
        description:
          "Quality clothing items for students with no additional cost. ",
        imageUrl:
          "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2070&auto=format&fit=crop",
      },
    },
    {
      category: "Miscellaneous",
      viewRoute: "/miscellaneous",
      uploadRoute: "/miscellaneous-form",
      details: {
        name: "Miscellaneous",
        description:
          "Various useful items from electronics to school supplies.",
        imageUrl:
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070&auto=format&fit=crop",
      },
    },
  ];

  const features = [
    {
      icon: <Heart className="h-5 w-5 text-primary" />,
      title: "Donate Unused Items",
      description:
        "Give your unused items a second life by donating them to fellow students in need.",
      isClickable: true,
    },
    {
      icon: <Users className="h-5 w-5 text-primary" />,
      title: "Build Community",
      description:
        "Connect with other students and build a stronger, more sustainable campus community.",
      isClickable: false,
    },
    {
      icon: <Sparkles className="h-5 w-5 text-primary" />,
      title: "Reduce Waste",
      description:
        "Help reduce waste and promote sustainability by sharing resources with others.",
      isClickable: false,
    },
  ];

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-background to-background/80 border-b">
        <div className="container px-4 py-16 md:py-24 mx-auto">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <Badge
              variant="outline"
              className="mb-4 px-3 py-1 text-sm border-primary text-primary"
            >
              Student Resource Sharing Platform
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
              Share<span className="text-primary ml-2">Sphere</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
              A community platform where students can{" "}
              <motion.span
                key={displayedText}
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="text-primary font-semibold"
              >
                {displayedText}
                <span className="blinking-cursor">|</span>
              </motion.span>
            </p>
            <div className="flex flex-col-reverse sm:flex-row gap-4">
              <Button
                className="bg-primary text-white hover:bg-primary/90"
                onClick={scrollToCategories}
              >
                Get Started
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="border-primary hover:bg-primary hover:text-white"
                onClick={() => navigate("/about")}
              >
                Learn More
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section
        ref={categoriesSectionRef}
        className="py-16 bg-muted/30 scroll-mt-16 "
      >
        <div className="container px-4 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-2">
              Browse Categories
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our collection of shared resources across different
              categories.
            </p>
          </div>
          <div className="relative px-4 sm:px-8">
            <CategoryCarousel items={categories} isVisible={isVisible} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-2">
              Why Share With Us?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              ShareSphere makes it easy to share resources and build a more
              sustainable campus.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className={`p-6 rounded-lg border bg-card text-card-foreground shadow-sm ${
                  feature.isClickable
                    ? "cursor-pointer hover:shadow-md transition-shadow duration-300"
                    : ""
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={
                  isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
                }
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              >
                {feature.isClickable ? (
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="w-full text-left">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                          {feature.icon}
                        </div>
                        <h3 className="text-xl font-semibold mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Choose Donation Category</DialogTitle>
                        <DialogDescription>
                          Select the category that best describes the item you
                          want to donate.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-1 gap-3 py-4">
                        <Button
                          variant="outline"
                          className="justify-start h-auto p-4 hover:bg-primary hover:text-white"
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
                          className="justify-start h-auto p-4 hover:bg-primary hover:text-white"
                          onClick={() =>
                            handleCategorySelection("/furniture-form")
                          }
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
                          className="justify-start h-auto p-4 hover:bg-primary hover:text-white"
                          onClick={() =>
                            handleCategorySelection("/clothing-form")
                          }
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
                          className="justify-start h-auto p-4 hover:bg-primary hover:text-white"
                          onClick={() =>
                            handleCategorySelection("/miscellaneous-form")
                          }
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
                ) : (
                  <div>
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default HomePage;
