import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Shirt, Search, Plus, SlidersHorizontal } from "lucide-react";

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
import ItemDetailsDialog from "@/components/ItemDetailsDialog";
import EmptyState from "@/components/EmptyState";
import { useAuth } from "@/components/AuthContext";
import { getSizeOptions } from "./ClothingForm";
import axios from "axios";

// Size display component
const SizeDisplay = ({ size }) => {
  const getSizeDisplay = (size) => {
    switch (size) {
      case "xs":
        return "XS";
      case "s":
        return "S";
      case "m":
        return "M";
      case "l":
        return "L";
      case "xl":
        return "XL";
      case "xxl":
        return "XXL";
      case "xxxl":
        return "XXXL";
      default:
        return size; // For custom sizes
    }
  };

  return <span className="font-medium">{getSizeDisplay(size)}</span>;
};

// Main ClothingViewPage component
const ClothingViewPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clothing, setClothing] = useState([]);
  const [filteredClothing, setFilteredClothing] = useState([]);
  const [likesById, setLikesById] = useState({});
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [isLikedById, setIsLikedById] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedSize, setSelectedSize] = useState("all");
  const [selectedGender, setSelectedGender] = useState("all");
  const [selectedCondition, setSelectedCondition] = useState("all");
  const [selectedAvailability, setSelectedAvailability] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClothing, setSelectedClothing] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const userMode = "view"; //for itemdetailsdialog display;
  const category = "clothing"; //for empty state handling



  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const axiosConfig = {
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  };

  const getUserFavorites = async () => {
    if (!user) return;

    try {
      const response = await axios.get(
        `${BACKEND_URL}/favorites?category=clothing`,
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
    const loadClothing = async () => {
      try {
        const response = await axios.get(
          `${BACKEND_URL}/items?category=clothing`,
          axiosConfig
        );
        if (response.data.getSuccess) {
          const items = response.data.items;
          setClothing(items);
          setFilteredClothing(items);

          const initialLikes = {};
          const initialLikedStatus = {};
          items.forEach((item) => {
            initialLikes[item.itemId] = item.likes;
            initialLikedStatus[item.itemId] = false;
          });
          setLikesById(initialLikes);
          setIsLikedById(initialLikedStatus);

          if (user) {
            getUserFavorites();
          }
        }
      } catch (error) {
        console.error("Error loading clothing:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadClothing();
  }, [user]);


  const handleDeletePost = async (itemId, itemCategory) => {
    setIsDeleting(true);

    try {
      console.log("Attempting to delete:", itemId, itemCategory);
      const response = await axios.delete(
        `${BACKEND_URL}/items/${itemId}/${itemCategory}`,
        axiosConfig
      );

      if (response.data.deleteSuccess) {
        toast.success("Post deleted successfully", {
          description: `Your ${itemCategory} has been successfully removed from ShareSphere.`,
        });

        setTimeout(() => {
          window.location.reload(); // refreshes the current page
        }, 2000);
      }
    } catch (error) {
      console.error("Failed to delete post:", error);
      toast.error("Failed to delete post. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter clothing based on search query and filters
  useEffect(() => {
    let result = [...clothing];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (clothing) =>
          clothing.name?.toLowerCase().includes(query) ||
          clothing.size?.toLowerCase().includes(query) ||
          clothing.brand?.toLowerCase().includes(query) ||
          clothing.color?.toLowerCase().includes(query) ||
          clothing.description?.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (selectedType !== "all") {
      result = result.filter(
        (item) => item.type.toLowerCase() === selectedType
      );
    }

    // Apply size filter
    if (selectedSize !== "all") {
      result = result.filter(
        (item) => item.size.toLowerCase() === selectedSize
      );
    }

    // Apply gender filter
    if (selectedGender !== "all") {
      result = result.filter(
        (item) => item.gender.toLowerCase() === selectedGender
      );
    }

    // Apply condition filter
    if (selectedCondition !== "all") {
      result = result.filter(
        (item) => item.condition.toLowerCase() === selectedCondition
      );
    }

    // Apply availability filter
    if (selectedAvailability !== "all") {
      const isAvailable = selectedAvailability === "available";
      result = result.filter(
        (item) => item.available === isAvailable.toString()
      );
    }

    // Apply sorting
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.uploadDate) - new Date(b.uploadDate));
        break;
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "most-liked":
        result.sort((a, b) => b.likes - a.likes);
        break;
      default:
        break;
    }

    setFilteredClothing(result);
  }, [
    clothing,
    searchQuery,
    selectedType,
    selectedSize,
    selectedGender,
    selectedCondition,
    selectedAvailability,
    sortBy,
  ]);

  // Handle view details
  const handleViewDetails = (item) => {
    setSelectedClothing(item);
    setIsDetailsOpen(true);
  };

  // Handle close details
  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedType("all");
    setSelectedSize("all");
    setSelectedGender("all");
    setSelectedCondition("all");
    setSelectedAvailability("all");
    setSortBy("newest");
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center">
          <Shirt className="h-8 w-8 text-primary mr-3" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Clothing Donations
            </h1>
            <p className="text-muted-foreground">
              Browse and request donated clothing from our community
            </p>
          </div>
        </div>
        <Button
          onClick={() => navigate("/clothing-form")}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Donate Clothing
        </Button>
      </div>

      <Tabs defaultValue="grid" className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="relative w-full sm:w-[300px] lg:w-[400px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, size, brand, color..."
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

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="tops">Tops/Shirts</SelectItem>
              <SelectItem value="pants">Pants/Jeans</SelectItem>
              <SelectItem value="dresses">Dresses/Skirts</SelectItem>
              <SelectItem value="outerwear">Outerwear/Jackets</SelectItem>
              <SelectItem value="activewear">Activewear</SelectItem>
              <SelectItem value="formal">Formal Wear</SelectItem>
              <SelectItem value="accessories">Accessories</SelectItem>
              <SelectItem value="footwear">Footwear</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={selectedSize}
            onValueChange={setSelectedSize}
            disabled={selectedType === "all"} // Disable if no category selected
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  selectedType === "all"
                    ? "Select category first"
                    : selectedType === "footwear"
                      ? "Select shoe size"
                      : "Select clothing size"
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sizes</SelectItem>
              {getSizeOptions(selectedType)}
            </SelectContent>
          </Select>

          <Select value={selectedGender} onValueChange={setSelectedGender}>
            <SelectTrigger>
              <SelectValue placeholder="Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genders</SelectItem>
              <SelectItem value="mens">Men's</SelectItem>
              <SelectItem value="womens">Women's</SelectItem>
              <SelectItem value="unisex">Unisex</SelectItem>
              <SelectItem value="kids">Kids</SelectItem>
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
              <SelectItem value="all">All Clothing</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="borrowed">Reserved</SelectItem>
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
              <SelectItem value="most-liked">Most Liked</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="grid" className="mt-0">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array(8)
                .fill(0)
                .map((_, index) => (
                  <Card key={index} className="overflow-hidden">
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
          ) : filteredClothing.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredClothing.map((item) => (
                <ItemCard
                  key={item.itemId}
                  item={item}
                  onViewDetails={handleViewDetails}
                  onDelete={handleDeletePost}
                  likes={likesById[item.itemId] || 0}
                  isLiked={isLikedById[item.itemId] || false}
                  onLikeToggle={handleLikeToggle}
                  sizeBadge={<SizeDisplay size={item.size} />}
                  viewMode="grid"
                />
              ))}
            </div>
          ) : (
            <EmptyState category={category} />
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
          ) : filteredClothing.length > 0 ? (
            <div className="space-y-4">
              {filteredClothing.map((item) => (
                <ItemCard
                  key={item.itemId}
                  item={item}
                  onViewDetails={handleViewDetails}
                  onDelete={handleDeletePost}
                  likes={likesById[item.itemId] || 0}
                  isLiked={isLikedById[item.itemId] || false}
                  onLikeToggle={handleLikeToggle}
                  viewMode="list"
                />
              ))}
            </div>
          ) : (
            <EmptyState category={category} />
          )}
        </TabsContent>
      </Tabs>

      {/* Pagination placeholder - would be implemented with real data */}
      {filteredClothing.length > 0 && (
        <div className="flex justify-center mt-8">
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" disabled>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-chevron-left"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-primary text-white hover:bg-primary/90"
            >
              1
            </Button>
            <Button variant="outline" size="sm">
              2
            </Button>
            <Button variant="outline" size="sm">
              3
            </Button>
            <Button variant="outline" size="icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-chevron-right"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Button>
          </div>
        </div>
      )}

      {/* Clothing details dialog */}
      <ItemDetailsDialog
        item={selectedClothing}
        isOpen={isDetailsOpen}
        onClose={handleCloseDetails}
        likes={selectedClothing ? likesById[selectedClothing.itemId] || 0 : 0}
        isLiked={
          selectedClothing
            ? isLikedById[selectedClothing.itemId] || false
            : false
        }
        onLikeToggle={handleLikeToggle}
        mode={userMode}
        additionalFields={[
          {
            label: "Size",
            value: selectedClothing?.size ? (
              <SizeDisplay size={selectedClothing.size} />
            ) : (
              "N/A"
            ),
          },
          { label: "Color", value: selectedClothing?.color || "N/A" },
          { label: "Material", value: selectedClothing?.material || "N/A" },
          {
            label: "Gender",
            value: selectedClothing?.gender ? (
              <Badge gender={selectedClothing.gender} />
            ) : (
              "N/A"
            ),
          },
        ]}
      />
    </main>
  );
};

export default ClothingViewPage;
