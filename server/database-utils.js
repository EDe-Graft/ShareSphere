import { v2 as cloudinary } from 'cloudinary';
import { formatLocalISO } from './format.js ';
import bcrypt from "bcrypt";
import { toCamelCase, toSnakeCase } from "./format.js";


export async function registerUser(db, userData) {
  const {displayName, email, password, confirmPassword} = userData;
  const saltRounds = 10;

  let username = userData?.displayName.toLowerCase() || null;
  if (!username) {
    username = await generateUniqueUsername(db, displayName);
  }
  const strategy = 'credentials';
  const joinedOn = formatLocalISO().slice(0,10);

  let photo = null;
  let photoPublicId = null;
  let profileUrl = null;
  let location = 'USA';
  const bio = `Hi, I'm ${displayName}!`;

  let emailVerified = false;
  let emailVerifiedAt = null;

  //user stats
  let postsCount = 0;
  let activePostsCount = 0;
  let inactivePostsCount = 0;
  let likesReceived = 0;
  let reportCount = 0;
  let reviewCount = 0;
  let reviewsGiven = 0;
  let reviewsReceived = 0;
  let averageRating = 0;
  

  if (password === confirmPassword) {
    try {
      const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [
          email,
      ]);
  
      if (checkResult.rows.length > 0) {
          throw new Error("User already exists. Please sign in.");
      } else {
          // Convert bcrypt.hash to use promises
          const hash = await new Promise((resolve, reject) => {
            bcrypt.hash(password, saltRounds, (err, hash) => {
              if (err) {
                console.error("Error hashing password:", err);
                reject(err);
              } else {
                resolve(hash);
              }
            });
          });

          const result = await db.query(
            "INSERT INTO users (username, name, email, password, strategy, joined_on, profile_url, bio, photo, photo_public_id, location, email_verified, email_verified_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *",
            [username, displayName, email, hash, strategy, joinedOn, profileUrl, bio, photo, photoPublicId, location, emailVerified, emailVerifiedAt]
          );
          
          const user = toCamelCase(result.rows[0]);
          const userId = user.userId;

          await db.query(
            `INSERT INTO user_stats (user_id, likes_received, posts_count, active_posts_count, inactive_posts_count, review_count, reviews_given, reviews_received, report_count, average_rating) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
            [userId, likesReceived, postsCount, activePostsCount, inactivePostsCount, reviewCount, reviewsGiven, reviewsReceived, reportCount, averageRating]
          );

          return user;
      }
  } catch (err) {
      console.log(err)
      throw new Error("Unable to register user");
    }
} else {
  throw new Error("Passwords don't match. Try again");
}
}


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


export async function getUserProfile(db, userId) {
  const userProfileResult = await db.query(
    `SELECT * FROM users WHERE user_id = $1`,
    [userId]
  );
  return toCamelCase(userProfileResult.rows[0]);
}


//update user profile data
export async function updateUserProfile(db, updateData) {
  const { userId, ...fieldsToUpdate } = updateData;

  try {
    const dataSetClause = [];
    const dataValues = [];

    let index = 1;
    for (const [key, value] of Object.entries(toSnakeCase(fieldsToUpdate))) {
      dataSetClause.push(`${key} = $${index}`);
      dataValues.push(value);
      index++;
    }

    // Append userId for WHERE clause
    dataValues.push(userId);

    const updateQuery = {
      text: `
        UPDATE users
        SET ${dataSetClause.join(', ')}
        WHERE user_id = $${index}
        RETURNING *
      `,
      values: dataValues,
    };

    const updateResults = await db.query(updateQuery);
    const userData = updateResults.rows[0];

    return userData;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
}




export async function getUserStats(db, userId) {
  const userStatsResult = await db.query(
    `SELECT * FROM user_stats WHERE user_id = $1`,
    [userId]
  );
  return toCamelCase(userStatsResult.rows[0]);
}

export async function updateUserStats(db, userId, updateData) {
  const { likesReceived, postsCount, activePostsCount, inactivePostsCount, reviewCount, reviewsGiven, reviewsReceived, reportCount, averageRating } = updateData;
  await db.query(
    `UPDATE user_stats SET likes_received = $1, posts_count = $2, active_posts_count = $3, inactive_posts_count = $4, review_count = $5, reviews_given = $6, reviews_received = $7, report_count = $8, average_rating = $9 WHERE user_id = $10`,
    [likesReceived, postsCount, activePostsCount, inactivePostsCount, reviewCount, reviewsGiven, reviewsReceived, reportCount, averageRating, userId]
  );
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
    
    // Different transformation settings based on image type
    let transformation;
    if (itemCategory === 'profile') {
      // Profile images: circular crop, smaller size
      transformation = [
        {
          width: 150,
          height: 150,
          crop: 'fill',
          gravity: 'face', // Focus on face if detected
          quality: 'auto:best',
          fetch_format: 'auto'
        }
      ];
    } else {
      // Item images: rectangular with padding
      transformation = [
        {
          width: 330,
          height: 200,
          crop: 'pad', // Use 'pad' instead of 'fill' to add black borders
          background: 'black', // Black background for padding
          quality: 'auto:best', // Highest quality preservation
          fetch_format: 'auto'
        }
      ];
    }
    
    const formattedImageURL = cloudinary.url(uploadResult.public_id, {
      transformation: transformation
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
    const { category, condition,  description, available, likes, uploaderId, uploaderUsername, uploaderEmail, uploaderPhoto, uploadDate } = itemData;
    
    const itemResult = await db.query(
      "INSERT INTO items (category, condition, description, available, likes, uploader_id, uploader_username, uploader_email, uploader_photo, upload_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *",
      [category, condition, description, available, likes, uploaderId, uploaderUsername, uploaderEmail, uploaderPhoto, uploadDate]
    );
    
    return itemResult.rows[0].item_id;
  } catch (error) {
    console.error('Error creating new item:', error);
    throw error;
  }
}


export async function insertCategoryDetails(db, {req, itemId, category}) {
  const generalCategory = category;
  const available = true;
  const uploaderId = req.user?.userId;
  const uploadedBy = req.user?.name || req.user?.displayName || "N/A";
  const uploaderUsername = req.user?.username || "N/A";
  const uploaderEmail = req.user?.email || "N/A";
  const uploaderPhoto = req.user?.photo || "N/A";
  const uploadDate = formatLocalISO();

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
        `INSERT INTO books (item_id, title, author, edition, year, general_category, parent_category, sub_category, description, condition, available, uploaded_by, uploader_id, uploader_email, uploader_photo, uploader_username, upload_date) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
        [itemId, title, author, edition, year, generalCategory, parentCategory, subCategory, description, condition, available, uploadedBy, uploaderId, uploaderEmail, uploaderPhoto, uploaderUsername, uploadDate]
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
        `INSERT INTO furniture (item_id, general_category, name, type, brand, age, color, dimensions, material, description, condition, available, uploaded_by, uploader_id, uploader_email, uploader_photo, uploader_username, upload_date) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
        [itemId, generalCategory, name,  type, brand, age, color, dimensions, material, description, condition, available, uploadedBy, uploaderId, uploaderEmail, uploaderPhoto, uploaderUsername, uploadDate]
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
        `INSERT INTO clothing (item_id, general_category, name, type, size, brand, color, material, gender, description, condition, available, uploaded_by, uploader_id, uploader_email, uploader_photo, uploader_username, upload_date) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
        [itemId, generalCategory, name, type, size, brand, color, material, gender, description, condition, available, uploadedBy, uploaderId, uploaderEmail, uploaderPhoto, uploaderUsername, uploadDate]
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
        `INSERT INTO miscellaneous (item_id, general_category, name, type, brand, color, age, estimated_value, description, condition, available, uploaded_by, uploader_id, uploader_email, uploader_photo, uploader_username, upload_date) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
        [itemId, generalCategory, name, type, brand, color, age, estimatedValue, description, condition, available, uploadedBy, uploaderId, uploaderEmail, uploaderPhoto, uploaderUsername, uploadDate]
      );
      break;
    }

    default:
      throw new Error(`Unsupported category: ${category}`);
  }

  //update posts count after item is posted
  await db.query(
    `UPDATE user_stats SET posts_count = posts_count + 1 WHERE user_id = $1`,
    [uploaderId]
  );
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


export async function deleteFromCloudinary (publicId) {
  try {
    await cloudinary.uploader.destroy(publicId);
    console.log("Old photo deleted from Cloudinary");
  } catch (deleteErr) {
    console.warn("Failed to delete old photo:", deleteErr.message);
    // Continue anyway
  }
}

export async function checkImageExists(publicId) {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
      api_key: process.env.CLOUDINARY_API_KEY, 
      api_secret: process.env.CLOUDINARY_API_SECRET 
    });
    
    const result = await cloudinary.api.resource(publicId);
    return result && result.public_id;
  } catch (error) {
    console.warn(`Image ${publicId} does not exist on Cloudinary:`, error.message);
    return false;
  }
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


export async function manageLikesReceived(db, itemId, updatedLikes) {
  //get id of user who uploaded the item
  const uploaderResult = await db.query(
    "SELECT uploader_id FROM items WHERE item_id = $1",
    [itemId]
  );
  const uploaderId = uploaderResult.rows[0].uploader_id;

  //update user likes received
  await db.query(
    "UPDATE user_stats SET likes_received = $1 WHERE user_id = $2",
    [updatedLikes, uploaderId]
  );
}


export async function getReportCount(db, itemId) {
  const reportCountResult = await db.query(
    `SELECT report_count FROM report_details WHERE item_id = $1 ORDER BY created_at DESC LIMIT 1`,
    [itemId]
  );
  return reportCountResult.rows[0]?.report_count || 0;
}


export async function postReview(db, reviewData) {
  const {
    reviewerId,
    reviewerName,
    reviewerPhoto,
    reviewedUserId,
    reviewedUserName,
    reviewedUserPhoto,
    itemId,
    itemName,
    itemCategory,
    rating,
    comment,
  } = reviewData;

  let reviewDate = formatLocalISO();

  const reviewsResult = await db.query(
    `INSERT INTO reviews (reviewer_id, reviewer_name, reviewer_photo, reviewed_user_id, reviewed_user_name, reviewed_user_photo, item_id, item_name, item_category, rating, comment, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
    [reviewerId, reviewerName, reviewerPhoto, reviewedUserId, reviewedUserName, reviewedUserPhoto, itemId, itemName, itemCategory, rating, comment, reviewDate]
  );

  //update user review count for reviewer (saving for user contribution to platform)
  await db.query(`
    UPDATE user_stats SET review_count = review_count + 1 WHERE user_id = $1`,
    [reviewerId]
  );

  //update user review count for reviewedUser
  await db.query(
    `UPDATE user_stats SET review_count = review_count + 1 WHERE user_id = $1`,
    [reviewedUserId]
  );

  //update user average rating
  await db.query(
    `UPDATE user_stats SET average_rating = (SELECT AVG(rating) FROM reviews WHERE reviewed_user_id = $1) WHERE user_id = $1`,
    [reviewedUserId]
  );

  return reviewsResult.rows;
}


export async function updateReview(db, reviewData) {
  const { rating, comment, reviewId } = reviewData;

  // Validate required parameters
  if (!reviewId) {
    throw new Error("Review ID is required for updating a review");
  }

  if (rating === undefined || rating === null) {
    throw new Error("Rating is required for updating a review");
  }

  try {
    const review = await db.query(
      `UPDATE reviews SET rating = $1, comment = $2 WHERE review_id = $3 RETURNING *`,
      [rating, comment, reviewId]
    );
    return review.rows[0];
  } catch (error) {
    console.error("Error updating review:", error);
    throw error;
  }
  
}

export async function saveReport(db, reportData) {
  try {
      const {
        reporterName,
        reporterEmail,
        reporterId,
        reportedUserId,
        reportedUserName,
        reportedUserEmail,
        itemId,
        itemCategory,
        itemCondition,
        reportReason,
        reportDescription,
      } = reportData;
  
      let alreadyReported = false;
      let newReport;

      //check if the reporter has already reported this item
      //only one report per item per user
      const existingReportTracking = await db.query(
        `SELECT * FROM report_tracking WHERE reporter_user_id = $1 AND item_id = $2`,
        [reporterId, itemId]
      );

      //if the reporter has not reported this item, insert into report_tracking table
      if (existingReportTracking.rows.length === 0) {
        //insert into report_tracking table and report_details table
        await db.query(
          `INSERT INTO report_tracking (reporter_user_id, reported_user_id, item_id, item_category) VALUES ($1, $2, $3, $4)`,
          [reporterId, reportedUserId, itemId, itemCategory]
        );

        //get the most recent report count for this item
        let currentReportCount = await getReportCount(db, itemId);

        //if the item has no reports, set the report count to 1
        if (currentReportCount === 0) {
          // first report for this item
          currentReportCount += 1;
          //insert into report_details table
          await db.query(
            `INSERT INTO report_details (report_count, reporter_name, reporter_email, reporter_id, reported_user_id, reported_user_name, reported_user_email, item_id, item_category, item_condition, report_reason, report_description) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
            [currentReportCount, reporterName, reporterEmail, reporterId, reportedUserId, reportedUserName, reportedUserEmail, itemId, itemCategory, itemCondition, reportReason, reportDescription]
          );
          
          // generate new report
          newReport = await db.query(
            `INSERT INTO report_details (
              report_count,
              reporter_id,
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
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *`,
            [
              currentReportCount,
              reporterId,
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
            alreadyReported = true;
          }      
      }      

      return {newReport, alreadyReported}
    }  catch (error) {
      console.error("Error in making report:", error);
      throw error; // Propagate the error to the route handler
    }
}

// Email verification functions
export async function createVerificationToken(db, userId, tokenType = 'email_verification') {
  const crypto = await import('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

  try {
    await db.query(
      'INSERT INTO verification_tokens (user_id, token, token_type, expires_at) VALUES ($1, $2, $3, $4)',
      [userId, token, tokenType, expiresAt]
    );
    return token;
  } catch (error) {
    console.error('Error creating verification token:', error);
    throw new Error('Failed to create verification token');
  }
}

export async function verifyToken(db, token, tokenType = 'email_verification') {
  try {
    const result = await db.query(
      `SELECT vt.*, u.email, u.name 
       FROM verification_tokens vt 
       JOIN users u ON vt.user_id = u.user_id 
       WHERE vt.token = $1 AND vt.token_type = $2 AND vt.expires_at > NOW() AND vt.used_at IS NULL`,
      [token, tokenType]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return toCamelCase(result.rows[0]);
  } catch (error) {
    console.error('Error verifying token:', error);
    throw new Error('Failed to verify token');
  }
}

export async function markTokenAsUsed(db, tokenId) {
  try {
    await db.query(
      'UPDATE verification_tokens SET used_at = NOW() WHERE token_id = $1',
      [tokenId]
    );
  } catch (error) {
    console.error('Error marking token as used:', error);
    throw new Error('Failed to mark token as used');
  }
}

export async function verifyUserEmail(db, userId) {
  try {
    await db.query(
      'UPDATE users SET email_verified = TRUE, email_verified_at = NOW() WHERE user_id = $1',
      [userId]
    );
  } catch (error) {
    console.error('Error verifying user email:', error);
    throw new Error('Failed to verify user email');
  }
}

export async function checkEmailVerificationStatus(db, email) {
  try {
    const result = await db.query(
      'SELECT email_verified FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return false; // User not found
    }

    let isUserVerified = result.rows[0].email_verified;
    return isUserVerified

  } catch (error) {
    console.error('Error checking email verification status:', error);
    throw new Error('Failed to check email verification status');
  }
}


export async function getUserByEmail(db, email) {
  try {
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return false;
    }

    return toCamelCase(result.rows[0]);
  } catch (error) {
    console.error('Error getting user by email:', error);
    throw new Error('Failed to get user by email');
  }
}

export async function getUserByProfileUrl(db, profileUrl) {
  try {
    const result = await db.query(
      'SELECT * FROM users WHERE profile_url = $1',
      [profileUrl]
    );

    if (result.rows.length === 0) {
      return false;
    }

    return toCamelCase(result.rows[0]);
  } catch (error) {
    console.error('Error getting user by profile URL:', error);
    throw new Error('Failed to get user by profile URL');
  }
}

export async function deleteExpiredTokens(db) {
  try {
    await db.query(
      'DELETE FROM verification_tokens WHERE expires_at < NOW()'
    );
  } catch (error) {
    console.error('Error deleting expired tokens:', error);
    throw new Error('Failed to delete expired tokens');
  }
}