import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  Check,
  Sparkles,
  Save,
  X,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { containerVariants, itemVariants } from '@/utils/animations';
import useAdminStore from '@/store/adminStore';
import { toast } from 'sonner';

const initialForm = {
  name: '',
  logo: '🏢',
  city: '',
  industry: '',
  websiteUrl: '',
  jd: '',
  interviewPattern: 'Tech-heavy',
  focusDistribution: { dsa: 25, coreCS: 25, systemDesign: 25, hr: 25 },
  rawAlumniInput: '',
  guidelines: [],
};

const normalizeCompanyPayload = (form) => ({
  name: form.name.trim(),
  logo: form.logo || '🏢',
  city: form.city.trim(),
  industry: form.industry.trim(),
  websiteUrl: form.websiteUrl.trim(),
  jd: form.jd.trim(),
  interviewPattern: form.interviewPattern,
  focusDistribution: {
    dsa: Number(form.focusDistribution.dsa) || 0,
    coreCS: Number(form.focusDistribution.coreCS) || 0,
    systemDesign: Number(form.focusDistribution.systemDesign) || 0,
    hr: Number(form.focusDistribution.hr) || 0,
  },
  rawAlumniInput: form.rawAlumniInput,
  guidelines: (form.guidelines || []).filter(Boolean),
});

export default function AdminCompaniesPage() {
  const companies = useAdminStore((state) => state.companies);
  const isLoading = useAdminStore((state) => state.isLoading);
  const fetchCompanies = useAdminStore((state) => state.fetchCompanies);
  const createCompany = useAdminStore((state) => state.createCompany);
  const updateCompany = useAdminStore((state) => state.updateCompany);
  const deleteCompany = useAdminStore((state) => state.deleteCompany);
  const approveCompany = useAdminStore((state) => state.approveCompany);
  const generateGuidelines = useAdminStore((state) => state.generateGuidelines);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchCompanies().catch((error) => {
      toast.error(error.message || 'Failed to load companies');
    });
  }, [fetchCompanies]);

  const approvedCount = useMemo(() => companies.filter((company) => company.approved).length, [companies]);

  const resetForm = () => {
    setFormData(initialForm);
    setEditingCompany(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (company) => {
    setEditingCompany(company);
    setFormData({
      ...initialForm,
      ...company,
      focusDistribution: {
        dsa: company.focusDistribution?.dsa ?? 25,
        coreCS: company.focusDistribution?.coreCS ?? 25,
        systemDesign: company.focusDistribution?.systemDesign ?? 25,
        hr: company.focusDistribution?.hr ?? 25,
      },
      guidelines: company.guidelines || [],
    });
    setIsDialogOpen(true);
  };

  const onSave = async () => {
    const payload = normalizeCompanyPayload(formData);

    if (!payload.name || !payload.city || !payload.industry || !payload.jd) {
      toast.error('Name, city, industry and JD are required');
      return;
    }

    const totalFocus =
      payload.focusDistribution.dsa +
      payload.focusDistribution.coreCS +
      payload.focusDistribution.systemDesign +
      payload.focusDistribution.hr;

    if (totalFocus > 100) {
      toast.error('Focus distribution total cannot exceed 100');
      return;
    }

    try {
      if (editingCompany?._id) {
        await updateCompany(editingCompany._id, payload);
        toast.success('Company updated');
      } else {
        await createCompany(payload);
        toast.success('Company created');
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error(error.message || 'Failed to save company');
    }
  };

  const onDelete = async (companyId) => {
    try {
      await deleteCompany(companyId);
      toast.success('Company deleted');
    } catch (error) {
      toast.error(error.message || 'Failed to delete company');
    }
  };

  const onApprove = async (companyId) => {
    try {
      await approveCompany(companyId);
      toast.success('Company approved');
    } catch (error) {
      toast.error(error.message || 'Failed to approve company');
    }
  };

  const onGenerateGuidelines = async () => {
    if (!editingCompany?._id) {
      toast.error('Save company first, then generate guidelines');
      return;
    }
    if (!formData.rawAlumniInput?.trim()) {
      toast.error('Raw alumni input is required');
      return;
    }

    try {
      const updated = await generateGuidelines(editingCompany._id, formData.rawAlumniInput);
      setFormData((prev) => ({ ...prev, guidelines: updated.guidelines || [] }));
      toast.success('Guidelines generated');
    } catch (error) {
      toast.error(error.message || 'Failed to generate guidelines');
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="w-7 h-7 text-primary" />
            Company Management
          </h1>
          <p className="text-muted-foreground">Single admin manages company JD and guidelines</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Add Company
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCompany ? 'Edit Company' : 'Add Company'}</DialogTitle>
              <DialogDescription>Manage company details, JD and generated guidelines</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Company Name *</Label>
                  <Input value={formData.name} onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Logo Emoji</Label>
                  <Input value={formData.logo} onChange={(event) => setFormData((prev) => ({ ...prev, logo: event.target.value }))} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>City *</Label>
                  <Input value={formData.city} onChange={(event) => setFormData((prev) => ({ ...prev, city: event.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Industry *</Label>
                  <Input value={formData.industry} onChange={(event) => setFormData((prev) => ({ ...prev, industry: event.target.value }))} />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Website URL
                </Label>
                <Input value={formData.websiteUrl} onChange={(event) => setFormData((prev) => ({ ...prev, websiteUrl: event.target.value }))} />
              </div>

              <div className="space-y-2">
                <Label>Job Description *</Label>
                <Textarea className="min-h-[140px]" value={formData.jd} onChange={(event) => setFormData((prev) => ({ ...prev, jd: event.target.value }))} />
              </div>

              <div className="grid grid-cols-4 gap-3">
                {['dsa', 'coreCS', 'systemDesign', 'hr'].map((key) => (
                  <div key={key} className="space-y-2">
                    <Label className="capitalize">{key}</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.focusDistribution?.[key] ?? 0}
                      onChange={(event) =>
                        setFormData((prev) => ({
                          ...prev,
                          focusDistribution: {
                            ...prev.focusDistribution,
                            [key]: Number(event.target.value) || 0,
                          },
                        }))
                      }
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-2 p-3 rounded-lg border border-primary/20 bg-primary/5">
                <Label>Raw Alumni Input</Label>
                <Textarea
                  className="min-h-[120px]"
                  value={formData.rawAlumniInput}
                  onChange={(event) => setFormData((prev) => ({ ...prev, rawAlumniInput: event.target.value }))}
                />
                <Button type="button" variant="outline" onClick={onGenerateGuidelines}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Guidelines
                </Button>
              </div>

              {(formData.guidelines || []).length > 0 ? (
                <div className="space-y-2">
                  <Label>Guidelines</Label>
                  <div className="space-y-2">
                    {formData.guidelines.map((guideline, index) => (
                      <div key={`${guideline}-${index}`} className="p-2 rounded-md bg-muted/30 text-sm">
                        {index + 1}. {guideline}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={onSave} disabled={isLoading}>
                <Save className="w-4 h-4 mr-2" />
                {editingCompany ? 'Save Changes' : 'Create Company'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card"><CardContent className="p-4"><p className="text-2xl font-bold">{companies.length}</p><p className="text-sm text-muted-foreground">Total</p></CardContent></Card>
        <Card className="glass-card"><CardContent className="p-4"><p className="text-2xl font-bold text-success">{approvedCount}</p><p className="text-sm text-muted-foreground">Approved</p></CardContent></Card>
        <Card className="glass-card"><CardContent className="p-4"><p className="text-2xl font-bold text-warning">{companies.length - approvedCount}</p><p className="text-sm text-muted-foreground">Pending</p></CardContent></Card>
        <Card className="glass-card"><CardContent className="p-4"><p className="text-2xl font-bold text-primary">{companies.reduce((sum, company) => sum + (company.guidelines?.length || 0), 0)}</p><p className="text-sm text-muted-foreground">Guidelines</p></CardContent></Card>
      </div>

      <div className="space-y-3">
        {companies.map((company) => (
          <motion.div key={company._id} variants={itemVariants}>
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{company.logo || '🏢'}</span>
                    <div>
                      <p>{company.name}</p>
                      <p className="text-xs text-muted-foreground font-normal">{company.city} • {company.industry}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={company.approved ? 'default' : 'secondary'}>{company.approved ? 'Approved' : 'Pending'}</Badge>
                    {!company.approved ? (
                      <Button size="sm" variant="outline" onClick={() => onApprove(company._id)}>
                        <Check className="w-4 h-4 mr-2" />Approve
                      </Button>
                    ) : null}
                    <Button size="sm" variant="outline" onClick={() => openEditDialog(company)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="text-destructive" onClick={() => onDelete(company._id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm line-clamp-3">{company.jd}</p>
                {company.guidelines?.length ? (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Guidelines</p>
                    {company.guidelines.slice(0, 3).map((guideline, index) => (
                      <p key={`${company._id}-guideline-${index}`} className="text-sm">• {guideline}</p>
                    ))}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
