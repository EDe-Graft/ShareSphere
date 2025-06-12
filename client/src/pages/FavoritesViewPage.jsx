import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Search, SlidersHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { Toaster, toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import ItemCard from "@/components/ItemCard";
import {ConditionBadge} from "@/components/CustomBadges";
import ItemDetailsDialog from "@/components/ItemDetailsDialog";
import EmptyState from "@/components/EmptyState";
import { useAuth } from "@/components/AuthContext";
import axios from "axios";

const FavoritesViewPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [filteredFavorites, setFilteredFavorites] = useState([]);
  const [likesById, setLikesById] = useState({});
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [isLikedById, setIsLikedById] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedAvailability, setSelectedAvailability] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const userMode = 'view';
  const category = 'favorites';

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const axiosConfig = {
    headers: { "Content-Type": "application/json" },
    withCredentials: true
  };

  // Modified to use includeDetails=true
  const loadUserFavorites = async () => {
    if (!user) return;

    try {
      const response = await axios.get(
        `${BACKEND_URL}/favorites?category=all&includeDetails=true`, // Key change
        axiosConfig
      );

      if (response.data.getSuccess) {
        const favorites = response.data.userFavoritesDetails || []; // Fallback to empty array

        setFavorites(favorites);
        setFilteredFavorites(favorites);

        const initialLikes = {};
        const initialLikedStatus = {};
        favorites.forEach(item => {
          const itemId = item.itemId;
          if (item && itemId) { // Null check
            initialLikes[itemId] = item.likes || 0;
            initialLikedStatus[itemId] = true;
          }
        });

        setLikesById(initialLikes);
        setIsLikedById(initialLikedStatus);
      }
    } catch (error) {
      console.error("Failed to fetch favorites:", error);
      toast.error("Failed to load favorites");
    } finally {
      setIsLoading(false);
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
        // Update likes count
        setLikesById(prev => ({
          ...prev,
          [itemId]: res.data.newLikeCount
        }));
        
        // Update liked status
        setIsLikedById(prev => ({
          ...prev,
          [itemId]: res.data.isLiked
        }));
        
        // If unliked, remove from favorites view
        if (!res.data.isLiked) {
          setFavorites(prev => prev.filter(item => item.itemId !== itemId));
          toast.info("Removed from favorites");
        }
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setIsLikeLoading(false);
    }
  };

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

  useEffect(() => {
    loadUserFavorites();
  }, [user]);

  useEffect(() => {
    let result = [...favorites];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.generalCategory?.toLowerCase().includes(query) ||
        item.name?.toLowerCase().includes(query) || 
        item.title?.toLowerCase().includes(query) ||
        item.type?.toLowerCase().includes(query) ||
        item.brand?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== "all") {
      result = result.filter(item => item.generalCategory?.toLowerCase() === selectedCategory);
    }

    if (selectedAvailability !== "all") {
      const isAvailable = selectedAvailability === "available";
      result = result.filter(item => item.available === isAvailable.toString());
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
          const aName = a.name || a.title || '';
          const bName = b.name || b.title || '';
          return aName.localeCompare(bName);
        }); 
        break;
      case "name-desc": 
        result.sort((a, b) => {
          const aName = a.name || a.title || '';
          const bName = b.name || b.title || '';
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

    setFilteredFavorites(result);
  }, [favorites, searchQuery, selectedCategory, selectedAvailability, sortBy]);

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
    setSelectedAvailability("all");
    setSortBy("newest");
  };

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Sonner Toaster Component */}
      <Toaster position="bottom-right" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center">
          <Heart className="h-8 w-8 text-primary mr-3" fill="#FF0000" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">My Favorites</h1>
            <p className="text-muted-foreground">Items you've liked from the community</p>
          </div>
        </div>
        <Button onClick={() => navigate("/explore")} className="bg-primary hover:bg-primary/90">
          Explore More Items
        </Button>
      </div>

      <Tabs defaultValue="grid" className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="relative w-full sm:w-[300px] lg:w-[400px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search favorites by category, type..."
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
            <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="book">Books</SelectItem>
              <SelectItem value="furniture">Furniture</SelectItem>
              <SelectItem value="clothing">Clothing</SelectItem>
              <SelectItem value="miscellaneous">Miscellaneous</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedAvailability} onValueChange={setSelectedAvailability}>
            <SelectTrigger><SelectValue placeholder="Availability" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Items</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="reserved">Reserved</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger><SelectValue placeholder="Sort By" /></SelectTrigger>
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
          ) : filteredFavorites.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredFavorites.map((item) => (
                <ItemCard
                  key={item.itemId}
                  item={item}
                  onViewDetails={handleViewDetails}
                  onDelete={handleDeletePost}
                  likes={likesById[item.itemId] || 0}
                  isLiked={isLikedById[item.itemId] || false}
                  onLikeToggle={handleLikeToggle}
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
          ) : filteredFavorites.length > 0 ? (
            <div className="space-y-4">
              {filteredFavorites.map((item) => (
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

      <ItemDetailsDialog
        item={selectedItem}
        isOpen={isDetailsOpen}
        onClose={handleCloseDetails}
        likes={selectedItem ? likesById[selectedItem.itemId] || 0 : 0}
        isLiked={selectedItem ? isLikedById[selectedItem.itemId] || false : false}
        onLikeToggle={handleLikeToggle}
        mode={userMode}
      />
    </main>
  );
};

export default FavoritesViewPage;