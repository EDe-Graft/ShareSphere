import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import passport from "passport";
import env from "dotenv";
import multer from "multer";
import cors from "cors";
import nodemailer from "nodemailer";
import { render } from '@react-email/render';
import { createElement } from 'react';
import ItemRequestEmail from './dist/emails/ItemRequestEmail.js';
import AdminReportEmail from './dist/emails/AdminReportEmail.js';
import ReportConfirmationEmail from './dist/emails/ReportConfirmationEmail.js';
import WarningEmail from './dist/emails/WarningEmail.js';
import EmailVerificationEmail from './dist/emails/EmailVerificationEmail.js';
import { configurePassport } from "./passport-config.js";
import { uploadToCloudinary, saveItem, saveImage, updateImage, insertCategoryDetails, getTableName, getImages, getLikes, manageLikesReceived, deleteImages, deletePost, saveReport, postReview, updateReview, getUserProfile, updateUserProfile, registerUser, getUserStats, deleteFromCloudinary, checkImageExists, createVerificationToken, verifyToken, markTokenAsUsed, verifyUserEmail, checkEmailVerificationStatus, getUserByEmail, deleteExpiredTokens } from './database-utils.js';
import { formatLocalISO, capitalizeFirst, toCamelCase, toSnakeCase } from "./format.js";

// Express-app and environment creation
const app = express();
const port = 3000;
const saltRounds = 10;

env.config();

// Database Connection
// const db = new Client({
//   user: process.env.PG_USER,
//   host: process.env.PG_HOST,
//   database: process.env.PG_DATABASE,
//   password: process.env.PG_PASSWORD,
//   port: process.env.PG_PORT,
// });

const db = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

db.connect();

// Initialize passport
configurePassport(passport, db);

// CORS Configuration - MUST come first
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.BACKEND_URL,
  process.env.GOOGLE_OAUTH_DOMAIN
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['set-cookie']
};

// Apply CORS before anything else
app.use(cors(corsOptions));

// Body parsers
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Session configuration
app.use(
  session({
    name: "cookie1",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000
    },
    proxy: process.env.NODE_ENV === 'production'
}));


const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 3 // Max 3 files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// Email configuration
// Use SendGrid for production (Render blocks Gmail SMTP ports)
const transporter = nodemailer.createTransport(
  process.env.NODE_ENV === 'production' && process.env.SENDGRID_API_KEY
    ? {
        host: 'smtp.sendgrid.net',
        port: 587,
        secure: false, // use TLS
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY,
        },
      }
    : {
        service: 'gmail',
        auth: {
          user: process.env.APP_USERNAME,
          pass: process.env.APP_PASSWORD,
        },
      }
);

// Helper function to send email
async function sendEmail({ to, subject, html }) {
  return await transporter.sendMail({
    from: `ShareSphere <${process.env.APP_USERNAME}>`,
    to: to,
    subject: subject,
    html: html,
  });
}

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());


//Routes
//For credentials auth success/failure
app.get('/auth/user', (req, res) => {
  if (req.isAuthenticated()) {
    // console.log(req.user)
    res.status(200).json({
      authSuccess: req.isAuthenticated(),
      message: 'User Logged In', 
      user: toCamelCase(req.user) 
    });
  } else {
    res.status(401).json({
      authSuccess: false,
      message: 'Could not get user data', 
      user: null 
    });
  }
});

//For google auth success
app.get("/auth/success", (req, res) => {
  if (req.user) {
    console.log("User", req.user);
    res.send(`
      <script>
        window.opener.postMessage(
          { authSuccess: true, user: ${JSON.stringify(req.user)} },
          "${process.env.FRONTEND_URL}"
        );
        window.close();
      </script>
    `);
  } else {
    res.redirect(`${process.env.FRONTEND_URL}/sign-in`);
  }
});

//for google auth failure
app.get("/auth/failure", (req, res) => {
  res.send(`
    <script>
      window.opener.postMessage(
        { authSuccess: false, user: null },
        "${process.env.FRONTEND_URL}"
      );
      window.close();
    </script>
  `);
})


// GOOGLE OAUTH 2.0 ROUTES
// Authenticate user through google and request for their profile and email.
app.get("/auth/google", passport.authenticate("google", 
  {scope: ['profile', 'email']}
))

// After Authentication Success/Failure
app.get("/auth/google/callback", 
  passport.authenticate("google", { failureRedirect: "/auth/failure" }),
  (req, res) => {
    //successful auth
    res.redirect("/auth/success");
  }
);

//GITHUB AUTH ROUTES
app.get("/auth/github", (req, res) => {
  // If email is provided in query params, encode it in state
  let state = req.query?.state || null;
  if (req.query?.email) {
    const stateData = { email: req.query.email };
    state = encodeURIComponent(JSON.stringify(stateData));
  }
  
  passport.authenticate("github", {
    scope: ['user:email'],
    state: state
  })(req, res);
});

app.get("/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/auth/failure" }),
  (req, res) => {
    // Successful auth
    const state = req.query?.state;
    res.redirect("/auth/success");
  }
);


//retrieve requested item type from database
app.get("/items", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const itemCategory = capitalizeFirst(req.query.category);
  const validCategories = ['Book', 'Clothing', 'Furniture', 'Miscellaneous', 'Favorites'];

  if (!validCategories.includes(itemCategory)) {
    return res.status(400).json({ error: "Unsupported or missing item category" });
  }

  try {
    // Query the appropriate table based on the category
    let tableName = getTableName(itemCategory);

    const itemsResult = await db.query(`SELECT * FROM ${tableName}`);
    

    const allItems = itemsResult.rows;

    const itemsWithImages = await Promise.all(
      allItems.map(async (item) => {

        let itemId = item.item_id;

        //get item images
        const images = await getImages(db, itemId)
        //get item likeCount
        const likes = await getLikes(db, itemId)

        //convert keys to camelCase before returning object
        return toCamelCase({
          ...item,
          images: images, // original snake_case key
          displayImage: images[0],
          likes: likes
        });
      })
    );

    res.json({
      getSuccess: true,
      items: itemsWithImages
    });

  } catch (error) {
    console.error("Error fetching items and images:", error);
    res.status(500).json({
      getSuccess: false,
      message: "Internal server error" 
    });
  }
});



app.get("/user-profile/:userId", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const userId = req.params?.userId;

  try {
    const userProfile = await getUserProfile(db, userId);
    res.status(200).json({
      success: true,
      userData: toCamelCase(userProfile)
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

app.get("/user-stats/:userId", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const userId = req.params?.userId;

  try {
    const userStats = await getUserStats(db, userId);
    console.log(userStats)
    res.status(200).json({
      success: true,
      stats: userStats
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});


app.get("/user-posts/:userId", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const userId = req.params?.userId;

  try {
    // Get all posted item ids by user from items table
    const postedResults = await db.query(
      "SELECT item_id, category FROM items WHERE uploader_id = $1", 
      [userId]
    );
    
    if (postedResults.rowCount === 0) {
      return res.json({
        success: true,
        posts: []
      });
    }

    // User has posted items
    const userPosts = await Promise.all(
      postedResults.rows.map(async (data) => {
        const itemId = data.item_id;
        const itemCategory = data.category;
        const tableName = getTableName(itemCategory);

        try {
          const postResult = await db.query(
            `SELECT * FROM ${tableName} WHERE item_id = $1`, 
            [itemId]
          );
          
          // Check if post exists in category table
          if (postResult.rowCount === 0) {
            console.warn(`Item ${itemId} not found in ${tableName}`);
            return null;
          }

          const post = postResult.rows[0];
          const images = await getImages(db, itemId);
          const likes = await getLikes(db, itemId);

          // Only convert to camelCase if post exists
          return post ? toCamelCase({
            ...post,
            images: images || [],
            displayImage: images?.[0] || null,
            likes: likes || 0
          }) : null;
        } catch (error) {
          console.error(`Error processing item ${itemId}:`, error);
          return null;
        }
      })
    );

    // Filter out any null posts that failed to load
    const validPosts = userPosts.filter(post => post !== null);
    
    res.json({
      success: true,
      posts: validPosts
    });
    
  } catch (error) {
    console.error("Error in /user-posts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user posts"
    });
  }
});


app.post("/update-post", upload.array('newImages', 3), async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const hasFile = req.query.hasFile;
  let newImages;
  let removedImages;
  let updateData;


  if (hasFile === "true") {
    //get new images
    newImages = req.files;
    removedImages = JSON.parse(req.body.removedImages);
    updateData = req.body;
  } else {
    //no new images, possibly removed images
    updateData = req.body.updateData;
    removedImages = JSON.parse(updateData.removedImages);
  }


  //get item id and category
  const { itemId, itemCategory } = updateData;
  const tableName = getTableName(itemCategory);

  // // Track original camelCase fields for response
  const updatedFields = Object.keys(updateData).filter(
    key => !['itemId', 'itemCategory', 'removedImages', 'newImages'].includes(key)
  );

  try {
    if (Object.keys(updateData).length === 2 && hasFile === "false") {
      //if only itemId and itemCategory are present, no changes were made
      console.log("no changes made")
      return res.status(200).json({
        updateSuccess: true,
        message: "No changes made"
      });
    }

    // Validate required parameters
    if (!itemId || !itemCategory) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Security: Validate category against allowed values
    const allowedCategories = ['book', 'furniture', 'clothing', 'miscellaneous'];
    if (!allowedCategories.includes(itemCategory.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    // Common fields that exist in both tables
    const commonFields = ['condition', 'description'];
    let itemsUpdateNeeded = false;
    let categoryUpdateNeeded = false;

    // Build updates for both tables
    const itemsSetClause = [];
    const categorySetClause = [];
    const itemsValues = [];
    const categoryValues = [];
    let itemsParamIndex = 1;
    let categoryParamIndex = 1;

    // Process all fields from converted data
    Object.entries(toSnakeCase(updateData)).forEach(([key, value]) => {
      // Skip identifiers
      if (key === 'item_id' || key === 'item_category' || key === 'removed_images' || key === 'new_images') return;

      // Update items table parameters
      if (commonFields.includes(key)) {
        itemsSetClause.push(`${key} = $${itemsParamIndex}`);
        itemsValues.push(value);
        itemsParamIndex++;
        itemsUpdateNeeded = true;
      }

      // Update category table parameters
      categorySetClause.push(`${key} = $${categoryParamIndex}`);
      categoryValues.push(value);
      categoryParamIndex++;
      categoryUpdateNeeded = true;
    });

    // Update items table if needed
    if (itemsUpdateNeeded) {
      itemsValues.push(itemId);
      const itemsQuery = {
        text: `UPDATE items 
               SET ${itemsSetClause.join(', ')}
               WHERE item_id = $${itemsParamIndex}`,
        values: itemsValues
      };
      await db.query(itemsQuery);
    }

    // Update category table if needed
    if (categoryUpdateNeeded) {
      categoryValues.push(itemId);
      const categoryQuery = {
        text: `UPDATE ${tableName} 
               SET ${categorySetClause.join(', ')}
               WHERE item_id = $${categoryParamIndex}`,
        values: categoryValues
      };
      await db.query(categoryQuery);  
    }


    if (removedImages) {
      //delete removed images
      const deleteSuccess = await deleteImages(db, itemId, removedImages);
      if (!deleteSuccess) {
        return res.status(500).json({
          error: 'Failed to delete images'
        });
      }
    }

    if (newImages) {
      const uploadDate = formatLocalISO(); //upload date

      // Process each file and upload to cloudinary
      const uploadPromises = newImages.map(async (image) => {
        // For multer files, use mimetype property
        const mimeType = image.mimetype || image.type || 'image/jpeg';

        //save image without the url
        const imageData = {
          imageUrl: `awaiting image url on ${uploadDate}...`,
          publicId: `awaiting public id on ${uploadDate}...`,
          imageType: mimeType,
          itemId: itemId,
        };

        //retrieve imageId to make every saved image unique
        const imageId = await saveImage(db, imageData);

        const [formattedImageUrl, publicId] = await uploadToCloudinary(
          `data:${mimeType};base64,${image.buffer.toString('base64')}`,
          itemCategory,
          imageId
        );

        //update image with the formatted image url
        const updateData = {
          imageUrl: formattedImageUrl,
          imageId: imageId,
          publicId: publicId
        }

        await updateImage(db, updateData);

        return formattedImageUrl;
      });

      await Promise.all(uploadPromises);
    }

    res.status(200).json({
      updateSuccess: true,
      message: "Post updated successfully",
      itemId: itemId,
      updatedFields: updatedFields
    });

  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    });
  }
});



app.patch("/update-profile", upload.single('profilePhoto'), async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  const userId = req.user?.userId;
  const image = req.file || null;
  let updateData = {
    ...req.body,
    userId
  };


  try {
    // 1. Check if old photo exists before trying to delete it
    if (image && updateData.photoPublicId) {
      let oldPublicId = updateData.photoPublicId;
      const imageExists = await checkImageExists(oldPublicId);
      if (imageExists) {
        await deleteFromCloudinary(oldPublicId);
      } else {
        console.log(`Old profile image ${oldPublicId} does not exist on Cloudinary, skipping deletion`);
      }
    }

    // 2. Upload new image to Cloudinary
    if (image) {
      const mimeType = image.mimetype || image.type || 'image/jpeg';
      const itemCategory = "profile";

      const [formattedImageUrl, newPublicId] = await uploadToCloudinary(
        `data:${mimeType};base64,${image.buffer.toString('base64')}`,
        itemCategory,
        userId
      );

      updateData.photo = formattedImageUrl;
      updateData.photoPublicId = newPublicId;
    }

    // 3. Update user profile
    const userData = await updateUserProfile(db, updateData);

    res.status(200).json({
      success: true,
      userData,
      message: "Your profile updated successfully"
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});



app.get("/favorites", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const userId = req.user.userId;
  const category = capitalizeFirst(req.query.category);
  const includeDetails = req.query.includeDetails === "true";

  try {
    let query, params;

    if (capitalizeFirst(category) === 'All') {
      //get favorites from all categories
      query = "SELECT item_id, item_category FROM favorites WHERE user_id = $1";
      params = [userId];
    } else {
      //get favorites from specific category
      query = "SELECT item_id, item_category FROM favorites WHERE user_id = $1 AND item_category = $2";
      params = [userId, category];
    }

    const favoritesResult = await db.query(query, params);

    const favoriteIds = favoritesResult.rows.map((item) => item.item_id);
    if (!includeDetails) {
      // Return just IDs of user favorites(backward-compatible)
      return res.json({
        getSuccess: true,
        userFavorites: favoriteIds,
      });
    }

    // else, fetch full details for each favorite
    const favoriteDetails = await Promise.all(
      favoritesResult.rows.map(async ({item_id, item_category}) => {

        let tableName = getTableName(item_category)
        let itemId = item_id;

        const itemRes = await db.query(
          `SELECT * FROM ${tableName} WHERE item_id = $1`,
          [itemId]
        );
        
        const favorite = itemRes.rows[0]; // Return the full item object

        //fetch favorites images
        const images = await getImages(db, itemId);
        //get favorite likes
        const likes = await getLikes(db, itemId)

        //convert keys to camelCase before returning object to front end
        return toCamelCase({
          ...favorite,
          images: images,
          displayImage: images[0],
          likes: likes
        });
      })
    );

    res.json({
      getSuccess: true,
      userFavoritesDetails: favoriteDetails
    });

  } catch (error) {
    console.error("Failed to fetch favorites:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});



//Post Routes
app.post("/favorites/toggle", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const userId = req.user.userId;
  const { itemId } = req.body;

  try {
    // Check if already in favorites
    const checkResult = await db.query(
      "SELECT * FROM favorites WHERE user_id = $1 AND item_id = $2",
      [userId, itemId]
    );

    let isNowLiked;
    let updatedLikes;

    if (checkResult.rowCount === 0) {
      // Add like
      const itemResult = await db.query(
        "SELECT category, likes FROM items WHERE item_id = $1",
        [itemId]
      );
      const itemCategory = itemResult.rows[0].category;
      updatedLikes = itemResult.rows[0].likes + 1;

      //add to favorites table
      await db.query(
        "INSERT INTO favorites (user_id, item_id, item_category) VALUES ($1, $2, $3)",
        [userId, itemId, itemCategory]
      );

      //update item likes
      await db.query(
        "UPDATE items SET likes = $1 WHERE item_id = $2",
        [updatedLikes, itemId]
      );

      //update user likes received
      await manageLikesReceived(db, itemId, updatedLikes);

      isNowLiked = true;
    } else {
      // Remove like
      const itemResult = await db.query(
        "SELECT likes FROM items WHERE item_id = $1",
        [itemId]
      );
      updatedLikes = Math.max(0, itemResult.rows[0].likes - 1); //avoid negative

      //remove from favorites table
      await db.query(
        "DELETE FROM favorites WHERE user_id = $1 AND item_id = $2",
        [userId, itemId]);

      //update item likes
      await db.query(
        "UPDATE items SET likes = $1 WHERE item_id = $2",
        [updatedLikes, itemId]
      );

      //update user likes received
      await manageLikesReceived(db, itemId, updatedLikes);

      isNowLiked = false;
    }

    return res.status(200).json({
      toggleSuccess: true,
      isLiked: isNowLiked,
      newLikeCount: updatedLikes
    });
  } catch (error) {
    console.error("Error toggling favorite:", error);
    return res.status(500).json({
      toggleSuccess: false,
      error: "Internal server error"
    });
  }
});



// Post Routes
app.post("/upload", upload.array('images', 3), async (req, res) => {
  if (req.isAuthenticated()) {
    try {    

      //retrieve form data for all categories
      const category = capitalizeFirst(req.query.category)
      const uploaderId = req.user?.userId;
      const uploaderUsername = req.user?.username;
      const uploaderEmail = req.user?.email;
      const uploaderPhoto = req.user?.photo;
      const {condition, description} = req.body;
      const uploadDate = formatLocalISO(); //upload date
      const files = req.files;
  
      // return if user didn't upload images
      if (!files || files.length === 0) {
        return res.status(400).json({ success: false, message: "No files uploaded" });
      }

       // Create new item in database
      const itemData = {
        category,
        condition,
        description,
        available: true,
        likes: 0,
        uploaderId,
        uploaderUsername,
        uploaderEmail,
        uploaderPhoto,
        uploadDate
      }
      const itemId = await saveItem(db, itemData)
      

      //INSERT INTO CATEGORY TABLE
      const categoryData = {
        req,
        itemId,
        category,
        uploaderPhoto
      }
      await insertCategoryDetails(db, categoryData);


      // Process each file and upload to cloudinary
      const uploadPromises = files.map(async (file) => {
        const mimeType = file.mimetype || file.type; // Get mimetype BEFORE converting to base64

        //save image without the url
        const imageData = {
          imageUrl: `awaiting image url on ${uploadDate}...`,
          publicId: `awaiting public id on ${uploadDate}...`,
          imageType: mimeType,  // Use the captured mimetype
          itemId: itemId
        };

        //retrieve imageId to make every saved image unique
        const imageId = await saveImage(db, imageData);

        const [formattedImageUrl, publicId] = await uploadToCloudinary(
          `data:${mimeType};base64,${file.buffer.toString('base64')}`,
          category,
          imageId
        );

        //update image with the formatted image url
        const updateData = {
          imageUrl: formattedImageUrl,
          imageId: imageId,
          publicId: publicId
        }

        await updateImage(db, updateData);

        return formattedImageUrl;
      });

      await Promise.all(uploadPromises);

      res.status(200).json({ 
        success: true,
        message: "Upload successful",
        itemId: itemId
      });

    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ 
        success: false,
        message: "Upload failed",
        error: error.message 
      });
    }
  } else {
    return res.status(401).json({ error: "Not authenticated" });
  }
});


app.post('/check-email', async (req, res) => {
  try {
    const { email } = req.body;
    // Basic validation
    if (!email) {
      return res.status(400).json({
        isValid: false,
        reason: "Email is required",
        confidence: "high"
      });
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(200).json({
        isValid: false,
        reason: "Please enter a valid email address",
        confidence: "high"
      });
    }

    // Check if email exists in the database
    const user = await getUserByEmail(db, email);
    if (user) {
      return res.status(200).json({
        isValid: false,
        reason: "Email is already registered. Please sign in",
        confidence: "high"
      });
    }

    // Email is available
    return res.status(200).json({
      isValid: true,
      reason: "Email is available for registration",
      confidence: "high"
    });
  } catch (error) {
    console.error('Error checking email:', error);
    res.status(500).json({
      isValid: false,
      reason: "Unable to verify email at this time",
      confidence: "low"
    });
  }
});


// Email verification routes
app.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, error: "No token provided" });
    }

    const tokenData = await verifyToken(db, token, 'email_verification');
    if (!tokenData) {
      return res.status(400).json({ success: false, error: "Invalid or expired token" });
    }

    await markTokenAsUsed(db, tokenData.tokenId);
    await verifyUserEmail(db, tokenData.userId);
    await deleteExpiredTokens(db);

    res.status(200).json({
      success: true,
      email: tokenData.email,
      message: "Email verified successfully"
    });
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});


app.post('/send-verification', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const { email, userName } = req.body;
    const userId = req.user?.userId;


    if (!email || !userName) {
      return res.status(400).json({ 
        success: false, 
        error: "Email and userName are required" 
      });
    }

    // Create verification token
    const token = await createVerificationToken(db, userId);
    
    // Create token verification URL route
    const verificationUrl = `${process.env.FRONTEND_URL}/email-verified?token=${token}`;
    
    // Render email template
    const emailHtml = await render(
      createElement(EmailVerificationEmail, {
        userName,
        verificationUrl,
        logoUrl: process.env.SHARESPHERE_LOGO_URL
      })
    );

    // Send email
    await sendEmail({
      to: email,
      subject: "Verify your email address - ShareSphere",
      html: emailHtml
    });

    res.status(200).json({
      success: true,
      message: "Verification email sent successfully"
    });
  } catch (error) {
    console.error('Error sending verification email:', error);
    res.status(500).json({
      success: false,
      error: "Failed to send verification email"
    });
  }
});


app.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    const tokenType = 'email_verification'

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        error: "Email is required" 
      });
    }

    // Get user by email
    const user = await getUserByEmail(db, email);
    const { userId } = user;
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    // Delete any existing verification tokens for this user
    await db.query(
      'DELETE FROM verification_tokens WHERE user_id = $1 AND token_type = $2',
      [userId, tokenType]
    );

    // Create new verification token
    const token = await createVerificationToken(db, userId);
    
    // Create verification URL
    const verificationUrl = `${process.env.FRONTEND_URL}/email-verified?token=${token}`;
    
    // Render email template
    const emailHtml = await render(
      createElement(EmailVerificationEmail, {
        userName: user.name,
        verificationUrl,
        logoUrl: process.env.SHARESPHERE_LOGO_URL
      })
    );

    // Send email
    await sendEmail({
      to: email,
      subject: "Verify your email address - ShareSphere",
      html: emailHtml
    });

    res.status(200).json({
      success: true,
      message: "Verification email sent successfully"
    });
  } catch (error) {
    console.error('Error resending verification email:', error);
    res.status(500).json({
      success: false,
      error: "Failed to resend verification email"
    });
  }
});


app.post('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;

    // Verify the token
    const tokenData = await verifyToken(db, token, 'email_verification');
    console.log(tokenData)
    
    if (!tokenData) {
      // Redirect to frontend with failure parameter
      return res.redirect(`${process.env.FRONTEND_URL}/email-verified?success=false&reason=invalid_or_expired`);
    }

    // Mark token as used
    await markTokenAsUsed(db, tokenData.tokenId);

    // Verify user's email
    await verifyUserEmail(db, tokenData.userId);

    // Clean up expired tokens
    await deleteExpiredTokens(db);

    // Redirect to frontend with success parameter
    res.redirect(`${process.env.FRONTEND_URL}/email-verified?success=true`);
  } catch (error) {
    console.error('Error verifying email:', error);
    res.redirect(`${process.env.FRONTEND_URL}/email-verified?success=false&reason=server_error`);
  }
});


app.get('/verification-status/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    const isVerified = await checkEmailVerificationStatus(db, email);
    
    if (isVerified === null) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      isVerified: isVerified
    });
  } catch (error) {
    console.error('Error checking verification status:', error);
    res.status(500).json({
      success: false,
      error: "Failed to check verification status"
    });
  }
});


// Send item request email
app.post('/send-request', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { 
      uploaderEmail, 
      requesterName, 
      requesterEmail, 
      message, 
      itemName,
      itemImage,
      itemCategory,
      itemCondition
    } = req.body;

    const emailHtml = await render(
    createElement(ItemRequestEmail, {
      uploaderEmail,
      requesterName,
      requesterEmail,
      message,
      itemName,
      itemImage,
      itemCategory,
      itemCondition,
      logoUrl: process.env.SHARESPHERE_LOGO_URL
    })
  );

    await sendEmail({
      to: uploaderEmail,
      subject: `New Request for Your ${itemName} ${itemCategory} on ShareSphere`,
      html: emailHtml
    });
    return res.status(200).json({ 
      success: true,
      message: 'Request email sent successfully'
    });
  } catch (error) {
    console.error('Error sending request email:', error);
    return res.status(500).json({ 
      success: false,
      message: error.response?.message || 'Failed to send request email'
    });
  }
});



// Report post route
app.post('/report-post', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const {
      reporterName,
      reporterEmail,
      reporterId,
      reportedUserName,
      reportedUserEmail,
      reportReason,
      reportDescription,
      itemName,
      itemImage,
      itemCategory,
      itemCondition
    } = req.body;

    // Render all email templates using createElement
    const adminEmailHtml = await render(
      createElement(AdminReportEmail, {
        reporterName,
        reporterEmail,
        reportedUserName,
        reportedUserEmail,
        reportReason,
        reportDescription,
        itemName,
        itemImage,
        itemCategory,
        itemCondition,
        logoUrl: process.env.SHARESPHERE_LOGO_URL
      })
    );

    const confirmationEmailHtml = await render(
      createElement(ReportConfirmationEmail, {
        reporterName,
        reporterEmail,
        reportedUserName,
        reportReason,
        itemName,
        itemImage,
        itemCategory,
        itemCondition,
        logoUrl: process.env.SHARESPHERE_LOGO_URL
      })
    );

    const warningEmailHtml = await render(
      createElement(WarningEmail, {
        reportedUserName,
        reportedUserEmail,
        reportReason,
        itemName,
        itemImage,
        itemCategory,
        itemCondition,
        logoUrl: process.env.SHARESPHERE_LOGO_URL
      })
    );

    // Send emails
    await sendEmail({
      to: process.env.APP_USERNAME,
      subject: `User Report: ${itemName} (${itemCategory}) flagged on ShareSphere`,
      html: adminEmailHtml
    });

    await sendEmail({
      to: reporterEmail,
      subject: `We Received Your Report on ${reportedUserName}`,
      html: confirmationEmailHtml
    });

    await sendEmail({
      to: reportedUserEmail,
      subject: '⚠️ Warning: Your ShareSphere post has been reported',
      html: warningEmailHtml
    });

    //save report to database after sending emails
    const {newReport, alreadyReported} = await saveReport(db, req.body)

    return res.status(200).json({
      reportSuccess: true,
      report: newReport,
      alreadyReported: alreadyReported,
      message: 'Report and warning emails sent successfully'
    });
  } catch (error) {
    console.error('Error sending report emails:', error);
    return res.status(500).json({
      reportSuccess: false,
      message: error.response?.message || 'Failed to send report or warning email'
    });
  }
});


// Review Routes
// Get reviews given by user
app.get("/reviews/:type/:userId", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const { type, userId } = req.params;

  if (type === "given") {
    //reviews given by user
    const reviews = await db.query("SELECT * FROM reviews WHERE reviewer_id = $1", [userId]);

    res.json({
      success: true,
      reviews: toCamelCase(reviews.rows),
      message: "Reviews given by user retrieved successfully"
    });
  } else {
    //reviews received by user
    const reviews = await db.query("SELECT * FROM reviews WHERE reviewed_user_id = $1", [userId]); //reviews received by user
    res.json({
      success: true,
      reviews: toCamelCase(reviews.rows),
      message: "Reviews received by user retrieved successfully"
    });
  }
});


app.post("/reviews", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const reviewData = req.body;
    console.log(reviewData)

    const review = await postReview(db, reviewData); //save review to database

    return res.status(200).json({
      reviewSuccess: true,
      message: "Review saved successfully",
      review: toCamelCase(review)
    });
  } catch (error) {
    console.error('Error saving review:', error);
    return res.status(500).json({
      reviewSuccess: false,
      message: error.message || 'Failed to save review'
    });
  }
});


app.patch("/reviews/update/:reviewId", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const { reviewId } = req.params;

    const reviewData = {
      rating: req.body.rating,
      comment: req.body.comment,
      reviewId: reviewId
    };

    //update review in database
    const review = await updateReview(db, reviewData);

    return res.status(200).json({
      reviewSuccess: true,
      message: "Review updated successfully",
      review: toCamelCase(review)
    });
  } catch (error) {
    console.error('Error updating review:', error);
    return res.status(500).json({
      reviewSuccess: false,
      message: error.message || 'Failed to update review'
    });
  }
});


// Delete review
app.delete("/reviews/:reviewId", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const { reviewId } = req.params;
    const userId = req.user?.userId;

    // Check if the review exists and belongs to the authenticated user
    const reviewCheck = await db.query(
      "SELECT * FROM reviews WHERE review_id = $1 AND reviewer_id = $2",
      [reviewId, userId]
    );

    if (reviewCheck.rows.length === 0) {
      return res.status(404).json({
        deleteSuccess: false,
        message: "Review not found or you don't have permission to delete it"
      });
    }

    // Delete the review
    await db.query("DELETE FROM reviews WHERE review_id = $1", [reviewId]);

    return res.status(200).json({
      deleteSuccess: true,
      message: "Review deleted successfully"
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    return res.status(500).json({
      deleteSuccess: false,
      message: error.message || 'Failed to delete review'
    });
  }
});



app.post("/change-availability", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const {itemId, itemCategory, newAvailability} = req.body;
  let tableName;

  switch (itemCategory) {
    case 'Book':
      tableName = 'books'
      break;
    default:
      tableName = itemCategory.toLowerCase();
      break;
  }

  try {
    //update items table
    await db.query(`UPDATE items SET available = $1 WHERE item_id = $2`, [newAvailability, itemId])
    //update category table
    await db.query(`UPDATE ${tableName} SET available = $1 WHERE item_id = $2`, [newAvailability, itemId])

    res.status(200).json({
      success: true,
      message: "Availability updated successfully"
    });

  } catch (error) {
    console.error("Could not update availability:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update availability"
    });
  }
});


// Register New User
app.post("/register", async (req, res) => {
  try {
    const userData = req.body;
    const user = await registerUser(db, userData);
    const userId = user?.userId;
    console.log("user registered successfully")

    if (user) {
      // Log in the user after registration
      req.login(user, (err) => {
        if (err) {
          console.log(err)
          return res.status(500).json({
            registerSuccess: false,
            message: "Registration successful but login failed"
          });
        }
        res.redirect("/auth/user");
      });
    } else {
      res.status(400).json({
        registerSuccess: false,
        message: "User registration failed. Please try again."
      });
    }
  } catch (error) {
    console.error("Registration error:", error);
    res.status(400).json({
      registerSuccess: false,
      message: error.message || "User registration failed. Please try again."
    });
  }
})

 // Login Existing User using Passport
 app.post("/login", (req, res, next) => {
  passport.authenticate('local', async (err, user, info) => {
    if (err) {
      console.error('Passport error:', err);
      return next(err);
    }

    if (!user) {
      console.log('Login failed:', info?.message || 'no user found');
      return res.json({
        authSuccess: false,
        message: info?.message || 'no user found',
        user: null
      });
    }

    // Check if email is verified for credential-based users
    if (user.strategy === 'credentials') {
      try {
        const isVerified = await checkEmailVerificationStatus(db, user.email);
        if (!isVerified) {
          return res.json({
            authSuccess: false,
            message: "Please verify your email address before signing in",
            user: null,
            requiresVerification: true
          });
        }
      } catch (error) {
        console.error('Error checking email verification:', error);
        // Continue with login if verification check fails
      }
    }

    // Log the user in
    req.login(user, (err) => {
      if (err) {
        console.error('Login error:', err);
        return next(err);
      }
      console.log('Login successful for user:', user.username);
      return res.redirect("/auth/user");
    });
  })(req, res, next);
});


// Logout user and terminate session
app.post("/logout/user", (req, res) => {
  if (req.isAuthenticated()) {
    console.log("Starting logout")
    req.logout(function (err) {
      if (err) {
        console.log(err)
        return next(err);
      }
      //send logout data to front end
      res.status(200).json({
        logoutSuccess: true,
        message: "User logged out successfully",
        user: null
      })
    });
  }
});

app.delete("/items/:itemId/:itemCategory", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    console.log("Deletion requested")
    const { itemId, itemCategory } = req.params;
    const tableName = getTableName(itemCategory);

    await deletePost(db, itemId, tableName);

    res.status(200).json({
      deleteSuccess: true, 
      message: `Removed post #${itemId} in category: ${itemCategory}` 
    });

  } catch (error) {
    console.error("Failed to delete post:", error);
    res.status(500).json({ 
      deleteSuccess: false,
      error: "Internal server error" 
    });
  }
});


// LISTENING FOR EVENTS
app.listen(port, () => {
  console.log(`Listening on port ${port}`)
});

