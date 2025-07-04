import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Package,
  Star,
  Camera,
  Edit2,
  MapPin,
  Calendar,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import ItemCard from "@/components/custom/ItemCard";
import ItemDetailsDialog from "@/components/custom/ItemDetailsDialog";
import ReviewDialog from "@/components/custom/ReviewDialog";
import { useAuth } from "@/components/context/AuthContext";
import axios from "axios";
import { formatData } from "@/lib/utils";

const ProfilePage = () => {
  const { userId } = useParams(); // For viewing other users' profiles
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [profileUser, setProfileUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [receivedReviews, setReceivedReviews] = useState([]);
  const [likesById, setLikesById] = useState({});
  const [isLikedById, setIsLikedById] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalReviews: 0,
    averageRating: 0,
    totalLikes: 0,
  });

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const axiosConfig = {
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  };

  // Determine if viewing own profile or another user's profile
  const isOwnProfile = !userId || userId === currentUser?.userId;
  const targetUserId = isOwnProfile ? currentUser?.userId : userId;

  useEffect(() => {
    if (targetUserId) {
      loadProfileData();
    }
  }, [targetUserId]);

  const loadProfileData = async () => {
    try {
      setIsLoading(true);

      // Load user profile info
      const profileResponse = await axios.get(
        `${BACKEND_URL}/user-profile/${targetUserId}`,
        axiosConfig
      );

      if (profileResponse.data.success) {
        setProfileUser(profileResponse.data.user);
      }

      // Load user's posts
      const postsResponse = await axios.get(
        `${BACKEND_URL}/user-posts/${targetUserId}`,
        axiosConfig
      );

      if (postsResponse.data.success) {
        const posts = postsResponse.data.posts;
        setUserPosts(posts);

        // Initialize likes data
        const initialLikes = {};
        const initialLikedStatus = {};
        posts.forEach((post) => {
          initialLikes[post.itemId] = post.likes || 0;
          initialLikedStatus[post.itemId] = false;
        });
        setLikesById(initialLikes);
        setIsLikedById(initialLikedStatus);
      }

      // Load reviews given by user
      const reviewsResponse = await axios.get(
        `${BACKEND_URL}/user-reviews/${targetUserId}`,
        axiosConfig
      );

      if (reviewsResponse.data.success) {
        setUserReviews(reviewsResponse.data.reviews);
      }

      // Load reviews received by user
      const receivedReviewsResponse = await axios.get(
        `${BACKEND_URL}/user-received-reviews/${targetUserId}`,
        axiosConfig
      );

      if (receivedReviewsResponse.data.success) {
        setReceivedReviews(receivedReviewsResponse.data.reviews);
      }

      // Load user statistics
      const statsResponse = await axios.get(
        `${BACKEND_URL}/user-stats/${targetUserId}`,
        axiosConfig
      );

      if (statsResponse.data.success) {
        setStats(statsResponse.data.stats);
      }

      // Load user favorites if viewing own profile
      if (isOwnProfile) {
        await getUserFavorites();
      }
    } catch (error) {
      console.error("Error loading profile data:", error);
      toast.error("Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  };

  const getUserFavorites = async () => {
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
    }
  };

  const handleUpdatePost = async (updateData) => {
    try {
      const formData = formatData(updateData);
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
        response = await axios.post(
          `${BACKEND_URL}/update-post?hasFile=true`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
          }
        );
      } else {
        const formattedData = {};
        for (const [key, value] of formData.entries()) {
          formattedData[key] = value;
        }
        response = await axios.post(
          `${BACKEND_URL}/update-post?hasFile=false`,
          { updateData: formattedData },
          axiosConfig
        );
      }

      if (response.data.updateSuccess) {
        toast.success("Post updated successfully");
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error("Failed to update post");
    }
  };

  const handleDeletePost = async (itemId, itemCategory) => {
    try {
      const response = await axios.delete(
        `${BACKEND_URL}/items/${itemId}/${itemCategory}`,
        axiosConfig
      );

      if (response.data.deleteSuccess) {
        toast.success("Post deleted successfully");
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      console.error("Failed to delete post:", error);
      toast.error("Failed to delete post");
    }
  };

  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setIsDetailsOpen(true);
  };

  const handleAddReview = () => {
    setSelectedReview(null);
    setIsReviewDialogOpen(true);
  };

  const handleEditReview = (review) => {
    setSelectedReview(review);
    setIsReviewDialogOpen(true);
  };

  const handleProfilePhotoUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append("profilePhoto", file);

      const response = await axios.post(
        `${BACKEND_URL}/upload-profile-photo`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        toast.success("Profile photo updated successfully");
        setProfileUser((prev) => ({
          ...prev,
          profilePhoto: response.data.photoUrl,
        }));
      }
    } catch (error) {
      console.error("Error uploading profile photo:", error);
      toast.error("Failed to upload profile photo");
    }
  };

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-8 w-full mb-2" />
                    <Skeleton className="h-4 w-16" />
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </main>
    );
  }

  if (!profileUser) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">User not found</h1>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={
                      profileUser.profilePhoto ||
                      "/placeholder.svg?height=80&width=80"
                    }
                    alt={profileUser.name || profileUser.displayName}
                  />
                  <AvatarFallback className="text-lg">
                    {(profileUser.name || profileUser.displayName || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {isOwnProfile && (
                  <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1 cursor-pointer hover:bg-primary/90">
                    <Camera className="h-3 w-3" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleProfilePhotoUpload(file);
                      }}
                    />
                  </label>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-bold">
                    {profileUser.name || profileUser.displayName}
                  </h1>
                  {isOwnProfile && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate("/edit-profile")}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <p className="text-muted-foreground">
                  @{profileUser.username || "user"}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  {profileUser.email && (
                    <div className="flex items-center space-x-1">
                      <Mail className="h-4 w-4" />
                      <span>{profileUser.email}</span>
                    </div>
                  )}
                  {profileUser.location && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{profileUser.location}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Joined{" "}
                      {new Date(
                        profileUser.createdAt || Date.now()
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {profileUser.bio && (
                  <p className="text-sm mt-2">{profileUser.bio}</p>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {stats.totalPosts}
              </div>
              <div className="text-sm text-muted-foreground">Posts</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {stats.totalLikes}
              </div>
              <div className="text-sm text-muted-foreground">
                Likes Received
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {receivedReviews.length}
              </div>
              <div className="text-sm text-muted-foreground">Reviews</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center space-x-1">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="text-2xl font-bold text-primary">
                  {stats.averageRating ? stats.averageRating.toFixed(1) : "0.0"}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">Rating</div>
            </CardContent>
          </Card>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="posts" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="posts">Posts ({userPosts.length})</TabsTrigger>
            <TabsTrigger value="reviews-received">
              Reviews Received ({receivedReviews.length})
            </TabsTrigger>
            <TabsTrigger value="reviews-given">
              Reviews Given ({userReviews.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-4">
            {userPosts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {userPosts.map((item) => (
                  <ItemCard
                    key={item.itemId}
                    item={item}
                    onViewDetails={handleViewDetails}
                    onDelete={isOwnProfile ? handleDeletePost : undefined}
                    likes={likesById[item.itemId] || 0}
                    isLiked={isLikedById[item.itemId] || false}
                    onLikeToggle={handleLikeToggle}
                    viewMode="grid"
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                  <p className="text-muted-foreground mb-4">
                    {isOwnProfile
                      ? "You haven't posted any items yet."
                      : "This user hasn't posted any items yet."}
                  </p>
                  {isOwnProfile && (
                    <Button onClick={() => navigate("/books-form")}>
                      Create Your First Post
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="reviews-received" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Reviews Received</h3>
              {!isOwnProfile && (
                <Button onClick={handleAddReview}>
                  <Star className="h-4 w-4 mr-2" />
                  Write Review
                </Button>
              )}
            </div>

            {receivedReviews.length > 0 ? (
              <div className="space-y-4">
                {receivedReviews.map((review) => (
                  <Card key={review.reviewId}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={review.reviewerPhoto || "/placeholder.svg"}
                            />
                            <AvatarFallback>
                              {review.reviewerName?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{review.reviewerName}</p>
                            <div className="flex items-center space-x-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="mt-3 text-sm">{review.comment}</p>
                      )}
                      {review.itemName && (
                        <Badge variant="secondary" className="mt-2">
                          About: {review.itemName}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
                  <p className="text-muted-foreground">
                    {isOwnProfile
                      ? "You haven't received any reviews yet."
                      : "This user hasn't received any reviews yet."}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="reviews-given" className="space-y-4">
            <h3 className="text-lg font-semibold">Reviews Given</h3>

            {userReviews.length > 0 ? (
              <div className="space-y-4">
                {userReviews.map((review) => (
                  <Card key={review.reviewId}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={
                                review.reviewedUserPhoto || "/placeholder.svg"
                              }
                            />
                            <AvatarFallback>
                              {review.reviewedUserName?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              Review for {review.reviewedUserName}
                            </p>
                            <div className="flex items-center space-x-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                          {isOwnProfile && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditReview(review)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="mt-3 text-sm">{review.comment}</p>
                      )}
                      {review.itemName && (
                        <Badge variant="secondary" className="mt-2">
                          About: {review.itemName}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No reviews given
                  </h3>
                  <p className="text-muted-foreground">
                    {isOwnProfile
                      ? "You haven't written any reviews yet."
                      : "This user hasn't written any reviews yet."}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Item Details Dialog */}
      <ItemDetailsDialog
        item={selectedItem}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        likes={selectedItem ? likesById[selectedItem.itemId] || 0 : 0}
        isLiked={
          selectedItem ? isLikedById[selectedItem.itemId] || false : false
        }
        onLikeToggle={handleLikeToggle}
        mode={isOwnProfile ? "edit" : "view"}
        onUpdate={handleUpdatePost}
        onDelete={isOwnProfile ? handleDeletePost : undefined}
      />

      {/* Review Dialog */}
      <ReviewDialog
        isOpen={isReviewDialogOpen}
        onClose={() => setIsReviewDialogOpen(false)}
        reviewedUser={profileUser}
        existingReview={selectedReview}
        onReviewSubmitted={() => {
          setIsReviewDialogOpen(false);
          loadProfileData();
        }}
      />
    </main>
  );
};

export default ProfilePage;
