const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");
const jwt = require("jsonwebtoken");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/auth/google/callback",
      scope: [
        "profile",
        "email",
        "https://www.googleapis.com/auth/drive.file",  // Grants file creation permission
        "https://www.googleapis.com/auth/drive.appdata", // Grants access to app-specific data
        "https://www.googleapis.com/auth/drive" // Full access to Drive (use carefully)
      ],
      accessType: "offline", // Ensures we get a refresh token
      prompt: "consent", // Forces re-authentication to get new permissions
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          user = new User({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            profilePic: profile.photos[0].value,
            googleAccessToken: accessToken,
            googleRefreshToken: refreshToken // Save refreshToken for future use
          });
        } else {
          user.googleAccessToken = accessToken;
          if (refreshToken) {
            user.googleRefreshToken = refreshToken; // Update refreshToken only if provided
          }
        }

        await user.save();

        // Generate JWT Token
        const token = jwt.sign(
          { id: user.id, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
        );

        user.token = token;

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);


// Serialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
