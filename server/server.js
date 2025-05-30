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
import { configurePassport } from "./passport-config.js";
import { uploadToCloudinary, saveItem, saveImage, updateImage, insertCategoryDetails, getTableName, getImages, getLikes, deletePost } from './database-utils.js';
import { formatLocalISO, capitalizeFirst, toCamelCase, toSnakeCase } from "./format.js";

// Express-app and environment creation
const app = express();
const port = 3000;
const saltRounds = 10;

env.config();

// Database Connection
const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

db.connect();

// Initialize passport
configurePassport(passport, db);

// ... rest of middleware setup 
app.use(
  session({
    name: "cookie1",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false, // Set to true if using HTTPS
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.BACKEND_URL, //backend origin
  process.env.GOOGLE_OAUTH_DOMAIN // Google OAuth domain
];

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};


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

app.use(cors(corsOptions));
app.use(passport.initialize());
app.use(passport.session());


//Routes
//For credentials auth success/failure
app.get('/auth/user', (req, res) => {
  if (req.isAuthenticated()) {
    console.log("User requested: " + req.user)
    res.status(200).json({
      authSuccess: req.isAuthenticated(),
      message: 'User Logged In', 
      user: toCamelCase(req.user) 
    });
    console.log("User data sent")
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
app.get("/auth/github", passport.authenticate("github",
  {scope: ['user:email']}
))

app.get("/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/auth/failure" }),
  (req, res) => {
    // Successful auth
    res.redirect("/auth/success");
  }
);


//retrieve requested item type from database
app.get("/items", async (req, res) => {
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


app.get("/user-posts", async (req, res) => {
  const userId = req.user?.user_id

  try {
    //get all posted item ids by user from items table
  const postedResults = await db.query("SELECT item_id, category FROM items WHERE uploader_id = $1", [userId])
  
  if (postedResults.rowCount === 0) {
    //no items posted
    res.json({
      success: true,
      posts: []
    })
  }

  else {
    //user has posted items
    const postedData = postedResults.rows.map(item => item)
    //get posted items data from respective tables

    const userPosts = await Promise.all(
      postedData.map(async (data) => {
        const itemId = data.item_id
        const itemCategory = data.category

        const tableName = getTableName(itemCategory)

        const postResult = await db.query(`SELECT * FROM ${tableName} WHERE item_id = $1`, [itemId])
        const post = postResult.rows[0]

        //fetch post images
       const images = await getImages(db, itemId)
        //get likeCount for post
        const likes = await getLikes(db, itemId)

        //convert keys to camelCase before returning object
        return toCamelCase({
          ...post,
          images: images,
          displayImage: images[0],
          likes: likes
        });
      })
    )
     
    res.json({
      success: true,
      posts: userPosts
    })
  }
  } catch (error) {
    console.error("Error: " + error);
  }
  
});


app.post("/update-post", async (req, res) => {
  const updateData = req.body.updateData;
  console.log(updateData)
  const convertedData = toSnakeCase(updateData);
  const { item_id: itemId, item_category: itemCategory } = convertedData;
  let tableName = getTableName(itemCategory);

  // Track original camelCase fields for response
  const camelCaseFields = Object.keys(updateData).filter(
    key => !['itemId', 'itemCategory'].includes(key)
  );

  try {
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
    Object.entries(convertedData).forEach(([key, value]) => {
      // Skip identifiers
      if (key === 'item_id' || key === 'item_category') return;

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

    // Check if any updates occurred
    if (camelCaseFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    res.status(200).json({
      updateSuccess: true,
      updatedFields: camelCaseFields
    });

  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    });
  }
});


app.delete("/items/:itemId/:itemCategory", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
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



app.get("/favorites", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const userId = req.user.user_id;
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

  const userId = req.user.user_id;
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
      // Add to favorites
      const itemResult = await db.query(
        "SELECT category, likes FROM items WHERE item_id = $1",
        [itemId]
      );
      const itemCategory = itemResult.rows[0].category;
      updatedLikes = itemResult.rows[0].likes + 1;

      await db.query(
        "INSERT INTO favorites (user_id, item_id, item_category) VALUES ($1, $2, $3)",
        [userId, itemId, itemCategory]
      );

      await db.query(
        "UPDATE items SET likes = $1 WHERE item_id = $2",
        [updatedLikes, itemId]
      );

      isNowLiked = true;
    } else {
      // Remove from favorites
      const itemResult = await db.query(
        "SELECT likes FROM items WHERE item_id = $1",
        [itemId]
      );
      updatedLikes = Math.max(0, itemResult.rows[0].likes - 1); //avoid negative

      await db.query(
        "DELETE FROM favorites WHERE user_id = $1 AND item_id = $2",
        [userId, itemId]
      );

      await db.query(
        "UPDATE items SET likes = $1 WHERE item_id = $2",
        [updatedLikes, itemId]
      );

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
      console.log("Form data:", req.body); // This will contain all your form fields
      console.log("Files:", req.files);  // This will contain the uploaded files      

      //retrieve form data for all categories
      const category = capitalizeFirst(req.query.category)
      const uploaderId = req.user?.user_id;
      const uploaderEmail = req.user?.email;
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
        uploaderEmail,
        uploadDate
      }
      const itemId = await saveItem(db, itemData)
      

      //INSERT INTO CATEGORY TABLE
      const categoryData = {
        req,
        itemId,
        category,
        uploadDate
      }
      await insertCategoryDetails(db, categoryData);


      // Process each file and upload to cloudinary
      const uploadPromises = files.map(async (file) => {
        const mimeType = file.mimetype || file.type; // Get mimetype BEFORE converting to base64

        //save image without the url
        const imageData = {
          imageUrl: `awaiting image url on ${uploadDate}...`,
          imageType: mimeType,  // Use the captured mimetype
          itemId: itemId
        };

        //retrieve imageId to make every saved image unique
        const imageId = await saveImage(db, imageData);

        const formattedImageUrl = await uploadToCloudinary(
          `data:${mimeType};base64,${file.buffer.toString('base64')}`,
          category,
          imageId
        );

        //update image with the formatted image url
        const updateData = {
          imageUrl: formattedImageUrl,
          imageId: imageId,
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


// Send email to uploader
app.post("/send-request", async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log("Logo URL:", process.env.SHARESPHERE_LOGO_URL);
    
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

    const currentYear = new Date().getFullYear();

    // Create a Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail', // or your email service
      auth: {
        user: process.env.APP_USERNAME,
        pass: process.env.APP_PASSWORD,
      },
    });

    // Email options
    const mailOptions = {
      from: `"ShareSphere" <${process.env.APP_USERNAME}>`,
      to: uploaderEmail,
      subject: `New Request for Your ${itemName} ${itemCategory} on ShareSphere`,
      text: `You have a new request for your ${itemName} ${itemCategory} on ShareSphere.\n\n
             Requester Details:
             Name: ${requesterName}
             Email: ${requesterEmail}
             
             Message:
             ${message}
             
             Please respond to the requester directly to arrange pickup/delivery.`,
      html: `
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f5f5; color: #333333;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5">
                <tr>
                  <td style="padding: 20px 0">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05)">
                      
                      <!-- Header with Logo -->
                      <tr>
                        <td style="background-color: #ffffff; padding: 10px 20px; text-align: center;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="text-align: center">
                                <img src="${process.env.SHARESPHERE_LOGO_URL}?height=40&width=120&query=ShareSphere+Logo" 
                                    alt="ShareSphere" 
                                    width="120"  
                                    style="display: block; margin: 0 auto"/>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <!-- Main Content -->
                      <tr>
                        <td style="padding: 15px">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            
                            <!-- Title -->
                            <tr>
                              <td>
                                <h2 style="color: #4f46e5; margin-top: 0; margin-bottom: 20px; font-size: 22px;">
                                  New Request for Your ${itemName} ${itemCategory}
                                </h2>
                                <p style="font-size: 16px; line-height: 1.5; margin-bottom: 25px;">
                                  Someone is interested in your item on ShareSphere! Please review the details below.
                                </p>
                              </td>
                            </tr>

                            <!-- Item Info with Image -->
                            <tr>
                              <td style="padding-bottom: 25px">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f9fafb; border-radius: 8px; border-left: 4px solid #4f46e5;">
                                  <tr>
                                    <td style="padding: 15px">
                                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                        <tr>
                                          <!-- Item Image -->
                                          <td width="150" style="vertical-align: top; padding-right: 15px;">
                                            <img src="${itemImage || 'https://placeholder.svg?height=150&width=150&query=No+Image+Available'}" 
                                                alt="${itemName}" 
                                                width="150" 
                                                style="display: block; border-radius: 6px; border: 1px solid #e5e7eb; max-width: 100%; height: auto;"/>
                                          </td>
                                          
                                          <!-- Item Details -->
                                          <td style="vertical-align: top">
                                            <h3 style="margin-top: 0; margin-bottom: 10px; color: #111827; font-size: 18px;">
                                              ${itemName}
                                            </h3>
                                            <p style="margin: 0; color: #4b5563; font-size: 14px;">
                                              Category: ${itemCategory || 'Not specified'}
                                            </p>
                                            <p style="margin: 5px 0 0; color: #4b5563; font-size: 14px;">
                                              Condition: ${itemCondition || 'Not specified'}
                                            </p>
                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>

                            <!-- Requester Details -->
                            <tr>
                              <td style="padding-bottom: 25px">
                                <h3 style="color: #4f46e5; margin-top: 0; margin-bottom: 15px; font-size: 18px;">
                                  Requester Details
                                </h3>
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f9fafb; border-radius: 8px">
                                  <tr>
                                    <td style="padding: 15px">
                                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                        <tr>
                                          <td width="100" style="font-weight: bold; padding-bottom: 8px">Name:</td>
                                          <td style="padding-bottom: 8px">${requesterName}</td>
                                        </tr>
                                        <tr>
                                          <td width="100" style="font-weight: bold">Email:</td>
                                          <td>
                                            <a href="mailto:${requesterEmail}" style="color: #4f46e5; text-decoration: none;">
                                              ${requesterEmail}
                                            </a>
                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>

                            <!-- Message -->
                            <tr>
                              <td style="padding-bottom: 25px">
                                <h3 style="color: #4f46e5; margin-top: 0; margin-bottom: 15px; font-size: 18px;">
                                  Message from ${requesterName}
                                </h3>
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                  <tr>
                                    <td style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; font-size: 15px; line-height: 1.6;">
                                      ${message.replace(/\n/g, '<br />')}
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>

                            <!-- Action -->
                            <tr>
                              <td style="padding-bottom: 25px">
                                <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
                                  Please respond to the requester directly to arrange pickup/delivery.
                                </p>
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                  <tr>
                                    <td style="background-color: #4f46e5; border-radius: 6px;">
                                      <a href="mailto:${requesterEmail}?subject=Regarding your request for ${itemName}" 
                                        style="display: inline-block; padding: 12px 24px; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 16px;">
                                        Reply to ${requesterName}
                                      </a>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <!-- Footer -->
                      <tr>
                        <td style="padding: 20px 30px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <!-- Logo in Footer -->
                            <tr>
                              <td style="text-align: center; padding-bottom: 20px">
                                <img src="${process.env.SHARESPHERE_LOGO_URL}?height=40&width=120&query=ShareSphere+Logo" 
                                    alt="ShareSphere" 
                                    width="120"  
                                    style="display: block; margin: 0 auto"/>
                              </td>
                            </tr>
                            <tr>
                              <td style="text-align: center; padding-bottom: 15px">
                                <p style="margin: 0; font-size: 14px; color: #6b7280">
                                  This email was sent via ShareSphere. Do not reply to this email.
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td style="text-align: center">
                                <p style="margin: 0; font-size: 14px; color: #6b7280">
                                  © ${currentYear} ShareSphere. All rights reserved.
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            `
    };

    // Send email
    await transporter.sendMail(mailOptions);
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
})

app.post("/change-availability", async (req, res) => {
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
    await db.query(`UPDATE items SET available to $1  WHERE item_id = $2`, [newAvailability, itemId])
    //updata category table
    await db.query(`UPDATE ${tableName} SET available to $1  WHERE item_id = $2`, [newAvailability, itemId])

  } catch (error) {
    console.log("Could not update availability")
  }
});


// Register New User
app.post("/register", async (req, res) => {
    const {displayName, email, password, confirmPassword} = req.body;
    console.log(req.body)

   if (password === confirmPassword) {
    try {
      const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [
          email,
      ]);
  
      if (checkResult.rows.length > 0) {
          console.log("User already exists")
          res.status(200).send({message: `User wih credentials ${req.body} already exists. Please Login`});
      } else {
          bcrypt.hash(password, saltRounds, async (err, hash) => {
          if (err) {
              console.error("Error hashing password:", err);
          } else {
              const result = await db.query(
              "INSERT INTO users (name, email, password, strategy) VALUES ($1, $2, $3, $4) RETURNING *",
              [displayName, email, hash, "credentials"]
              );
              const user = result.rows[0];
              console.log(user);

               // Log in the user after registration
              req.login(user, (err) => {
                if (err) {console.log(error)}

                res.redirect("/auth/user"); //verify login success or failure
              });
          }
          });
      }
  } catch (err) {
      console.log(err)
  }
} else {
  res.status(400).send({message: 'Error: Passwords do not match'})
}    
})

 // Login Existing User using Passport
 app.post("/login", (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
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


// LISTENING FOR EVENTS
app.listen(port, () => {
  console.log(`Listening on port ${port}`)
});

