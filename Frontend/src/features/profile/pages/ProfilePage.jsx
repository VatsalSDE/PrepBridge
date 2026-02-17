import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Mail, Building2, GraduationCap, Target, Code2, 
  Github, Globe, FileText, Edit3, Save, X, Plus, Trash2,
  Award, Calendar, TrendingUp, Upload, Clock
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
import { TARGET_ROLES, MOCK_USER } from '@/utils/constants';

const AVAILABLE_SKILLS = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 
  'C++', 'SQL', 'MongoDB', 'Git', 'Docker', 'AWS', 'REST APIs',
  'Data Structures', 'Algorithms', 'System Design', 'Machine Learning'
];

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', url: '' });
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const fileInputRef = useRef(null);
  const [profile, setProfile] = useState({
    ...MOCK_USER,
    weeklyStudyGoal: 25,
    dailyTaskGoal: 6,
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'Git'],
    projects: [
      { name: 'E-Commerce Platform', url: 'https://github.com/alex/ecommerce' },
      { name: 'Task Manager App', url: 'https://github.com/alex/taskmanager' }
    ],
    codingProfiles: {
      leetcode: 'alex_codes',
      codolio: 'alex_johnson',
      gfg: 'alexj'
    }
  });

  const handleSave = () => {
    setIsEditing(false);
    setShowProjectForm(false);
    toast.success('Profile updated successfully!');
    // Save to backend
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

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === 'application/pdf') {
        if (file.size <= 5 * 1024 * 1024) { // 5MB limit
          setResumeFile(file);
          toast.success(`Resume "${file.name}" uploaded successfully!`);
          // Upload to backend
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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your profile and career goals</p>
        </div>
        {isEditing ? (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              <X className="w-4 h-4 mr-2" /> Cancel
            </Button>
            <Button onClick={handleSave}>
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
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-3xl font-bold text-white">
                  {profile.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Full Name</Label>
                    {isEditing ? (
                      <Input 
                        value={profile.name} 
                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                      />
                    ) : (
                      <p className="text-foreground font-medium">{profile.name}</p>
                    )}
                  </div>
                  <div>
                    <Label>Email</Label>
                    <p className="text-foreground flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      {profile.email}
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
                      onChange={(e) => setProfile({...profile, college: e.target.value})}
                    />
                  ) : (
                    <p className="text-foreground flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      {profile.college}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Branch</Label>
                  {isEditing ? (
                    <Input 
                      value={profile.branch} 
                      onChange={(e) => setProfile({...profile, branch: e.target.value})}
                    />
                  ) : (
                    <p className="text-foreground">{profile.branch}</p>
                  )}
                </div>
                <div>
                  <Label>Year of Study</Label>
                  {isEditing ? (
                    <Select 
                      value={String(profile.year)}
                      onValueChange={(value) => setProfile({...profile, year: parseInt(value)})}
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
                    <p className="text-foreground">{getYearSuffix(profile.year)} Year</p>
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
                      onChange={(e) => setProfile({...profile, cgpa: parseFloat(e.target.value)})}
                    />
                  ) : (
                    <p className="text-foreground font-semibold text-lg">{profile.cgpa}/10</p>
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
                      onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Project URL</Label>
                    <Input 
                      placeholder="https://github.com/username/project"
                      value={newProject.url}
                      onChange={(e) => setNewProject({...newProject, url: e.target.value})}
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
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>LeetCode</Label>
                  {isEditing ? (
                    <Input 
                      value={profile.codingProfiles.leetcode} 
                      onChange={(e) => setProfile({
                        ...profile, 
                        codingProfiles: {...profile.codingProfiles, leetcode: e.target.value}
                      })}
                    />
                  ) : (
                    <p className="text-foreground">@{profile.codingProfiles.leetcode}</p>
                  )}
                </div>
                <div>
                  <Label>Codolio</Label>
                  {isEditing ? (
                    <Input 
                      value={profile.codingProfiles.codolio} 
                      onChange={(e) => setProfile({
                        ...profile, 
                        codingProfiles: {...profile.codingProfiles, codolio: e.target.value}
                      })}
                    />
                  ) : (
                    <p className="text-foreground">@{profile.codingProfiles.codolio}</p>
                  )}
                </div>
                <div>
                  <Label>GeeksforGeeks</Label>
                  {isEditing ? (
                    <Input 
                      value={profile.codingProfiles.gfg} 
                      onChange={(e) => setProfile({
                        ...profile, 
                        codingProfiles: {...profile.codingProfiles, gfg: e.target.value}
                      })}
                    />
                  ) : (
                    <p className="text-foreground">@{profile.codingProfiles.gfg}</p>
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
                  onValueChange={(value) => setProfile({...profile, targetRole: value})}
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
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" /> Replace
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setResumeFile(null);
                        toast.success('Resume removed');
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
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" /> Upload Resume
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
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-warning to-streak flex items-center justify-center">
                  🔥
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  💻
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-success to-primary flex items-center justify-center">
                  ⭐
                </div>
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                  +5
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
