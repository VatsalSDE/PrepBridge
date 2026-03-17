import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Plus,
  Edit3,
  Trash2,
  Code2,
  Database,
  Calculator,
  ChevronRight,
  CheckCircle2,
  Save,
  X,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { containerVariants, itemVariants } from '@/utils/animations';
import { toast } from 'sonner';
import adminService from '@/services/adminService';

const FOUNDATION_META = {
  dsa: { title: 'DSA Roadmap', icon: Code2 },
  coreCs: { title: 'Core CS Roadmap', icon: Database },
  systemDesign: { title: 'System Design Roadmap', icon: Layers },
  aptitude: { title: 'Aptitude Roadmap', icon: Calculator },
};

const INITIAL_ROADMAPS = {
  dsa: {
    title: FOUNDATION_META.dsa.title,
    icon: FOUNDATION_META.dsa.icon,
    sections: [],
  },
  coreCs: {
    title: FOUNDATION_META.coreCs.title,
    icon: FOUNDATION_META.coreCs.icon,
    sections: [],
  },
  systemDesign: {
    title: FOUNDATION_META.systemDesign.title,
    icon: FOUNDATION_META.systemDesign.icon,
    sections: [],
  },
  aptitude: {
    title: FOUNDATION_META.aptitude.title,
    icon: FOUNDATION_META.aptitude.icon,
    sections: [],
  },
};

const toEditorSections = (sections = []) =>
  sections.map((section, index) => ({
    id: `${section.name}-${index}`,
    name: section.name,
    topics: section.topics || [],
  }));

const sanitizeSections = (sections = []) =>
  sections
    .map((section) => ({
      name: String(section.name || '').trim(),
      topics: Array.from(
        new Set(
          (section.topics || [])
            .map((topic) => String(topic || '').trim())
            .filter(Boolean)
        )
      ),
    }))
    .filter((section) => section.name && section.topics.length > 0);

const mapTemplateToRoadmaps = (template) => {
  const foundations = template?.foundations || {};
  return {
    dsa: {
      title: foundations.dsa?.title || FOUNDATION_META.dsa.title,
      icon: FOUNDATION_META.dsa.icon,
      sections: toEditorSections(foundations.dsa?.sections || []),
    },
    coreCs: {
      title: foundations.coreCS?.title || FOUNDATION_META.coreCs.title,
      icon: FOUNDATION_META.coreCs.icon,
      sections: toEditorSections(foundations.coreCS?.sections || []),
    },
    systemDesign: {
      title: foundations.systemDesign?.title || FOUNDATION_META.systemDesign.title,
      icon: FOUNDATION_META.systemDesign.icon,
      sections: toEditorSections(foundations.systemDesign?.sections || []),
    },
    aptitude: {
      title: foundations.aptitude?.title || FOUNDATION_META.aptitude.title,
      icon: FOUNDATION_META.aptitude.icon,
      sections: toEditorSections(foundations.aptitude?.sections || []),
    },
  };
};

const mapTemplateToRoles = (template) =>
  (template?.domainRoles || []).map((role) => ({
    id: role.roleId,
    name: role.roleName,
    skills: role.skills || [],
  }));

const roleIdFromName = (name) => String(name || '').trim().toLowerCase().replace(/\s+/g, '-');

const mapRolesForApi = (roles = []) =>
  roles.map((role) => ({
    roleId: role.id || roleIdFromName(role.name),
    roleName: role.name,
    skills: Array.from(new Set((role.skills || []).map((skill) => String(skill || '').trim()).filter(Boolean))),
  }));

function RoadmapEditor({ roadmap, isSaving, onSave }) {
  const [sections, setSections] = useState(roadmap.sections || []);
  const [newSectionName, setNewSectionName] = useState('');
  const [showAddSection, setShowAddSection] = useState(false);

  useEffect(() => {
    setSections(roadmap.sections || []);
  }, [roadmap]);

  const handleAddSection = () => {
    if (!newSectionName.trim()) return;
    setSections([
      ...sections,
      {
        id: `${newSectionName.trim()}-${Date.now()}`,
        name: newSectionName.trim(),
        topics: [],
      },
    ]);
    setNewSectionName('');
    setShowAddSection(false);
    toast.success('Section added');
  };

  const handleDeleteSection = (sectionId) => {
    setSections(sections.filter((section) => section.id !== sectionId));
    toast.success('Section deleted');
  };

  const handleAddTopic = (sectionId, topic) => {
    const nextTopic = String(topic || '').trim();
    if (!nextTopic) return;

    setSections(
      sections.map((section) => {
        if (section.id !== sectionId) return section;
        if (section.topics.includes(nextTopic)) return section;
        return { ...section, topics: [...section.topics, nextTopic] };
      })
    );
  };

  const handleDeleteTopic = (sectionId, topicIndex) => {
    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? { ...section, topics: section.topics.filter((_, index) => index !== topicIndex) }
          : section
      )
    );
  };

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <Card key={section.id} className="glass-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <ChevronRight className="w-4 h-4" />
                {section.name}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{section.topics.length} topics</Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => handleDeleteSection(section.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {section.topics.map((topic, idx) => (
                <Badge key={`${topic}-${idx}`} variant="outline" className="gap-2">
                  {topic}
                  <button
                    onClick={() => handleDeleteTopic(section.id, idx)}
                    className="hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2 mt-3">
              <Input
                placeholder="Add topic..."
                className="flex-1"
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && event.target.value.trim()) {
                    handleAddTopic(section.id, event.target.value.trim());
                    event.target.value = '';
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>
      ))}

      {showAddSection ? (
        <Card className="glass-card border-dashed border-2 border-primary/30">
          <CardContent className="p-4">
            <div className="flex gap-2">
              <Input
                placeholder="Section name..."
                value={newSectionName}
                onChange={(event) => setNewSectionName(event.target.value)}
                autoFocus
              />
              <Button onClick={handleAddSection}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Add
              </Button>
              <Button variant="ghost" onClick={() => setShowAddSection(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button
          variant="outline"
          className="w-full border-dashed"
          onClick={() => setShowAddSection(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Section
        </Button>
      )}

      <Button className="w-full" disabled={isSaving} onClick={() => onSave(sections)}>
        <Save className="w-4 h-4 mr-2" />
        {isSaving ? 'Saving...' : 'Save Roadmap'}
      </Button>
    </div>
  );
}

function EditSkillsDialog({ role, isOpen, isSaving, onClose, onSave }) {
  const [skills, setSkills] = useState(role?.skills || []);
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    setSkills(role?.skills || []);
  }, [role]);

  const handleAddSkill = () => {
    const value = newSkill.trim();
    if (!value) return;
    if (skills.includes(value)) {
      toast.error('Skill already exists');
      return;
    }
    setSkills([...skills, value]);
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const handleSave = async () => {
    if (!role) return;
    await onSave(role.id, skills);
    onClose();
  };

  if (!role) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-primary" />
            Edit Skills for {role.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add new skill..."
              value={newSkill}
              onChange={(event) => setNewSkill(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  handleAddSkill();
                }
              }}
            />
            <Button onClick={handleAddSkill}>
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Current Skills ({skills.length})</Label>
            <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-muted/30 min-h-[100px]">
              {skills.length > 0 ? (
                skills.map((skill, idx) => (
                  <Badge key={`${skill}-${idx}`} variant="secondary" className="gap-2">
                    {skill}
                    <button onClick={() => handleRemoveSkill(skill)} className="hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No skills added yet</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminContentPage() {
  const [roadmaps, setRoadmaps] = useState(INITIAL_ROADMAPS);
  const [roles, setRoles] = useState([]);
  const [showAddRole, setShowAddRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [editingRole, setEditingRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingFoundation, setIsSavingFoundation] = useState(false);
  const [isSavingRoles, setIsSavingRoles] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadTemplate = async () => {
      try {
        const response = await adminService.getRoadmapTemplate();
        if (!mounted) return;
        setRoadmaps(mapTemplateToRoadmaps(response?.data));
        setRoles(mapTemplateToRoles(response?.data));
      } catch (error) {
        toast.error(error?.message || 'Failed to load roadmap template');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadTemplate();

    return () => {
      mounted = false;
    };
  }, []);

  const persistRoles = async (nextRoles, successMessage) => {
    setIsSavingRoles(true);
    try {
      const payload = mapRolesForApi(nextRoles);
      await adminService.updateRoadmapTemplateDomains(payload);
      setRoles(nextRoles);
      if (editingRole) {
        const refreshedRole = nextRoles.find((role) => role.id === editingRole.id) || null;
        setEditingRole(refreshedRole);
      }
      toast.success(successMessage);
    } catch (error) {
      toast.error(error?.message || 'Failed to update domain roles');
      throw error;
    } finally {
      setIsSavingRoles(false);
    }
  };

  const handleSaveRoadmap = async (key, sections) => {
    const sectionMap = { dsa: 'dsa', coreCs: 'coreCS', aptitude: 'aptitude', systemDesign: 'systemDesign' };
    const backendSection = sectionMap[key];
    const sanitizedSections = sanitizeSections(sections);

    if (!sanitizedSections.length) {
      toast.error('Add at least one section with topics before saving');
      return;
    }

    setIsSavingFoundation(true);
    try {
      await adminService.updateRoadmapTemplateFoundation(backendSection, {
        title: roadmaps[key]?.title,
        sections: sanitizedSections,
      });

      setRoadmaps((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          sections: toEditorSections(sanitizedSections),
        },
      }));

      toast.success('Roadmap updated for all users');
    } catch (error) {
      toast.error(error?.message || 'Failed to update roadmap');
    } finally {
      setIsSavingFoundation(false);
    }
  };

  const handleAddRole = async () => {
    const roleName = newRoleName.trim();
    if (!roleName) return;

    const nextRole = {
      id: roleIdFromName(roleName),
      name: roleName,
      skills: [],
    };

    if (roles.some((role) => role.id === nextRole.id)) {
      toast.error('Role already exists');
      return;
    }

    const nextRoles = [...roles, nextRole];
    await persistRoles(nextRoles, 'Role added');
    setNewRoleName('');
    setShowAddRole(false);
  };

  const handleDeleteRole = async (roleId) => {
    const nextRoles = roles.filter((role) => role.id !== roleId);
    if (!nextRoles.length) {
      toast.error('At least one role must remain');
      return;
    }
    await persistRoles(nextRoles, 'Role deleted');
  };

  const handleSaveSkills = async (roleId, skills) => {
    const nextRoles = roles.map((role) =>
      role.id === roleId ? { ...role, skills: Array.from(new Set(skills.map((skill) => skill.trim()).filter(Boolean))) } : role
    );
    await persistRoles(nextRoles, 'Skills updated successfully');
  };

  if (isLoading) {
    return (
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary" />
            Content Management
          </h1>
          <p className="text-muted-foreground">Loading roadmap content...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-primary" />
          Content Management
        </h1>
        <p className="text-muted-foreground">Admin controls the roadmap template used by all students</p>
      </div>

      <Tabs defaultValue="foundations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="foundations">Foundations</TabsTrigger>
          <TabsTrigger value="domains">Domain Roles</TabsTrigger>
        </TabsList>

        <TabsContent value="foundations" className="space-y-6">
          <Tabs defaultValue="dsa">
            <TabsList>
              <TabsTrigger value="dsa" className="gap-2">
                <Code2 className="w-4 h-4" />
                DSA
              </TabsTrigger>
              <TabsTrigger value="coreCs" className="gap-2">
                <Database className="w-4 h-4" />
                Core CS
              </TabsTrigger>
              <TabsTrigger value="systemDesign" className="gap-2">
                <Layers className="w-4 h-4" />
                System Design
              </TabsTrigger>
              <TabsTrigger value="aptitude" className="gap-2">
                <Calculator className="w-4 h-4" />
                Aptitude
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dsa" className="mt-4">
              <RoadmapEditor
                roadmap={roadmaps.dsa}
                isSaving={isSavingFoundation}
                onSave={(sections) => handleSaveRoadmap('dsa', sections)}
              />
            </TabsContent>

            <TabsContent value="coreCs" className="mt-4">
              <RoadmapEditor
                roadmap={roadmaps.coreCs}
                isSaving={isSavingFoundation}
                onSave={(sections) => handleSaveRoadmap('coreCs', sections)}
              />
            </TabsContent>

            <TabsContent value="systemDesign" className="mt-4">
              <RoadmapEditor
                roadmap={roadmaps.systemDesign}
                isSaving={isSavingFoundation}
                onSave={(sections) => handleSaveRoadmap('systemDesign', sections)}
              />
            </TabsContent>

            <TabsContent value="aptitude" className="mt-4">
              <RoadmapEditor
                roadmap={roadmaps.aptitude}
                isSaving={isSavingFoundation}
                onSave={(sections) => handleSaveRoadmap('aptitude', sections)}
              />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="domains" className="space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((role) => (
              <motion.div key={role.id} variants={itemVariants}>
                <Card className="glass-card hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold">{role.name}</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive h-8 w-8"
                        disabled={isSavingRoles}
                        onClick={() => handleDeleteRole(role.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Skills</span>
                      <Badge variant="secondary">{role.skills?.length || 0}</Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3"
                      onClick={() => setEditingRole(role)}
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Skills
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {showAddRole ? (
              <Card className="glass-card border-dashed border-2 border-primary/30">
                <CardContent className="p-4 space-y-3">
                  <Input
                    placeholder="Role name..."
                    value={newRoleName}
                    onChange={(event) => setNewRoleName(event.target.value)}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1" onClick={handleAddRole} disabled={isSavingRoles}>
                      Add
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setShowAddRole(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card
                className="glass-card border-dashed border-2 border-muted-foreground/20 cursor-pointer hover:border-primary/30 transition-colors"
                onClick={() => setShowAddRole(true)}
              >
                <CardContent className="p-4 flex items-center justify-center h-full min-h-[120px]">
                  <div className="text-center text-muted-foreground">
                    <Plus className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">Add New Role</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <EditSkillsDialog
        role={editingRole}
        isOpen={Boolean(editingRole)}
        isSaving={isSavingRoles}
        onClose={() => setEditingRole(null)}
        onSave={handleSaveSkills}
      />
    </motion.div>
  );
}
