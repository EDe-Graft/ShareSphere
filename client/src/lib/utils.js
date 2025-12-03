import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}


export const CATEGORY_OPTIONS = {
  Textbook: [
    "Mathematics",
    "Science",
    "Engineering",
    "Computer Science",
    "Medical",
    "Law",
    "Business",
    "Economics",
    "Psychology",
    "Arts",
    "Humanities",
    "Other Textbooks"
  ],
  Fiction: [
    "Fantasy",
    "Science Fiction",
    "Mystery",
    "Romance",
    "Thriller",
    "Historical Fiction",
    "Young Adult",
    "Literary Fiction",
    "Other Fiction"
  ],
  "Non-Fiction": [
    "Biography",
    "Self-Help",
    "History",
    "Politics",
    "Travel",
    "Health & Fitness",
    "True Crime",
    "Philosophy",
    "Memoir",
    "Other Non-Fiction"
  ],
};


//Helper functions and constants

export function toTitleCase(str) {
  if (typeof str !== "string") return str;
  return str
    .toLowerCase()
    .replace(/\b\w+/g, function(word) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    });
}
      
export function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatData(updatedData) {
  const formData = new FormData();

  // Helper functions
  const isNA = (value) => value === "N/A" || value === null || value === undefined;
  const shouldTitleCase = (key) => !['description', 'estimatedValue', 'year', 'age', 'gender'].includes(key);

  for (const [key, value] of Object.entries(updatedData)) {
    let processedValue;

    if (isNA(value)) {
      processedValue = "N/A";
    } else if (key === "images") {
      continue; // Skip images here, we'll handle them separately
    } else if (key === "imageChanges" && value) {
      // Handle imageChanges: append removedImages as JSON, newImages as files
      if (Array.isArray(value.removedImages)) {
        formData.append("removedImages", JSON.stringify(value.removedImages));
      }
      if (Array.isArray(value.newImages)) {
        value.newImages.forEach((file) => {
          if (file instanceof File) {
            formData.append("newImages", file);
          }
        });
      }
      continue; // Don't append imageChanges as a whole
    } else {
      switch (key) {
        case "description":
          processedValue = capitalizeFirst(value.trim());
          break;
        case "estimatedValue":
          const numericValue = parseFloat(value.replace(/[^0-9.]/g, ''));
          processedValue = isNaN(numericValue) ? "N/A" : `$${numericValue.toFixed(2)}`;
          break;
        case "age":
          processedValue = value.toLowerCase() === "n/a" ? "N/A" : value;
          break;
        case "gender":
          processedValue = value;
          break;
        case "condition":
          processedValue = formatCondition(value);
          break;
        case "itemCategory":
        case "itemId":
          processedValue = value;
          break;
        default:
          processedValue = shouldTitleCase(key) && typeof value === "string" ? toTitleCase(value) : value;
          break;
      }
    }
    if (key !== "images" && key !== "imageChanges") {
      formData.append(key, processedValue);
    }
  }

  // Handle images separately (legacy, if needed)
  if (updatedData.images && Array.isArray(updatedData.images)) {
    updatedData.images.forEach((file) => {
      formData.append("images", file);
    });
  }

  return formData;
}


// Helper function to format condition values
export function formatCondition(condition) {
  if (!condition) return "Good"; // Default value
  
  const lowerCondition = condition.toLowerCase().trim();
  
  switch (lowerCondition) {    
    case 'like-new':
      return 'Like-New';
    case 'good':
      return 'Good';
    case 'fair':
      return 'Fair';
    case 'poor':
      return 'Poor';
    default:
      // For any unexpected values, capitalize the first letter
      return condition.charAt(0).toUpperCase() + condition.slice(1).toLowerCase();
  }
}