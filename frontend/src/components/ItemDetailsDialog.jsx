import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Edit2, Save, X } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ImageCarousel from "./ImageCarousel";
import ConditionBadge from "./ConditionBadge";
import { RequestItemDialog } from "./RequestItemDialog";
import { CATEGORY_OPTIONS } from "@/lib/utils";

export default function ItemDetailsDialog({ item, isOpen, onClose, likes, isLiked, onLikeToggle, mode, onDelete, onUpdate }) {
  const navigate = useNavigate();
  
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({...item});

  console.log(editedData)
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
    if (item?.generalCategory === 'Book' && 
        editedData.parentCategory !== originalParentCategory.current) {
      console.log("subCategory value changed")
      setEditedData(prev => ({
        ...prev,
        subCategory: ''
      }));
    }
  }, [editedData.parentCategory]);


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
    Object.keys(editedData).forEach(key => {
      if (editedData[key] !== item[key]) {
        changes[key] = editedData[key];
      }
    });
  
    if (Object.keys(changes).length > 0 && onUpdate) {
      // Include identifiers and only changed fields
      onUpdate({
        itemId: item.itemId,
        itemCategory: item.generalCategory,
        ...changes
      });
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedData({ ...item });
  };

  const handleInputChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!item) return null;

  // Helper function to get field configurations based on item type
  const getFieldConfigurations = () => {
    let headings, values, fieldNames, typeToChange, selectToChange, selectOptions;
    
    typeToChange = [2, 3, 4];
    selectToChange = [5];

    switch (item.generalCategory) {
      case 'Book':
        const currentParent = editedData.parentCategory || originalParentCategory.current;
        
        headings = ['Title', 'Category', 'Author', 'Edition', 'Publication Year', 'Genre'];
        values = [
          editedData.title,
          editedData.parentCategory,
          editedData.author,
          editedData.edition,
          editedData.year,
          editedData.subCategory || item.subCategory
        ];
        fieldNames = ['title', 'parentCategory', 'author', 'edition', 'year', 'subCategory'];
        selectOptions = {
          1: ['Textbook', 'Fiction', 'Non-Fiction'],
          5: currentParent ? CATEGORY_OPTIONS[currentParent] : []
        };
        break;
      case 'Furniture':
        headings = ['Name', 'Type', 'Brand', 'Color', 'Material', 'Age'];
        values = [
          editedData.name,
          editedData.type,
          editedData.brand,
          editedData.color,
          editedData.material,
          editedData.age
        ];
        fieldNames = ['name', 'type', 'brand', 'color', 'material', 'age'];
        selectOptions = {
          1: ['Chairs', 'Desks', 'Tables', 'Sofas', 'Beds', 'Shelves', 'Cabinets', 'Other'],
          5: ['1-2 years', '3-5 years', '5-10 years', '10+ years']
        };
        break;
      case 'Clothing':
        headings = ['Name', 'Type', 'Brand', 'Size', 'Material', 'Gender'];    
        values = [
          editedData.name,
          editedData.type,
          editedData.brand,
          editedData.size,
          editedData.material,
          editedData.gender,
        ];
        fieldNames = ['name', 'type', 'brand', 'size', 'material', 'gender'];
        selectOptions = {
          1: ['Tops/Shirts', 'Pants/Jeans', 'Dresses/Skirts', 'Outerwear/Jackets', 'Activewear', 'Formal Wear', 'Accessories', 'Footwear', 'Other'],
          5: ["Men", "Women", "Unisex", "Kids"]
        };
        break;
      case 'Miscellaneous':
        headings = ['Name', 'Type', 'Brand', 'Color', 'Estimated Value', 'Age'];
        values = [
          editedData.name,
          editedData.type,
          editedData.brand,
          editedData.color,
          editedData.estimatedValue,
          editedData.age
        ];
        fieldNames = ['name', 'type', 'brand', 'color', 'estimatedValue', 'age'];
        selectOptions = {
          1: ['Electronics', 'Kitchen Items', 'Home Decor', 'Stationary', 'Sports Equipment', 'Musical Instruments', 'Arts Supplies', 'Other'],
          5: ['Less than 1 year', '1-2 years', '3-5 years', '5+ years', 'Unknown']
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

    return { headings, values, fieldNames, typeToChange, selectToChange, selectOptions };
  };

  const { headings, values, fieldNames, typeToChange, selectToChange, selectOptions } = getFieldConfigurations();
  const conditionOptions = ["Like-New", "Good", "Fair"];

  // View Mode Dialog Content
  const renderViewDialog = () => (
    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
      <DialogHeader className="flex flex-row items-center justify-between">
        <div className="space-y-2">
          <DialogTitle className="text-xl font-bold">
            {item.title || item.name}
          </DialogTitle>
          <DialogDescription asChild>
            <div className="text-base font-medium">
              {item.type || item.parentCategory}
            </div>
          </DialogDescription>
        </div>
        {mode === 'edit' && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleEditToggle}
            className="h-8 w-8 rounded-full hover:bg-violet-50 hover:text-violet-500"
          >
            <Edit2 className="h-4 w-4" />
            <span className="sr-only">Edit post</span>
          </Button>
        )}
      </DialogHeader>

      <div className="py-4">
        <ImageCarousel
          item={item}
          images={item.images || []}
          likes={likes}
          isLiked={isLiked}
          onLikeToggle={onLikeToggle}
        />
       
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-[4rem]">
          <div className="space-y-4">
            {typeToChange.map((fieldIndex) => (
              <div key={`field-${fieldIndex}`}>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  {headings[fieldIndex]}
                </h4>
                <p className="capitalize">{values[fieldIndex]}</p>
              </div>
            ))}

            {selectToChange.map((fieldIndex) => (
              <div key={`select-${fieldIndex}`}>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  {headings[fieldIndex]}
                </h4>
                <p className="capitalize">{values[fieldIndex]}</p>
              </div>
            ))}

            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Condition</h4>
              <ConditionBadge condition={item.condition} />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Uploaded By</h4>
              <p>{item.uploadedBy}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Upload Date</h4>
              <p>{new Date(item.uploadDate).toLocaleDateString()}</p>
            </div>
            {item.generalCategory === 'Book' && item.parentCategory.toLowerCase() === "textbook" && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Course Relevance</h4>
                <p>{item.subCategory ? item.subCategory : "Not specified"}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Separator />
      <div className="py-2">
        <h4 className="text-sm font-medium text-muted-foreground mb-2">Description</h4>
        <p className="text-sm">{item.description || "No description available."}</p>
      </div>
      <div className="flex justify-end items-center mt-4">
        {mode === 'edit' ? (
          <Button
            variant="destructive"
            className="mt-4"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item.itemId, item.generalCategory);
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Delete This Post
          </Button>
        ) : item.available === "true" ? (
          <Button
            className="bg-primary hover:bg-primary/90"
            onClick={handleRequestItem}
          >
            Request This Item
          </Button>
        ) : (
          <Button variant="outline" disabled>Currently Unavailable</Button>
        )}
      </div>
    </DialogContent>
  );

  // Edit Mode Dialog Content
  const renderEditDialog = () => (
    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
      <DialogHeader className="flex flex-row items-center justify-between">
        <div className="space-y-2">
          <DialogTitle>
            <div className="text-sm font-medium text-muted-foreground mt-2 mb-1">
              {headings[0]}
            </div>
            <Input
              value={values[0]}
              onChange={(e) => handleInputChange(fieldNames[0], e.target.value)}
              className="font-bold text-xl"
            />
          </DialogTitle>
          <DialogDescription asChild>
            <div className="text-base font-medium">
              <div className="text-sm font-medium text-muted-foreground mt-2 mb-1">
                {headings[1]}
              </div>
              <Select
                value={editedData.type || editedData.parentCategory || ''}
                onValueChange={(value) => handleInputChange(fieldNames[1], value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {selectOptions[1].map((option) => (
                    <SelectItem key={option.toLowerCase()} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </DialogDescription>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancelEdit}
            className="h-8 w-8 rounded-full hover:bg-red-50 hover:text-red-500"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Cancel edit</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSaveEdit}
            className="h-8 w-8 rounded-full hover:bg-green-50 hover:text-green-500"
          >
            <Save className="h-4 w-4" />
            <span className="sr-only">Save changes</span>
          </Button>
        </div>
      </DialogHeader>

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
              <div key={`edit-field-${fieldIndex}`}>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  {headings[fieldIndex]}
                </h4>
                <Input
                  value={values[fieldIndex]}
                  onChange={(e) => handleInputChange(fieldNames[fieldIndex], e.target.value)}
                />
              </div>
            ))}


            {selectToChange.map((fieldIndex) => (
              <div key={`edit-select-${fieldIndex}`}>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  {headings[fieldIndex]}
                </h4>
                <Select
                  value={editedData[fieldNames[fieldIndex]]}  // Directly access from editedData
                  onValueChange={(value) => handleInputChange(fieldNames[fieldIndex], value)}
                  disabled={!editedData.parentCategory}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={
                      editedData.parentCategory === originalParentCategory.current 
                        ? "Select genre"
                        : "Please select a new genre"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {selectOptions[fieldIndex].map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                    {selectOptions[fieldIndex].length === 0 && (
                      <SelectItem value="" disabled>
                        {editedData.parentCategory ? "No options available" : "Select category first"}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            ))}


            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Condition</h4>
              <Select
                value={editedData.condition || item.condition}
                onValueChange={(value) => handleInputChange('condition', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  {conditionOptions.map((option) => (
                    <SelectItem
                      key={option.toLowerCase()} 
                      value={option}
                    >
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Uploaded By</h4>
              <p>{item.uploadedBy}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Upload Date</h4>
              <p>{new Date(item.uploadDate).toLocaleDateString()}</p>
            </div>
            {item.generalCategory === 'Book' && item.parentCategory.toLowerCase() === "textbook" && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Course Relevance</h4>
                <Input
                  value={editedData.subCategory || ''}
                  onChange={(e) => handleInputChange('subCategory', e.target.value)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <Separator />
      <div className="py-2">
        <h4 className="text-sm font-medium text-muted-foreground mb-2">Description</h4>
        <Textarea
          value={editedData.description || ''}
          onChange={(e) => handleInputChange('description', e.target.value)}
          className="min-h-[100px]"
        />
      </div>
      <div className="flex justify-end items-center mt-4">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleCancelEdit}
          >
            Cancel
          </Button>
          <Button
            className="bg-primary hover:bg-primary/90"
            onClick={handleSaveEdit}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </DialogContent>
  );

  return (
    <>
      {/* View Mode Dialog */}
      <Dialog open={isOpen && !isEditing} onOpenChange={onClose}>
        {renderViewDialog()}
      </Dialog>

      {/* Edit Mode Dialog */}
      <Dialog open={isOpen && isEditing} onOpenChange={handleCancelEdit}>
        {renderEditDialog()}
      </Dialog>

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





// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Trash2 } from "lucide-react";
// import { Separator } from "@/components/ui/separator";
// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import ImageCarousel from "./ImageCarousel";
// import ConditionBadge from "./ConditionBadge";
// import { RequestItemDialog } from "./RequestItemDialog";

// const ItemDetailsDialog = ({ item, isOpen, onClose, likes, isLiked, onLikeToggle, mode, onDelete }) => {

//   const navigate = useNavigate();

//   const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);

//   const handleRequestItem = () => {
//     setIsRequestDialogOpen(true);
//   };

//   const handleRequestDialogClose = () => {
//     setIsRequestDialogOpen(false);
//   };

//   if (!item) return null;

//   let headings;
//   let values;
//   switch (item.generalCategory) {
//     case 'Book':
//       headings = ['Title', 'Author', 'Edition', 'Publication Year', 'Category', 'Genre']
//       values = [item.title, item.author, item.edition, item.year, item.parentCategory, item.subCategory]
//       break;
//     case 'Furniture':
//       headings = ['Name', 'Type', 'Brand', 'Color', 'Material', 'Age']
//       values = [item.name, item.type, item.brand, item.color, item.material, item.age]
//       break;
//     case 'Clothing':
//       headings = ['Name', 'Type', 'Brand', 'Size', 'Gender', 'Material']    
//       values = [item.name, item.type, item.brand, item.size, item.gender, item.material]
//       break;
//     case 'Miscellaneous':
//       headings = ['Name', 'Type', 'Brand', 'Color', 'Age', 'Estimated Value']
//       values = [item.name, item.type,item.brand, item.color, item.age, item.estimatedValue]
//     default:
//       break;
//   }

//   return (
//     <>
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle className="text-xl font-bold">{values[0]}</DialogTitle>
//           <DialogDescription className="text-base font-medium">
//             {values[1]}
//           </DialogDescription>
//         </DialogHeader>

//         <div className="py-4">
//           <ImageCarousel 
//             item={item}
//             images={item.images || []}
//             likes={likes}
//             isLiked={isLiked}
//             onLikeToggle={onLikeToggle}
//           />
          
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-[4rem]">
//             <div className="space-y-4">
//               <div>
//                 <h4 className="text-sm font-medium text-muted-foreground mb-1">{headings[2]}</h4>
//                 <p>{values[2]}</p>
//               </div>
//               <div>
//                 <h4 className="text-sm font-medium text-muted-foreground mb-1">{headings[3]}</h4>
//                 <p>{values[3]}</p>
//               </div>
//               <div>
//                 <h4 className="text-sm font-medium text-muted-foreground mb-1">{headings[4]}</h4>
//                 <p className="capitalize">{values[4]}</p>
//               </div>
//               {(headings.length > 5) && (
//                 <div>
//                   <h4 className="text-sm font-medium text-muted-foreground mb-1">{headings[5]}</h4>
//                   <p className="capitalize">{values[5]}</p>
//                 </div>
//               )}
//               <div>
//                 <h4 className="text-sm font-medium text-muted-foreground mb-1">Condition</h4>
//                 <ConditionBadge condition={item.condition} />
//               </div>
//             </div>
//             <div className="space-y-4">
//               <div>
//                 <h4 className="text-sm font-medium text-muted-foreground mb-1">Uploaded By</h4>
//                 <p>{item.uploadedBy}</p>
//               </div>
//               <div>
//                 <h4 className="text-sm font-medium text-muted-foreground mb-1">Upload Date</h4>
//                 <p>{new Date(item.uploadDate).toLocaleDateString()}</p>
//               </div>
//               {item.generalCategory === 'Book' && item.parentCategory.toLowerCase() === "textbook" && (
//                 <div>
//                   <h4 className="text-sm font-medium text-muted-foreground mb-1">Course Relevance</h4>
//                   <p>{item.subCategory ? item.subCategory : "Not specified"}</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         <Separator />
//         <div className="py-2">
//           <h4 className="text-sm font-medium text-muted-foreground mb-2">Description</h4>
//           <p className="text-sm">{item.description || "No description available."}</p>
//         </div>
//         <div className="flex justify-end items-center mt-4">
//           {
//             //if user in edit mode, display delete button option
//             mode === 'edit' ?
//             <Button
//             key="delete"
//             variant="destructive"
//             className="mt-4"
//             onClick={(e) => {
//               e.stopPropagation();
//               onDelete(item.itemId, item.generalCategory);
//               // onClose();
//             }}
//           >
//             <Trash2 className="mr-2 h-4 w-4" /> Delete This Post
//           </Button>
//           :
//           //user in view mode
//           item.available === "true" ? (
//             <Button 
//               className="bg-primary hover:bg-primary/90"
//               onClick={handleRequestItem}
//             >
//               Request This Item
//             </Button>
//           ) : (
//             <Button variant="outline" disabled>Currently Unavailable</Button>
//           )}
//         </div>
//       </DialogContent>
//     </Dialog>

//      {/*Request Item Dialog  */}
//     {isRequestDialogOpen && (
//       <RequestItemDialog
//         item={item}
//         isOpen={isRequestDialogOpen}
//         onClose={handleRequestDialogClose}
//       />
//     )}
//   </>
// )};

// export default ItemDetailsDialog;