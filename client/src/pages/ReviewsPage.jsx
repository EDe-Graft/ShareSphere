import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Search, Filter, Plus, Edit2, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast, Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import ReviewDialog from "@/components/custom/ReviewDialog";
import Pagination from "@/components/custom/Pagination";
import { useAuth } from "@/components/context/AuthContext";
import axios from "axios";

const ReviewsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [reviewsGiven, setReviewsGiven] = useState([]);
  const [reviewsReceived, setReviewsReceived] = useState([]);
  const [filteredReviewsGiven, setFilteredReviewsGiven] = useState([]);
  const [filteredReviewsReceived, setFilteredReviewsReceived] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [isLoading, setIsLoading] = useState(true);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // Pagination states
  const [currentReceivedPage, setCurrentReceivedPage] = useState(1);
  const [currentGivenPage, setCurrentGivenPage] = useState(1);
  const itemsPerPage = 5;

  const BACKEND_URL = import.meta.env.NODE_ENV === 'production' ? import.meta.env.VITE_BACKEND_URL : 'http://localhost:3000';

  const axiosConfig = {
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  };

  useEffect(() => {
    loadReviews();
  }, [user]);

  useEffect(() => {
    filterReviews();
    setCurrentReceivedPage(1);
    setCurrentGivenPage(1);
  }, [reviewsGiven, reviewsReceived, searchQuery, ratingFilter, sortBy]);

  // Reset pagination when tab changes
  const handleTabChange = (value) => {
    if (value === "received") {
      setCurrentReceivedPage(1);
    } else if (value === "given") {
      setCurrentGivenPage(1);
    }
  };

  //load reviews
  const loadReviews = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Load reviews given by user
      const givenResponse = await axios.get(
        `${BACKEND_URL}/reviews/given/${user.userId}`,
        axiosConfig
      );

      if (givenResponse.data.success) {
        setReviewsGiven(givenResponse.data.reviews);
      }

      // Load reviews received by user
      const receivedResponse = await axios.get(
        `${BACKEND_URL}/reviews/received/${user.userId}`,
        axiosConfig
      );

      if (receivedResponse.data.success) {
        setReviewsReceived(receivedResponse.data.reviews);
      }
    } catch (error) {
      console.error("Error loading reviews:", error);
      toast.error("Failed to load reviews");
    } finally {
      setIsLoading(false);
    }
  };

  const filterReviews = () => {
    // Filter reviews given
    let filteredGiven = [...reviewsGiven];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredGiven = filteredGiven.filter(
        (review) =>
          review.reviewedUserName?.toLowerCase().includes(query) ||
          review.comment?.toLowerCase().includes(query) ||
          review.itemName?.toLowerCase().includes(query)
      );
    }

    if (ratingFilter !== "all") {
      const rating = Number.parseInt(ratingFilter);
      filteredGiven = filteredGiven.filter(
        (review) => review.rating === rating
      );
    }

    // Filter reviews received
    let filteredReceived = [...reviewsReceived];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredReceived = filteredReceived.filter(
        (review) =>
          review.reviewerName?.toLowerCase().includes(query) ||
          review.comment?.toLowerCase().includes(query) ||
          review.itemName?.toLowerCase().includes(query)
      );
    }

    if (ratingFilter !== "all") {
      const rating = Number.parseInt(ratingFilter);
      filteredReceived = filteredReceived.filter(
        (review) => review.rating === rating
      );
    }

    // Apply sorting
    const sortFunction = (a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "rating-high":
          return b.rating - a.rating;
        case "rating-low":
          return a.rating - b.rating;
        default:
          return 0;
      }
    };

    filteredGiven.sort(sortFunction);
    filteredReceived.sort(sortFunction);

    setFilteredReviewsGiven(filteredGiven);
    setFilteredReviewsReceived(filteredReceived);
  };

  const handleEditReview = (review) => {
    setSelectedReview(review);
    setSelectedUser({
      userId: review.reviewedUserId,
      name: review.reviewedUserName,
      photo: review.reviewedUserPhoto,
    });
    setIsReviewDialogOpen(true);
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      const response = await axios.delete(
        `${BACKEND_URL}/reviews/${reviewId}`,
        axiosConfig
      );

      if (response.data.deleteSuccess) {
        toast.success("Review deleted successfully");
        //refresh reviews page after 2 seconds
        setTimeout(() => {
          loadReviews();
        }, 1500);
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Failed to delete review");
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setRatingFilter("all");
    setSortBy("newest");
  };

  // Star rendering with precise decimal support
  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, index) => {
      const fillPercentage = Math.max(0, Math.min(100, (rating - index) * 100));

      return (
        <div key={index} className="relative inline-block">
          {/* Background empty star */}
          <Star className="h-4 w-4 text-gray-300" />
          {/* Filled portion */}
          {fillPercentage > 0 && (
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fillPercentage}%` }}
            >
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            </div>
          )}
        </div>
      );
    });
  };

  // Pagination helpers
  const getPaginatedReceivedReviews = () => {
    const startIndex = (currentReceivedPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredReviewsReceived.slice(startIndex, endIndex);
  };

  const getPaginatedGivenReviews = () => {
    const startIndex = (currentGivenPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredReviewsGiven.slice(startIndex, endIndex);
  };

  const ReviewCard = ({ review, type, onEdit, onDelete }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={
                    type === "given"
                      ? review.reviewedUserPhoto
                      : review.reviewerPhoto
                  }
                />
                <AvatarFallback>
                  {(type === "given"
                    ? review.reviewedUserName
                    : review.reviewerName
                  )
                    ?.charAt(0)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {type === "given"
                    ? `Review for ${review.reviewedUserName}`
                    : `Review from ${review.reviewerName}`}
                </p>
                <div className="flex items-center space-x-1 mt-1">
                  {renderStars(review.rating)}
                  <span className="text-sm text-muted-foreground ml-2">
                    {review.rating}/5
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {new Date(review.createdAt).toLocaleDateString()}
              </span>

              {type === "given" && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(review)}>
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit Review
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(review.reviewId)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Review
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {review.comment && (
            <p className="mt-3 text-sm text-muted-foreground">
              {review.comment}
            </p>
          )}

          {review.itemName && (
            <div className="mt-3">
              <Badge variant="secondary">About: {review.itemName}</Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center space-x-4 mb-8">
            <Skeleton className="h-8 w-8" />
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>

          <div className="space-y-4">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-full mt-3" />
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <Toaster position="bottom-right" richColors />
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center">
            <Star className="h-8 w-8 text-primary mr-3" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Reviews
              </h1>
              <p className="text-muted-foreground">
                Manage your reviews and see what others think
              </p>
            </div>
          </div>
          <Button onClick={() => navigate("/explore")}>
            <Plus className="mr-2 h-4 w-4" />
            Find Items to Review
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reviews..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="rating-high">Highest Rating</SelectItem>
                  <SelectItem value="rating-low">Lowest Rating</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={resetFilters}>
                <Filter className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Reviews Tabs */}
        <Tabs
          defaultValue="received"
          className="space-y-4"
          onValueChange={handleTabChange}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="received">
              Reviews For ({filteredReviewsReceived.length})
            </TabsTrigger>
            <TabsTrigger value="given">
              Reviews By ({filteredReviewsGiven.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="received" className="space-y-4">
            {filteredReviewsReceived.length > 0 ? (
              <>
                <div className="space-y-4">
                  {getPaginatedReceivedReviews().map((review, index) => (
                    <ReviewCard
                      key={review.reviewId || `received-${index}`}
                      review={review}
                      type="received"
                    />
                  ))}
                </div>
                <Pagination
                  currentPage={currentReceivedPage}
                  totalItems={filteredReviewsReceived.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentReceivedPage}
                />
              </>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No reviews received
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't received any reviews yet. Keep sharing great
                    items!
                  </p>
                  <Button onClick={() => navigate("/posts")}>
                    View Your Posts
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="given" className="space-y-4">
            {filteredReviewsGiven.length > 0 ? (
              <>
                <div className="space-y-4">
                  {getPaginatedGivenReviews().map((review, index) => (
                    <ReviewCard
                      key={review.reviewId || `given-${index}`}
                      review={review}
                      type="given"
                      onEdit={handleEditReview}
                      onDelete={handleDeleteReview}
                    />
                  ))}
                </div>
                <Pagination
                  currentPage={currentGivenPage}
                  totalItems={filteredReviewsGiven.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentGivenPage}
                />
              </>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No reviews given
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't written any reviews yet. Help the community by
                    sharing your experiences!
                  </p>
                  <Button onClick={() => navigate("/all-categories")}>
                    Find Items to Review
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Review Dialog */}
      <ReviewDialog
        isOpen={isReviewDialogOpen}
        onClose={() => {
          setIsReviewDialogOpen(false);
          setSelectedReview(null);
          setSelectedUser(null);
        }}
        reviewedUser={selectedUser}
        existingReview={selectedReview}
        onReviewSubmitted={() => {
          setIsReviewDialogOpen(false);
          setSelectedReview(null);
          setSelectedUser(null);
          toast.success("Review updated successfully!");

          //refresh reviews page after 2 seconds
          setTimeout(() => {
            loadReviews();
          }, 1500);
        }}
      />
    </main>
  );
};

export default ReviewsPage;
