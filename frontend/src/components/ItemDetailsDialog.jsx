import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Edit2, Save, X } from "lucide-react";
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
import ConditionBadge from "./ConditionBadge";
import { RequestItemDialog } from "./RequestItemDialog";
import { CATEGORY_OPTIONS } from "@/lib/utils";

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

  const dialogRef = useRef(null);
  const overlayRef = useRef(null);

  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({ ...item });
  
  const originalParentCategory = useRef(item?.parentCategory);

  // Initialize editedData with proper fallbacks
  useEffect(() => {
    if (item) {
      setEditedData({
        ...item,
      });
      originalParentCategory.current = item.parentCategory;
    }
  }, [item]);

  // Handle parent category changes
  useEffect(() => {
    if (
      item?.generalCategory === "Book" &&
      editedData.parentCategory !== originalParentCategory.current
    ) {
      console.log("subCategory value changed");
      setEditedData((prev) => ({
        ...prev,
        subCategory: "",
      }));
    }
  }, [editedData.parentCategory]);

  // Handle inert attribute and focus management
  useEffect(() => {
    const handleInert = () => {
      const body = document.body;

      if (isOpen) {
        // Make everything except the dialog inert
        Array.from(body.children).forEach((child) => {
          if (
            child !== dialogRef.current &&
            !child.contains(dialogRef.current)
          ) {
            child.setAttribute("inert", "");
          }
        });

        // Ensure dialog is not inert
        if (dialogRef.current) {
          dialogRef.current.removeAttribute("inert");
        }
      } else {
        // Remove inert from all elements when dialog closes
        Array.from(body.children).forEach((child) => {
          child.removeAttribute("inert");
        });
      }
    };

    handleInert();

    // Cleanup function
    return () => {
      if (!isOpen) {
        Array.from(document.body.children).forEach((child) => {
          child.removeAttribute("inert");
        });
      }
    };
  }, [isOpen]);

  const handleRequestItem = () => {
    setIsRequestDialogOpen(true);
  };

  const handleRequestDialogClose = () => {
    setIsRequestDialogOpen(false);
  };

  const handleEditToggle = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    // Find changed fields
    const changes = {};
    Object.keys(editedData).forEach((key) => {
      if (editedData[key] !== item[key]) {
        changes[key] = editedData[key];
      }
    });

    if (Object.keys(changes).length > 0 && onUpdate) {
      // Include identifiers and only changed fields
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
    setEditedData({ ...item });
  };

  const handleInputChange = (field, value) => {
    setEditedData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDialogClose = () => {
    setIsEditing(false);
    setEditedData({ ...item });
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      handleDialogClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      if (isEditing) {
        handleCancelEdit();
      } else {
        handleDialogClose();
      }
    }
  };

  if (!item) return null;

  // Helper function to get field configurations based on item type
  const getFieldConfigurations = () => {
    let headings,
      values,
      fieldNames,
      typeToChange,
      selectToChange,
      selectOptions;

    typeToChange = [2, 3, 4];
    selectToChange = [5];

    switch (item.generalCategory) {
      case "Book":
        const currentParent =
          editedData.parentCategory || originalParentCategory.current;

        headings = [
          "Title",
          "Category",
          "Author",
          "Edition",
          "Publication Year",
          "Genre",
        ];
        values = [
          editedData.title,
          editedData.parentCategory,
          editedData.author,
          editedData.edition,
          editedData.year,
          editedData.subCategory || item.subCategory,
        ];
        fieldNames = [
          "title",
          "parentCategory",
          "author",
          "edition",
          "year",
          "subCategory",
        ];
        selectOptions = {
          1: ["Textbook", "Fiction", "Non-Fiction"],
          5: currentParent ? CATEGORY_OPTIONS[currentParent] : [],
        };
        break;
      case "Furniture":
        headings = ["Name", "Type", "Brand", "Color", "Material", "Age"];
        values = [
          editedData.name,
          editedData.type,
          editedData.brand,
          editedData.color,
          editedData.material,
          editedData.age,
        ];
        fieldNames = ["name", "type", "brand", "color", "material", "age"];
        selectOptions = {
          1: [
            "Chairs",
            "Desks",
            "Tables",
            "Sofas",
            "Beds",
            "Shelves",
            "Cabinets",
            "Other",
          ],
          5: ["1-2 years", "3-5 years", "5-10 years", "10+ years"],
        };
        break;
      case "Clothing":
        headings = ["Name", "Type", "Brand", "Size", "Material", "Gender"];
        values = [
          editedData.name,
          editedData.type,
          editedData.brand,
          editedData.size,
          editedData.material,
          editedData.gender,
        ];
        fieldNames = ["name", "type", "brand", "size", "material", "gender"];
        selectOptions = {
          1: [
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
          5: ["Men", "Women", "Unisex", "Kids"],
        };
        break;
      case "Miscellaneous":
        headings = ["Name", "Type", "Brand", "Color", "Estimated Value", "Age"];
        values = [
          editedData.name,
          editedData.type,
          editedData.brand,
          editedData.color,
          editedData.estimatedValue,
          editedData.age,
        ];
        fieldNames = [
          "name",
          "type",
          "brand",
          "color",
          "estimatedValue",
          "age",
        ];
        selectOptions = {
          1: [
            "Electronics",
            "Kitchen Items",
            "Home Decor",
            "Stationary",
            "Sports Equipment",
            "Musical Instruments",
            "Arts Supplies",
            "Other",
          ],
          5: [
            "Less than 1 year",
            "1-2 years",
            "3-5 years",
            "5+ years",
            "Unknown",
          ],
        };
        break;
      default:
        headings = [];
        values = [];
        fieldNames = [];
        typeToChange = [];
        selectToChange = [];
        selectOptions = {};
    }

    return {
      headings,
      values,
      fieldNames,
      typeToChange,
      selectToChange,
      selectOptions,
    };
  };

  const {
    headings,
    values,
    fieldNames,
    typeToChange,
    selectToChange,
    selectOptions,
  } = getFieldConfigurations();
  
  const conditionOptions = ["Like-New", "Good", "Fair"];

  if (!isOpen) return null;

  return (
    <>
      {/* Custom Dialog Implementation with inert */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        onClick={handleOverlayClick}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        <div
          ref={dialogRef}
          className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dialog-title"
          aria-describedby="dialog-description"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            type="button"
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
            onClick={handleDialogClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>

          {/* Dialog Header */}
          <div className="flex flex-row items-center justify-between space-y-1.5 text-center sm:text-left">
            <div className="space-y-2">
              <h2 id="dialog-title" className="text-xl font-bold">
                {isEditing ? (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mt-2 mb-1">
                      {headings[0]}
                    </div>
                    <Input
                      value={values[0]}
                      onChange={(e) =>
                        handleInputChange(fieldNames[0], e.target.value)
                      }
                      className="font-bold text-xl hover:border-violet-300 focus:border-violet-500 transition-colors"
                    />
                  </div>
                ) : (
                  item.title || item.name
                )}
              </h2>
              <div id="dialog-description" className="text-base font-medium">
                {isEditing ? (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mt-2 mb-1">
                      {headings[1]}
                    </div>
                    <Select
                      value={editedData.type || editedData.parentCategory || ""}
                      onValueChange={(value) =>
                        handleInputChange(fieldNames[1], value)
                      }
                    >
                      <SelectTrigger className="w-full hover:border-violet-300 focus:border-violet-500 transition-colors">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectOptions[1].map((option) => (
                          <SelectItem
                            key={option.toLowerCase()}
                            value={option}
                            className="hover:bg-violet-50 hover:text-violet-700 cursor-pointer transition-colors"
                          >
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
            {mode === "edit" && !isEditing && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleEditToggle}
                className="h-8 w-8 rounded-full hover:bg-violet-50 hover:text-violet-500 transition-colors"
              >
                <Edit2 className="h-4 w-4" />
                <span className="sr-only">Edit post</span>
              </Button>
            )}
            {isEditing && (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCancelEdit}
                  className="h-8 w-8 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Cancel edit</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSaveEdit}
                  className="h-8 w-8 rounded-full hover:bg-green-50 hover:text-green-500 transition-colors"
                >
                  <Save className="h-4 w-4" />
                  <span className="sr-only">Save changes</span>
                </Button>
              </div>
            )}
          </div>

          {/* Dialog Content */}
          <div className="py-4">
            <ImageCarousel
              item={item}
              images={item.images || []}
              likes={likes}
              isLiked={isLiked}
              onLikeToggle={onLikeToggle}
              isEditing={isEditing}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-[4rem]">
              <div className="space-y-4">
                {typeToChange.map((fieldIndex) => (
                  <div key={`field-${fieldIndex}`}>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      {headings[fieldIndex]}
                    </h4>
                    {isEditing ? (
                      <Input
                        value={values[fieldIndex]}
                        onChange={(e) =>
                          handleInputChange(
                            fieldNames[fieldIndex],
                            e.target.value
                          )
                        }
                        className="hover:border-violet-300 focus:border-violet-500 transition-colors"
                      />
                    ) : (
                      <p className="capitalize">{values[fieldIndex]}</p>
                    )}
                  </div>
                ))}

                {selectToChange.map((fieldIndex) => (
                  <div key={`select-${fieldIndex}`}>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      {headings[fieldIndex]}
                    </h4>
                    {isEditing ? (
                      <Select
                        value={editedData[fieldNames[fieldIndex]]}
                        onValueChange={(value) =>
                          handleInputChange(fieldNames[fieldIndex], value)
                        }
                      >
                        <SelectTrigger className="w-full hover:border-violet-300 focus:border-violet-500 transition-colors">
                          <SelectValue
                            placeholder={
                              editedData.parentCategory ===
                              originalParentCategory.current
                                ? "Select genre"
                                : "Please select a new genre"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {selectOptions[fieldIndex].map((option) => (
                            <SelectItem
                              key={option}
                              value={option}
                              className="hover:bg-violet-50 hover:text-violet-700 cursor-pointer transition-colors"
                            >
                              {option}
                            </SelectItem>
                          ))}
                          {selectOptions[fieldIndex].length === 0 && (
                            <SelectItem value="" disabled>
                              {editedData.parentCategory
                                ? "No options available"
                                : "Select category first"}
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="capitalize">{values[fieldIndex]}</p>
                    )}
                  </div>
                ))}

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Condition
                  </h4>
                  {isEditing ? (
                    <Select
                      value={editedData.condition || item.condition}
                      onValueChange={(value) =>
                        handleInputChange("condition", value)
                      }
                    >
                      <SelectTrigger className="w-full hover:border-violet-300 focus:border-violet-500 transition-colors">
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        {conditionOptions.map((option) => (
                          <SelectItem
                            key={option.toLowerCase()}
                            value={option}
                            className="hover:bg-violet-50 hover:text-violet-700 cursor-pointer transition-colors"
                          >
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
                  <p>{item.uploadedBy}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Upload Date
                  </h4>
                  <p>{new Date(item.uploadDate).toLocaleDateString()}</p>
                </div>
                {item.generalCategory === "Book" &&
                  item.parentCategory.toLowerCase() === "textbook" && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">
                        Course Relevance
                      </h4>
                      {isEditing ? (
                        <Input
                          value={editedData.subCategory || ""}
                          onChange={(e) =>
                            handleInputChange("subCategory", e.target.value)
                          }
                          className="hover:border-violet-300 focus:border-violet-500 transition-colors"
                        />
                      ) : (
                        <p>
                          {item.subCategory
                            ? item.subCategory
                            : "Not specified"}
                        </p>
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
                value={editedData.description || ""}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                className="min-h-[100px] hover:border-violet-300 focus:border-violet-500 transition-colors"
              />
            ) : (
              <p className="text-sm">
                {item.description || "No description available."}
              </p>
            )}
          </div>
          <div className="flex justify-end items-center mt-4">
            {mode === "edit" && !isEditing ? (
              <Button
                variant="destructive"
                className="mt-4 hover:bg-red-600 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.itemId, item.generalCategory);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete This Post
              </Button>
            ) : isEditing ? (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  className="hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors"
                >
                  Cancel
                </Button>
                <Button
                  className="bg-primary hover:bg-primary/90 transition-colors"
                  onClick={handleSaveEdit}
                >
                  Save Changes
                </Button>
              </div>
            ) : item.available === "true" ? (
              <Button
                className="bg-primary hover:bg-primary/90 transition-colors"
                onClick={handleRequestItem}
              >
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

      {/* Request Item Dialog */}
      {isRequestDialogOpen && (
        <RequestItemDialog
          item={item}
          isOpen={isRequestDialogOpen}
          onClose={handleRequestDialogClose}
        />
      )}
    </>
  );
}