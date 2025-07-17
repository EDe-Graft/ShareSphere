import { useEffect, useRef, useState } from "react";
import { Upload, Camera, X } from "lucide-react";
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
  const [isMobile, setIsMobile] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const isMobileDevice =
        /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
          userAgent.toLowerCase()
        );
      const isSmallScreen = window.innerWidth <= 768;
      setIsMobile(isMobileDevice || isSmallScreen);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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

  const handleCameraCapture = (e) => {
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
          <div className="space-y-3">
            {/* Mobile: Show both camera and upload options */}
            {isMobile ? (
              <div className="grid grid-cols-1 gap-3">
                {/* Camera Option for Mobile */}
                <div
                  className="flex flex-col items-center justify-center border-2 border-dashed border-violet-400 rounded-lg p-4 cursor-pointer hover:border-violet-500 hover:bg-violet-50 transition-colors bg-violet-25"
                  onClick={() => cameraInputRef.current?.click()}
                >
                  <Camera className="h-6 w-6 text-violet-500 mb-2" />
                  <p className="text-sm font-medium text-gray-700 dark:text-white/60">
                    Take Photo
                  </p>
                  <p className="text-xs text-gray-500 text-center">
                    Use your camera to capture up to 3 images
                  </p>
                  <Input
                    ref={cameraInputRef}
                    type="file"
                    accept={ACCEPTED_IMAGE_TYPES.join(",")}
                    capture="environment"
                    multiple
                    className="hidden"
                    onChange={handleCameraCapture}
                  />
                </div>

                {/* Upload Option for Mobile */}
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
              </div>
            ) : (
              /* Desktop Screen - Upload option only*/
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

            {/* Progress indicator */}
            {canAddMore && (
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  {currentCount} of {MAX_FILES} photos selected
                </p>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                  <div
                    className="bg-violet-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${(currentCount / MAX_FILES) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
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
