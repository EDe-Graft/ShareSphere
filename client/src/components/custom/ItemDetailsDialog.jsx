import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trash2,
  Edit2,
  Save,
  Star,
  X,
  Flag,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import ImageCarousel from "./ImageCarousel";
import { ConditionBadge } from "./CustomBadges";
import { RequestItemDialog } from "./RequestItemDialog";
import { ReportDialog } from "./ReportDialog";
import { useAuth, getAxiosConfig } from "@/components/context/AuthContext";
import { CATEGORY_OPTIONS } from "@/lib/utils";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import ReviewDialog from "./ReviewDialog";
import ImageUploadField from "@/components/custom/ImageUploadField";
import axios from "axios";

export default function ItemDetailsDialog({
  item,
  isOpen,
  onClose,
  likes,
  isLiked,
  onLikeToggle,
  mode,
  onDelete,
  onUpdate,
}) {
  const navigate = useNavigate();
  const { user, initialized } = useAuth();
  const dialogRef = useRef(null);
  const overlayRef = useRef(null);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOwnItem, setIsOwnItem] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [selectedReviewUser, setSelectedReviewUser] = useState(null);

  // Reviews state
  const [ownerReviews, setOwnerReviews] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [reviewsStats, setReviewsStats] = useState({
    averageRating: 0,
    totalReviews: 0,
  });

  // Simplified state management
  const [formData, setFormData] = useState({});
  const [imageChanges, setImageChanges] = useState({
    existingImages: [],
    newImages: [],
    removedImages: [],
  });

  // Initialize form data only when item changes
  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title || "",
        name: item.name || "",
        parentCategory: item.parentCategory || "",
        author: item.author || "",
        edition: item.edition || "",
        year: item.year || "",
        subCategory: item.subCategory || "",
        type: item.type || "",
        brand: item.brand || "",
        color: item.color || "",
        material: item.material || "",
        age: item.age || "",
        size: item.size || "",
        gender: item.gender || "",
        estimatedValue: item.estimatedValue || "",
        condition: item.condition || "",
        description: item.description || "",
        images: item.images || [],
      });
      setImageChanges({
        existingImages: item.images || [],
        newImages: [],
        removedImages: [],
      });
    }
  }, [item]); // Only depend on item

  // Update isOwnItem when user or item changes
  useEffect(() => {
    if (initialized && item && user) {
      setIsOwnItem(item.uploaderId === user.userId);
    } else {
      setIsOwnItem(false);
    }
  }, [initialized, item, user]);

  // Fetch owner reviews when dialog is open for another user's item
  useEffect(() => {
    if (isOpen && user && !isOwnItem && item) {
      fetchOwnerReviews();
    } else {
      setOwnerReviews([]);
      setReviewsStats({ averageRating: 0, totalReviews: 0 });
    }
  }, [isOpen, user, isOwnItem, item]);

  // Handle inert attribute
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!item || !isOpen) return null;

  const fetchOwnerReviews = async () => {
    if (!item?.uploaderId) return;

    setIsLoadingReviews(true);
    try {
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
      const response = await axios.get(
        `${BACKEND_URL}/reviews/received/${item.uploaderId}`,
        getAxiosConfig()
      );

      if (response.data.success) {
        const reviews = response.data.reviews || [];
        setOwnerReviews(reviews);

        if (reviews.length > 0) {
          const avgRating =
            reviews.reduce((sum, review) => sum + review.rating, 0) /
            reviews.length;
          setReviewsStats({
            averageRating: avgRating,
            totalReviews: reviews.length,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching owner reviews:", error);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  // Enhanced star rendering with precise decimal support
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

  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      // Reset subcategory when parent category changes for books
      if (field === "parentCategory" && item.generalCategory === "Book") {
        newData.subCategory = "";
      }
      return newData;
    });
  };

  const handleImageChanges = (changes) => {
    console.log("changes", changes);
    setImageChanges({
      existingImages: changes.existingImages,
      newImages: changes.newFiles,
      removedImages: changes.removedImages,
    });
  };

  const handleSaveEdit = () => {
    const changes = {};
    console.log("formData", formData);
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== (item[key] || "")) {
        changes[key] = formData[key];
      }
    });

    if (
      imageChanges.newImages?.length > 0 ||
      imageChanges.removedImages?.length > 0
    ) {
      changes.imageChanges = imageChanges;
    }

    if (Object.keys(changes).length > 0 && onUpdate) {
      onUpdate({
        itemId: item.itemId,
        itemCategory: item.generalCategory,
        ...changes,
      });
    }

    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData({
      title: item.title || "",
      name: item.name || "",
      parentCategory: item.parentCategory || "",
      author: item.author || "",
      edition: item.edition || "",
      year: item.year || "",
      subCategory: item.subCategory || "",
      type: item.type || "",
      brand: item.brand || "",
      color: item.color || "",
      material: item.material || "",
      age: item.age || "",
      size: item.size || "",
      gender: item.gender || "",
      estimatedValue: item.estimatedValue || "",
      condition: item.condition || "",
      description: item.description || "",
      images: item.images || [],
    });
    setImageChanges({
      existingImages: item.images || [],
      newImages: [],
      removedImages: [],
    });
  };

  const handleDialogClose = () => {
    setIsEditing(false);
    onClose();
  };

  const handleDeleteConfirm = async () => {
    if (onDelete && item) {
      setIsDeleting(true);
      try {
        await onDelete(item.itemId, item.generalCategory);
      } catch (error) {
        console.error("Error deleting item:", error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleWriteReview = () => {
    setSelectedReviewUser({
      userId: item.uploaderId,
      name: item.uploadedBy,
      username: item.uploaderUsername,
      photo: item.uploaderPhoto,
    });
    setIsReviewDialogOpen(true);
  };

  // Get field configuration based on category
  const getFieldConfig = () => {
    switch (item.generalCategory) {
      case "Book":
        return {
          headings: [
            "Title",
            "Category",
            "Author",
            "Edition",
            "Publication Year",
            "Genre",
          ],
          fields: [
            "title",
            "parentCategory",
            "author",
            "edition",
            "year",
            "subCategory",
          ],
          inputFields: [2, 3, 4], // Author, Edition, Year
          selectFields: [5], // Genre
          categoryOptions: ["Textbook", "Fiction", "Non-Fiction"],
          genreOptions:
            formData.parentCategory && CATEGORY_OPTIONS[formData.parentCategory]
              ? CATEGORY_OPTIONS[formData.parentCategory]
              : [],
        };
      case "Furniture":
        return {
          headings: ["Name", "Type", "Brand", "Color", "Material", "Age"],
          fields: ["name", "type", "brand", "color", "material", "age"],
          inputFields: [2, 3, 4], // Brand, Color, Material
          selectFields: [5], // Age
          categoryOptions: [
            "Chairs",
            "Desks",
            "Tables",
            "Sofas",
            "Beds",
            "Shelves",
            "Cabinets",
            "Other",
          ],
          genreOptions: ["1-2 years", "3-5 years", "5-10 years", "10+ years"],
        };
      case "Clothing":
        return {
          headings: ["Name", "Type", "Brand", "Size", "Material", "Gender"],
          fields: ["name", "type", "brand", "size", "material", "gender"],
          inputFields: [2, 3, 4], // Brand, Size, Material
          selectFields: [5], // Gender
          categoryOptions: [
            "Tops/Shirts",
            "Pants/Jeans",
            "Dresses/Skirts",
            "Outerwear/Jackets",
            "Activewear",
            "Formal Wear",
            "Accessories",
            "Footwear",
            "Other",
          ],
          genreOptions: ["Men", "Women", "Unisex", "Kids"],
        };
      case "Miscellaneous":
        return {
          headings: [
            "Name",
            "Type",
            "Brand",
            "Color",
            "Estimated Value",
            "Age",
          ],
          fields: ["name", "type", "brand", "color", "estimatedValue", "age"],
          inputFields: [2, 3, 4], // Brand, Color, Estimated Value
          selectFields: [5], // Age
          categoryOptions: [
            "Electronics",
            "Kitchen Items",
            "Home Decor",
            "Stationary",
            "Sports Equipment",
            "Musical Instruments",
            "Arts Supplies",
            "Other",
          ],
          genreOptions: [
            "Less than 1 year",
            "1-2 years",
            "3-5 years",
            "5+ years",
            "Unknown",
          ],
        };
      default:
        return {
          headings: [],
          fields: [],
          inputFields: [],
          selectFields: [],
          categoryOptions: [],
          genreOptions: [],
        };
    }
  };

  const config = getFieldConfig();
  const conditionOptions = ["Like-New", "Good", "Fair"];

  return (
    <>
      <div
        ref={overlayRef}
        className="fixed inset-0 z-50 bg-black/80"
        onClick={(e) => {
          if (e.target === overlayRef.current) {
            handleDialogClose();
          }
        }}
      >
        <div
          ref={dialogRef}
          className="fixed left-[50%] top-[50%] w-full z-50 grid max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-4 sm:p-6 shadow-lg rounded-lg sm:max-w-[600px] max-h-[85vh] sm:max-h-[90vh] overflow-y-auto mx-0"
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDialogClose}
            className="absolute right-4 top-4 h-10 w-10 rounded-full hover:bg-muted z-10"
          >
            <X className="h-5 w-5" />
          </Button>

          {/* Header */}
          <div className="flex items-start justify-between gap-4 pr-12">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold truncate">
                {isEditing ? (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      {config.headings[0]}
                    </div>
                    <Input
                      value={formData[config.fields[0]] || ""}
                      onChange={(e) =>
                        handleInputChange(config.fields[0], e.target.value)
                      }
                    />
                  </div>
                ) : (
                  item.title || item.name
                )}
              </h2>
              <div className="text-sm font-medium text-muted-foreground mt-1">
                {isEditing ? (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      {config.headings[1]}
                    </div>
                    <Select
                      value={formData[config.fields[1]] || ""}
                      onValueChange={(value) =>
                        handleInputChange(config.fields[1], value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {config.categoryOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  item.type || item.parentCategory
                )}
              </div>
            </div>

            {/* Action buttons - Edit*/}
            {isEditing ? (
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveEdit}>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
              </div>
            ) : (
              (mode === "edit" || isOwnItem) && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditing(true)}
                  className="h-9 w-9 shrink-0"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              )
            )}
          </div>

          <div className="py-4">
            {isEditing ? (
              <div className="mb-6">
                <ImageUploadField
                  existingImages={item.images || []}
                  onImagesChange={handleImageChanges}
                  isEditMode={true}
                />
              </div>
            ) : (
              <ImageCarousel
                item={item}
                images={item.images || []}
                likes={likes}
                isLiked={isLiked}
                onLikeToggle={onLikeToggle}
                isEditing={isEditing}
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
              <div className="space-y-4">
                {config.inputFields.map((fieldIndex) => (
                  <div key={fieldIndex}>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      {config.headings[fieldIndex]}
                    </h4>
                    {isEditing ? (
                      <Input
                        value={formData[config.fields[fieldIndex]] || ""}
                        onChange={(e) =>
                          handleInputChange(
                            config.fields[fieldIndex],
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      <p className="capitalize">
                        {item[config.fields[fieldIndex]] || ""}
                      </p>
                    )}
                  </div>
                ))}

                {config.selectFields.map((fieldIndex) => (
                  <div key={fieldIndex}>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      {config.headings[fieldIndex]}
                    </h4>
                    {isEditing ? (
                      <Select
                        value={formData[config.fields[fieldIndex]] || ""}
                        onValueChange={(value) =>
                          handleInputChange(config.fields[fieldIndex], value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                        <SelectContent>
                          {config.genreOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="capitalize">
                        {item[config.fields[fieldIndex]] || ""}
                      </p>
                    )}
                  </div>
                ))}

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Condition
                  </h4>
                  {isEditing ? (
                    <Select
                      value={formData.condition || ""}
                      onValueChange={(value) =>
                        handleInputChange("condition", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        {conditionOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <ConditionBadge condition={item.condition} />
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Uploaded By
                  </h4>
                  <div className={`${isEditing ? "py-1" : ""}`}>
                    <p>{`${item.uploadedBy}`}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Username
                  </h4>
                  <div className={`${isEditing ? "py-2" : ""}`}>
                    <p
                      className="text text-primary cursor-pointer hover:underline"
                      onClick={() => navigate(`/profile/${item.uploaderId}`)}
                    >
                      {`${item.uploaderUsername || "user"}`}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Upload Date
                  </h4>
                  <div className={`${isEditing ? "py-2" : ""}`}>
                    <p>{new Date(item.uploadDate).toLocaleDateString()}</p>
                  </div>
                </div>

                {item.generalCategory === "Book" &&
                  item.parentCategory?.toLowerCase() === "textbook" && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">
                        Course Relevance
                      </h4>
                      {isEditing ? (
                        <Input
                          value={formData.subCategory || ""}
                          onChange={(e) =>
                            handleInputChange("subCategory", e.target.value)
                          }
                        />
                      ) : (
                        <div className={`${isEditing ? "py-2" : ""}`}>
                          <p>{item.subCategory || "Not specified"}</p>
                        </div>
                      )}
                    </div>
                  )}
              </div>
            </div>
          </div>

          <Separator />

          <div className="py-2">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Description
            </h4>
            {isEditing ? (
              <Textarea
                value={formData.description || ""}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                className="min-h-[100px]"
              />
            ) : (
              <p className="text-sm">
                {item.description || "No description available."}
              </p>
            )}
          </div>

          {/* Owner Reviews Section */}
          {user && !isOwnItem && (
            <>
              <Separator />
              <div className="py-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h4 className="text-lg font-semibold">
                      Reviews for {item.uploadedBy}
                    </h4>
                    {reviewsStats.totalReviews > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          {renderStars(reviewsStats.averageRating)}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {reviewsStats.averageRating.toFixed(1)} (
                          {reviewsStats.totalReviews} reviews)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {isLoadingReviews ? (
                  <div className="space-y-3">
                    {[...Array(2)].map((_, i) => (
                      <div
                        key={i}
                        className="flex items-start space-x-3 p-3 border rounded-lg bg-muted/50"
                      >
                        <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded animate-pulse w-1/4" />
                          <div className="h-3 bg-muted rounded animate-pulse w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : ownerReviews.length > 0 ? (
                  <div className="space-y-3">
                    {(showAllReviews
                      ? ownerReviews
                      : ownerReviews.slice(0, 2)
                    ).map((review) => (
                      <div
                        key={review.id}
                        className="p-4 border rounded-lg bg-muted/30"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={review.reviewerPhoto || "/placeholder.svg"}
                              />
                              <AvatarFallback>
                                {review.reviewerName?.charAt(0).toUpperCase() ||
                                  "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">
                                {review.reviewerName}
                              </p>
                              <div className="flex items-center space-x-1">
                                {renderStars(review.rating)}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                            {review.comment}
                          </p>
                        )}
                        {review.itemName && (
                          <Badge variant="secondary" className="mt-2 text-xs">
                            About: {review.itemName}
                          </Badge>
                        )}
                      </div>
                    ))}
                    {ownerReviews.length > 2 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAllReviews(!showAllReviews)}
                        className="w-full"
                      >
                        {showAllReviews ? (
                          <>
                            <ChevronUp className="mr-2 h-4 w-4" />
                            Show Less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="mr-2 h-4 w-4" />
                            Show All {ownerReviews.length} Reviews
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Star className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                    <p className="text-sm">No reviews yet for this user.</p>
                    <p className="text-xs mt-1">
                      Be the first to share your experience!
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          <div
            className={` flex flex-col gap-3 items-start sm:flex-row sm:justify-between sm:items-center mt-4 ${isOwnItem ? "flex-row-reverse" : "flex-row"}`}
          >
            {mode !== "edit" && !isEditing && !isOwnItem && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsReportDialogOpen(true)}
                  className="text-red-500 hover:text-red-500"
                >
                  <Flag className="mr-2 h-4 w-4" />
                  Report Post
                </Button>
                {/* write review button */}
                {!isOwnItem && (
                  <Button
                    className="text-yellow-500 hover:text-yellow-500 bg-transparent"
                    variant="outline"
                    onClick={handleWriteReview}
                  >
                    <Star className="mr-2 h-4 w-4" />
                    Write Review
                  </Button>
                )}
              </div>
            )}

            <div>
              {mode === "edit" && !isEditing && isOwnItem ? (
                <Button
                  variant="destructive"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete This Post
                </Button>
              ) : isEditing ? (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveEdit}>Save Changes</Button>
                </div>
              ) : item.available === "true" ? (
                <Button onClick={() => setIsRequestDialogOpen(true)}>
                  Request This Item
                </Button>
              ) : (
                <Button variant="outline" disabled>
                  Currently Unavailable
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {isRequestDialogOpen && (
        <RequestItemDialog
          item={item}
          isOpen={isRequestDialogOpen}
          onClose={() => setIsRequestDialogOpen(false)}
        />
      )}

      <ReportDialog
        isOpen={isReportDialogOpen}
        onClose={() => setIsReportDialogOpen(false)}
        reportedUser={{
          id: item.uploaderId,
          name: item.uploadedBy,
          email: item.uploaderEmail,
        }}
        reportedItem={item}
      />

      <ConfirmDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName={item.name || item.title}
        itemType={item.generalCategory}
        isDeleting={isDeleting}
      />

      <ReviewDialog
        isOpen={isReviewDialogOpen}
        onClose={() => {
          setIsReviewDialogOpen(false);
          setSelectedReviewUser(null);
        }}
        reviewedUser={selectedReviewUser}
        relatedItem={item}
        onReviewSubmitted={() => {
          setIsReviewDialogOpen(false);
          setSelectedReviewUser(null);
        }}
      />
    </>
  );
}
