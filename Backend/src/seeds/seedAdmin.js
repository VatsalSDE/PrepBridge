const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const User = require("../models/User");

async function seedAdmin() {
  
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const email = process.env.ADMIN_EMAIL || "admin@prepbridge.com";
    const password = process.env.ADMIN_PASSWORD || "Admin@123";

    let admin = await User.findOne({ email });

    if (!admin) {
      admin = await User.create({
        name: "Platform Admin",
        email,
        password,
        role: "admin",
        status: "active",
        isVerified: true,
      });
      console.log("Admin created:", admin.email);
    } else {
      admin.name = admin.name || "Platform Admin";
      admin.email = email;
      admin.password = password;
      admin.role = "admin";
      admin.status = "active";
      admin.isVerified = true;
      await admin.save();
      console.log("Admin updated:", admin.email);
    }

    await User.updateMany(
      { _id: { $ne: admin._id }, role: "admin" },
      { $set: { role: "student", status: "active" } }
    );
    console.log("Single-admin policy enforced");

    process.exit(0);
  } catch (err) {
    console.error("seedAdmin error:", err.message);
    process.exit(1);
  }
}

seedAdmin();
