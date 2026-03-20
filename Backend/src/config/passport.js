const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const User = require("../models/User");

// ── Google Strategy ───────────────────────────────────────
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error("No email from Google"), null);

        // Check if user exists
        let user = await User.findOne({ email });

        if (user) {
          // User exists → just return them
          return done(null, user);
        }

        // Create new user
        user = await User.create({
          name: profile.displayName || "Google User",
          email,
          password: `google_oauth_${profile.id}_${Date.now()}`,
          isVerified: true,
          status: "active",
          role: "student",
        });

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// ── GitHub Strategy ───────────────────────────────────────
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
      scope: ["user:email"],
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email =
          profile.emails?.[0]?.value ||
          `github_${profile.id}@prepbridge.com`;

        let user = await User.findOne({ email });

        if (user) {
          return done(null, user);
        }

        user = await User.create({
          name: profile.displayName || profile.username || "GitHub User",
          email,
          password: `github_oauth_${profile.id}_${Date.now()}`,
          isVerified: true,
          status: "active",
          role: "student",
        });

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;