import { v2 as cloudinary } from 'cloudinary';


export async function uploadToCloudinary(encodedImage, itemCategory, imageId) {
  // Cloudinary Configuration
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
  });

  try {
    const uploadResult = await cloudinary.uploader.upload(
      encodedImage, {
        public_id: `${itemCategory}-${imageId}`,
      }
    );
    
    const formattedImageURL = cloudinary.url(uploadResult.public_id, {
      transformation: [
        {
          width: 330,
          height: 200,
          crop: 'pad', // Use 'pad' instead of 'fill' to add black borders
          background: 'black', // Black background for padding
          quality: 'auto:best', // Highest quality preservation
          fetch_format: 'auto'
        }
      ]
    });
    
    return formattedImageURL;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
}


export async function saveImage(db, imageData) {
  try {
    const imageResult = await db.query(
      "INSERT INTO images (image_url, image_type, item_id) VALUES ($1, $2, $3) RETURNING image_id",
      [imageData.imageUrl, imageData.imageType, imageData.itemId]
    );
    return imageResult.rows[0].image_id;
  } catch (error) {
    console.error('Error saving image to database:', error);
    throw error;
  }
}

export async function updateImage(db, updateData) {
  try {
    const {imageUrl, imageId} = updateData;
    await db.query("UPDATE images SET image_url = ($1) WHERE image_id = ($2)", [imageUrl, imageId]) 
  } catch (error) {
    console.error('Error updating image')
  }
}


export async function saveItem(db, itemData) {
  try {
    console.log(itemData)
    const { category, condition,  description, available, likes, uploaderId, uploaderEmail, uploadDate } = itemData;
    
    const itemResult = await db.query(
      "INSERT INTO items (category, condition, description, available, likes, uploader_id, uploader_email, upload_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
      [category, condition, description, available, likes, uploaderId, uploaderEmail, uploadDate]
    );
    
    return itemResult.rows[0].item_id;
  } catch (error) {
    console.error('Error creating new item:', error);
    throw error;
  }
}


export async function insertCategoryDetails(db, {req, itemId, category, uploadDate}) {
  const generalCategory = category;
  const available = true;
  const uploadedBy = req.user?.name || req.user?.displayName || "N/A";
  const uploaderEmail = req.user?.email || "N/A";

  switch (category) {
    case 'Book': {
      const {
        parentCategory,
        subCategory,
        title,
        author,
        edition,
        year,
        description,
        condition
      } = req.body;

      await db.query(
        `INSERT INTO books (item_id, title, author, edition, year, general_category, parent_category, sub_category, description, condition, available, uploaded_by, uploader_email, upload_date) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [itemId, title, author, edition, year, generalCategory, parentCategory, subCategory, description, condition, available, uploadedBy, uploaderEmail, uploadDate]
      );
      break;
    }

    case 'Furniture': {
      const {
        name,
        type,
        brand,
        age,
        color,
        dimensions,
        material,
        description,
        condition
      } = req.body;

      await db.query(
        `INSERT INTO furniture (item_id, general_category, name, type, brand, age, color, dimensions, material, description, condition, available, uploaded_by, uploader_email, upload_date) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [itemId, generalCategory, name,  type, brand, age, color, dimensions, material, description, condition, available, uploadedBy, uploaderEmail, uploadDate]
      );
      break;
    }

    case 'Clothing': {
      const {
        name,
        type,
        size,
        brand,
        color,
        material,
        gender,
        description,
        condition
      } = req.body;

      await db.query(
        `INSERT INTO clothing (item_id, general_category, name, type, size, brand, color, material, gender, description, condition, available, uploaded_by, uploader_email, upload_date) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [itemId, generalCategory, name, type, size, brand, color, material, gender, description, condition, available, uploadedBy, uploaderEmail, uploadDate]
      );
      break;
    }

    case 'Miscellaneous': {
      const {
        name,
        type,
        brand,
        color,
        age,
        estimatedValue,
        description,
        condition
      } = req.body;

      await db.query(
        `INSERT INTO miscellaneous (item_id, general_category, name, type, brand, color, age, estimated_value, description, condition, available, uploaded_by, uploader_email, upload_date) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [itemId, generalCategory, name, type, brand, color, age, estimatedValue, description, condition, available, uploadedBy, uploaderEmail, uploadDate]
      );
      break;
    }

    default:
      throw new Error(`Unsupported category: ${category}`);
  }
}


export default function updateCategoryDetails(category) {

}

export function getTableName(itemCategory) {
  itemCategory = itemCategory.toLowerCase();
  let tableName;

  switch (itemCategory) {
    case "book":
      tableName = "books"
      break;
  
    default:
      tableName = itemCategory.toLowerCase();
      break;
  }

  return tableName;
}

export async function getImages(db, itemId) {
  //fetch images
  const imagesResult = await db.query(
    "SELECT image_url FROM images WHERE item_id = $1",
    [itemId]
  );
  const images = imagesResult.rows.map((row) => row.image_url);

  return images
}

export async function getLikes(db, itemId) {
  const likesResult = await db.query(
    `SELECT likes FROM items WHERE item_id = $1`,
    [itemId]
  );

    const likes = likesResult.rows[0].likes
    return likes
}

export async function deletePost(db, itemId, tableName) {
  try {
    // Update availability in items table
    await db.query(
      "UPDATE items SET available = $1 WHERE item_id = $2",  // Fixed "to" -> "="
      [false, itemId]
    );

    // Update availability in category-specific table
    await db.query(
      `UPDATE ${tableName} SET available = $1 WHERE item_id = $2`,
      [false, itemId]
    );

    return true;

  } catch (error) {
    console.error("Error in deletePost:", error);
    throw error; // Propagate the error to the route handler
  }
}