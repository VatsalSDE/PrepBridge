import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  BarChart3,
  Bookmark,
  BookmarkCheck,
  Briefcase,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  FileSearch,
  FileText,
  GraduationCap,
  Lightbulb,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  Sparkles,
  Target,
  Trash2,
  Upload,
  X,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { containerVariants, itemVariants } from '@/utils/animations';
import toast from 'react-hot-toast';
import useJDStore from '@/store/jdStore';

const AUTO_REFRESH_MS = 20000;

const getPatternBadge = (pattern) => {
  const styles = {
    'DSA-heavy': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    'Tech-heavy': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    'HR-heavy': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  };
  return styles[pattern] || 'bg-muted text-muted-foreground border-border';
};

const getScoreColor = (score) => {
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-yellow-500';
  return 'text-red-500';
};

const getScoreLabel = (score) => {
  if (score >= 80) return { text: 'Strong Match', color: 'bg-green-500 text-white' };
  if (score >= 60) return { text: 'Good Match', color: 'bg-yellow-500 text-black' };
  return { text: 'Needs Work', color: 'bg-red-500 text-white' };
};

const getEstimatedPrepTime = (score) => {
  if (score >= 80) return '2-4 weeks';
  if (score >= 60) return '4-6 weeks';
  return '6-8 weeks';
};

// ✅ CHANGE 1: Added difficulty color helper
const getDifficultyStyle = (difficulty) => {
  if (difficulty === 'Hard') return 'bg-red-500/10 text-red-400 border-red-500/20';
  if (difficulty === 'Medium') return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
  return 'bg-green-500/10 text-green-400 border-green-500/20';
};

const formatDateTime = (value) => {
  if (!value) return 'Just now';
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function JDMatchingPage() {
  const {
    companies,
    currentAnalysis,
    isLoading,
    isAnalyzing,
    error,
    fetchCompanies,
    fetchHistory,
    fetchSkillGaps,
    analyzeJD,
    toggleSaveAnalysis,
    deleteAnalysis,
    clearCurrentAnalysis,
  } = useJDStore();

  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [activeTab, setActiveTab] = useState('jd');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const selectedCompany = useMemo(
    () => companies.find((company) => company._id === selectedCompanyId) || null,
    [companies, selectedCompanyId]
  );

  const cityOptions = useMemo(() => {
    const cities = Array.from(new Set(companies.map((company) => company.city).filter(Boolean)));
    return ['all', ...cities.sort((left, right) => left.localeCompare(right))];
  }, [companies]);

  const filteredCompanies = useMemo(() => {
    return companies.filter((company) => {
      const search = searchQuery.trim().toLowerCase();
      const matchesSearch = !search || [company.name, company.industry, company.city]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(search));
      const matchesCity = selectedCity === 'all' || company.city === selectedCity;
      return matchesSearch && matchesCity;
    });
  }, [companies, searchQuery, selectedCity]);

  const displayedAnalysis = currentAnalysis;
  const hasGuidelines = Boolean(selectedCompany?.guidelines?.length);

  const loadLiveData = async (showLoader = false) => {
    if (showLoader) setIsRefreshing(true);
    try {
      await Promise.all([
        fetchCompanies({ page: 1, limit: 100 }),
        fetchHistory({ page: 1, limit: 10 }),
        fetchSkillGaps(),
      ]);
      setLastSyncedAt(new Date());
    } catch (loadError) {
      if (showLoader) toast.error(loadError.message || 'Failed to sync JD data');
    } finally {
      if (showLoader) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadLiveData(true);
    const interval = window.setInterval(() => loadLiveData(false), AUTO_REFRESH_MS);
    const handleFocus = () => loadLiveData(false);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') loadLiveData(false);
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  useEffect(() => {
    if (currentAnalysis) setActiveTab('result');
  }, [currentAnalysis]);

  useEffect(() => {
    if (!selectedCompanyId) return;
    const stillExists = companies.some((company) => company._id === selectedCompanyId);
    if (!stillExists && !isLoading) {
      setSelectedCompanyId('');
      clearCurrentAnalysis();
      setActiveTab('jd');
      toast('The selected company is no longer available.');
    }
  }, [selectedCompanyId, companies, isLoading, clearCurrentAnalysis]);

  const handleCompanySelect = (companyId) => {
    setSelectedCompanyId(companyId);
    clearCurrentAnalysis();
    setActiveTab('jd');
  };

  const clearSelection = () => {
    setSelectedCompanyId('');
    setResumeText('');
    setResumeFile(null);
    clearCurrentAnalysis();
    setActiveTab('jd');
  };

  // ✅ CHANGE 2: Updated to accept PDF + Word docs
  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const lowerName = file.name.toLowerCase();
    const isPdf = file.type === 'application/pdf' || lowerName.endsWith('.pdf');
    const isWord = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      || file.type === 'application/msword'
      || lowerName.endsWith('.docx')
      || lowerName.endsWith('.doc');
    const isTxt = file.type === 'text/plain' || lowerName.endsWith('.txt');

    if (!isPdf && !isWord && !isTxt) {
      toast.error('Please upload a PDF, Word (.docx), or TXT file');
      return;
    }

    setResumeFile(file);

    if (isTxt) {
      try {
        const content = await file.text();
        setResumeText(content);
        toast.success(`Text loaded from ${file.name}`);
      } catch {
        toast.error('Unable to read the text file');
      }
      return;
    }

    // PDF or Word — backend will extract text
    toast.success(`${file.name} selected! AI will extract text automatically.`);
  };

  // ✅ CHANGE 3: Send form-data when file uploaded, JSON when text pasted
  const handleAnalyze = async () => {
    if (!selectedCompanyId) {
      toast.error('Please select a company first');
      return;
    }

    if (!resumeFile && !resumeText.trim()) {
      toast.error('Upload a resume file or paste resume text');
      return;
    }

    toast.loading('Analyzing JD match...', { id: 'jd-analyze' });

    try {
      if (resumeFile && (
        resumeFile.type === 'application/pdf' ||
        resumeFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        resumeFile.type === 'application/msword'
      )) {
        // Send as form-data for PDF/Word parsing
        const formData = new FormData();
        formData.append('companyId', selectedCompanyId);
        formData.append('resume', resumeFile);
        await analyzeJD(formData, true); // true = isFormData
      } else {
        // Send as JSON for pasted text
        await analyzeJD({ companyId: selectedCompanyId, resumeText: resumeText.trim() });
      }

      await Promise.all([
        fetchHistory({ page: 1, limit: 10 }),
        fetchSkillGaps(),
      ]);
      toast.success('JD analysis completed', { id: 'jd-analyze' });
    } catch (analyzeError) {
      toast.error(analyzeError.message || 'Failed to analyze JD', { id: 'jd-analyze' });
    }
  };

  const handleToggleSave = async (analysisId) => {
    try {
      const saved = await toggleSaveAnalysis(analysisId);
      toast.success(saved ? 'Analysis saved' : 'Saved flag removed');
    } catch (toggleError) {
      toast.error(toggleError.message || 'Failed to update saved state');
    }
  };

  const handleDeleteAnalysis = async (analysisId) => {
    try {
      await deleteAnalysis(analysisId);
      if (currentAnalysis?._id === analysisId) {
        clearCurrentAnalysis();
        setActiveTab('jd');
      }
      await fetchSkillGaps();
      toast.success('Analysis deleted');
    } catch (deleteError) {
      toast.error(deleteError.message || 'Failed to delete analysis');
    }
  };

  const scoreMeta = displayedAnalysis ? getScoreLabel(displayedAnalysis.matchScore || 0) : null;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold text-foreground">
            <FileSearch className="h-8 w-8 text-primary" />
            JD Matching
          </h1>
          <p className="mt-1 text-muted-foreground">
            AI-powered JD matching. Upload your resume and get instant skill gap analysis.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/70 px-4 py-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Live Sync</p>
            <p className="text-sm text-foreground">
              {lastSyncedAt ? `Last synced ${formatDateTime(lastSyncedAt)}` : 'Syncing data...'}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => loadLiveData(true)} disabled={isRefreshing}>
            {isRefreshing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Refresh
          </Button>
        </div>
      </div>

      {error ? (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-start gap-3 p-4 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </CardContent>
        </Card>
      ) : null}

      <div className="space-y-6">
        <motion.div variants={itemVariants} className="space-y-6">
          {!selectedCompany ? (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Select a Company
                </CardTitle>
                <CardDescription>
                  This list is sourced from approved admin entries and refreshes in real time.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search by company, industry, or city"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger className="w-full sm:w-52">
                      <MapPin className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Filter by city" />
                    </SelectTrigger>
                    <SelectContent>
                      {cityOptions.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city === 'all' ? 'All Cities' : city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <ScrollArea className="h-[460px] rounded-lg border border-border/50">
                  <div className="space-y-2 p-2">
                    {filteredCompanies.length > 0 ? filteredCompanies.map((company) => (
                      <motion.div
                        key={company._id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => handleCompanySelect(company._id)}
                        className="cursor-pointer rounded-lg border border-border/50 bg-card p-4 transition-colors hover:bg-muted/40"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="text-2xl">{company.logo || '🏢'}</span>
                            <div className="min-w-0">
                              <h3 className="truncate font-medium text-foreground">{company.name}</h3>
                              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{company.city}</span>
                                <span>•</span>
                                <span>{company.industry}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* ✅ CHANGE 4: Show difficulty badge in company list */}
                            {company.difficultyEstimate && (
                              <Badge variant="outline" className={getDifficultyStyle(company.difficultyEstimate)}>
                                {company.difficultyEstimate}
                              </Badge>
                            )}
                            <Badge className={getPatternBadge(company.interviewPattern)}>
                              {company.interviewPattern || 'General'}
                            </Badge>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </div>
                      </motion.div>
                    )) : (
                      <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
                        <Building2 className="mb-3 h-12 w-12 text-muted-foreground" />
                        <p className="font-medium text-foreground">No approved companies match these filters</p>
                        <p className="mt-1 text-sm text-muted-foreground">Clear the filters or wait for the next admin sync.</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                <p className="text-center text-sm text-muted-foreground">{filteredCompanies.length} live company entries</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="glass-card border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-4">
                      <span className="text-3xl">{selectedCompany.logo || '🏢'}</span>
                      <div className="min-w-0">
                        <h2 className="truncate text-lg font-semibold text-foreground sm:text-xl">
                          {selectedCompany.name}
                        </h2>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{selectedCompany.city}</span>
                          <span>•</span>
                          <span>{selectedCompany.industry}</span>
                        </div>
                      </div>
                      <Badge className={getPatternBadge(selectedCompany.interviewPattern)}>
                        {selectedCompany.interviewPattern || 'General'}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      {selectedCompany.websiteUrl ? (
                        <Button variant="outline" size="sm" onClick={() => window.open(selectedCompany.websiteUrl, '_blank', 'noopener,noreferrer')}>
                          <ExternalLink className="mr-2 h-4 w-4" />Visit
                        </Button>
                      ) : null}
                      <Button variant="outline" size="sm" onClick={clearSelection}>
                        <X className="mr-2 h-4 w-4" />Change
                      </Button>
                    </div>
                  </div>

                  {/* Focus Distribution */}
                  <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <div className="rounded-lg bg-blue-500/10 p-2 text-center">
                      <div className="text-xs text-muted-foreground">DSA</div>
                      <div className="font-semibold text-blue-500">{selectedCompany.focusDistribution?.dsa || 0}%</div>
                    </div>
                    <div className="rounded-lg bg-purple-500/10 p-2 text-center">
                      <div className="text-xs text-muted-foreground">Core CS</div>
                      <div className="font-semibold text-purple-500">{selectedCompany.focusDistribution?.coreCS || 0}%</div>
                    </div>
                    <div className="rounded-lg bg-green-500/10 p-2 text-center">
                      <div className="text-xs text-muted-foreground">System Design</div>
                      <div className="font-semibold text-green-500">{selectedCompany.focusDistribution?.systemDesign || 0}%</div>
                    </div>
                    <div className="rounded-lg bg-orange-500/10 p-2 text-center">
                      <div className="text-xs text-muted-foreground">HR / Behavioral</div>
                      <div className="font-semibold text-orange-500">{selectedCompany.focusDistribution?.hr || 0}%</div>
                    </div>
                  </div>

                  {/* ✅ CHANGE 5: Difficulty Badge */}
                  {selectedCompany?.difficultyEstimate && (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Difficulty:</span>
                      <Badge variant="outline" className={getDifficultyStyle(selectedCompany.difficultyEstimate)}>
                        {selectedCompany.difficultyEstimate}
                      </Badge>
                    </div>
                  )}

                  {/* ✅ CHANGE 6: Round Structure */}
                  {selectedCompany?.roundStructure?.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-muted-foreground mb-2">Interview Rounds:</p>
                      <div className="flex flex-wrap items-center gap-2">
                        {selectedCompany.roundStructure.map((round, index) => (
                          <div key={index} className="flex items-center gap-1.5">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                              {index + 1}
                            </span>
                            <span className="text-xs text-foreground">{round}</span>
                            {index < selectedCompany.roundStructure.length - 1 && (
                              <ChevronRight className="h-3 w-3 text-muted-foreground" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ✅ CHANGE 7: Key Topics */}
                  {selectedCompany?.keyTopics?.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-muted-foreground mb-2">Key Topics:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedCompany.keyTopics.map((topic, index) => (
                          <span
                            key={index}
                            className="text-xs px-2 py-0.5 rounded-md bg-muted/40 border border-border/50 text-foreground"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Resume Input
                  </CardTitle>
                  <CardDescription>
                    Upload your PDF or Word resume — AI extracts text automatically. Or paste text directly.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* ✅ CHANGE 8: Updated file upload to accept PDF + Word */}
                    <div className="relative">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={handleFileUpload}
                        className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                      />
                      <div className="flex min-h-[140px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-6 text-center transition-colors hover:border-primary/50">
                        <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                        <p className="text-sm font-medium text-foreground">
                          {resumeFile ? resumeFile.name : 'Upload PDF, Word, or TXT'}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          PDF and Word files are parsed automatically by AI
                        </p>
                      </div>
                    </div>

                    <Textarea
                      placeholder="Or paste your resume text here..."
                      className="min-h-[140px] resize-none"
                      value={resumeText}
                      onChange={(event) => setResumeText(event.target.value)}
                    />
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || (!resumeText.trim() && !resumeFile)}
                  >
                    {isAnalyzing ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Analyzing...</>
                    ) : (
                      <><Target className="mr-2 h-5 w-5" />Analyze Match</>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="jd" className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    <span className="hidden sm:inline">Job Description</span>
                    <span className="sm:hidden">JD</span>
                  </TabsTrigger>
                  <TabsTrigger value="result" disabled={!displayedAnalysis} className="flex items-center gap-1">
                    <BarChart3 className="h-4 w-4" />
                    <span className="hidden sm:inline">Match Result</span>
                    <span className="sm:hidden">Result</span>
                  </TabsTrigger>
                  <TabsTrigger value="guidelines" className="flex items-center gap-1">
                    <GraduationCap className="h-4 w-4" />
                    <span className="hidden sm:inline">Prep Guidelines</span>
                    <span className="sm:hidden">Tips</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="jd" className="mt-4">
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />{selectedCompany.name} Job Description
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="max-h-[420px] overflow-y-auto rounded-lg bg-muted/30 p-4 text-sm whitespace-pre-wrap">
                        {selectedCompany.jd}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="result" className="mt-4">
                  <AnimatePresence mode="wait">
                    {displayedAnalysis ? (
                      <motion.div
                        key={displayedAnalysis._id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -16 }}
                        className="grid gap-6 lg:grid-cols-2"
                      >
                        <Card className="glass-card">
                          <CardContent className="p-6">
                            <div className="text-center">
                              <div className="relative mx-auto mb-4 h-32 w-32">
                                <svg className="h-full w-full -rotate-90 transform">
                                  <circle cx="64" cy="64" r="56" fill="none" stroke="hsl(var(--muted))" strokeWidth="12" />
                                  <motion.circle
                                    cx="64" cy="64" r="56"
                                    fill="none"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth="12"
                                    strokeLinecap="round"
                                    strokeDasharray={352}
                                    initial={{ strokeDashoffset: 352 }}
                                    animate={{ strokeDashoffset: 352 - (352 * (displayedAnalysis.matchScore || 0) / 100) }}
                                    transition={{ duration: 0.9, ease: 'easeOut' }}
                                  />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className={`text-4xl font-bold ${getScoreColor(displayedAnalysis.matchScore || 0)}`}>
                                    {displayedAnalysis.matchScore || 0}%
                                  </span>
                                </div>
                              </div>

                              <Badge className={scoreMeta?.color}>{scoreMeta?.text}</Badge>

                              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                                <div className="flex items-center justify-center gap-2">
                                  <Clock className="h-4 w-4" />
                                  Estimated prep: {getEstimatedPrepTime(displayedAnalysis.matchScore || 0)}
                                </div>
                                <div>Generated {formatDateTime(displayedAnalysis.createdAt)}</div>
                              </div>

                              <div className="mt-5 flex justify-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleToggleSave(displayedAnalysis._id)}>
                                  {displayedAnalysis.isSaved
                                    ? <><BookmarkCheck className="mr-2 h-4 w-4" />Saved</>
                                    : <><Bookmark className="mr-2 h-4 w-4" />Save</>}
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleDeleteAnalysis(displayedAnalysis._id)}>
                                  <Trash2 className="mr-2 h-4 w-4" />Delete
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="glass-card">
                          <CardHeader>
                            <CardTitle className="text-base">Skills Analysis</CardTitle>
                            <CardDescription>
                              AI-powered skill matching between JD and your resume.
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-5">
                            <div>
                              <div className="mb-2 flex items-center justify-between text-sm">
                                <span className="font-medium text-foreground">Coverage</span>
                                <span className="text-muted-foreground">
                                  {displayedAnalysis.matchedSkills?.length || 0} matched / {displayedAnalysis.extractedSkills?.length || 0} extracted
                                </span>
                              </div>
                              <Progress value={displayedAnalysis.matchScore || 0} className="h-2" />
                            </div>

                            <div>
                              <p className="mb-2 flex items-center gap-2 text-sm font-medium text-green-500">
                                <CheckCircle2 className="h-4 w-4" />Matched ({displayedAnalysis.matchedSkills?.length || 0})
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {(displayedAnalysis.matchedSkills || []).length > 0
                                  ? displayedAnalysis.matchedSkills.map((skill) => (
                                    <Badge key={`${skill.skill}-${skill.userLevel}`} variant="outline" className="border-green-500/20 bg-green-500/10 text-green-500">
                                      {skill.skill}{skill.userLevel ? ` | ${skill.userLevel}` : ''}
                                    </Badge>
                                  ))
                                  : <p className="text-sm text-muted-foreground">No matched skills detected yet.</p>}
                              </div>
                            </div>

                            <div>
                              <p className="mb-2 flex items-center gap-2 text-sm font-medium text-red-500">
                                <XCircle className="h-4 w-4" />Missing ({displayedAnalysis.missingSkills?.length || 0})
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {(displayedAnalysis.missingSkills || []).length > 0
                                  ? displayedAnalysis.missingSkills.map((skill) => (
                                    <Badge
                                      key={`${skill.skill}-${skill.importance}`}
                                      variant="outline"
                                      className={skill.importance === 'required'
                                        ? 'border-red-500/20 bg-red-500/10 text-red-500'
                                        : 'border-yellow-500/20 bg-yellow-500/10 text-yellow-600'}
                                    >
                                      {skill.skill}{skill.importance ? ` | ${skill.importance}` : ''}
                                    </Badge>
                                  ))
                                  : <p className="text-sm text-muted-foreground">No missing skills detected.</p>}
                              </div>
                            </div>

                            <div>
                              <p className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
                                <Sparkles className="h-4 w-4" />Recommendations
                              </p>
                              <div className="space-y-2">
                                {(displayedAnalysis.recommendations || []).length > 0
                                  ? displayedAnalysis.recommendations.slice(0, 4).map((item) => (
                                    <div key={item.skill} className="rounded-lg border border-border/50 bg-muted/20 p-3">
                                      <div className="flex items-center justify-between gap-3">
                                        <p className="font-medium text-foreground">{item.skill}</p>
                                        <Badge variant="outline">{item.priority}</Badge>
                                      </div>
                                      <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                                        {(item.suggestedResources || []).slice(0, 2).map((resource) => (
                                          <li key={resource}>- {resource}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  ))
                                  : <p className="text-sm text-muted-foreground">Recommendations will appear when missing skills are found.</p>}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ) : (
                      <Card className="glass-card">
                        <CardContent className="flex flex-col items-center justify-center px-6 py-14 text-center">
                          <BarChart3 className="mb-3 h-12 w-12 text-muted-foreground" />
                          <p className="font-medium text-foreground">No analysis selected</p>
                          <p className="mt-1 text-sm text-muted-foreground">Run a match to see your JD analysis result here.</p>
                        </CardContent>
                      </Card>
                    )}
                  </AnimatePresence>
                </TabsContent>

                <TabsContent value="guidelines" className="mt-4">
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-primary" />Interview Preparation Guidelines
                      </CardTitle>
                      <CardDescription>
                        AI-generated from real alumni interview experiences.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {hasGuidelines ? (
                        <div className="space-y-3">
                          {selectedCompany.guidelines.map((guideline, index) => (
                            <motion.div
                              key={`${selectedCompany._id}-${index}`}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.08 }}
                              className="flex items-start gap-3 rounded-lg border border-primary/10 bg-primary/5 p-4"
                            >
                              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                                {index + 1}
                              </span>
                              <div className="flex-1">
                                <p className="text-sm leading-relaxed text-foreground">{guideline}</p>
                              </div>
                              <Lightbulb className="h-4 w-4 shrink-0 text-primary/50" />
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <AlertCircle className="mb-3 h-12 w-12 text-muted-foreground" />
                          <h3 className="font-medium text-foreground">No guidelines published yet</h3>
                          <p className="mt-1 max-w-md text-sm text-muted-foreground">
                            When admin adds alumni experience, guidelines will appear here automatically.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}