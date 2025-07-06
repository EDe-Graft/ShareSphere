import { useState, useEffect } from "react";
import { Star, Send, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Slider } from "@/components/ui/slider";
import { useAuth } from "@/components/context/AuthContext";
import axios from "axios";

const ReviewDialog = ({
  isOpen,
  onClose,
  reviewedUser,
  existingReview = null,
  onReviewSubmitted,
  relatedItem = null,
}) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const axiosConfig = {
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  };

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment || "");
    } else {
      setRating(0);
      setComment("");
    }
    setError(null);
  }, [existingReview, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    if (!reviewedUser) {
      setError("Invalid user to review");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const reviewData = {
        reviewedUserId: reviewedUser.userId,
        reviewedUserName: reviewedUser.name,
        reviewedUserPhoto: reviewedUser.photo,
        reviewerId: user.userId,
        reviewerName: user.name,
        reviewerPhoto: user.photo,
        rating,
        comment: comment.trim(),
        itemId: relatedItem?.itemId || null,
        itemName: relatedItem?.name || relatedItem?.title || null,
        itemCategory: relatedItem?.generalCategory || null,
      };

      let response;

      if (existingReview) {
        // Update existing review
        response = await axios.patch(
          `${BACKEND_URL}/reviews/update/${existingReview.reviewId}`,
          reviewData,
          axiosConfig
        );
      } else {
        // Create new review
        response = await axios.post(
          `${BACKEND_URL}/reviews`,
          reviewData,
          axiosConfig
        );
      }

      if (response.data.reviewSuccess) {
        toast.success(
          existingReview
            ? "Review updated successfully!"
            : "Review submitted successfully!"
        );
        onReviewSubmitted?.();
        handleClose();
      } else {
        throw new Error(response.data.message || "Failed to submit review");
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      setError(
        err.response?.data?.message ||
          "There was an error submitting your review. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setComment("");
    setError(null);
    onClose();
  };

  // Enhanced star rendering with precise decimal support
  const renderStars = (displayRating) => {
    return Array.from({ length: 5 }).map((_, index) => {
      const starValue = index + 1;
      const fillPercentage = Math.max(
        0,
        Math.min(100, (displayRating - index) * 100)
      );

      return (
        <div key={index} className="relative inline-block">
          {/* Background empty star */}
          <Star className="h-8 w-8 text-gray-300" />
          {/* Filled portion */}
          {fillPercentage > 0 && (
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fillPercentage}%` }}
            >
              <Star className="h-8 w-8 fill-yellow-400 text-yellow-400" />
            </div>
          )}
        </div>
      );
    });
  };

  // Rating labels for better UX
  const getRatingLabel = (rating) => {
    if (rating === 0) return "No rating";
    if (rating <= 1) return "Poor";
    if (rating <= 2) return "Fair";
    if (rating <= 3) return "Good";
    if (rating <= 4) return "Very Good";
    return "Excellent";
  };

  if (!reviewedUser) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {existingReview ? "Edit Review" : "Write a Review"}
          </DialogTitle>
          <DialogDescription>
            {existingReview
              ? `Update your review for ${reviewedUser.name || reviewedUser.displayName}`
              : `Share your experience with ${reviewedUser.name || reviewedUser.displayName}`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* User Info */}
          <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={
                  reviewedUser.photo ||
                  "/placeholder.svg?height=48&width=48"
                }
                alt={reviewedUser.name || reviewedUser.displayName}
              />
              <AvatarFallback>
                {(reviewedUser.name || reviewedUser.displayName || "U")
                  .charAt(0)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">
                {reviewedUser.name || reviewedUser.displayName}
              </p>
              <p className="text-sm text-muted-foreground">
                {reviewedUser.username || "user"}
              </p>
            </div>
          </div>

          {/* Related Item */}
          {relatedItem && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Reviewing about:</p>
              <p className="font-medium">
                {relatedItem.name || relatedItem.title}
              </p>
            </div>
          )}

          {/* Enhanced Rating Section */}
          <div className="space-y-4">
            <Label>Rating *</Label>

            {/* Visual Star Display */}
            <div className="flex items-center justify-center space-x-1 py-2">
              {renderStars(rating)}
            </div>

            {/* Precise Rating Slider */}
            <div className="space-y-3">
              <div className="px-2">
                <Slider
                  value={[rating]}
                  onValueChange={(value) => setRating(value[0])}
                  max={5}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* Rating Display */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {rating > 0
                    ? `${rating.toFixed(1)} out of 5.0`
                    : "Move slider to rate"}
                </span>
                <span
                  className={`font-medium ${
                    rating <= 2
                      ? "text-red-500"
                      : rating <= 3
                        ? "text-yellow-500"
                        : rating <= 4
                          ? "text-blue-500"
                          : "text-green-500"
                  }`}
                >
                  {getRatingLabel(rating)}
                </span>
              </div>
            </div>

            {/* Quick Rating Buttons */}
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((quickRating) => (
                <Button
                  key={quickRating}
                  type="button"
                  variant={rating === quickRating ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRating(quickRating)}
                  className="w-12 h-8"
                >
                  {quickRating}
                </Button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Comment (optional)</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience, thoughts about the item quality, communication, etc..."
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {comment.length}/500 characters
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || rating === 0}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {existingReview ? "Updating..." : "Submitting..."}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  {existingReview ? "Update Review" : "Submit Review"}
                </span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewDialog;
