import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  BookMarked,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import ItemCard from "@/components/custom/ItemCard";
import ItemDetailsDialog from "@/components/custom/ItemDetailsDialog";
import EmptyState from "@/components/custom/EmptyState";
import Pagination from "@/components/custom/Pagination";
import { CATEGORY_OPTIONS, toTitleCase } from "@/lib/utils";
import axios from "axios";
import { useAuth, getAxiosConfig } from "@/components/context/AuthContext";
import { formatData } from "@/lib/utils";
import { toast } from "sonner";

const BooksViewPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [likesById, setLikesById] = useState({});
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [isLikedById, setIsLikedById] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState("all");
  const [selectedCondition, setSelectedCondition] = useState("all");
  const [selectedAvailability, setSelectedAvailability] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const userMode = "view"; //for itemdetailsdialog display;
  const category = "book"; //for empty state handling
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  // Calculate current items for pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredBooks.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    selectedCategory,
    selectedSubcategory,
    selectedCondition,
    selectedAvailability,
    sortBy,
  ]);

  const getUserFavorites = async () => {
    if (!user) return;

    try {
      const response = await axios.get(
        `${BACKEND_URL}/favorites?category=book`,
        getAxiosConfig()
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
        getAxiosConfig()
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

  const handleUpdatePost = async (updateData) => {
    try {
      // formatData returns a FormData object
      const formData = formatData(updateData);

      // Check if there are any File objects in imageChanges.newImages
      let hasFile = false;
      if (
        updateData.imageChanges &&
        Array.isArray(updateData.imageChanges.newImages)
      ) {
        hasFile = updateData.imageChanges.newImages.some(
          (f) => f instanceof File
        );
      }

      let response;
      if (hasFile) {
        // Send as multipart/form-data
        response = await axios.post(
          `${BACKEND_URL}/update-post?hasFile=true`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
          }
        );
      } else {
        // Convert FormData to a JS object for JSON
        const formattedData = {};
        for (const [key, value] of formData.entries()) {
          formattedData[key] = value;
        }
        response = await axios.post(
          `${BACKEND_URL}/update-post?hasFile=false`,
          { updateData: formattedData },
          getAxiosConfig()
        );
      }

      if (response.data.updateSuccess) {
        toast.success("Post updated successfully", {
          description: `Your ${updateData.itemCategory} post was successfully updated on ShareSphere.`,
        });

        setTimeout(() => {
          window.location.reload(); // refreshes the current page
        }, 2000);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const response = await axios.get(
          `${BACKEND_URL}/items?category=book`,
          getAxiosConfig()
        );
        if (response.data.getSuccess) {
          const items = response.data.items;
          setBooks(items);
          setFilteredBooks(items);

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
        console.error("Error loading books:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadBooks();
  }, [user]);

  // Update your filtering useEffect to be more defensive
  useEffect(() => {
    let result = [...books];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (book) =>
          (book.title?.toLowerCase() || "").includes(query) ||
          (book.subCategory?.toLowerCase() || "").includes(query) ||
          (book.author?.toLowerCase() || "").includes(query)
      );
    }

    if (selectedCategory !== "all") {
      result = result.filter(
        (book) =>
          (book.parentCategory?.toLowerCase() || "") === selectedCategory
      );
      if (selectedSubcategory !== "all") {
        result = result.filter(
          (book) =>
            (book.subCategory?.toLowerCase() || "") === selectedSubcategory
        );
      }
    }

    if (selectedCondition !== "all") {
      result = result.filter(
        (book) => (book.condition?.toLowerCase() || "") === selectedCondition
      );
    }

    if (selectedAvailability !== "all") {
      console.log(selectedAvailability);
      const isAvailable = selectedAvailability === "available";
      result = result.filter(
        (book) => String(book.available) === String(isAvailable)
      );
    }

    // Sorting logic remains the same
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.uploadDate) - new Date(b.uploadDate));
        break;
      case "title-asc":
        result.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        break;
      case "title-desc":
        result.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
        break;
      case "most-liked":
        result.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        break;
      default:
        break;
    }

    setFilteredBooks(result);
  }, [
    books,
    searchQuery,
    selectedCategory,
    selectedSubcategory,
    selectedCondition,
    selectedAvailability,
    sortBy,
  ]);

  useEffect(() => {
    setSelectedSubcategory("all");
  }, [selectedCategory]);

  // Handle view details
  const handleViewDetails = (item) => {
    setSelectedBook(item);
    setIsDetailsOpen(true);
  };

  // Handle close details
  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
  };

  const handleDeletePost = async (itemId, itemCategory) => {
    setIsDeleting(true);

    try {
      console.log("Attempting to delete:", itemId, itemCategory);
      const response = await axios.delete(
        `${BACKEND_URL}/items/${itemId}/${itemCategory}`,
        getAxiosConfig()
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

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedSubcategory("all");
    setSelectedCondition("all");
    setSelectedAvailability("all");
    setSortBy("newest");
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center">
          <BookMarked className="h-8 w-8 text-primary mr-3" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Books Donations
            </h1>
            <p className="text-muted-foreground">
              Browse and request donated books from our community
            </p>
          </div>
        </div>
        <Button
          onClick={() => navigate("/books-form")}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" /> Donate a Book
        </Button>
      </div>

      <Tabs defaultValue="grid" className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="relative w-full sm:w-[300px] lg:w-[400px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, author, or genre..."
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

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="textbook">Textbooks</SelectItem>
              <SelectItem value="fiction">Fiction</SelectItem>
              <SelectItem value="non-fiction">Non-Fiction</SelectItem>
            </SelectContent>
          </Select>

          {["textbook", "fiction", "non-fiction"].includes(
            selectedCategory
          ) && (
            <Select
              value={selectedSubcategory}
              onValueChange={setSelectedSubcategory}
            >
              <SelectTrigger>
                <SelectValue placeholder={`All ${selectedCategory}`} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All {selectedCategory}</SelectItem>
                {CATEGORY_OPTIONS[
                  selectedCategory === "non-fiction"
                    ? "Non-Fiction"
                    : toTitleCase(selectedCategory)
                ].map((subcategory) => (
                  <SelectItem
                    key={subcategory}
                    value={subcategory.toLowerCase()}
                  >
                    {subcategory}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

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
              <SelectItem value="all">All Books</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="borrowed">Reserved</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* <TabsContent value="grid" className="mt-0">
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
          ) : filteredBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredBooks.map((item) => (
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
        </TabsContent> */}

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
          ) : currentItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {currentItems.map((item) => (
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

        {/* <TabsContent value="list" className="mt-0">
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
          ) : filteredBooks.length > 0 ? (
            <div className="space-y-4">
              {filteredBooks.map((item) => (
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
        </TabsContent> */}

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
          ) : currentItems.length > 0 ? (
            <div className="space-y-4">
              {currentItems.map((item) => (
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

      {filteredBooks.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={filteredBooks.length}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
        />
      )}

      <ItemDetailsDialog
        item={selectedBook}
        isOpen={!!selectedBook}
        onClose={() => setSelectedBook(null)}
        likes={selectedBook ? likesById[selectedBook.itemId] || 0 : 0}
        isLiked={
          selectedBook ? isLikedById[selectedBook.itemId] || false : false
        }
        onLikeToggle={handleLikeToggle}
        mode={userMode}
        onUpdate={handleUpdatePost}
      />
    </main>
  );
};

export default BooksViewPage;
