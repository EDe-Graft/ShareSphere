import { DialogTrigger } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Grid3X3, Search, SlidersHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { Toaster, toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import ItemCard from "@/components/ItemCard";
import ConditionBadge from "@/components/ConditionBadge";
import ItemDetailsDialog from "@/components/ItemDetailsDialog";
import EmptyState from "@/components/EmptyState";
import { useAuth } from "@/components/AuthContext";
import LikeButton from "@/components/LikeButton";
import axios from "axios";
import { Plus, BookOpen, Shirt, Sofa, Package, Gift } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const AllCategoriesViewPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [allItems, setAllItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [likesById, setLikesById] = useState({});
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [isLikedById, setIsLikedById] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCondition, setSelectedCondition] = useState("all");
  const [selectedAvailability, setSelectedAvailability] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDonateDialogOpen, setIsDonateDialogOpen] = useState(false);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);

  const userMode = "view";
  const category = "all";

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const axiosConfig = {
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  };

  const getUserFavorites = async () => {
    if (!user) return;

    try {
      const response = await axios.get(
        `${BACKEND_URL}/favorites?category=all`,
        axiosConfig
      );

      if (response.data.getSuccess) {
        const favorites = response.data.userFavorites;
        const newLikedStatus = { ...isLikedById };
        favorites.forEach((itemId) => {
          newLikedStatus[itemId] = true;
        });
        setIsLikedById(newLikedStatus);
      }
    } catch (error) {
      console.error("Failed to fetch user favorites:", error);
    }
  };

  const handleLikeToggle = async (itemId) => {
    setIsLikeLoading(true);
    try {
      const res = await axios.post(
        `${BACKEND_URL}/favorites/toggle`,
        { itemId },
        axiosConfig
      );

      if (res.data.toggleSuccess) {
        setLikesById((prev) => ({
          ...prev,
          [itemId]: res.data.newLikeCount,
        }));
        setIsLikedById((prev) => ({
          ...prev,
          [itemId]: res.data.isLiked,
        }));
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setIsLikeLoading(false);
    }
  };

  useEffect(() => {
    const loadAllItems = async () => {
      try {
        // Fetch items from all categories
        const [booksRes, furnitureRes, clothingRes, miscRes] =
          await Promise.all([
            axios.get(`${BACKEND_URL}/items?category=book`, axiosConfig),
            axios.get(`${BACKEND_URL}/items?category=furniture`, axiosConfig),
            axios.get(`${BACKEND_URL}/items?category=clothing`, axiosConfig),
            axios.get(
              `${BACKEND_URL}/items?category=miscellaneous`,
              axiosConfig
            ),
          ]);

        const allItemsData = [];

        if (booksRes.data.getSuccess) {
          allItemsData.push(
            ...booksRes.data.items.map((item) => ({
              ...item,
            }))
          );
        }
        if (furnitureRes.data.getSuccess) {
          allItemsData.push(
            ...furnitureRes.data.items.map((item) => ({
              ...item,
            }))
          );
        }
        if (clothingRes.data.getSuccess) {
          allItemsData.push(
            ...clothingRes.data.items.map((item) => ({
              ...item,
            }))
          );
        }
        if (miscRes.data.getSuccess) {
          allItemsData.push(
            ...miscRes.data.items.map((item) => ({
              ...item,
            }))
          );
        }

        setAllItems(allItemsData);
        setFilteredItems(allItemsData);

        const initialLikes = {};
        const initialLikedStatus = {};
        allItemsData.forEach((item) => {
          initialLikes[item.itemId] = item.likes;
          initialLikedStatus[item.itemId] = false;
        });
        setLikesById(initialLikes);
        setIsLikedById(initialLikedStatus);

        if (user) {
          getUserFavorites();
        }
      } catch (error) {
        console.error("Error loading items:", error);
        toast.error("Failed to load items");
      } finally {
        setIsLoading(false);
      }
    };
    loadAllItems();
  }, [user]);

  useEffect(() => {
    let result = [...allItems];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.generalCategory?.toLowerCase().includes(query) ||
          item.name?.toLowerCase().includes(query) ||
          item.title?.toLowerCase().includes(query) ||
          item.type?.toLowerCase().includes(query) ||
          item.brand?.toLowerCase().includes(query) ||
          item.author?.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== "all") {
      result = result.filter(
        (item) => item.generalCategory?.toLowerCase() === selectedCategory
      );
    }

    if (selectedCondition !== "all") {
      result = result.filter(
        (item) => item.condition?.toLowerCase() === selectedCondition
      );
    }

    if (selectedAvailability !== "all") {
      const isAvailable = selectedAvailability === "available";
      result = result.filter(
        (item) => item.available === isAvailable.toString()
      );
    }

    switch (sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.uploadDate) - new Date(b.uploadDate));
        break;
      case "name-asc":
        result.sort((a, b) => {
          const aName = a.name || a.title || "";
          const bName = b.name || b.title || "";
          return aName.localeCompare(bName);
        });
        break;
      case "name-desc":
        result.sort((a, b) => {
          const aName = a.name || a.title || "";
          const bName = b.name || b.title || "";
          return bName.localeCompare(aName);
        });
        break;
      case "likes-high":
        result.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        break;
      case "likes-low":
        result.sort((a, b) => (a.likes || 0) - (b.likes || 0));
        break;
      default:
        break;
    }

    setFilteredItems(result);
  }, [
    allItems,
    searchQuery,
    selectedCategory,
    selectedCondition,
    selectedAvailability,
    sortBy,
  ]);

  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedCondition("all");
    setSelectedAvailability("all");
    setSortBy("newest");
  };

  const handleCategorySelection = (formPath) => {
    setIsDonateDialogOpen(false);
    setIsPostDialogOpen(false);

    if (user) {
      navigate(formPath);
    } else {
      localStorage.setItem("redirectAfterLogin", formPath);
      navigate("/sign-in");
    }
  };

  // Custom EmptyState component that shows dialog instead of navigating
  const CustomEmptyState = () => {
    const getEmptyStateContent = () => {
      if (selectedCategory !== "all") {
        // If a specific category is selected, use that category for EmptyState
        return <EmptyState category={selectedCategory} />;
      } else {
        // If "all" categories, show custom empty state with dialog
        return (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="bg-muted/50 rounded-full p-6 mb-4">
              <Gift className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Items Found</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              {searchQuery ||
              selectedCondition !== "all" ||
              selectedAvailability !== "all"
                ? "No items match your current filters. Try adjusting your search criteria or be the first to post an item!"
                : "No items have been posted yet. Be the first to share something with the community!"}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              {(searchQuery ||
                selectedCondition !== "all" ||
                selectedAvailability !== "all") && (
                <Button onClick={resetFilters} variant="outline">
                  Reset Filters
                </Button>
              )}
              <Button
                onClick={() => setIsPostDialogOpen(true)}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="mr-2 h-4 w-4" />
                Post an Item
              </Button>
            </div>
          </div>
        );
      }
    };

    return getEmptyStateContent();
  };

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Sonner Toaster Component */}
      <Toaster position="bottom-right" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center">
          <Grid3X3 className="h-8 w-8 text-primary mr-3" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              All Categories
            </h1>
            <p className="text-muted-foreground">
              Browse all donated items from our community
            </p>
          </div>
        </div>
        {/* Donate Item Dialog */}
        <Dialog open={isDonateDialogOpen} onOpenChange={setIsDonateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Donate Item
            </Button>
          </DialogTrigger>
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
      </div>

      <Tabs defaultValue="grid" className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="relative w-full sm:w-[300px] lg:w-[400px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search across all categories..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <TabsList>
              <TabsTrigger value="grid">Grid</TabsTrigger>
              <TabsTrigger value="list">List</TabsTrigger>
            </TabsList>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuItem onClick={resetFilters}>
                  Reset all filters
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="book">Books</SelectItem>
              <SelectItem value="furniture">Furniture</SelectItem>
              <SelectItem value="clothing">Clothing</SelectItem>
              <SelectItem value="miscellaneous">Miscellaneous</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={selectedCondition}
            onValueChange={setSelectedCondition}
          >
            <SelectTrigger>
              <SelectValue placeholder="Condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Conditions</SelectItem>
              <SelectItem value="like-new">Like New</SelectItem>
              <SelectItem value="good">Good</SelectItem>
              <SelectItem value="fair">Fair</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={selectedAvailability}
            onValueChange={setSelectedAvailability}
          >
            <SelectTrigger>
              <SelectValue placeholder="Availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Items</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="reserved">Reserved</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              <SelectItem value="likes-high">Most Likes</SelectItem>
              <SelectItem value="likes-low">Fewest Likes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="grid" className="mt-0">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array(8)
                .fill(0)
                .map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-[200px] w-full" />
                    <CardHeader className="p-4 pb-2">
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent className="px-4 py-2">
                      <Skeleton className="h-4 w-full" />
                    </CardContent>
                    <CardFooter className="p-4">
                      <Skeleton className="h-9 w-full" />
                    </CardFooter>
                  </Card>
                ))}
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <ItemCard
                  key={item.itemId}
                  item={item}
                  onViewDetails={handleViewDetails}
                  likes={likesById[item.itemId] || 0}
                  isLiked={isLikedById[item.itemId] || false}
                  onLikeToggle={handleLikeToggle}
                  mode={userMode}
                  additionalBadges={[
                    <Badge
                      key="category"
                      variant="secondary"
                      className="text-xs capitalize"
                    >
                      {item.generalCategory}
                    </Badge>,
                  ]}
                />
              ))}
            </div>
          ) : (
            <CustomEmptyState />
          )}
        </TabsContent>

        <TabsContent value="list" className="mt-0">
          {isLoading ? (
            <div className="space-y-4">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="flex flex-col sm:flex-row">
                      <Skeleton className="h-[150px] sm:w-[150px] w-full" />
                      <div className="p-4 flex-1">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2 mb-4" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="space-y-4">
              {filteredItems.map((item) => (
                <motion.div
                  key={item.itemId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
                    <div className="flex flex-col sm:flex-row">
                      <div className="relative h-[150px] sm:w-[150px] overflow-hidden bg-muted">
                        {item.images ? (
                          <img
                            src={item.displayImage || "/placeholder.svg"}
                            alt={item.name || item.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <Grid3X3 className="h-8 w-8 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-muted-foreground/50" />
                        )}
                        {!item.available && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <Badge
                              variant="destructive"
                              className="text-sm font-medium px-3 py-1"
                            >
                              Reserved
                            </Badge>
                          </div>
                        )}
                      </div>

                      <div className="p-4 flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg">
                                {item.name || item.title}
                              </h3>
                              <Badge
                                variant="secondary"
                                className="text-xs capitalize"
                              >
                                {item.size || item.brand || item.estimatedValue || item.subCategory}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground">
                              {item.brand || item.author || "No brand"}
                            </p>
                          </div>
                          <ConditionBadge
                            condition={item.condition?.toLowerCase()}
                          />
                        </div>

                        <p className="text-sm mt-2 line-clamp-2">
                          {item.description}
                        </p>
                        <div className="flex items-center justify-between mt-4">
                          <div className="text-sm text-muted-foreground">
                            {item.generalCategory} •{" "}
                            {item.available === "true"
                              ? "Available"
                              : "Reserved"}
                          </div>
                          <div className="flex items-center gap-2">
                            <LikeButton
                              itemId={item.itemId}
                              likes={likesById[item.itemId] || 0}
                              isLiked={isLikedById[item.itemId] || false}
                              onLikeToggle={handleLikeToggle}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-primary text-primary hover:bg-primary hover:text-white"
                              onClick={() => handleViewDetails(item)}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <CustomEmptyState />
          )}
        </TabsContent>
      </Tabs>

      {/* Post Item Dialog */}
      <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Choose Item Category</DialogTitle>
            <DialogDescription>
              Select the category that best describes the item you want to post.
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
              className="justify-start h-auto p-4"
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

      <ItemDetailsDialog
        item={selectedItem}
        isOpen={isDetailsOpen}
        onClose={handleCloseDetails}
        likes={selectedItem ? likesById[selectedItem.itemId] || 0 : 0}
        isLiked={
          selectedItem ? isLikedById[selectedItem.itemId] || false : false
        }
        onLikeToggle={handleLikeToggle}
        mode={userMode}
      />
    </main>
  );
};

export default AllCategoriesViewPage;
