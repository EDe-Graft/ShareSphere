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
  return str
    .toLowerCase()
    .replace(/\b\w+/g, function(word) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    });
}
      
export function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatData(processedData) {
  const formData = new FormData();

  // Helper functions
  const isNA = (value) => value === "N/A" || value === null || value === undefined;
  const shouldTitleCase = (key) => !['images', 'description', 'estimatedValue', 'year', 'age', 'gender'].includes(key);

  // Process each field
  for (const [key, value] of Object.entries(processedData)) {
    let processedValue;

    if (isNA(value)) {
      processedValue = "N/A";
    } else if (key === "images") {
      continue; // Skip images here, we'll handle them separately
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
          processedValue = value; // Leave as-is
          break;

        case "condition":
          processedValue = formatCondition(value);
          break;
          
        //for edited data formatting
        case "itemCategory":
          processedValue = value;
          break;

        case "itemId":
          processedValue = value;
          break;

        default:
          processedValue = shouldTitleCase(key) ? toTitleCase(value) : value;
          break;
      }
    }

    if (key !== "images") {
      console.log(key, processedValue)
      formData.append(key, processedValue);
    }
  }

  // Handle images separately
  if (processedData.images && Array.isArray(processedData.images)) {
    processedData.images.forEach((file) => {
      formData.append("images", file);
    });
  }

  return formData;
}


// Helper function to format condition values
function formatCondition(condition) {
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