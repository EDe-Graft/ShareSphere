import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Edit2, Save, Star, X, Flag } from "lucide-react";
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
import ImageCarousel from "./ImageCarousel";
import { ConditionBadge } from "./CustomBadges";
import { RequestItemDialog } from "./RequestItemDialog";
import { ReportDialog } from "./ReportDialog";
import { useAuth } from "@/components/context/AuthContext";
import { CATEGORY_OPTIONS } from "@/lib/utils";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import ReviewDialog from "./ReviewDialog";
import ImageUploadField from "@/components/custom/ImageUploadField";

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
      profilePhoto: item.uploaderPhoto,
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
          className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg sm:rounded-lg sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
            onClick={handleDialogClose}
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex flex-row items-center justify-between">
            <div className="space-y-2">
              <h2 className="text-xl font-bold">
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
                      className="font-bold text-xl"
                    />
                  </div>
                ) : (
                  item.title || item.name
                )}
              </h2>
              <div className="text-base font-medium">
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

            {(mode === "edit" || isOwnItem) && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            )}

            {isEditing && (
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={handleCancelEdit}>
                  <X className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleSaveEdit}>
                  <Save className="h-4 w-4" />
                </Button>
              </div>
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
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Uploaded By
                  </h4>
                  <p className="mb-4">{`${item.uploadedBy}`}</p>

                  <h4 className="text-sm font-medium text-muted-foreground">
                    Username
                  </h4>
                  {/* <p className="text-xs text-primary mb-4">{`${item.uploaderUsername}`}</p> */}
                  <p
                    className="text-xs text-primary mb-4 cursor-pointer hover:underline"
                    onClick={() => navigate(`/profile/${item.uploaderId}`)}
                  >
                    {`@${item.uploaderUsername}`}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Upload Date
                  </h4>
                  <p>{new Date(item.uploadDate).toLocaleDateString()}</p>
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
                        <p>{item.subCategory || "Not specified"}</p>
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

          <div className="flex justify-between items-center mt-4">
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
                <Button variant="outline" onClick={handleWriteReview}>
                  <Star className="mr-2 h-4 w-4" />
                  Write Review
                </Button>
              </div>
            )}

            <div>
              {(mode === "edit" && !isEditing) || isOwnItem ? (
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
