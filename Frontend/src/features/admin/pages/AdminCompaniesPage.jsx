import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Plus, Edit, Trash2, Save, X, Check,
  FileText, GraduationCap, AlertCircle, ChevronDown, ChevronUp,
  MapPin, Sparkles, Wand2, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import toast from 'react-hot-toast';
import { containerVariants, itemVariants } from '@/utils/animations';
import { COMPANIES, CITIES, INDUSTRIES, generateGuidelinesFromInput } from '@/features/jdmatching/data/mockCompanyData';

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState(COMPANIES);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [expandedCompany, setExpandedCompany] = useState(null);
  const [generatedGuidelines, setGeneratedGuidelines] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    logo: '🏢',
    city: '',
    industry: '',
    websiteUrl: '',
    jd: '',
    interviewPattern: 'Tech-heavy',
    focusDistribution: { dsa: 25, coreCS: 25, systemDesign: 25, hr: 25 },
    guidelines: ['', '', '', '', '', '', ''],
    rawAlumniInput: '',
    approved: false
  });

  const resetForm = () => {
    setFormData({
      name: '',
      logo: '🏢',
      city: '',
      industry: '',
      websiteUrl: '',
      jd: '',
      interviewPattern: 'Tech-heavy',
      focusDistribution: { dsa: 25, coreCS: 25, systemDesign: 25, hr: 25 },
      guidelines: ['', '', '', '', '', '', ''],
      rawAlumniInput: '',
      approved: false
    });
    setGeneratedGuidelines(null);
  };

  const handleAddCompany = () => {
    if (!formData.name.trim() || !formData.jd.trim()) {
      toast.error('Company name and JD are required');
      return;
    }
    if (!formData.city || !formData.industry) {
      toast.error('City and Industry are required');
      return;
    }

    const newCompany = {
      ...formData,
      id: formData.name.toLowerCase().replace(/\s+/g, '-'),
      alumniInsights: [], // Keep for backward compatibility but not used
      guidelines: formData.guidelines.filter(g => g.trim())
    };

    setCompanies([...companies, newCompany]);
    setIsAddDialogOpen(false);
    resetForm();
    toast.success('✅ Company added successfully');
  };

  const handleEditCompany = (company) => {
    setEditingCompany(company.id);
    setExpandedCompany(company.id);
    setFormData({
      ...company,
      websiteUrl: company.websiteUrl || '',
      guidelines: [...(company.guidelines || []), '', '', '', '', '', '', ''].slice(0, 7),
      rawAlumniInput: company.rawAlumniInput || ''
    });
  };

  const handleSaveEdit = () => {
    setCompanies(companies.map(c => 
      c.id === editingCompany 
        ? {
            ...formData,
            id: editingCompany,
            alumniInsights: [], // Keep for backward compatibility
            guidelines: formData.guidelines.filter(g => g.trim())
          }
        : c
    ));
    setEditingCompany(null);
    resetForm();
    toast.success('✅ Company updated successfully');
  };

  const handleDeleteCompany = (companyId) => {
    setCompanies(companies.filter(c => c.id !== companyId));
    toast.success('🗑️ Company deleted');
  };

  const handleApproveGuidelines = (companyId) => {
    setCompanies(companies.map(c => 
      c.id === companyId ? { ...c, approved: true } : c
    ));
    toast.success('✅ Guidelines approved and published');
  };

  const handleGenerateGuidelines = () => {
    if (!formData.rawAlumniInput.trim()) {
      toast.error('Please paste alumni interview communications first');
      return;
    }

    toast.loading('Generating guidelines...', { id: 'generate' });
    
    // Simulate AI processing
    setTimeout(() => {
      const generated = generateGuidelinesFromInput(formData.rawAlumniInput);
      setGeneratedGuidelines(generated);
      
      // Auto-fill the guidelines
      setFormData(prev => ({
        ...prev,
        guidelines: generated.tips.slice(0, 7)
      }));
      
      toast.success('✨ Guidelines generated successfully!', { id: 'generate' });
    }, 1500);
  };

  const updateFocusDistribution = (key, value) => {
    const numValue = parseInt(value) || 0;
    setFormData(prev => ({
      ...prev,
      focusDistribution: {
        ...prev.focusDistribution,
        [key]: Math.min(100, Math.max(0, numValue))
      }
    }));
  };

  const updateGuideline = (index, value) => {
    const newGuidelines = [...formData.guidelines];
    newGuidelines[index] = value;
    setFormData(prev => ({ ...prev, guidelines: newGuidelines }));
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
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="w-7 h-7 text-primary" />
            Company Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage companies, JDs, and interview preparation guidelines
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsAddDialogOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Company
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Company</DialogTitle>
              <DialogDescription>
                Add company details, JD, and alumni insights
              </DialogDescription>
            </DialogHeader>
            <CompanyForm 
              formData={formData}
              setFormData={setFormData}
              updateFocusDistribution={updateFocusDistribution}
              updateGuideline={updateGuideline}
              onGenerateGuidelines={handleGenerateGuidelines}
              generatedGuidelines={generatedGuidelines}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddCompany}>
                <Save className="w-4 h-4 mr-2" />
                Save Company
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{companies.length}</div>
            <div className="text-sm text-muted-foreground">Total Companies</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-500">
              {companies.filter(c => c.approved).length}
            </div>
            <div className="text-sm text-muted-foreground">Approved</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-500">
              {companies.filter(c => !c.approved).length}
            </div>
            <div className="text-sm text-muted-foreground">Pending Review</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">
              {companies.reduce((sum, c) => sum + (c.guidelines?.length || 0), 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Guidelines</div>
          </CardContent>
        </Card>
      </div>

      {/* Companies List */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>All Companies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {companies.map((company) => (
              <motion.div
                key={company.id}
                variants={itemVariants}
                className="border border-border rounded-lg overflow-hidden"
              >
                {/* Company Header Row */}
                <div 
                  className="flex items-center justify-between p-4 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setExpandedCompany(expandedCompany === company.id ? null : company.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{company.logo}</span>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {company.name}
                        {company.approved ? (
                          <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                            <Check className="w-3 h-3 mr-1" />
                            Approved
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {company.city || 'No city'}
                        </span>
                        <span>•</span>
                        <span>{company.industry || 'No industry'}</span>
                        <span>•</span>
                        <span>{company.interviewPattern}</span>
                        <span>•</span>
                        <span>{company.guidelines?.length || 0} guidelines</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); handleEditCompany(company); }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive"
                      onClick={(e) => { e.stopPropagation(); handleDeleteCompany(company.id); }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    {expandedCompany === company.id ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                  {expandedCompany === company.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-border"
                    >
                      {editingCompany === company.id ? (
                        <div className="p-4">
                          <CompanyForm 
                            formData={formData}
                            setFormData={setFormData}
                            updateFocusDistribution={updateFocusDistribution}
                            updateGuideline={updateGuideline}
                            onGenerateGuidelines={handleGenerateGuidelines}
                            generatedGuidelines={generatedGuidelines}
                          />
                          <div className="flex gap-2 mt-4">
                            <Button onClick={handleSaveEdit}>
                              <Save className="w-4 h-4 mr-2" />
                              Save Changes
                            </Button>
                            <Button variant="outline" onClick={() => { setEditingCompany(null); resetForm(); }}>
                              <X className="w-4 h-4 mr-2" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 space-y-4">
                          <Tabs defaultValue="jd">
                            <TabsList className="grid w-full grid-cols-3">
                              <TabsTrigger value="jd">
                                <FileText className="w-4 h-4 mr-1" />
                                JD
                              </TabsTrigger>
                              <TabsTrigger value="guidelines">
                                <GraduationCap className="w-4 h-4 mr-1" />
                                Guidelines
                              </TabsTrigger>
                              <TabsTrigger value="raw">
                                <FileText className="w-4 h-4 mr-1" />
                                Raw Input
                              </TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value="jd" className="mt-4">
                              <div className="bg-muted/30 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                                {company.jd}
                              </div>
                              <div className="grid grid-cols-4 gap-2 mt-4">
                                <div className="p-2 rounded bg-blue-500/10 text-center">
                                  <div className="text-xs text-muted-foreground">DSA</div>
                                  <div className="font-semibold text-blue-500">{company.focusDistribution.dsa}%</div>
                                </div>
                                <div className="p-2 rounded bg-purple-500/10 text-center">
                                  <div className="text-xs text-muted-foreground">Core CS</div>
                                  <div className="font-semibold text-purple-500">{company.focusDistribution.coreCS}%</div>
                                </div>
                                <div className="p-2 rounded bg-green-500/10 text-center">
                                  <div className="text-xs text-muted-foreground">System Design</div>
                                  <div className="font-semibold text-green-500">{company.focusDistribution.systemDesign}%</div>
                                </div>
                                <div className="p-2 rounded bg-orange-500/10 text-center">
                                  <div className="text-xs text-muted-foreground">HR</div>
                                  <div className="font-semibold text-orange-500">{company.focusDistribution.hr}%</div>
                                </div>
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="guidelines" className="mt-4 space-y-2">
                              {company.guidelines.length > 0 ? (
                                <>
                                  {company.guidelines.map((guideline, idx) => (
                                    <div key={idx} className="flex items-start gap-2 p-2 rounded bg-primary/5 border border-primary/10">
                                      <GraduationCap className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                      <p className="text-sm">{guideline}</p>
                                    </div>
                                  ))}
                                  {!company.approved && (
                                    <Button 
                                      className="w-full mt-4"
                                      onClick={() => handleApproveGuidelines(company.id)}
                                    >
                                      <Check className="w-4 h-4 mr-2" />
                                      Approve & Publish Guidelines
                                    </Button>
                                  )}
                                </>
                              ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                  <GraduationCap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                  <p>No guidelines added yet</p>
                                </div>
                              )}
                            </TabsContent>
                            
                            <TabsContent value="raw" className="mt-4">
                              {company.rawAlumniInput ? (
                                <div className="bg-muted/30 rounded-lg p-4 text-sm whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                                  {company.rawAlumniInput}
                                </div>
                              ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                  <p>No raw alumni input stored</p>
                                </div>
                              )}
                            </TabsContent>
                          </Tabs>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Company Form Component
function CompanyForm({ formData, setFormData, updateFocusDistribution, updateGuideline, onGenerateGuidelines, generatedGuidelines }) {
  return (
    <div className="space-y-6 py-4">
      {/* Basic Info */}
      <div className="space-y-2">
        <Label>Company Name *</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="e.g., Google"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>City *</Label>
          <Select 
            value={formData.city} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, city: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent>
              {CITIES.filter(c => c !== 'All Cities').map(city => (
                <SelectItem key={city} value={city}>{city}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Industry *</Label>
          <Select 
            value={formData.industry} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              {INDUSTRIES.map(industry => (
                <SelectItem key={industry} value={industry}>{industry}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Company Website URL */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <ExternalLink className="w-4 h-4" />
          Company Website / Careers Page URL
        </Label>
        <Input
          value={formData.websiteUrl}
          onChange={(e) => setFormData(prev => ({ ...prev, websiteUrl: e.target.value }))}
          placeholder="https://careers.company.com"
          type="url"
        />
        <p className="text-xs text-muted-foreground">
          Students will see this as a "Visit Company Page" button
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>City *</Label>
          <Select 
            value={formData.city} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, city: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent>
              {CITIES.filter(c => c !== 'All Cities').map(city => (
                <SelectItem key={city} value={city}>{city}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Industry *</Label>
          <Select 
            value={formData.industry} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              {INDUSTRIES.map(industry => (
                <SelectItem key={industry} value={industry}>{industry}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* JD */}
      <div className="space-y-2">
        <Label>Job Description *</Label>
        <Textarea
          value={formData.jd}
          onChange={(e) => setFormData(prev => ({ ...prev, jd: e.target.value }))}
          placeholder="Paste the complete job description..."
          className="min-h-[150px]"
        />
      </div>

      {/* Interview Pattern & Focus */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Interview Pattern</Label>
          <Select 
            value={formData.interviewPattern} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, interviewPattern: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DSA-heavy">DSA-heavy</SelectItem>
              <SelectItem value="Tech-heavy">Tech-heavy</SelectItem>
              <SelectItem value="HR-heavy">HR-heavy</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Focus Distribution */}
      <div className="space-y-2">
        <Label>Focus Distribution (%)</Label>
        <div className="grid grid-cols-4 gap-4">
          <div className="space-y-1">
            <Label className="text-xs">DSA</Label>
            <Input
              type="number"
              min="0"
              max="100"
              value={formData.focusDistribution.dsa}
              onChange={(e) => updateFocusDistribution('dsa', e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Core CS</Label>
            <Input
              type="number"
              min="0"
              max="100"
              value={formData.focusDistribution.coreCS}
              onChange={(e) => updateFocusDistribution('coreCS', e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">System Design</Label>
            <Input
              type="number"
              min="0"
              max="100"
              value={formData.focusDistribution.systemDesign}
              onChange={(e) => updateFocusDistribution('systemDesign', e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">HR</Label>
            <Input
              type="number"
              min="0"
              max="100"
              value={formData.focusDistribution.hr}
              onChange={(e) => updateFocusDistribution('hr', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Raw Alumni Input */}
      <div className="space-y-2 p-4 border border-primary/20 rounded-lg bg-primary/5">
        <Label className="flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-primary" />
          Raw Alumni Interview Communications
        </Label>
        <p className="text-xs text-muted-foreground">
          Paste raw alumni interview experiences, messages, or notes. The system will generate structured guidelines from this input.
        </p>
        <Textarea
          value={formData.rawAlumniInput}
          onChange={(e) => setFormData(prev => ({ ...prev, rawAlumniInput: e.target.value }))}
          placeholder="Paste raw alumni interview communications here...&#10;&#10;Example:&#10;- Had 4 rounds, first was DSA heavy with 2 medium LC problems&#10;- System design focused on scalability&#10;- HR asked about leadership experiences&#10;- Focus on graphs and DP for coding rounds"
          className="min-h-[150px]"
        />
        <Button 
          type="button" 
          variant="outline" 
          onClick={onGenerateGuidelines}
          className="w-full"
          disabled={!formData.rawAlumniInput.trim()}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Generate Guidelines from Alumni Input
        </Button>
        
        {generatedGuidelines && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-3">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Generated Summary
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-muted-foreground">Rounds:</span> {generatedGuidelines.rounds}</div>
              <div><span className="text-muted-foreground">Difficulty:</span> {generatedGuidelines.difficulty}</div>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Focus Areas:</span> {generatedGuidelines.focusAreas.join(', ')}
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Common Topics:</span> {generatedGuidelines.commonTopics.join(', ')}
            </div>
          </div>
        )}
      </div>

      {/* Interview Preparation Guidelines */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <GraduationCap className="w-4 h-4" />
          Interview Preparation Guidelines (7 points)
        </Label>
        <p className="text-xs text-muted-foreground mb-2">
          These structured guidelines will be shown to students. Generated from raw alumni input or manually entered.
        </p>
        <div className="space-y-2">
          {formData.guidelines.map((guideline, idx) => (
            <Input
              key={idx}
              value={guideline}
              onChange={(e) => updateGuideline(idx, e.target.value)}
              placeholder={`Guideline ${idx + 1}...`}
            />
          ))}
        </div>
      </div>

      {/* Approval Status */}
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div>
          <Label>Publish Status</Label>
          <p className="text-sm text-muted-foreground">
            Approved guidelines will be visible to students
          </p>
        </div>
        <Switch
          checked={formData.approved}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, approved: checked }))}
        />
      </div>
    </div>
  );
}