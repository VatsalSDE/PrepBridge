const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const Company = require("../models/Company");
const User = require("../models/User");

const sampleCompanies = [
  {
    name: "Infosys",
    city: "Bangalore",
    industry: "IT Services",
    websiteUrl: "https://www.infosys.com/careers/",
    jd: "Systems Engineer role with coding + CS fundamentals.",
    interviewPattern: "Tech + HR",
    focusDistribution: { dsa: 25, coreCS: 35, systemDesign: 10, hr: 30 },
    guidelines: ["Prepare OOPs", "Practice coding basics"],
    approved: true,
  },
  {
    name: "TCS",
    city: "Pune",
    industry: "IT Services",
    websiteUrl: "https://www.tcs.com/careers",
    jd: "Ninja role with aptitude, coding, and HR.",
    interviewPattern: "Aptitude + Tech + HR",
    focusDistribution: { dsa: 20, coreCS: 30, systemDesign: 10, hr: 40 },
    guidelines: ["Aptitude practice", "Strong communication"],
    approved: true,
  },
  {
    name: "Razorpay",
    city: "Bangalore",
    industry: "Fintech",
    websiteUrl: "https://razorpay.com/jobs/",
    jd: "SDE role with backend and system design exposure.",
    interviewPattern: "Tech-heavy",
    focusDistribution: { dsa: 35, coreCS: 20, systemDesign: 35, hr: 10 },
    guidelines: [],
    approved: false,
  },
];

async function seedCompanies() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const admin = await User.findOne({ role: "admin" });

    for (const item of sampleCompanies) {
      await Company.findOneAndUpdate(
        { name: item.name },
        { ...item, createdBy: admin?._id || null },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    console.log("Companies seeded");
    process.exit(0);
  } catch (err) {
    console.error("seedCompanies error:", err.message);
    process.exit(1);
  }
}

seedCompanies();