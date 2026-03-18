import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, Building2, GraduationCap, Target, Code2,
  Github, Globe, FileText, Edit3, Save, X, Plus, Trash2,
  Award, TrendingUp, Upload, Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { containerVariants, itemVariants } from '@/utils/animations';
import { TARGET_ROLES } from '@/utils/constants';
import useProfileStore from '@/store/profileStore';
import useAchievementStore from '@/store/achievementStore';
import profileService from '@/services/profileService';
import { API_BASE_URL } from '@/services/api';

const DEFAULT_PROFILE = {
  id: '',
  name: '',
  email: '',
  college: '',
  branch: '',
  year: 1,
  cgpa: 0,
  targetRole: TARGET_ROLES[0],
  streak: 0,
  longestStreak: 0,
  tasksCompleted: 0,
  avgProductivity: 0,
  weeklyStudyGoal: 25,
  dailyTaskGoal: 6,
  skills: [],
  projects: [],
  codingProfiles: { leetcode: '', codolio: '', gfg: '' },
  resumeUrl: '',
};

const AVAILABLE_SKILLS = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java',
  'C++', 'SQL', 'MongoDB', 'Git', 'Docker', 'AWS', 'REST APIs',
  'Data Structures', 'Algorithms', 'System Design', 'Machine Learning'
];

export default function ProfilePage() {
  const fetchProfile = useProfileStore((state) => state.fetchProfile);
  const saveProfile = useProfileStore((state) => state.saveProfile);
  const uploadResume = useProfileStore((state) => state.uploadResume);
  const profileFromStore = useProfileStore((state) => state.profile);
  const isLoading = useProfileStore((state) => state.isLoading);
  const earnedBadges = useAchievementStore((state) => state.earned);
  const totalEarnedBadges = useAchievementStore((state) => state.totalEarned);
  const fetchAchievements = useAchievementStore((state) => state.fetchAchievements);

  const [isEditing, setIsEditing] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', url: '' });
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [isResumeUploading, setIsResumeUploading] = useState(false);
  const [isResumeOpening, setIsResumeOpening] = useState(false);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [resumePreviewUrl, setResumePreviewUrl] = useState('');
  const fileInputRef = useRef(null);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);

  useEffect(() => {
    return () => {
      if (resumePreviewUrl) {
        URL.revokeObjectURL(resumePreviewUrl);
      }
    };
  }, [resumePreviewUrl]);

  useEffect(() => {
    fetchProfile().catch((error) => {
      toast.error(error.message || 'Failed to load profile');
    });
  }, [fetchProfile]);

  useEffect(() => {
    fetchAchievements({ silent: true }).catch(() => {});
  }, [fetchAchievements]);

  useEffect(() => {
    setProfile({
      ...DEFAULT_PROFILE,
      ...profileFromStore,
      codingProfiles: {
        ...DEFAULT_PROFILE.codingProfiles,
        ...(profileFromStore?.codingProfiles || {}),
      },
      skills: profileFromStore?.skills || [],
      projects: profileFromStore?.projects || [],
    });

    if (profileFromStore?.resumeUrl) {
      const fallbackName = String(profileFromStore.resumeUrl).split('/').pop() || 'resume.pdf';
      setResumeFile({ name: fallbackName, size: 0 });
    } else {
      setResumeFile(null);
    }
  }, [profileFromStore]);

  const handleSave = async () => {
    try {
      const payload = {
        name: profile.name,
        college: profile.college,
        branch: profile.branch,
        year: profile.year,
        cgpa: profile.cgpa,
        targetRole: profile.targetRole,
        skills: profile.skills,
        projects: profile.projects,
        codingProfiles: profile.codingProfiles,
        weeklyStudyGoal: profile.weeklyStudyGoal,
        dailyTaskGoal: profile.dailyTaskGoal,
      };

      await saveProfile(payload);
      setIsEditing(false);
      setShowProjectForm(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    }
  };

  const addSkill = (skill) => {
    if (!profile.skills.includes(skill)) {
      setProfile({ ...profile, skills: [...profile.skills, skill] });
    }
  };

  const removeSkill = (skill) => {
    setProfile({ ...profile, skills: profile.skills.filter(s => s !== skill) });
  };

  const addProject = () => {
    if (newProject.name.trim() && newProject.url.trim()) {
      setProfile({ ...profile, projects: [...profile.projects, { ...newProject }] });
      setNewProject({ name: '', url: '' });
      setShowProjectForm(false);
      toast.success('Project added successfully!');
    } else {
      toast.error('Please fill in both project name and URL');
    }
  };

  const deleteProject = (index) => {
    setProfile({
      ...profile,
      projects: profile.projects.filter((_, idx) => idx !== index)
    });
    toast.success('Project removed');
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === 'application/pdf') {
        if (file.size <= 5 * 1024 * 1024) { // 5MB limit
          try {
            setIsResumeUploading(true);
            await uploadResume(file);
            setResumeFile(file);
            toast.success(`Resume "${file.name}" uploaded successfully!`);
          } catch (error) {
            toast.error(error.message || 'Failed to upload resume');
          } finally {
            setIsResumeUploading(false);
            // Allow selecting the same file again if needed.
            if (fileInputRef.current) fileInputRef.current.value = '';
          }
        } else {
          toast.error('File size should be less than 5MB');
        }
      } else {
        toast.error('Please upload a PDF file');
      }
    }
  };

  const getYearSuffix = (year) => {
    if (year === 1) return '1st';
    if (year === 2) return '2nd';
    if (year === 3) return '3rd';
    if (year === 4) return '4th';
    return year;
  };

  const getResumeUrl = () => {
    const raw = String(profile?.resumeUrl || '').trim();
    if (!raw) return '';

    if (/^https?:\/\//i.test(raw)) return raw;
    if (raw.startsWith('//')) return `https:${raw}`;

    // Support relative API paths (e.g. /api/users/resume/view).
    if (raw.startsWith('/')) {
      try {
        return new URL(raw, API_BASE_URL).toString();
      } catch {
        return '';
      }
    }

    // Legacy values might be saved without protocol
    if (raw.includes('res.cloudinary.com')) {
      return `https://${raw.replace(/^\/+/, '')}`;
    }

    // Unknown non-URL value (e.g. old filename-only records)
    return '';
  };

  const getResumeViewerUrl = () => {
    const rawUrl = getResumeUrl();
    if (!rawUrl) return '';
    if (!/^https?:\/\//i.test(rawUrl)) return '';
    return `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(rawUrl)}`;
  };

  const handleViewResume = async (e) => {
    e.preventDefault();
    try {
      setIsResumeOpening(true);
      // Authenticated fetch from backend; preview locally in a modal.
      const blob = await profileService.getResumeBlob();
      const blobUrl = URL.createObjectURL(blob);
      if (resumePreviewUrl) {
        URL.revokeObjectURL(resumePreviewUrl);
      }
      setResumePreviewUrl(blobUrl);
      setIsResumeModalOpen(true);
    } catch (error) {
      // Last fallback: try direct link if available.
      const url = getResumeUrl();
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
      toast.error(error.message || 'Unable to open resume');
    } finally {
      setIsResumeOpening(false);
    }
  };

  const getProfileLinkMeta = (platform, value) => {
    const raw = String(value || '').trim();
    if (!raw) return null;

    const isFullUrl = /^https?:\/\//i.test(raw);
    if (isFullUrl) {
      return { href: raw, label: raw };
    }

    const handle = raw.replace(/^@/, '');

    if (platform === 'leetcode') {
      return { href: `https://leetcode.com/${handle}/`, label: `@${handle}` };
    }

    if (platform === 'codolio') {
      return { href: `https://codolio.com/profile/${handle}`, label: `@${handle}` };
    }

    if (platform === 'gfg') {
      return { href: `https://www.geeksforgeeks.org/user/${handle}/`, label: `@${handle}` };
    }

    return { href: raw, label: raw };
  };

  const previewBadges = (earnedBadges || []).slice(0, 3);
  const extraBadgeCount = Math.max((totalEarnedBadges || 0) - previewBadges.length, 0);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Profile</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">Manage your profile and career goals</p>
        </div>
        {isEditing ? (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              <X className="w-4 h-4 mr-2" /> Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              <Save className="w-4 h-4 mr-2" /> Save Changes
            </Button>
          </div>
        ) : (
          <Button onClick={() => setIsEditing(true)}>
            <Edit3 className="w-4 h-4 mr-2" /> Edit Profile
          </Button>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Profile Card */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-3xl font-bold text-white">
                  {(profile.name || 'U').split(' ').map((part) => part[0]).join('')}
                </div>
                <div className="flex-1 grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Full Name</Label>
                    {isEditing ? (
                      <Input
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      />
                    ) : (
                      <p className="text-foreground font-medium">{profile.name || '-'}</p>
                    )}
                  </div>
                  <div>
                    <Label>Email</Label>
                    <p className="text-foreground flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      {profile.email || '-'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Academic Info */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-accent" />
                Academic Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>College</Label>
                  {isEditing ? (
                    <Input
                      value={profile.college}
                      onChange={(e) => setProfile({ ...profile, college: e.target.value })}
                    />
                  ) : (
                    <p className="text-foreground flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      {profile.college || '-'}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Branch</Label>
                  {isEditing ? (
                    <Input
                      value={profile.branch}
                      onChange={(e) => setProfile({ ...profile, branch: e.target.value })}
                    />
                  ) : (
                    <p className="text-foreground">{profile.branch || '-'}</p>
                  )}
                </div>
                <div>
                  <Label>Year of Study</Label>
                  {isEditing ? (
                    <Select
                      value={String(profile.year)}
                      onValueChange={(value) => setProfile({ ...profile, year: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4].map(y => (
                          <SelectItem key={y} value={String(y)}>{y}{y === 1 ? 'st' : y === 2 ? 'nd' : y === 3 ? 'rd' : 'th'} Year</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-foreground">{getYearSuffix(profile.year || 1)} Year</p>
                  )}
                </div>
                <div>
                  <Label>CGPA</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      step="0.1"
                      max="10"
                      value={profile.cgpa}
                      onChange={(e) => setProfile({ ...profile, cgpa: parseFloat(e.target.value) })}
                    />
                  ) : (
                    <p className="text-foreground font-semibold text-lg">{profile.cgpa ?? 0}/10</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-success" />
                Technical Skills
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {profile.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="px-3 py-1">
                    {skill}
                    {isEditing && (
                      <button onClick={() => removeSkill(skill)} className="ml-2 hover:text-destructive">
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>
              {isEditing && (
                <div>
                  <Label className="text-sm text-muted-foreground">Add Skills</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {AVAILABLE_SKILLS.filter(s => !profile.skills.includes(s)).map((skill) => (
                      <Badge
                        key={skill}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary/10"
                        onClick={() => addSkill(skill)}
                      >
                        <Plus className="w-3 h-3 mr-1" /> {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Projects */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Github className="w-5 h-5" />
                Projects
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {profile.projects.map((project, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">{project.name}</p>
                      <a href={project.url} className="text-sm text-muted-foreground hover:text-primary">
                        {project.url}
                      </a>
                    </div>
                  </div>
                  {isEditing && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => deleteProject(idx)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              {isEditing && !showProjectForm && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowProjectForm(true)}
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Project
                </Button>
              )}
              {isEditing && showProjectForm && (
                <div className="space-y-3 p-4 rounded-lg bg-muted/30">
                  <div>
                    <Label>Project Name</Label>
                    <Input
                      placeholder="E.g., Portfolio Website"
                      value={newProject.name}
                      onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Project URL</Label>
                    <Input
                      placeholder="https://github.com/username/project"
                      value={newProject.url}
                      onChange={(e) => setNewProject({ ...newProject, url: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={addProject} className="flex-1">
                      <Plus className="w-4 h-4 mr-2" /> Add
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowProjectForm(false);
                        setNewProject({ name: '', url: '' });
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Coding Profiles */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-warning" />
                Coding Profiles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4 items-start">
                <div>
                  <Label className="block mb-1">LeetCode</Label>
                  {isEditing ? (
                    <Input
                      value={profile.codingProfiles.leetcode}
                      onChange={(e) => setProfile({
                        ...profile,
                        codingProfiles: { ...profile.codingProfiles, leetcode: e.target.value }
                      })}
                    />
                  ) : (
                    (() => {
                      const link = getProfileLinkMeta('leetcode', profile.codingProfiles.leetcode);
                      return link ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noreferrer"
                          className="block max-w-full break-words whitespace-normal text-primary hover:underline"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <p className="text-muted-foreground">-</p>
                      );
                    })()
                  )}
                </div>
                <div>
                  <Label className="block mb-1">Codolio</Label>
                  {isEditing ? (
                    <Input
                      value={profile.codingProfiles.codolio}
                      onChange={(e) => setProfile({
                        ...profile,
                        codingProfiles: { ...profile.codingProfiles, codolio: e.target.value }
                      })}
                    />
                  ) : (
                    (() => {
                      const link = getProfileLinkMeta('codolio', profile.codingProfiles.codolio);
                      return link ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noreferrer"
                          className="block max-w-full break-words whitespace-normal text-primary hover:underline"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <p className="text-muted-foreground">-</p>
                      );
                    })()
                  )}
                </div>
                <div>
                  <Label className="block mb-1">GeeksforGeeks</Label>
                  {isEditing ? (
                    <Input
                      value={profile.codingProfiles.gfg}
                      onChange={(e) => setProfile({
                        ...profile,
                        codingProfiles: { ...profile.codingProfiles, gfg: e.target.value }
                      })}
                    />
                  ) : (
                    (() => {
                      const link = getProfileLinkMeta('gfg', profile.codingProfiles.gfg);
                      return link ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noreferrer"
                          className="block max-w-full break-words whitespace-normal text-primary hover:underline"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <p className="text-muted-foreground">-</p>
                      );
                    })()
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sidebar Stats */}
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Target Role */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-streak" />
                Target Role
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Select
                  value={profile.targetRole}
                  onValueChange={(value) => setProfile({ ...profile, targetRole: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TARGET_ROLES.map(role => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-lg font-semibold text-primary">{profile.targetRole}</p>
              )}
            </CardContent>
          </Card>

          {/* Study Goals */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Study Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Weekly Study Goal (hours)</Label>
                {isEditing ? (
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={profile.weeklyStudyGoal}
                    onChange={(e) => setProfile({ ...profile, weeklyStudyGoal: parseInt(e.target.value) || 25 })}
                  />
                ) : (
                  <p className="text-lg font-semibold text-foreground">{profile.weeklyStudyGoal}h / week</p>
                )}
              </div>
              <div>
                <Label>Daily Task Target</Label>
                {isEditing ? (
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    value={profile.dailyTaskGoal}
                    onChange={(e) => setProfile({ ...profile, dailyTaskGoal: parseInt(e.target.value) || 6 })}
                  />
                ) : (
                  <p className="text-lg font-semibold text-foreground">{profile.dailyTaskGoal} tasks / day</p>
                )}
              </div>
              {!isEditing && (
                <p className="text-xs text-muted-foreground">Click "Edit Profile" to update your goals</p>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-success" />
                Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Current Streak</span>
                <span className="font-bold text-streak">🔥 {profile.streak} days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Longest Streak</span>
                <span className="font-semibold">{profile.longestStreak} days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tasks Completed</span>
                <span className="font-semibold">{profile.tasksCompleted}</span>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground">Avg. Productivity</span>
                  <span className="font-semibold">{profile.avgProductivity}%</span>
                </div>
                <Progress value={profile.avgProductivity} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Resume */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-accent" />
                Resume
              </CardTitle>
            </CardHeader>
            <CardContent>
              {resumeFile ? (
                <div className="border-2 border-primary/20 rounded-lg p-4 bg-primary/5">
                  <div className="flex items-center gap-3 mb-3">
                    <FileText className="w-8 h-8 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{resumeFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(resumeFile.size / 1024).toFixed(2)} KB
                      </p>
                      {profile.resumeUrl && (
                        <div className="flex items-center gap-3 mt-1">
                          <a
                            href={getResumeUrl() || '#'}
                            onClick={handleViewResume}
                            className="text-xs text-primary hover:underline"
                          >
                            {isResumeOpening ? 'Opening resume...' : 'View uploaded resume'}
                          </a>
                          {getResumeViewerUrl() && (
                            <a
                              href={getResumeUrl() || '#'}
                              onClick={handleViewResume}
                              className="text-xs text-muted-foreground hover:underline"
                            >
                              Open in viewer
                            </a>
                          )}
                        </div>
                      )}
                      {!getResumeUrl() && profile.resumeUrl && (
                        <p className="text-xs text-destructive mt-1">
                          Resume link is invalid. Please replace and upload again.
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      disabled={isResumeUploading}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" /> {isResumeUploading ? 'Uploading...' : 'Replace'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        try {
                          await saveProfile({ resumeUrl: '' });
                          setResumeFile(null);
                          setProfile((prev) => ({ ...prev, resumeUrl: '' }));
                          toast.success('Resume removed');
                        } catch (error) {
                          toast.error(error.message || 'Failed to remove resume');
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
                  <FileText className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-3">Upload your resume (PDF, max 5MB)</p>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isResumeUploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" /> {isResumeUploading ? 'Uploading...' : 'Upload Resume'}
                  </Button>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleResumeUpload}
                className="hidden"
              />
            </CardContent>
          </Card>

          {/* Badges Preview */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-warning" />
                Badges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {previewBadges.length > 0 ? (
                  previewBadges.map((badge) => (
                    <div
                      key={badge._id || badge.name}
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center"
                      title={badge.name || 'Badge'}
                    >
                      {badge.icon || '🏅'}
                    </div>
                  ))
                ) : (
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground" title="No badges earned yet">
                    🏅
                  </div>
                )}

                {extraBadgeCount > 0 && (
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                    +{extraBadgeCount}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Local Resume Preview Modal */}
      {isResumeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 p-4 md:p-8">
          <div className="mx-auto h-full max-w-5xl rounded-xl bg-background shadow-xl border border-border flex flex-col">
            <div className="flex items-center justify-between p-3 border-b border-border">
              <h3 className="font-semibold">Resume Preview</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsResumeModalOpen(false)}
              >
                <X className="w-4 h-4 mr-1" /> Close
              </Button>
            </div>
            <div className="flex-1 p-2">
              {resumePreviewUrl ? (
                <iframe
                  src={resumePreviewUrl}
                  title="Resume Preview"
                  className="w-full h-full rounded-md border border-border"
                />
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                  Resume preview unavailable.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
