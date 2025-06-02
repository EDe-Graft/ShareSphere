// src/components/ImageUploadField.jsx

import { useEffect, useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormControl, FormLabel, FormMessage } from "@/components/ui/form";

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
const MAX_FILES = 3;

export default function ImageUploadField({ field, fieldState, setValue }) {
  const [imagePreview, setImagePreview] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const urls = field.value.map((file) => URL.createObjectURL(file));
    setImagePreview(urls);

    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [field.value]);

  const handleFiles = (files) => {
    const validFiles = files.filter((file) =>
      ACCEPTED_IMAGE_TYPES.includes(file.type)
    );
    const combined = [...field.value, ...validFiles].slice(0, MAX_FILES);
    setValue("images", combined);
  };

  const handleRemove = (index) => {
    const newFiles = field.value.filter((_, i) => i !== index);
    setValue("images", newFiles);
  };

  const handleInputChange = (e) => {
    handleFiles(Array.from(e.target.files));
    e.target.value = "";
  };

  const canAddMore = field.value.length < MAX_FILES;

  return (
    <>
      <FormLabel className="font-medium">Book Images*</FormLabel>
      <FormControl>
        <div>
          {canAddMore && (
            <div
              className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer hover:border-violet-500 hover:bg-slate-50 hover:dark:bg-[hsl(224,71.4%,4.1%)] transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-12 w-12 text-violet-500 mb-2" />
              <p className="text-base font-medium text-gray-700 dark:text-white/60">
                Click to upload up to 3 photos
              </p>
              <p className="mt-1 text-sm text-gray-500">
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

          {imagePreview.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              {imagePreview.map((src, index) => (
                <div
                  key={index}
                  className="relative rounded-lg overflow-hidden border-2 border-violet-500"
                >
                  <img
                    src={src}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-auto object-cover max-h-[200px]"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 rounded-full shadow-lg"
                    onClick={() => handleRemove(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </FormControl>
      <FormMessage className="text-red-500" />
    </>
  );
}
