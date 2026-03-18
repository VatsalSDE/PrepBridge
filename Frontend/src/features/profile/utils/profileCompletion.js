export const isValueFilled = (value) => {
  if (value === null || value === undefined) return false;
  return String(value).trim().length > 0;
};

export const isProfileComplete = (profile) => {
  if (!profile) return false;

  const hasCollege = isValueFilled(profile.college);
  const hasBranch = isValueFilled(profile.branch);
  const hasTargetRole = isValueFilled(profile.targetRole);
  const hasSkills = Array.isArray(profile.skills) && profile.skills.length > 0;

  return hasCollege && hasBranch && hasTargetRole && hasSkills;
};