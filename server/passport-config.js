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

        if (passwordMatch) {
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

      //check if user exists
      const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);

      //if user does not exist, create new user
      if (result.rows.length === 0) {
        // Generate a unique username
        username = await generateUniqueUsername(db, name)

        //initialize variables for user profile
        joinedOn = formatLocalISO()
        photo = profile.picture;
        location = 'USA';
        bio = `Hi, I'm ${name}!`;

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
        

        //insert new user into users table
        const newUserResults = await db.query(
          "INSERT INTO users (username, name, email, password, strategy, photo, photo_public_id, profile_url, location, joined_on, bio) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *",
          [username, name, email, password, authStrategy, photo, photoPublicId, profileUrl, location, joinedOn, bio]
        );

        //get new user from result
        const newUser = newUserResults.rows[0];

        //get user id to insert into user_stats table
        userId = newUser.user_id;

        //insert new user stats into user_stats table
        const newUserStats = await db.query(
          "INSERT INTO user_stats (user_id, likes_received, posts_count, active_posts_count, inactive_posts_count, review_count, reviews_given, reviews_received, report_count, average_rating) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
          [userId, likesReceived, postsCount, activePostsCount, inactivePostsCount, reviewCount, reviewsGiven, reviewsReceived, reportCount, averageRating]
        );

        //update user profile with new user profile data and stats
        username = newUser.username;
        joinedOn = newUser.joined_on;
        authStrategy = newUser.strategy;
        location = newUser.locaton;
        photo = newUser.photo;
        photoPublicId = newUser.photoPublicId;
        bio = newUser.bio;
      } else {
        //get user from result
        const user = result.rows[0];

        //if user exists, update user profile with existing user profile data
        userId = user.user_id;
        username = user.username;
        joinedOn = user.joined_on;
        authStrategy = user.strategy;
        location = user.location;
        photo = user.photo;
        photoPublicId = user.photoPublicId;
        bio = user.bio;
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

      //return profile object
      cb(null, profile);
    } catch (error) {
      console.error("Error in Google strategy:", error);
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
      //initialize variables for user profile
      let email;
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

      //check if profile url is valid
      profileUrl = profile.profileUrl || null;
      if (!profileUrl) return cb(null, false, { message: "No profile found" });

      //log that the strategy is activated
      console.log("GitHub strategy activated");

      //check if user exists
      const result = await db.query("SELECT * FROM users WHERE profile_url = $1", [profileUrl]);

      //if user does not exist, create new user
      if (result.rows.length === 0) {
        // Generate a unique username
        username = await generateUniqueUsername(db, name)

        //get email from state or profile
        const state = req.query?.state;
        email = state?.email || profile.email || null;

        //initialize variables for user stats
        joinedOn = formatLocalISO();
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

        //insert new user into users table
        const newUserResults = await db.query(
          "INSERT INTO users (username, name, email, password, strategy, photo, photo_public_id, profile_url, location, joined_on, bio) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *",
          [username, name, email, password, authStrategy, photo, photoPublicId, profileUrl, location, joinedOn, bio]
        );

        //get new user from result
        const newUser = newUserResults.rows[0];

        //get user id to insert into user_stats table
        userId = newUser.user_id;

        //insert new user stats into user_stats table
        const newUserStats = await db.query(
          "INSERT INTO user_stats (user_id, likes_received, posts_count, active_posts_count, inactive_posts_count, review_count, reviews_given, reviews_received, report_count, average_rating) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
          [userId, likesReceived, postsCount, activePostsCount, inactivePostsCount, reviewCount, reviewsGiven, reviewsReceived, reportCount, averageRating]
        );

        //update user profile with new user profile data
        name = newUser.name;
        email = newUser.email;
        authStrategy = newUser.strategy
        joinedOn = newUser.joined_on;
        location = newUser.location;
        photo = newUser.photo;
        photoPublicId = newUser.photoPublicId;
        bio = newUser.bio;
      } else {
        //get user from result
        const user = result.rows[0];

        //if user exists, update user profile with existing user profile data
        userId = user.user_id;
        name = user.name;
        email = user.email;
        authStrategy = user.strategy;
        joinedOn = user.joined_on;
        location = user.location;
        photo = user.photo;
        photoPublicId = user.photoPublicId;
        bio = user.bio;
      }

      //create profile object
      profile.userId = userId;
      profile.email = email;
      profile.photo = photo;
      profile.photoPublicId = photoPublicId;
      profile.name = name;
      profile.joinedOn = joinedOn;
      profile.authStrategy = authStrategy;
      profile.location = location;
      profile.bio = bio;

      //return profile object
      cb(null, profile);
    } catch (error) {
      console.error("Error in GitHub strategy:", error);
      cb(error);
    }
  }));

  // SERIALIZATION
  passport.serializeUser((user, cb) => cb(null, user));
  passport.deserializeUser((user, cb) => cb(null, user));
}
