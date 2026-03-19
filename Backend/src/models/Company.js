const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    logo: {
      type: String,
      default: "🏢",
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    industry: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    websiteUrl: {
      type: String,
      trim: true,
      default: ""
    },
    jd: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20000
    },
    interviewPattern: {
      type: String,
      trim: true,
      default: "Tech-heavy"
    },
    roundStructure: [{
       type: String 
      }],

    difficultyEstimate: { 
      type: String, default: "Medium"
     },

    keyTopics: [{ 
      type: String
     }],
    focusDistribution: {
      dsa: { type: Number, min: 0, max: 100, default: 25 },
      coreCS: { type: Number, min: 0, max: 100, default: 25 },
      systemDesign: { type: Number, min: 0, max: 100, default: 25 },
      hr: { type: Number, min: 0, max: 100, default: 25 },
    },
    guidelines: [{
      type: String,
      trim: true,
      maxlength: 500
    }],
    rawAlumniInput: {
      type: String,
      trim: true,
      default: ""
    },
    approved: {
      type: Boolean,
      default: false,
      index: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
  },
  { timestamps: true },
);

companySchema.index({ approved: 1, city: 1, industry: 1 });
companySchema.index({ name: "text", jd: "text", guidelines: "text" });

companySchema.pre("validate", function () {
  const f = this.focusDistribution || {};
  const total =
    (f.dsa || 0) + (f.coreCS || 0) + (f.systemDesign || 0) + (f.hr || 0);
  if (total > 100) {
    throw new Error("focusDistribution total cannot exceed 100");
  }
});

module.exports = mongoose.model("Company", companySchema);
