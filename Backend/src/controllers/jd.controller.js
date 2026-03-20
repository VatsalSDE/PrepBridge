const JDAnalysis = require('../models/JDAnalysis');
const Company = require('../models/Company');
const User = require('../models/User');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const axios = require('axios');
const { extractTextFromFile } = require('../utils/resumeParser');

const SKILL_LIBRARY = {
  technical: [
    'javascript', 'typescript', 'react', 'node', 'node.js', 'express', 'mongodb', 'sql', 'mysql', 'postgresql',
    'python', 'java', 'c++', 'c#', 'go', 'rest api', 'microservices', 'distributed systems', 'system design',
    'data structures', 'algorithms', 'dynamic programming', 'graphs', 'trees', 'docker', 'kubernetes', 'aws', 'gcp', 'azure'
  ],
  soft: [
    'communication', 'collaboration', 'teamwork', 'problem solving', 'critical thinking', 'leadership', 'ownership'
  ],
  tool: [
    'git', 'github', 'jira', 'postman', 'linux', 'ci/cd', 'jenkins'
  ],
  domain: [
    'fintech', 'e-commerce', 'payments', 'cloud', 'backend', 'frontend', 'full stack'
  ]
};

const normalizeText = (value = '') => String(value).toLowerCase();

const toDisplaySkill = (value) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .replace('Node.js', 'Node.js')
    .replace('Rest Api', 'REST API')
    .replace('Ci/cd', 'CI/CD')
    .replace('Aws', 'AWS')
    .replace('Gcp', 'GCP');

const extractSkillCandidates = (sourceText = '') => {
  const text = normalizeText(sourceText);
  const lines = text.split(/\n|\.|;/).map((line) => line.trim()).filter(Boolean);
  const extracted = [];

  Object.entries(SKILL_LIBRARY).forEach(([category, keywords]) => {
    keywords.forEach((keyword) => {
      if (!text.includes(keyword)) return;

      const matchingLine = lines.find((line) => line.includes(keyword)) || '';
      let importance = 'required';
      if (matchingLine.includes('nice to have') || matchingLine.includes('bonus')) {
        importance = 'nice-to-have';
      } else if (matchingLine.includes('preferred') || matchingLine.includes('good to have')) {
        importance = 'preferred';
      }

      extracted.push({
        skill: toDisplaySkill(keyword),
        category,
        importance,
      });
    });
  });

  return Array.from(new Map(extracted.map((item) => [item.skill.toLowerCase(), item])).values());
};

const buildUserSkillSet = (userSkills = [], resumeText = '') => {
  const normalizedSkills = new Set((userSkills || []).map((skill) => normalizeText(skill).trim()).filter(Boolean));
  const resumeLower = normalizeText(resumeText);

  Object.values(SKILL_LIBRARY).flat().forEach((keyword) => {
    if (resumeLower.includes(keyword)) normalizedSkills.add(keyword);
  });

  return normalizedSkills;
};

const getSkillLevel = (skillName, resumeText) => {
  const text = normalizeText(resumeText);
  const keyword = normalizeText(skillName);
  const occurrences = (text.match(new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;

  if (occurrences >= 3) return 'advanced';
  if (occurrences >= 1) return 'intermediate';
  return 'beginner';
};

const buildRecommendations = (missingSkills = []) =>
  missingSkills.slice(0, 8).map((item) => ({
    skill: item.skill,
    priority: item.importance === 'required' ? 'high' : item.importance === 'preferred' ? 'medium' : 'low',
    suggestedResources: [
      `Practice ${item.skill} interview questions`,
      `Build one mini project using ${item.skill}`,
      `Revise fundamentals of ${item.skill}`,
    ],
  }));

const toSummaryAnalysis = (analysis) => ({
  _id: analysis._id,
  companyId: analysis.companyId,
  jobTitle: analysis.jobTitle,
  company: analysis.company,
  matchScore: analysis.matchScore,
  extractedSkills: analysis.extractedSkills,
  matchedSkills: analysis.matchedSkills,
  missingSkills: analysis.missingSkills,
  recommendations: analysis.recommendations,
  isSaved: analysis.isSaved,
  createdAt: analysis.createdAt,
});

// ─── Get approved companies ───────────────────────────────
exports.getCompanies = asyncHandler(async (req, res) => {
  const { search = '', city = '', industry = '', page = 1, limit = 20 } = req.query;
  const parsedPage = Number(page) || 1;
  const parsedLimit = Number(limit) || 20;

  const query = { approved: true };
  if (search?.trim()) {
    query.$or = [
      { name: { $regex: search.trim(), $options: 'i' } },
      { industry: { $regex: search.trim(), $options: 'i' } },
      { city: { $regex: search.trim(), $options: 'i' } },
    ];
  }
  if (city?.trim()) query.city = city.trim();
  if (industry?.trim()) query.industry = industry.trim();

  const [companies, total] = await Promise.all([
    Company.find(query)
      .sort({ name: 1 })
      .skip((parsedPage - 1) * parsedLimit)
      .limit(parsedLimit)
      .select('name logo city industry websiteUrl jd interviewPattern focusDistribution guidelines rawAlumniInput roundStructure difficultyEstimate keyTopics approved'),
    Company.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: companies,
    pagination: { page: parsedPage, limit: parsedLimit, total },
  });
});

// ─── Analyze JD (AI powered) ──────────────────────────────
exports.analyzeJD = asyncHandler(async (req, res) => {
  const {
    companyId,
    jobTitle,
    company,
    resumeText: bodyResumeText = "",
  } = req.body;

  // Step 1 → Extract resume text from uploaded file OR use pasted text
  let resumeText = bodyResumeText;
  if (req.file) {
    try {
      resumeText = await extractTextFromFile(req.file);
    } catch (err) {
      throw new AppError(err.message || "Failed to extract text from file", 400);
    }
  }

  if (!resumeText.trim()) {
    throw new AppError("Resume is required — upload a PDF/Word file or paste text", 400);
  }

  // Step 2 → Resolve company and JD text
  let selectedCompany = null;
  let resolvedJDText = req.body.jdText;
  let resolvedCompanyName = company;
  let resolvedJobTitle = jobTitle;

  if (companyId) {
    selectedCompany = await Company.findById(companyId);
    if (!selectedCompany || !selectedCompany.approved) {
      throw new AppError("Approved company not found", 404);
    }
    resolvedJDText = selectedCompany.jd;
    resolvedCompanyName = selectedCompany.name;
    if (!resolvedJobTitle) {
      resolvedJobTitle = selectedCompany.interviewPattern || "Software Engineer";
    }
  }

  if (!resolvedJobTitle || !resolvedJDText) {
    throw new AppError("companyId or both jobTitle and jdText are required", 400);
  }

  const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

  let mlResult;

  try {
    // Step 3 → Call FastAPI ML service
    const response = await axios.post(`${ML_SERVICE_URL}/user/analyze-jd`, {
      jdText: resolvedJDText,
      resumeText,
      jobTitle: resolvedJobTitle,
      companyName: resolvedCompanyName || "the company",
    });
    mlResult = response.data.data;
    console.log("✅ ML JD analysis received");

  } catch (err) {
    // Step 4 → Fallback to rule-based if ML service is down
    console.error("ML service unavailable, using fallback:", err.message);

    const user = await User.findById(req.user.id).select("skills");
    const userSkillSet = buildUserSkillSet([...(user?.skills || [])], resumeText);
    const extractedSkills = extractSkillCandidates(resolvedJDText);

    const matchedSkills = extractedSkills
      .filter((item) => {
        const normalizedSkill = normalizeText(item.skill);
        return Array.from(userSkillSet).some(
          (skill) => normalizedSkill.includes(skill) || skill.includes(normalizedSkill)
        );
      })
      .map((item) => ({
        skill: item.skill,
        userLevel: getSkillLevel(item.skill, resumeText),
      }));

    const matchedSet = new Set(matchedSkills.map((item) => normalizeText(item.skill)));
    const missingSkills = extractedSkills
      .filter((item) => !matchedSet.has(normalizeText(item.skill)))
      .map((item) => ({
        skill: item.skill,
        category: item.category,
        importance: item.importance,
      }));

    const matchScore = extractedSkills.length > 0
      ? Math.round((matchedSkills.length / extractedSkills.length) * 100)
      : 0;

    mlResult = {
      matchScore,
      matchedSkills,
      missingSkills,
      extractedSkills,
      recommendations: buildRecommendations(missingSkills),
    };
  }

  // Step 5 → Save to MongoDB
  const analysis = await JDAnalysis.create({
    userId: req.user.id,
    companyId: selectedCompany?._id,
    jobTitle: resolvedJobTitle,
    company: resolvedCompanyName || "Custom JD",
    jdText: resolvedJDText,
    extractedSkills:  mlResult.extractedSkills  || [],
    matchedSkills:    mlResult.matchedSkills     || [],
    missingSkills:    mlResult.missingSkills     || [],
    matchScore:       mlResult.matchScore        || 0,
    recommendations:  mlResult.recommendations   || [],
  });

  res.status(201).json({
    success: true,
    data: toSummaryAnalysis(analysis),
    message: "JD analysis completed successfully using AI",
  });
});

// ─── Get history ──────────────────────────────────────────
exports.getHistory = asyncHandler(async (req, res) => {
  const { savedOnly, page = 1, limit = 10 } = req.query;
  const parsedPage = Number(page) || 1;
  const parsedLimit = Number(limit) || 10;

  const analyses = await JDAnalysis.getUserAnalyses(req.user.id, {
    savedOnly: savedOnly === 'true',
    limit: parsedLimit,
    skip: (parsedPage - 1) * parsedLimit,
  });

  const total = await JDAnalysis.countDocuments({
    userId: req.user.id,
    ...(savedOnly === 'true' ? { isSaved: true } : {}),
  });

  res.json({
    success: true,
    data: analyses,
    pagination: { page: parsedPage, limit: parsedLimit, total },
  });
});

// ─── Get single analysis ──────────────────────────────────
exports.getAnalysis = asyncHandler(async (req, res) => {
  const analysis = await JDAnalysis.findById(req.params.id)
    .populate('companyId', 'name logo city industry websiteUrl interviewPattern focusDistribution guidelines');

  if (!analysis) throw new AppError('Analysis not found', 404);
  if (analysis.userId.toString() !== req.user.id) throw new AppError('Not authorized', 403);

  res.json({ success: true, data: analysis });
});

// ─── Toggle save ──────────────────────────────────────────
exports.toggleSave = asyncHandler(async (req, res) => {
  const analysis = await JDAnalysis.findById(req.params.id);
  if (!analysis) throw new AppError('Analysis not found', 404);
  if (analysis.userId.toString() !== req.user.id) throw new AppError('Not authorized', 403);

  analysis.isSaved = !analysis.isSaved;
  await analysis.save();

  res.json({ success: true, data: { isSaved: analysis.isSaved } });
});

// ─── Delete analysis ──────────────────────────────────────
exports.deleteAnalysis = asyncHandler(async (req, res) => {
  const analysis = await JDAnalysis.findById(req.params.id);
  if (!analysis) throw new AppError('Analysis not found', 404);
  if (analysis.userId.toString() !== req.user.id) throw new AppError('Not authorized', 403);

  await JDAnalysis.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Analysis deleted' });
});

// ─── Skill gaps ───────────────────────────────────────────
exports.getSkillGaps = asyncHandler(async (req, res) => {
  const skillGaps = await JDAnalysis.getSkillGaps(req.user.id);
  res.json({ success: true, data: skillGaps });
});