import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileSearch, Target, CheckCircle2, XCircle, Lightbulb, Upload,
  Briefcase, Clock, ChevronRight, Sparkles, Building2,
  GraduationCap, BarChart3, FileText, AlertCircle, Search,
  MapPin, X, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { containerVariants, itemVariants } from '@/utils/animations';
import toast from 'react-hot-toast';
import { COMPANIES, CITIES, DEFAULT_RESUME_SKILLS, SKILL_KEYWORDS } from '../data/mockCompanyData';

export default function JDMatchingPage() {
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchResult, setMatchResult] = useState(null);
  const [activeTab, setActiveTab] = useState('jd');
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('All Cities');

  const selectedCompany = useMemo(() => 
    COMPANIES.find(c => c.id === selectedCompanyId),
    [selectedCompanyId]
  );

  // Filter companies based on search and city
  const filteredCompanies = useMemo(() => {
    return COMPANIES.filter(company => {
      const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCity = selectedCity === 'All Cities' || company.city === selectedCity;
      return matchesSearch && matchesCity && company.approved;
    });
  }, [searchQuery, selectedCity]);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf' || file.type === 'text/plain' || file.name.endsWith('.txt')) {
        setResumeFile(file);
        toast.success(`📄 Resume uploaded: ${file.name}`);
        setResumeText(`Resume content from ${file.name} - Skills: Java, Python, React, Node.js, SQL, Data Structures, Algorithms, Git, REST APIs, Problem Solving`);
      } else {
        toast.error('Please upload a PDF or TXT file');
      }
    }
  };

  const analyzeMatch = () => {
    if (!selectedCompanyId) {
      toast.error('Please select a company first');
      return;
    }
    if (!resumeText.trim() && !resumeFile) {
      toast.error('Please upload your resume or paste your skills');
      return;
    }

    setIsAnalyzing(true);
    toast.loading('Analyzing your profile...', { id: 'jd-analyze' });

    setTimeout(() => {
      const company = COMPANIES.find(c => c.id === selectedCompanyId);
      const jdLower = company.jd.toLowerCase();
      
      const resumeSkills = resumeText.toLowerCase();
      const matchedSkills = DEFAULT_RESUME_SKILLS.filter(skill => 
        resumeSkills.includes(skill.toLowerCase()) || jdLower.includes(skill.toLowerCase())
      );

      const missingSkills = [];
      Object.entries(SKILL_KEYWORDS).forEach(([category, keywords]) => {
        keywords.forEach(keyword => {
          if (jdLower.includes(keyword) && !resumeSkills.includes(keyword)) {
            const skillName = keyword.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            if (!missingSkills.find(s => s.name.toLowerCase() === skillName.toLowerCase())) {
              missingSkills.push({
                name: skillName,
                priority: company.focusDistribution.dsa > 35 ? 'high' : 'medium',
                category
              });
            }
          }
        });
      });

      const baseScore = Math.min(85, 50 + matchedSkills.length * 3);
      const penaltyPerMissing = company.focusDistribution.dsa > 35 ? 3 : 2;
      const score = Math.max(40, baseScore - (missingSkills.slice(0, 5).length * penaltyPerMissing));

      setMatchResult({
        score,
        matchedSkills,
        missingSkills: missingSkills.slice(0, 6),
        company,
        estimatedPrepTime: score > 70 ? '2-4 weeks' : score > 55 ? '4-6 weeks' : '6-8 weeks'
      });

      setIsAnalyzing(false);
      setActiveTab('result');
      toast.success('🎯 Analysis complete!', { id: 'jd-analyze' });
    }, 2000);
  };

  const handleCompanySelect = (companyId) => {
    setSelectedCompanyId(companyId);
    setMatchResult(null);
    setActiveTab('jd');
  };

  const clearSelection = () => {
    setSelectedCompanyId('');
    setMatchResult(null);
    setActiveTab('jd');
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return { text: 'Strong Match', color: 'bg-green-500' };
    if (score >= 60) return { text: 'Good Match', color: 'bg-yellow-500' };
    return { text: 'Needs Work', color: 'bg-red-500' };
  };

  const getPatternBadge = (pattern) => {
    const styles = {
      'DSA-heavy': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      'Tech-heavy': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      'HR-heavy': 'bg-orange-500/10 text-orange-500 border-orange-500/20'
    };
    return styles[pattern] || 'bg-muted text-muted-foreground';
  };

  const hasGuidelines = selectedCompany?.guidelines?.length > 0;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <FileSearch className="w-8 h-8 text-primary" />
          JD Matching
        </h1>
        <p className="text-muted-foreground mt-1">
          Select a company, upload your resume, and get personalized insights
        </p>
      </div>

      {/* Step 1: Company Selection */}
      {!selectedCompanyId ? (
        <motion.div variants={itemVariants}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Step 1: Select a Company
              </CardTitle>
              <CardDescription>
                Search and filter companies to find your target
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search and Filter Row */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search companies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="w-full sm:w-48">
                    <MapPin className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by city" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border">
                    {CITIES.map(city => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Company List */}
              <ScrollArea className="h-[400px] rounded-lg border border-border/50">
                <div className="p-2 space-y-2">
                  {filteredCompanies.length > 0 ? (
                    filteredCompanies.map((company) => (
                      <motion.div
                        key={company.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => handleCompanySelect(company.id)}
                        className="p-4 rounded-lg border border-border/50 bg-card hover:bg-muted/50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{company.logo}</span>
                            <div>
                              <h3 className="font-medium">{company.name}</h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="w-3 h-3" />
                                {company.city}
                                <span>•</span>
                                <span>{company.industry}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getPatternBadge(company.interviewPattern)}>
                              {company.interviewPattern}
                            </Badge>
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Building2 className="w-12 h-12 text-muted-foreground mb-3" />
                      <p className="text-muted-foreground">No companies found matching your criteria</p>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <p className="text-sm text-muted-foreground text-center">
                {filteredCompanies.length} companies found
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <>
          {/* Selected Company Header */}
          <motion.div variants={itemVariants}>
            <Card className="glass-card bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{selectedCompany.logo}</span>
                    <div>
                      <h2 className="text-xl font-semibold">{selectedCompany.name}</h2>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {selectedCompany.city}
                        <span>•</span>
                        <span>{selectedCompany.industry}</span>
                      </div>
                    </div>
                    <Badge className={getPatternBadge(selectedCompany.interviewPattern)}>
                      {selectedCompany.interviewPattern}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedCompany.websiteUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(selectedCompany.websiteUrl, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Visit Company Page
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={clearSelection}>
                      <X className="w-4 h-4 mr-2" />
                      Change Company
                    </Button>
                  </div>
                </div>

                {/* Focus Distribution */}
                <div className="grid grid-cols-4 gap-2 mt-4">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-center">
                    <div className="text-xs text-muted-foreground">DSA</div>
                    <div className="font-semibold text-blue-500">
                      {selectedCompany.focusDistribution.dsa}%
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-purple-500/10 text-center">
                    <div className="text-xs text-muted-foreground">Core CS</div>
                    <div className="font-semibold text-purple-500">
                      {selectedCompany.focusDistribution.coreCS}%
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-green-500/10 text-center">
                    <div className="text-xs text-muted-foreground">System Design</div>
                    <div className="font-semibold text-green-500">
                      {selectedCompany.focusDistribution.systemDesign}%
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-orange-500/10 text-center">
                    <div className="text-xs text-muted-foreground">HR/Behavioral</div>
                    <div className="font-semibold text-orange-500">
                      {selectedCompany.focusDistribution.hr}%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Step 2: Resume Upload */}
          <motion.div variants={itemVariants}>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Step 2: Upload Your Resume
                </CardTitle>
                <CardDescription>
                  Upload your resume or paste your skills to get matched
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {/* File Upload */}
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,.txt"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors h-full flex flex-col items-center justify-center">
                      <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                      {resumeFile ? (
                        <p className="text-sm text-primary font-medium">{resumeFile.name}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Drag & drop or click to upload (PDF, TXT)
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Text Input */}
                  <div>
                    <Textarea
                      placeholder="Or paste your resume content / list your skills here..."
                      className="min-h-[120px] resize-none h-full"
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                    />
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={analyzeMatch}
                  disabled={(!resumeText.trim() && !resumeFile) || isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="mr-2"
                      >
                        <Sparkles className="w-5 h-5" />
                      </motion.div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Target className="w-5 h-5 mr-2" />
                      Analyze Match
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Results Section with Tabs */}
          <motion.div variants={itemVariants}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="jd" className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  <span className="hidden sm:inline">Job Description</span>
                  <span className="sm:hidden">JD</span>
                </TabsTrigger>
                <TabsTrigger value="result" disabled={!matchResult} className="flex items-center gap-1">
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Match Result</span>
                  <span className="sm:hidden">Result</span>
                </TabsTrigger>
                <TabsTrigger value="guidelines" className="flex items-center gap-1">
                  <GraduationCap className="w-4 h-4" />
                  <span className="hidden sm:inline">Interview Prep Guidelines</span>
                  <span className="sm:hidden">Guidelines</span>
                </TabsTrigger>
              </TabsList>

              {/* JD Tab */}
              <TabsContent value="jd" className="mt-4">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="w-5 h-5" />
                      {selectedCompany.name} - Job Description
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted/30 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap max-h-[400px] overflow-y-auto">
                      {selectedCompany.jd}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Match Result Tab */}
              <TabsContent value="result" className="mt-4">
                <AnimatePresence mode="wait">
                  {matchResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="grid md:grid-cols-2 gap-6"
                    >
                      {/* Score Card */}
                      <Card className="glass-card">
                        <CardContent className="p-6">
                          <div className="text-center">
                            <div className="relative w-32 h-32 mx-auto mb-4">
                              <svg className="w-full h-full transform -rotate-90">
                                <circle
                                  cx="64"
                                  cy="64"
                                  r="56"
                                  fill="none"
                                  stroke="hsl(var(--muted))"
                                  strokeWidth="12"
                                />
                                <motion.circle
                                  cx="64"
                                  cy="64"
                                  r="56"
                                  fill="none"
                                  stroke="hsl(var(--primary))"
                                  strokeWidth="12"
                                  strokeLinecap="round"
                                  strokeDasharray={352}
                                  initial={{ strokeDashoffset: 352 }}
                                  animate={{ strokeDashoffset: 352 - (352 * matchResult.score / 100) }}
                                  transition={{ duration: 1, ease: 'easeOut' }}
                                />
                              </svg>
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className={`text-4xl font-bold ${getScoreColor(matchResult.score)}`}>
                                  {matchResult.score}%
                                </span>
                              </div>
                            </div>
                            <Badge className={`${getScoreLabel(matchResult.score).color} text-white`}>
                              {getScoreLabel(matchResult.score).text}
                            </Badge>
                            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              Estimated prep: {matchResult.estimatedPrepTime}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Skills Analysis */}
                      <Card className="glass-card">
                        <CardHeader>
                          <CardTitle className="text-base">Skills Analysis</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <p className="text-sm font-medium text-green-500 flex items-center gap-2 mb-2">
                              <CheckCircle2 className="w-4 h-4" />
                              Matched ({matchResult.matchedSkills.length})
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {matchResult.matchedSkills.map((skill, idx) => (
                                <Badge key={idx} variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="text-sm font-medium text-red-500 flex items-center gap-2 mb-2">
                              <XCircle className="w-4 h-4" />
                              Missing ({matchResult.missingSkills.length})
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {matchResult.missingSkills.map((skill, idx) => (
                                <Badge 
                                  key={idx} 
                                  variant="outline" 
                                  className={`${
                                    skill.priority === 'high' 
                                      ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                                      : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                  }`}
                                >
                                  {skill.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </TabsContent>

              {/* Interview Preparation Guidelines Tab */}
              <TabsContent value="guidelines" className="mt-4">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-primary" />
                      Interview Preparation Guidelines
                    </CardTitle>
                    <CardDescription>
                      Curated insights from alumni experiences to help you prepare effectively
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {hasGuidelines ? (
                      <div className="space-y-3">
                        {selectedCompany.guidelines.map((guideline, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors"
                          >
                            <span className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                              {idx + 1}
                            </span>
                            <div className="flex-1">
                              <p className="text-sm leading-relaxed">{guideline}</p>
                            </div>
                            <Lightbulb className="w-4 h-4 text-primary/50 flex-shrink-0" />
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <AlertCircle className="w-12 h-12 text-muted-foreground mb-3" />
                        <h3 className="font-medium mb-2">Guidelines Coming Soon</h3>
                        <p className="text-sm text-muted-foreground max-w-md">
                          Interview preparation guidelines for {selectedCompany.name} are being compiled from verified alumni experiences. 
                          Check back soon for actionable tips and strategies!
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}