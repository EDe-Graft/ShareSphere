import { v2 as cloudinary } from 'cloudinary';

// Utility: Simple slugify function
export function slugify(name) {
    return name.toLowerCase().replace(/\s+/g, '').replace(/[^\w]/g, '');
}

// Generate unique username
export async function generateUniqueUsername(db, name) {
    let baseUsername = slugify(name);
    let username = baseUsername;
    let isUnique = false;
    let attempt = 0;

    while (!isUnique) {
        const res = await db.query('SELECT 1 FROM users WHERE username = $1', [username]);

        if (res.rowCount === 0) {
            isUnique = true;
        } else {
            // Append random 3-digit number to base username
            const randomSuffix = Math.floor(100 + Math.random() * 900); // 100 - 999
            username = `${baseUsername}${randomSuffix}`;
        }

        attempt++;
        if (attempt > 10) throw new Error('Unable to generate unique username. Try again.');
    }

    return username;
}



export async function uploadToCloudinary(encodedImage, itemCategory, imageId) {
  // Cloudinary Configuration
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
  });

  try {
    const publicId = `${itemCategory}-${imageId}`
    const uploadResult = await cloudinary.uploader.upload(
      encodedImage, {
        public_id: publicId,
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
    
    return [formattedImageURL, publicId];
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
}


export async function saveImage(db, imageData) {
  try {
    const {imageUrl, publicId, imageType, itemId} = imageData;
    const imageResult = await db.query(
      "INSERT INTO images (image_url, public_id, image_type, item_id) VALUES ($1, $2, $3, $4) RETURNING image_id",
      [imageUrl, publicId, imageType, itemId]
    );
    return imageResult.rows[0].image_id;
  } catch (error) {
    console.error('Error saving image to database:', error);
    throw error;
  }
}

export async function updateImage(db, updateData) {
  try {
    const {imageUrl, imageId, publicId} = updateData;
    await db.query("UPDATE images SET image_url = $1, public_id = $2 WHERE image_id = $3", [imageUrl, publicId, imageId]) 
  } catch (error) {
    console.error('Error updating image:', error)
    throw error;
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
  const uploaderId = req.user?.user_id;
  const uploadedBy = req.user?.name || req.user?.displayName || "N/A";
  const uploaderUsername = req.user?.username || "N/A";
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
        `INSERT INTO books (item_id, title, author, edition, year, general_category, parent_category, sub_category, description, condition, available, uploaded_by, uploader_id, uploader_email, uploader_username, upload_date) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
        [itemId, title, author, edition, year, generalCategory, parentCategory, subCategory, description, condition, available, uploadedBy, uploaderId, uploaderEmail, uploaderUsername, uploadDate]
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
        `INSERT INTO furniture (item_id, general_category, name, type, brand, age, color, dimensions, material, description, condition, available, uploaded_by, uploader_id, uploader_email, uploader_username, upload_date) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
        [itemId, generalCategory, name,  type, brand, age, color, dimensions, material, description, condition, available, uploadedBy, uploaderId, uploaderEmail, uploaderUsername, uploadDate]
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
        `INSERT INTO clothing (item_id, general_category, name, type, size, brand, color, material, gender, description, condition, available, uploaded_by, uploader_id, uploader_email, uploader_username, upload_date) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
        [itemId, generalCategory, name, type, size, brand, color, material, gender, description, condition, available, uploadedBy, uploaderId, uploaderEmail, uploaderUsername, uploadDate]
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
        `INSERT INTO miscellaneous (item_id, general_category, name, type, brand, color, age, estimated_value, description, condition, available, uploaded_by, uploader_id, uploader_email, uploader_username, upload_date) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
        [itemId, generalCategory, name, type, brand, color, age, estimatedValue, description, condition, available, uploadedBy, uploaderId, uploaderEmail, uploaderUsername, uploadDate]
      );
      break;
    }

    default:
      throw new Error(`Unsupported category: ${category}`);
  }
}


export function getTableName(itemCategory) {
  if (!itemCategory || typeof itemCategory !== "string") {
    throw new Error(`Invalid itemCategory: ${itemCategory}`);
  }
  itemCategory = itemCategory.toLowerCase();
  let tableName;
  switch (itemCategory) {
    case "book":
      tableName = "books";
      break;
    default:
      tableName = itemCategory;
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


export async function deleteImages(db, itemId, deletedImages) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
  });
  
  try {
    //get public_id from images table to delete from cloudinary
    const deletedImagesPublicIds = deletedImages.map(async (imageUrl) => {
      const result = await db.query(
        "SELECT public_id FROM images WHERE item_id =($1) AND image_url = ($2)",
        [itemId, imageUrl]
      );
      const publicId = result?.rows[0]?.public_id;
      return publicId;
    });

    await Promise.all(deletedImagesPublicIds);

    //delete images from cloudinary
    const cloudinaryPromises = deletedImagesPublicIds.map(async (publicId) => {
      return cloudinary.uploader.destroy(publicId)
        .catch(error => {
          console.error(`Failed to delete image ${publicId} from Cloudinary:`, error);
          // Continue even if one fails
        });
    });

    await Promise.all(cloudinaryPromises);

    //delete images from images table
    const deleteImagesPromises = deletedImages.map(async (imageUrl) => {
      return db.query("DELETE FROM images WHERE item_id = $1 AND image_url = $2", [itemId, imageUrl])
    });

    await Promise.all(deleteImagesPromises);

    return true;
  } catch (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
}


export async function deletePost(db, itemId, tableName) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
  });

  try {
    // 1. Get all Cloudinary public_ids for this item's images
    const imagesResult = await db.query(
      "SELECT public_id FROM images WHERE item_id = $1",
      [itemId]
    );

    // 2. Delete images from Cloudinary
    const deletePromises = imagesResult.rows.map(image => {
      return cloudinary.uploader.destroy(image.public_id)
        .catch(error => {
          console.error(`Failed to delete image ${image.public_id} from Cloudinary:`, error);
          // Continue even if one fails
        });
    });

    await Promise.all(deletePromises);

    // 3. Delete from images table
    await db.query(
      "DELETE FROM images WHERE item_id = $1",
      [itemId]
    );

    //4. Delete from favorites table
    await db.query(
      "DELETE FROM favorites WHERE item_id = $1",
      [itemId]
    )

    // 5. Delete from category-specific table
    await db.query(
      `DELETE FROM ${tableName} WHERE item_id = $1`,
      [itemId]
    );

    // 6. Delete from items table
    await db.query(
      "DELETE FROM items WHERE item_id = $1",
      [itemId]
    );

    return true;

  } catch (error) {
    console.error("Error in deletePost:", error);
    throw error;
  }
}

export async function saveReport(db, reportData) {
  try {
      const {
        reporterName,
        reporterEmail,
        reportedUserId,
        reportedUserName,
        reportedUserEmail,
        itemId,
        itemCategory,
        itemCondition,
        reportReason,
        reportDescription,
      } = reportData;
  
      // First, get the most recent report count for this item
      const existingReport = await db.query(
        `SELECT report_count FROM reports WHERE item_id = $1 ORDER BY created_at DESC LIMIT 1`,
        [itemId]
      );
  
      // Determine the new report count
      let currentReportCount;
      let newReport;
  
      if (existingReport.rows.length === 0) {
        // First report for this item
        currentReportCount = 1;
        // Insert the report with the calculated report_count
      newReport = await db.query(
        `INSERT INTO reports (
          report_count,
          reporter_name,
          reporter_email,
          reported_user_id,
          reported_user_name,
          reported_user_email,
          item_id,
          item_category,
          item_condition,
          report_reason,
          report_description
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *`,
        [
          currentReportCount,
          reporterName,
          reporterEmail,
          reportedUserId,
          reportedUserName,
          reportedUserEmail,
          itemId,
          itemCategory,
          itemCondition,
          reportReason,
          reportDescription
        ]
      );
  
      } else {
        // Increment the most recent report count
        currentReportCount = parseInt(existingReport.rows[0].report_count) + 1;
  
        //Update report count in the report table
        newReport = await db.query("UPDATE reports SET report_count = $1 WHERE item_id = $2 RETURNING *", [currentReportCount, itemId])
      }
      
      //update user report count in users table
      await db.query("UPDATE users SET report_count = $1 WHERE user_id = $2", [currentReportCount, reportedUserId])

      return newReport
    }  catch (error) {
      console.error("Error in making report:", error);
      throw error; // Propagate the error to the route handler
    }
}