import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Search, Plus, SlidersHorizontal } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import ItemCard from "@/components/ItemCard";
import ConditionBadge from "@/components/ConditionBadge";
import ItemDetailsDialog from "@/components/ItemDetailsDialog";
import EmptyState from "@/components/EmptyState";
import { useAuth } from "@/components/AuthContext";
import LikeButton from "@/components/LikeButton";
import axios from "axios";

// Age display component
const AgeDisplay = ({ age }) => {
  const getAgeDisplay = (age) => {
    switch (age) {
      case "less-than-1": return "< 1 year";
      case "1-2": return "1-2 years";
      case "3-5": return "3-5 years";
      case "5+": return "5+ years";
      default: return "Unknown";
    }
  };

  return <span className="text-sm text-muted-foreground">{getAgeDisplay(age)}</span>;
};

const MiscellaneousViewPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [likesById, setLikesById] = useState({});
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [isLikedById, setIsLikedById] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedAge, setSelectedAge] = useState("all");
  const [selectedCondition, setSelectedCondition] = useState("all");
  const [selectedAvailability, setSelectedAvailability] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const userMode = 'view'; //for itemdetailsdialog display;
  const category = 'miscellaneous' //for empty state handling

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const axiosConfig = {
    headers: { "Content-Type": "application/json" },
    withCredentials: true
  };

  const getUserFavorites = async () => {
    if (!user) return;

    try {
      const response = await axios.get(
        `${BACKEND_URL}/favorites?category=miscellaneous`,
        axiosConfig
      );

      if (response.data.getSuccess) {
        const favorites = response.data.userFavorites;
        const newLikedStatus = {...isLikedById};
        favorites.forEach(itemId => {
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
        setLikesById(prev => ({
          ...prev,
          [itemId]: res.data.newLikeCount
        }));
        setIsLikedById(prev => ({
          ...prev,
          [itemId]: res.data.isLiked
        }));
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setIsLikeLoading(false);
    }
  };

  useEffect(() => {
    const loadItems = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/items?category=miscellaneous`, axiosConfig);
        if (response.data.getSuccess) {
          const items = response.data.items;
          setItems(items);
          setFilteredItems(items);
          
          const initialLikes = {};
          const initialLikedStatus = {};
          items.forEach(item => {
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
        console.error("Error loading items:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadItems();
  }, [user]);

  useEffect(() => {
    let result = [...items];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.name?.toLowerCase().includes(query) || 
        item.brand?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== "all") {
      result = result.filter(item => item.type.toLowerCase() === selectedCategory);
    }

    if (selectedAge !== "all") {
      result = result.filter(item => item.age.toLowerCase() === selectedAge);
    }

    if (selectedCondition !== "all") {
      result = result.filter(item => item.condition.toLowerCase() === selectedCondition);
    }

    if (selectedAvailability !== "all") {
      const isAvailable = selectedAvailability === "available";
      result = result.filter(item => item.available === isAvailable.toString());
    }

    switch (sortBy) {
      case "newest": result.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate)); break;
      case "oldest": result.sort((a, b) => new Date(a.uploadDate) - new Date(b.uploadDate)); break;
      case "name-asc": result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case "name-desc": result.sort((a, b) => b.name.localeCompare(a.name)); break;
      case "value-high": 
        result.sort((a, b) => {
          const valA = parseFloat(a.estimatedValue?.replace(/[^0-9.-]/g, '') || 0);
          const valB = parseFloat(b.estimatedValue?.replace(/[^0-9.-]/g, '') || 0);
          return valB - valA;
        });
        break;
      case "value-low":
        result.sort((a, b) => {
          const valA = parseFloat(a.estimatedValue?.replace(/[^0-9.-]/g, '') || 0);
          const valB = parseFloat(b.estimatedValue?.replace(/[^0-9.-]/g, '') || 0);
          return valA - valB;
        });
        break;
      default: break;
    }

    setFilteredItems(result);
  }, [items, searchQuery, selectedCategory, selectedAge, selectedCondition, selectedAvailability, sortBy]);

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
    setSelectedAge("all");
    setSelectedCondition("all");
    setSelectedAvailability("all");
    setSortBy("newest");
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center">
          <Package className="h-8 w-8 text-primary mr-3" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Miscellaneous Donations</h1>
            <p className="text-muted-foreground">Browse and request donated items from our community</p>
          </div>
        </div>
        <Button onClick={() => navigate("/miscellaneous-form")} className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" /> Donate Item
        </Button>
      </div>

      <Tabs defaultValue="grid" className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="relative w-full sm:w-[300px] lg:w-[400px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, brand, or description..."
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
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="electronics">Electronics</SelectItem>
              <SelectItem value="kitchen">Kitchen</SelectItem>
              <SelectItem value="decor">Home Decor</SelectItem>
              <SelectItem value="stationery">Stationery</SelectItem>
              <SelectItem value="sports">Sports</SelectItem>
              <SelectItem value="tools">Tools</SelectItem>
              <SelectItem value="instruments">Instruments</SelectItem>
              <SelectItem value="art">Art Supplies</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedAge} onValueChange={setSelectedAge}>
            <SelectTrigger><SelectValue placeholder="Age" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ages</SelectItem>
              <SelectItem value="less-than-1">Less than 1 year</SelectItem>
              <SelectItem value="1-2">1-2 years</SelectItem>
              <SelectItem value="3-5">3-5 years</SelectItem>
              <SelectItem value="5+">5+ years</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedCondition} onValueChange={setSelectedCondition}>
            <SelectTrigger><SelectValue placeholder="Condition" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Conditions</SelectItem>
              <SelectItem value="like-new">Like New</SelectItem>
              <SelectItem value="good">Good</SelectItem>
              <SelectItem value="fair">Fair</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedAvailability} onValueChange={setSelectedAvailability}>
            <SelectTrigger><SelectValue placeholder="Availability" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Miscellaneous</SelectItem>
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
              <SelectItem value="value-high">Value (High to Low)</SelectItem>
              <SelectItem value="value-low">Value (Low to High)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="grid" className="mt-0">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array(8).fill(0).map((_, i) => (
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
                  additionalBadges={[
                    <Badge key="age" variant="outline" className="text-xs">
                      <AgeDisplay age={item.age} />
                    </Badge>
                  ]}
                />
              ))}
            </div>
          ) : (
            <EmptyState category="miscellaneous" />
          )}
        </TabsContent>

        <TabsContent value="list" className="mt-0">
          {isLoading ? (
            <div className="space-y-4">
              {Array(5).fill(0).map((_, i) => (
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
                            alt={item.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <Package className="h-8 w-8 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-muted-foreground/50" />
                        )}
                        {!item.available && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <Badge variant="destructive" className="text-sm font-medium px-3 py-1">
                              Reserved
                            </Badge>
                          </div>
                        )}
                      </div>

                      <div className="p-4 flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg">{item.name}</h3>
                              <Badge variant="outline" className="text-xs">
                                <AgeDisplay age={item.age} />
                              </Badge>
                            </div>
                            <p className="text-muted-foreground">{item.brand || "No brand"}</p>
                          </div>
                          <ConditionBadge condition={item.condition.toLowerCase()} />
                        </div>

                        <p className="text-sm mt-2 line-clamp-2">{item.description}</p>
                        <div className="flex items-center justify-between mt-4">
                          <div className="text-sm text-muted-foreground">
                            {item.estimatedValue || "Value not specified"}
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
            <EmptyState category={category} />
          )}
        </TabsContent>
      </Tabs>

      {filteredItems.length > 0 && (
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
            <Button variant="outline" size="sm" className="bg-primary text-white hover:bg-primary/90">
              1
            </Button>
            <Button variant="outline" size="sm">2</Button>
            <Button variant="outline" size="sm">3</Button>
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

      <ItemDetailsDialog
        item={selectedItem}
        isOpen={isDetailsOpen}
        onClose={handleCloseDetails}
        likes={selectedItem ? likesById[selectedItem.itemId] || 0 : 0}
        isLiked={selectedItem ? isLikedById[selectedItem.itemId] || false : false}
        onLikeToggle={handleLikeToggle}
        mode = {userMode}
        additionalFields={[
          { label: "Age", value: selectedItem?.age ? <AgeDisplay age={selectedItem.age} /> : "N/A" },
          { label: "Estimated Value", value: selectedItem?.estimatedValue || "N/A" }
        ]}
      />
    </main>
  );
};

export default MiscellaneousViewPage;
