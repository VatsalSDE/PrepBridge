const mongoose = require("mongoose");

const platformSettingsSchema = new mongoose.Schema(
  {
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    allowRegistration: {
      type: Boolean,
      default: true,
    },
    requireEmailVerification: {
      type: Boolean,
      default: true,
    },
    communityModeration: {
      type: Boolean,
      default: true,
    },
    maxTasksPerDay: {
      type: Number,
      default: 20,
      min: 1,
      max: 100,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

platformSettingsSchema.statics.getSingleton = async function () {
  let doc = await this.findOne({});
  if (!doc) {
    doc = await this.create({});
  }
  return doc;
};

const PlatformSettings = mongoose.model("PlatformSettings", platformSettingsSchema);

module.exports = PlatformSettings;