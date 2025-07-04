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
  const [hoveredRating, setHoveredRating] = useState(0);
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
        reviewerId: user?.userId,
        reviewerName: user?.name,
        reviewerPhoto: user?.photo,
        reviewedUserId: reviewedUser.userId,
        reviewedUserName: reviewedUser.name,
        reviewedUserPhoto: reviewedUser.photo,
        itemId: relatedItem?.itemId || null,
        itemName: relatedItem?.name || relatedItem?.title || "N/A",
        itemCategory: relatedItem?.generalCategory || "N/A",
        rating,
        comment: comment.trim(),
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
    setHoveredRating(0);
    setComment("");
    setError(null);
    onClose();
  };

  const renderStars = () => {
    return Array.from({ length: 5 }).map((_, index) => {
      const starValue = index + 1;
      const isActive = starValue <= (hoveredRating || rating);

      return (
        <button
          key={index}
          type="button"
          className={`p-1 transition-colors ${isActive ? "text-yellow-400" : "text-gray-300 hover:text-yellow-200"}`}
          onMouseEnter={() => setHoveredRating(starValue)}
          onMouseLeave={() => setHoveredRating(0)}
          onClick={() => setRating(starValue)}
        >
          <Star className={`h-8 w-8 ${isActive ? "fill-current" : ""}`} />
        </button>
      );
    });
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
                alt={reviewedUser.name || reviewedUser.displayName || "User"}
              />
              <AvatarFallback>
                {(reviewedUser.name || reviewedUser.displayName || "U")
                  .charAt(0)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">
                {reviewedUser.name || reviewedUser.displayName || "User"}
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

          {/* Rating */}
          <div className="space-y-2">
            <Label>Rating *</Label>
            <div className="flex items-center space-x-1">
              {renderStars()}
              {rating > 0 && (
                <span className="ml-2 text-sm text-muted-foreground">
                  {rating} out of 5 stars
                </span>
              )}
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
