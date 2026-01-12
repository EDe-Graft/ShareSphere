import { Strategy as LocalStrategy } from "passport-local";
import GoogleStrategy from "passport-google-oauth2";
import GitHubStrategy from "passport-github2"; //  import GitHub strategy
import bcrypt from "bcrypt";
import { generateUniqueUsername } from "./database-utils.js";
import { formatLocalISO, toCamelCase } from "./format.js";


export function configurePassport(passport, db) {
  // LOCAL STRATEGY
  passport.use("local", new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, async (email, password, cb) => {
    try {
      console.log("local strategy activated");
      const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);

      if (result.rows.length > 0) {
        const user = result.rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (user.strategy != 'credentials') {
          return cb(null, false, {message: 'incorrect authentication method'})
        }

        if (passwordMatch) {
          // Check if email is verified before allowing login
          if (!user.email_verified) {
            console.log("Email not verified for user:", email);
            return cb(null, false, { message: 'email not verified' });
          }

          console.log(user)
          return cb(null, toCamelCase(user));
        } else {
          return cb(null, false, { message: 'incorrect password' });
        }
      } else {
        return cb(null, false, { message: 'no user found' });
      }
    } catch (error) {
      return cb(error);
    }
  }));


  // GOOGLE STRATEGY
  passport.use("google", new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    userProfileURL: process.env.USER_PROFILE_URL
  }, async function(accessToken, refreshToken, profile, cb) {
    try {
      console.log("=== Google Strategy Initiated ===");
      console.log("Profile received:", {
        id: profile.id,
        displayName: profile.displayName,
        email: profile.email
      });

      //initialize variables for user profile
      let userId;
      let username;
      let name = profile.displayName;
      let password = "google";
      let email = profile.email;
      let authStrategy = "google";
      let photo;
      let photoPublicId = null;
      let profileUrl = profile.profileUrl || null;
      let location;
      let bio;
      let joinedOn;

      //initialize variables for user stats
      let likesReceived;
      let postsCount;
      let activePostsCount;
      let inactivePostsCount;
      let reviewCount;
      let reviewsGiven;
      let reviewsReceived;
      let reportCount;
      let averageRating;

      console.log("Checking if Google user exists in database:", email);
      //check if user exists
      const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);

      //if user does not exist, create new user
      if (result.rows.length === 0) {
        console.log("✓ New Google user - creating account");

        // Generate a unique username
        username = await generateUniqueUsername(db, name)
        console.log("Generated username:", username);


        //initialize variables for user profile
        joinedOn = formatLocalISO().slice(0,10);
        photo = profile.picture;
        location = 'USA';
        bio = `Hi, I'm ${name}!`;

        let emailVerified = true;
        let emailVerifiedAt = formatLocalISO().slice(0, 10);

        //initialize variables for user stats
        likesReceived = 0;
        postsCount = 0;
        activePostsCount = 0;
        inactivePostsCount = 0;
        reviewCount = 0;
        reviewsGiven = 0;
        reviewsReceived = 0;
        reportCount = 0;
        averageRating = 0;

        console.log("Inserting new Google user into database...");
        //insert new user into users table
        const newUserResults = await db.query(
          "INSERT INTO users (username, name, email, password, strategy, photo, photo_public_id, profile_url, location, joined_on, bio, email_verified, email_verified_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *",
          [username, name, email, password, authStrategy, photo, photoPublicId, profileUrl, location, joinedOn, bio, emailVerified, emailVerifiedAt]
        );

        //get new user from result
        const newUser = toCamelCase(newUserResults.rows[0]);
        console.log("✓ Google user created successfully with ID:", newUser.userId);

        //get user id to insert into user_stats table
        userId = newUser.userId;

        console.log("Creating user stats...");
        //insert new user stats into user_stats table
        const newUserStats = await db.query(
          "INSERT INTO user_stats (user_id, likes_received, posts_count, active_posts_count, inactive_posts_count, review_count, reviews_given, reviews_received, report_count, average_rating) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
          [userId, likesReceived, postsCount, activePostsCount, inactivePostsCount, reviewCount, reviewsGiven, reviewsReceived, reportCount, averageRating]
        );
        console.log("✓ User stats created");

        //update user profile with new user profile data and stats
        username = newUser.username;
        joinedOn = newUser.joinedOn;
        authStrategy = newUser.strategy;
        location = newUser.locaton;
        photo = newUser.photo;
        photoPublicId = newUser.photoPublicId;
        bio = newUser.bio;
      } else {
        console.log("✓ Existing Google user found - loading profile");
        //get user from result
        const user = toCamelCase(result.rows[0]);

        //if user exists, update user profile with existing user profile data
        userId = user.userId;
        username = user.username;
        joinedOn = user.joinedOn;
        authStrategy = user.strategy;
        location = user.location;
        photo = user.photo;
        photoPublicId = user.photoPublicId;
        bio = user.bio;
        console.log("Loaded user ID:", userId, "Username:", username);
      }

      //create profile object
      profile.userId = userId;
      profile.name = name;
      profile.username = username;
      profile.photo = photo;
      profile.authStrategy = authStrategy;
      profile.joinedOn = joinedOn;
      profile.location = location;
      profile.photoPublicId = photoPublicId;
      profile.bio = bio;

      console.log("✓ Google authentication successful for:", email);
      console.log("=== Google Strategy Complete ===\n");

      //return profile object
      cb(null, profile);
    } catch (error) {
      console.error("❌ Error in Google strategy:", error);
      cb(error);
    }
  }));


  // ✅ GITHUB STRATEGY
  passport.use("github", new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL,
    passReqToCallback: true
  }, async (req, accessToken, refreshToken, profile, cb) => {
    try {
      console.log("=== GitHub Strategy Initiated ===");
      console.log("Profile received:", {
        id: profile.id,
        displayName: profile.displayName,
        username: profile.username,
        profileUrl: profile.profileUrl
      });

      //initialize variables for user profile
      let email;
      let emailVerified = false;
      let emailVerifiedAt = null;
      let userId;
      let username;
      let name = profile.displayName;
      let password = "github";
      let photo;
      let photoPublicId = null;
      let authStrategy = "github";
      let profileUrl = profile.profileUrl || null;
      let location;
      let joinedOn;
      let bio;

      //initialize variables for user stats
      let likesReceived;
      let postsCount;
      let activePostsCount;
      let inactivePostsCount;
      let reviewCount;
      let reviewsGiven;
      let reviewsReceived;
      let reportCount;
      let averageRating;

      console.log("Checking if GitHub user exists by profile_url:", profileUrl);
      //check if user exists
      const result = await db.query("SELECT * FROM users WHERE profile_url = $1", [profileUrl]);

      //if user does not exist, create new user
      if (result.rows.length === 0) {
        console.log("✓ New GitHub user - creating account");

        // Generate a unique username
        username = await generateUniqueUsername(db, name)
        console.log("Generated username:", username);

        //initialize variables for user stats
        joinedOn = formatLocalISO().slice(0,10);
        photo = profile.photos?.[0]?.value;
        location = `USA`;
        bio = `Hi, I'm ${name}!`;

        reviewCount = 0;
        postsCount = 0;
        activePostsCount = 0;
        inactivePostsCount = 0;
        likesReceived = 0;
        reviewsGiven = 0;
        reviewsReceived = 0;
        reportCount = 0;
        averageRating = 0;

        console.log("Inserting new GitHub user into database...");
        console.log("- Email:", email || "(no email)");
        console.log("- Email verified:", emailVerified);

        //insert new user into users table
        const newUserResults = await db.query(
          "INSERT INTO users (username, name, email, password, strategy, photo, photo_public_id, profile_url, location, joined_on, bio, email_verified, email_verified_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *",
          [username, name, email, password, authStrategy, photo, photoPublicId, profileUrl, location, joinedOn, bio, emailVerified, emailVerifiedAt]
        );

        //get new user from result
        const newUser = toCamelCase(newUserResults.rows[0]);
        console.log("✓ GitHub user created successfully with ID:", newUser.userId);

        //get user id to insert into user_stats table
        userId = newUser.userId;

        console.log("Creating user stats...");
        //insert new user stats into user_stats table
        const newUserStats = await db.query(
          "INSERT INTO user_stats (user_id, likes_received, posts_count, active_posts_count, inactive_posts_count, review_count, reviews_given, reviews_received, report_count, average_rating) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
          [userId, likesReceived, postsCount, activePostsCount, inactivePostsCount, reviewCount, reviewsGiven, reviewsReceived, reportCount, averageRating]
        );
        console.log("✓ User stats created");

        //update user profile with new user profile data
        name = newUser.name;
        email = newUser.email;
        authStrategy = newUser.strategy
        joinedOn = newUser.joinedOn;
        location = newUser.location;
        photo = newUser.photo;
        photoPublicId = newUser.photoPublicId;
        bio = newUser.bio;
      } else {
        console.log("✓ Existing GitHub user found - loading profile");

        //get user from result
        const user = toCamelCase(result.rows[0]);
        //if user exists, update user profile with existing user profile data
        userId = user.userId;
        email = user.email;
        name = user.name;
        emailVerified = user.emailVerified;
        emailVerifiedAt = user.emailVerifiedAt;
        authStrategy = user.strategy;
        joinedOn = user.joinedOn;
        location = user.location;
        photo = user.photo;
        photoPublicId = user.photoPublicId;
        bio = user.bio;

        console.log("Loaded user ID:", userId);
        console.log("Current email in DB:", email);
        console.log("Email verified status:", emailVerified);
      }

      // Check if email is provided and verified before allowing login
      console.log("\nValidating email requirements...");
      if (!email) {
        console.log("❌ No email provided for GitHub user:", name);
        console.log("=== GitHub Strategy Incomplete - Email Required ===\n");
        return cb(null, false, { message: 'email required', profileUrl: profileUrl });
      }
      console.log("✓ Email present:", email);

      if (!emailVerified) {
        console.log("❌ Email not verified for GitHub user:", email);
        console.log("=== GitHub Strategy Incomplete - Email Verification Required ===\n");
        return cb(null, false, { message: 'email not verified' });
      }
      console.log("✓ Email verified");

      console.log("\nBuilding profile object...");
      //create profile object
      profile.userId = userId;
      profile.email = email;
      profile.emailVerified = emailVerified;
      profile.emailVerifiedAt = emailVerifiedAt;
      profile.photo = photo;
      profile.photoPublicId = photoPublicId;
      profile.name = name;
      profile.joinedOn = joinedOn;
      profile.authStrategy = authStrategy;
      profile.location = location;
      profile.bio = bio;

      console.log("✓ GitHub authentication successful for:", email);
      console.log("✓ User ID:", userId, "| Name:", name);
      console.log("=== GitHub Strategy Complete ===\n");

      //return profile object
      cb(null, profile);
    } catch (error) {
      console.error("❌ Error in GitHub strategy:", error);
      console.error("Error stack:", error.stack);
      console.log("=== GitHub Strategy Failed ===\n");
      cb(error);
    }
  }));

  // SERIALIZATION
  passport.serializeUser((user, cb) => cb(null, user));
  passport.deserializeUser((user, cb) => cb(null, user));
}
