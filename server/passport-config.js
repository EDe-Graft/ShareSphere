import { Strategy as LocalStrategy } from "passport-local";
import GoogleStrategy from "passport-google-oauth2";
import GitHubStrategy from "passport-github2"; //  import GitHub strategy
import bcrypt from "bcrypt";
import { generateUniqueUsername } from "./database-utils.js";
import { formatLocalISO } from "./format.js";


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
          return cb(null, user);
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
      console.log("Google strategy activated");
      const result = await db.query("SELECT * FROM users WHERE email = $1", [profile.email]);
      let userId;
      let username;
      let authStrategy;
      let joinedOn;

      let name = profile.displayName;
      let photo = profile.picture;

      let postsCount;
      let activePostsCount;
      let inactivePostsCount;
      let likesReceived;
      let reviewCount;
      let reportCount;
      let averageRating;
      let bio;

      if (result.rows.length === 0) {
        // Generate a unique username
        username = await generateUniqueUsername(db, name)
        authStrategy = "google";
        let password = "google";
        postsCount = 0;
        activePostsCount = 0;
        inactivePostsCount = 0;
        likesReceived = 0;
        reviewCount = 0;
        averageRating = 0;
        reportCount = 0;
        bio = `Hi, I'm ${name}!`;
        joinedOn = formatLocalISO(new Date());

        const newUser = await db.query(
          "INSERT INTO users (username, name, email, password, photo, strategy, review_count, posts_count, active_posts_count, inactive_posts_count, likes_received, average_rating, report_count, joined_on, bio) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *",
          [username, name, profile.email, password, photo, authStrategy, reviewCount, postsCount, activePostsCount, inactivePostsCount, likesReceived, averageRating, reportCount, joinedOn, bio]
        );
        userId = newUser.rows[0].user_id;
        username = newUser.rows[0].username;
        authStrategy = newUser.rows[0].strategy;
        joinedOn = newUser.rows[0].joined_on;
        reviewCount = newUser.rows[0].review_count;
        postsCount = newUser.rows[0].posts_count;
        activePostsCount = newUser.rows[0].active_posts_count;
        inactivePostsCount = newUser.rows[0].inactive_posts_count;
        likesReceived = newUser.rows[0].likes_received;
        averageRating = newUser.rows[0].average_rating;
        reportCount = newUser.rows[0].report_count;
        bio = newUser.rows[0].bio;
      } else {
        userId = result.rows[0].user_id;
        username = result.rows[0].username;
        authStrategy = result.rows[0].strategy;
        joinedOn = result.rows[0].joined_on;
        reviewCount = result.rows[0].review_count;
        postsCount = result.rows[0].posts_count;
        activePostsCount = result.rows[0].active_posts_count;
        inactivePostsCount = result.rows[0].inactive_posts_count;
        likesReceived = result.rows[0].likes_received;
        averageRating = result.rows[0].average_rating;
        reportCount = result.rows[0].report_count;
        bio = result.rows[0].bio;
      }

      profile.userId = userId;
      profile.name = name;
      profile.username = username;
      profile.photo = photo;
      profile.authStrategy = authStrategy;
      profile.postsCount = postsCount;
      profile.activePostsCount = activePostsCount;
      profile.inactivePostsCount = inactivePostsCount;
      profile.likesReceived = likesReceived;
      profile.reviewCount = reviewCount;
      profile.averageRating = averageRating;
      profile.reportCount = reportCount;
      profile.joinedOn = joinedOn;
      profile.bio = bio;
      cb(null, profile);
    } catch (error) {
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
      console.log("GitHub strategy activated");
      const state = req.query?.state;
      const email = state?.email
      const profileUrl = profile.profileUrl;
      if (!profileUrl) return cb(null, false, { message: "No profile found" });

      const result = await db.query("SELECT * FROM users WHERE profile_url = $1", [profileUrl]);
      let userId;
      let username;
      let authStrategy;
      let postsCount;
      let activePostsCount;
      let inactivePostsCount;
      let likesReceived;
      let reviewCount;
      let reportCount;
      let averageRating;
      let joinedOn;
      let bio;
      let name = profile.displayName;
      let photo = profile.photos?.[0]?.value;

      if (result.rows.length === 0) {
        // Generate a unique username
        username = await generateUniqueUsername(db, name)
        let password = "github";
        authStrategy = "github";
        reviewCount = 0;
        postsCount = 0;
        activePostsCount = 0;
        inactivePostsCount = 0;
        likesReceived = 0;
        averageRating = 0;
        reportCount = 0;
        bio = `Hi, I'm ${name}!`;
        joinedOn = formatLocalISO(new Date());

        const newUser = await db.query(
          "INSERT INTO users (username, name, email, password, photo, strategy, review_count, posts_count, active_posts_count, inactive_posts_count, likes_received, average_rating, report_count, joined_on, bio) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *",
          [username, name, email, password, photo, authStrategy, reviewCount, postsCount, activePostsCount, inactivePostsCount, likesReceived, averageRating, reportCount, joinedOn, bio]
        );
        userId = newUser.rows[0].user_id;
        name = newUser.rows[0].name;
        authStrategy = newUser.rows[0].strategy
        joinedOn = newUser.rows[0].joined_on;
        reviewCount = newUser.rows[0].review_count;
        postsCount = newUser.rows[0].posts_count;
        activePostsCount = newUser.rows[0].active_posts_count;
        inactivePostsCount = newUser.rows[0].inactive_posts_count;
        likesReceived = newUser.rows[0].likes_received;
        averageRating = newUser.rows[0].average_rating;
        reportCount = newUser.rows[0].report_count;
        bio = newUser.rows[0].bio;
      } else {
        userId = result.rows[0].user_id;
        name = result.rows[0].name;
        authStrategy = result.rows[0].strategy;
        joinedOn = result.rows[0].joined_on;
        reviewCount = result.rows[0].review_count;
        postsCount = result.rows[0].posts_count;
        activePostsCount = result.rows[0].active_posts_count;
        inactivePostsCount = result.rows[0].inactive_posts_count;
        likesReceived = result.rows[0].likes_received;
        averageRating = result.rows[0].average_rating;
        reportCount = result.rows[0].report_count;
        bio = result.rows[0].bio;
      }

      profile.userId = userId;
      profile.email = profileUrl;
      profile.photo = photo;
      profile.name = name;
      profile.authStrategy = authStrategy;
      profile.reviewCount = reviewCount;
      profile.postsCount = postsCount;
      profile.activePostsCount = activePostsCount;
      profile.inactivePostsCount = inactivePostsCount;
      profile.likesReceived = likesReceived;
      profile.averageRating = averageRating;
      profile.reportCount = reportCount;
      profile.joinedOn = joinedOn;
      profile.bio = bio;
      cb(null, profile);

    } catch (error) {
      cb(error);
    }
  }));

  // SERIALIZATION
  passport.serializeUser((user, cb) => cb(null, user));
  passport.deserializeUser((user, cb) => cb(null, user));
}
