import { Strategy as LocalStrategy } from "passport-local";
import GoogleStrategy from "passport-google-oauth2";
import GitHubStrategy from "passport-github2"; //  import GitHub strategy
import bcrypt from "bcrypt";
import { generateUniqueUsername } from "./database-utils.js";


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
      let username;
      let userId;
      let authStrategy;

      let name = profile.displayName;
      let photo = profile.picture;

      if (result.rows.length === 0) {
        // Generate a unique username
        username = await generateUniqueUsername(db, name)
        const newUser = await db.query(
          "INSERT INTO users (username, name, email, password, photo, strategy, report_count) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
          [username, name, profile.email, "google", photo, "google", 0]
        );
        userId = newUser.rows[0].user_id;
        name = newUser.rows[0].name;
        authStrategy = newUser.rows[0].strategy
      } else {
        userId = result.rows[0].user_id;
        name = result.rows[0].name;
        authStrategy = result.rows[0].strategy;
      }

      profile.user_id = userId;
      profile.photo = photo;
      profile.name = name;
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
      
      let name = profile.displayName;
      let photo = profile.photos?.[0]?.value;

      if (result.rows.length === 0) {
        // Generate a unique username
        username = await generateUniqueUsername(db, name)
        const newUser = await db.query(
          "INSERT INTO users (username, name, email, password, photo, strategy, report_count) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
          [username, name, email, "github", photo, "github", 0]
        );
        userId = newUser.rows[0].user_id;
        name = newUser.rows[0].name;
        authStrategy = newUser.rows[0].strategy
      } else {
        userId = result.rows[0].user_id;
        name = result.rows[0].name;
        authStrategy = result.rows[0].strategy;
      }

      profile.user_id = userId;
      profile.email = profileUrl;
      profile.photo = photo;
      profile.name = name;
      profile.authStrategy = authStrategy;
      cb(null, profile);

    } catch (error) {
      cb(error);
    }
  }));

  // SERIALIZATION
  passport.serializeUser((user, cb) => cb(null, user));
  passport.deserializeUser((user, cb) => cb(null, user));
}
