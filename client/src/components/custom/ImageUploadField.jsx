// import { useEffect, useRef, useState } from "react";
// import { Upload, X } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { FormControl, FormLabel, FormMessage } from "@/components/ui/form";

// const ACCEPTED_IMAGE_TYPES = [
//   "image/jpeg",
//   "image/jpg",
//   "image/png",
//   "image/webp",
// ];
// const MAX_FILES = 3;

// export default function ImageUploadField({ field, fieldState, setValue }) {
//   const [imagePreview, setImagePreview] = useState([]);
//   const fileInputRef = useRef(null);

//   useEffect(() => {
//     const urls = field.value.map((file) => URL.createObjectURL(file));
//     setImagePreview(urls);

//     return () => urls.forEach((url) => URL.revokeObjectURL(url));
//   }, [field.value]);

//   const handleFiles = (files) => {
//     const validFiles = files.filter((file) =>
//       ACCEPTED_IMAGE_TYPES.includes(file.type)
//     );
//     const combined = [...field.value, ...validFiles].slice(0, MAX_FILES);
//     setValue("images", combined);
//   };

//   const handleRemove = (index) => {
//     const newFiles = field.value.filter((_, i) => i !== index);
//     setValue("images", newFiles);
//   };

//   const handleInputChange = (e) => {
//     handleFiles(Array.from(e.target.files));
//     e.target.value = "";
//   };

//   const canAddMore = field.value.length < MAX_FILES;

//   return (
//     <>
//       <FormLabel className="font-medium">Book Images*</FormLabel>
//       <FormControl>
//         <div>
//           {canAddMore && (
//             <div
//               className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer hover:border-violet-500 hover:bg-slate-50 hover:dark:bg-[hsl(224,71.4%,4.1%)] transition-colors"
//               onClick={() => fileInputRef.current?.click()}
//             >
//               <Upload className="h-12 w-12 text-violet-500 mb-2" />
//               <p className="text-base font-medium text-gray-700 dark:text-white/60">
//                 Click to upload up to 3 photos
//               </p>
//               <p className="mt-1 text-sm text-gray-500">
//                 JPG, PNG, WebP up to 7MB each
//               </p>
//               <Input
//                 ref={fileInputRef}
//                 type="file"
//                 accept={ACCEPTED_IMAGE_TYPES.join(",")}
//                 multiple
//                 className="hidden"
//                 onChange={handleInputChange}
//               />
//             </div>
//           )}

//           {imagePreview.length > 0 && (
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
//               {imagePreview.map((src, index) => (
//                 <div
//                   key={index}
//                   className="relative rounded-lg overflow-hidden border-2 border-violet-500"
//                 >
//                   <img
//                     src={src}
//                     alt={`Preview ${index + 1}`}
//                     className="w-full h-auto object-cover max-h-[200px]"
//                   />
//                   <Button
//                     type="button"
//                     variant="destructive"
//                     size="icon"
//                     className="absolute top-2 right-2 h-6 w-6 rounded-full shadow-lg"
//                     onClick={() => handleRemove(index)}
//                   >
//                     <X className="h-4 w-4" />
//                   </Button>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </FormControl>
//       <FormMessage className="text-red-500" />
//     </>
//   );
// }

import { useEffect, useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
const MAX_FILES = 3;

const ImageUploadField = ({
  value = [],
  onChange,
  existingImages = [],
  onImagesChange,
  isEditMode = false,
  label = "Images",
  required = false,
  error = "",
}) => {
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null);

  // Initialize images only once when props change
  useEffect(() => {
    if (isEditMode && existingImages.length > 0) {
      const initialImages = existingImages.map((url, index) => ({
        type: "existing",
        url,
        id: `existing-${index}`,
      }));
      setImages(initialImages);
    } else if (!isEditMode && value.length > 0) {
      const fileImages = value.map((file, index) => ({
        type: "new",
        file,
        id: `new-${index}`,
      }));
      setImages(fileImages);
    } else {
      setImages([]);
    }
  }, [isEditMode, existingImages.length, value.length]); // Only depend on lengths, not the arrays themselves

  // Notify parent of changes - only when images actually change
  useEffect(() => {
    if (isEditMode && onImagesChange) {
      const existingUrls = images
        .filter((img) => img.type === "existing")
        .map((img) => img.url);
      const newFiles = images
        .filter((img) => img.type === "new")
        .map((img) => img.file);
      const removedUrls = existingImages.filter(
        (url) => !existingUrls.includes(url)
      );

      onImagesChange({
        existingImages: existingUrls,
        newFiles,
        removedImages: removedUrls,
      });
    }
  }, [images, isEditMode]);

  const handleFiles = (files) => {
    const validFiles = files.filter((file) =>
      ACCEPTED_IMAGE_TYPES.includes(file.type)
    );

    if (isEditMode) {
      const newImages = validFiles.map((file, index) => ({
        type: "new",
        file,
        id: `new-${Date.now()}-${index}`,
      }));
      const combined = [...images, ...newImages].slice(0, MAX_FILES);
      setImages(combined);
    } else {
      const combined = [...(value || []), ...validFiles].slice(0, MAX_FILES);
      if (onChange) {
        onChange(combined);
      }
    }
  };

  const handleRemove = (indexOrId) => {
    if (isEditMode) {
      setImages((prev) => prev.filter((img) => img.id !== indexOrId));
    } else {
      const newFiles = value.filter((_, i) => i !== indexOrId);
      if (onChange) {
        onChange(newFiles);
      }
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
      e.target.value = "";
    }
  };

  const currentCount = isEditMode ? images.length : value.length || 0;
  const canAddMore = currentCount < MAX_FILES;

  const renderImages = () => {
    if (isEditMode) {
      return images.map((img) => (
        <div
          key={img.id}
          className="relative rounded-lg overflow-hidden border-2 border-violet-500 group"
        >
          <img
            src={
              img.type === "existing" ? img.url : URL.createObjectURL(img.file)
            }
            alt={img.type === "existing" ? "Existing image" : "New upload"}
            className="w-full h-24 object-cover"
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-1 right-1 h-6 w-6 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => handleRemove(img.id)}
          >
            <X className="h-3 w-3" />
          </Button>
          {img.type === "new" && (
            <div className="absolute bottom-1 left-1 bg-green-500 text-white text-xs px-1 rounded">
              New
            </div>
          )}
        </div>
      ));
    } else {
      return (
        value.map((file, index) => (
          <div
            key={index}
            className="relative rounded-lg overflow-hidden border-2 border-violet-500"
          >
            <img
              src={URL.createObjectURL(file) || "/placeholder.svg"}
              alt={`Preview ${index + 1}`}
              className="w-full h-24 object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6 rounded-full shadow-lg"
              onClick={() => handleRemove(index)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )) || []
      );
    }
  };

  return (
    <div className="space-y-2">
      <Label className="font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      <div className="space-y-4">
        {canAddMore && (
          <div
            className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-violet-500 hover:bg-accent transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-8 w-8 text-violet-500 mb-2" />
            <p className="text-sm font-medium text-gray-700 dark:text-white/60">
              Click to upload up to {MAX_FILES} photos
            </p>
            <p className="mt-1 text-xs text-gray-500">
              JPG, PNG, WebP up to 7MB each
            </p>
            <Input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_IMAGE_TYPES.join(",")}
              multiple
              className="hidden"
              onChange={handleInputChange}
            />
          </div>
        )}

        {currentCount > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {renderImages()}
          </div>
        )}

        {currentCount === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No images selected
          </p>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default ImageUploadField;
