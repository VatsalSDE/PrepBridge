// src/models/RoadmapProgress.js
const mongoose = require("mongoose");

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
  const defaultDSA = {
    sections: [
      { name: "Arrays", topics: [
        { name: "Two Pointers", completed: false },
        { name: "Sliding Window", completed: false },
        { name: "Prefix Sum", completed: false },
        { name: "Kadane's Algorithm", completed: false }
      ]},
      { name: "Linked Lists", topics: [
        { name: "Reversal", completed: false },
        { name: "Fast & Slow Pointers", completed: false },
        { name: "Merge Lists", completed: false }
      ]},
      { name: "Trees", topics: [
        { name: "BFS/DFS", completed: false },
        { name: "Binary Search Tree", completed: false },
        { name: "Tree DP", completed: false }
      ]},
      { name: "Graphs", topics: [
        { name: "BFS/DFS", completed: false },
        { name: "Dijkstra", completed: false },
        { name: "Topological Sort", completed: false },
        { name: "Union Find", completed: false }
      ]},
      { name: "Dynamic Programming", topics: [
        { name: "1D DP", completed: false },
        { name: "2D DP", completed: false },
        { name: "Knapsack", completed: false },
        { name: "LCS/LIS", completed: false }
      ]}
    ],
    overallProgress: 0
  };

  const defaultCoreCS = {
    sections: [
      { name: "DBMS", topics: [
        { name: "SQL Basics", completed: false },
        { name: "Normalization", completed: false },
        { name: "Transactions & ACID", completed: false },
        { name: "Indexing", completed: false }
      ]},
      { name: "Operating Systems", topics: [
        { name: "Process & Threads", completed: false },
        { name: "CPU Scheduling", completed: false },
        { name: "Memory Management", completed: false },
        { name: "Deadlocks", completed: false }
      ]},
      { name: "Computer Networks", topics: [
        { name: "OSI Model", completed: false },
        { name: "TCP/UDP", completed: false },
        { name: "HTTP/HTTPS", completed: false },
        { name: "DNS", completed: false }
      ]},
      { name: "OOP", topics: [
        { name: "4 Pillars", completed: false },
        { name: "SOLID Principles", completed: false },
        { name: "Design Patterns", completed: false }
      ]}
    ],
    overallProgress: 0
  };

  const defaultAptitude = {
    sections: [
      { name: "Quantitative", topics: [
        { name: "Number System", completed: false },
        { name: "Percentages", completed: false },
        { name: "Profit & Loss", completed: false },
        { name: "Time & Work", completed: false }
      ]},
      { name: "Logical Reasoning", topics: [
        { name: "Puzzles", completed: false },
        { name: "Blood Relations", completed: false },
        { name: "Coding-Decoding", completed: false }
      ]},
      { name: "Verbal", topics: [
        { name: "Reading Comprehension", completed: false },
        { name: "Grammar", completed: false },
        { name: "Vocabulary", completed: false }
      ]}
    ],
    overallProgress: 0
  };

  const defaultSystemDesign = {
    sections: [
      { name: "Basics", topics: [
        { name: "Scalability", completed: false },
        { name: "Load Balancing", completed: false },
        { name: "Caching", completed: false },
        { name: "Database Sharding", completed: false }
      ]},
      { name: "Components", topics: [
        { name: "Message Queues", completed: false },
        { name: "CDN", completed: false },
        { name: "API Gateway", completed: false }
      ]}
    ],
    overallProgress: 0
  };

  const defaultDomainRoles = [
    {
      roleId: "frontend",
      roleName: "Frontend Developer",
      skills: [
        { name: "HTML/CSS", completed: false },
        { name: "JavaScript", completed: false },
        { name: "React/Vue/Angular", completed: false },
        { name: "State Management", completed: false },
        { name: "Testing", completed: false }
      ],
      progress: 0
    },
    {
      roleId: "backend",
      roleName: "Backend Developer",
      skills: [
        { name: "Node.js/Python/Java", completed: false },
        { name: "REST APIs", completed: false },
        { name: "Databases", completed: false },
        { name: "Authentication", completed: false },
        { name: "Cloud Basics", completed: false }
      ],
      progress: 0
    },
    {
      roleId: "fullstack",
      roleName: "Fullstack Developer",
      skills: [
        { name: "Frontend Framework", completed: false },
        { name: "Backend Framework", completed: false },
        { name: "Database Design", completed: false },
        { name: "DevOps Basics", completed: false },
        { name: "System Design", completed: false }
      ],
      progress: 0
    }
  ];

  const roadmap = await this.create({
    userId,
    dsa: defaultDSA,
    coreCS: defaultCoreCS,
    aptitude: defaultAptitude,
    systemDesign: defaultSystemDesign,
    domainRoles: defaultDomainRoles,
    totalProgress: 0
  });

  return roadmap;
};

const RoadmapProgress = mongoose.model("RoadmapProgress", roadmapProgressSchema);

module.exports = RoadmapProgress;
