// src/models/RoadmapProgress.js
const mongoose = require("mongoose");
const RoadmapTemplate = require("./RoadmapTemplate");

const topicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date }
}, { _id: false });

const sectionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  topics: [topicSchema]
}, { _id: false });

const domainRoleSchema = new mongoose.Schema({
  roleId: { type: String, required: true },
  roleName: { type: String, required: true },
  skills: [topicSchema],
  progress: { type: Number, default: 0, min: 0, max: 100 }
}, { _id: false });

const roadmapProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true
    },

    // DSA Progress
    dsa: {
      sections: [sectionSchema],
      overallProgress: { type: Number, default: 0, min: 0, max: 100 }
    },

    // Core CS Progress (DBMS, OS, Networks, OOP)
    coreCS: {
      sections: [sectionSchema],
      overallProgress: { type: Number, default: 0, min: 0, max: 100 }
    },

    // Aptitude Progress
    aptitude: {
      sections: [sectionSchema],
      overallProgress: { type: Number, default: 0, min: 0, max: 100 }
    },

    // System Design Progress
    systemDesign: {
      sections: [sectionSchema],
      overallProgress: { type: Number, default: 0, min: 0, max: 100 }
    },

    // Domain Roles (Frontend, Backend, Fullstack, etc.)
    domainRoles: [domainRoleSchema],

    // Overall progress across all foundations
    totalProgress: { type: Number, default: 0, min: 0, max: 100 }
  },
  { timestamps: true }
);

// Calculate progress for a foundation section
roadmapProgressSchema.methods.calculateSectionProgress = function (foundationType) {
  const foundation = this[foundationType];
  if (!foundation || !foundation.sections.length) return 0;

  let totalTopics = 0;
  let completedTopics = 0;

  foundation.sections.forEach(section => {
    totalTopics += section.topics.length;
    completedTopics += section.topics.filter(t => t.completed).length;
  });

  const progress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
  foundation.overallProgress = progress;
  return progress;
};

// Calculate total progress across all foundations
roadmapProgressSchema.methods.calculateTotalProgress = function () {
  const dsaProgress = this.dsa?.overallProgress || 0;
  const coreCSProgress = this.coreCS?.overallProgress || 0;
  const aptitudeProgress = this.aptitude?.overallProgress || 0;
  const systemDesignProgress = this.systemDesign?.overallProgress || 0;

  this.totalProgress = Math.round((dsaProgress + coreCSProgress + aptitudeProgress + systemDesignProgress) / 4);
  return this.totalProgress;
};

// Toggle topic completion
roadmapProgressSchema.methods.toggleTopic = async function (foundationType, sectionName, topicName) {
  const foundation = this[foundationType];
  if (!foundation) throw new Error("Invalid foundation type");

  const section = foundation.sections.find(s => s.name === sectionName);
  if (!section) throw new Error("Section not found");

  const topic = section.topics.find(t => t.name === topicName);
  if (!topic) throw new Error("Topic not found");

  topic.completed = !topic.completed;
  topic.completedAt = topic.completed ? new Date() : null;

  this.calculateSectionProgress(foundationType);
  this.calculateTotalProgress();

  await this.save();
  return { topic, sectionProgress: foundation.overallProgress, totalProgress: this.totalProgress };
};

// Toggle domain skill
roadmapProgressSchema.methods.toggleDomainSkill = async function (roleId, skillName) {
  const role = this.domainRoles.find(r => r.roleId === roleId);
  if (!role) throw new Error("Role not found");

  const skill = role.skills.find(s => s.name === skillName);
  if (!skill) throw new Error("Skill not found");

  skill.completed = !skill.completed;
  skill.completedAt = skill.completed ? new Date() : null;

  // Recalculate role progress
  const completed = role.skills.filter(s => s.completed).length;
  role.progress = Math.round((completed / role.skills.length) * 100);

  await this.save();
  return { skill, roleProgress: role.progress };
};

roadmapProgressSchema.methods.syncWithTemplate = async function (template) {
  const source = template?.toObject ? template.toObject() : template;
  const templateFoundations = source?.foundations || {};
  const templateDomainRoles = source?.domainRoles || [];

  let changed = false;
  const foundationKeys = ["dsa", "coreCS", "aptitude", "systemDesign"];

  foundationKeys.forEach((key) => {
    const currentSections = this[key]?.sections || [];
    const currentSectionMap = new Map(currentSections.map((section) => [section.name, section]));
    const nextSections = (templateFoundations[key]?.sections || []).map((templateSection) => {
      const currentSection = currentSectionMap.get(templateSection.name);
      const currentTopicMap = new Map((currentSection?.topics || []).map((topic) => [topic.name, topic]));

      return {
        name: templateSection.name,
        topics: (templateSection.topics || []).map((topicName) => {
          const currentTopic = currentTopicMap.get(topicName);
          return {
            name: topicName,
            completed: Boolean(currentTopic?.completed),
            completedAt: currentTopic?.completed ? currentTopic.completedAt || null : null,
          };
        }),
      };
    });

    if (JSON.stringify(currentSections) !== JSON.stringify(nextSections)) {
      this[key].sections = nextSections;
      changed = true;
    }

    this.calculateSectionProgress(key);
  });

  const currentRoles = this.domainRoles || [];
  const currentRoleMap = new Map(currentRoles.map((role) => [role.roleId, role]));

  const nextRoles = templateDomainRoles.map((templateRole) => {
    const currentRole = currentRoleMap.get(templateRole.roleId);
    const currentSkillMap = new Map((currentRole?.skills || []).map((skill) => [skill.name, skill]));
    const nextSkills = (templateRole.skills || []).map((skillName) => {
      const currentSkill = currentSkillMap.get(skillName);
      return {
        name: skillName,
        completed: Boolean(currentSkill?.completed),
        completedAt: currentSkill?.completed ? currentSkill.completedAt || null : null,
      };
    });

    const completed = nextSkills.filter((skill) => skill.completed).length;
    return {
      roleId: templateRole.roleId,
      roleName: templateRole.roleName,
      skills: nextSkills,
      progress: nextSkills.length ? Math.round((completed / nextSkills.length) * 100) : 0,
    };
  });

  if (JSON.stringify(currentRoles) !== JSON.stringify(nextRoles)) {
    this.domainRoles = nextRoles;
    changed = true;
  }

  this.calculateTotalProgress();

  if (changed) {
    await this.save();
  }

  return changed;
};

// Get or create roadmap for user
roadmapProgressSchema.statics.getOrCreate = async function (userId) {
  let roadmap = await this.findOne({ userId });

  if (!roadmap) {
    roadmap = await this.create({
      userId,
      dsa: { sections: [], overallProgress: 0 },
      coreCS: { sections: [], overallProgress: 0 },
      aptitude: { sections: [], overallProgress: 0 },
      systemDesign: { sections: [], overallProgress: 0 },
      domainRoles: []
    });
  }

  return roadmap;
};

// Initialize with default roadmap structure
roadmapProgressSchema.statics.initializeDefault = async function (userId) {
  const template = await RoadmapTemplate.getActiveTemplate();

  const toSections = (sections = []) =>
    sections.map((section) => ({
      name: section.name,
      topics: (section.topics || []).map((topicName) => ({ name: topicName, completed: false })),
    }));

  const toDomainRoles = (roles = []) =>
    roles.map((role) => ({
      roleId: role.roleId,
      roleName: role.roleName,
      skills: (role.skills || []).map((skillName) => ({ name: skillName, completed: false })),
      progress: 0,
    }));

  const roadmap = await this.create({
    userId,
    dsa: { sections: toSections(template.foundations?.dsa?.sections), overallProgress: 0 },
    coreCS: { sections: toSections(template.foundations?.coreCS?.sections), overallProgress: 0 },
    aptitude: { sections: toSections(template.foundations?.aptitude?.sections), overallProgress: 0 },
    systemDesign: { sections: toSections(template.foundations?.systemDesign?.sections), overallProgress: 0 },
    domainRoles: toDomainRoles(template.domainRoles),
    totalProgress: 0
  });

  return roadmap;
};

const RoadmapProgress = mongoose.model("RoadmapProgress", roadmapProgressSchema);

module.exports = RoadmapProgress;
