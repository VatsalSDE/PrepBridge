const mongoose = require("mongoose");
const { getDefaultRoadmapTemplate } = require("../utils/defaultRoadmapTemplate");

const foundationSectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    topics: [{ type: String, trim: true }],
  },
  { _id: false }
);

const foundationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    sections: [foundationSectionSchema],
  },
  { _id: false }
);

const domainRoleTemplateSchema = new mongoose.Schema(
  {
    roleId: { type: String, required: true, trim: true },
    roleName: { type: String, required: true, trim: true },
    skills: [{ type: String, trim: true }],
  },
  { _id: false }
);

const roadmapTemplateSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: "default" },
    foundations: {
      dsa: { type: foundationSchema, required: true },
      coreCS: { type: foundationSchema, required: true },
      aptitude: { type: foundationSchema, required: true },
      systemDesign: { type: foundationSchema, required: true },
    },
    domainRoles: [domainRoleTemplateSchema],
  },
  { timestamps: true }
);

roadmapTemplateSchema.statics.getActiveTemplate = async function () {
  let template = await this.findOne({ key: "default" });
  if (!template) {
    const defaults = getDefaultRoadmapTemplate();
    template = await this.create({
      key: "default",
      foundations: defaults.foundations,
      domainRoles: defaults.domainRoles,
    });
  }
  return template;
};

const RoadmapTemplate = mongoose.model("RoadmapTemplate", roadmapTemplateSchema);

module.exports = RoadmapTemplate;