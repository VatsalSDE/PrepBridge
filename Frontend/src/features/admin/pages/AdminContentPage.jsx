import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen, Plus, Edit3, Trash2, Code2, Database, Calculator,
  ChevronDown, ChevronRight, CheckCircle2, Save, X, Layers
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

const INITIAL_ROADMAPS = {
  dsa: {
    title: 'DSA Roadmap',
    icon: Code2,
    sections: [
      { id: 1, name: 'Arrays', topics: ['Two Pointers', 'Sliding Window', 'Prefix Sum'] },
      { id: 2, name: 'Linked Lists', topics: ['Fast & Slow Pointers', 'Reversal', 'Merge'] },
      { id: 3, name: 'Trees', topics: ['DFS', 'BFS', 'BST Operations'] },
      { id: 4, name: 'Graphs', topics: ['DFS/BFS', 'Shortest Path', 'Topological Sort'] },
      { id: 5, name: 'Dynamic Programming', topics: ['1D DP', '2D DP', 'Knapsack'] },
    ]
  },
  coreCs: {
    title: 'Core CS Roadmap',
    icon: Database,
    sections: [
      { id: 1, name: 'DBMS', topics: ['ER Model', 'Normalization', 'SQL', 'Transactions'] },
      { id: 2, name: 'Operating Systems', topics: ['Processes', 'Scheduling', 'Memory'] },
      { id: 3, name: 'Computer Networks', topics: ['OSI Model', 'TCP/IP', 'HTTP'] },
      { id: 4, name: 'OOP', topics: ['Classes', 'Inheritance', 'Polymorphism'] },
    ]
  },
  systemDesign: {
    title: 'System Design Roadmap',
    icon: Layers,
    sections: [
      { id: 1, name: 'Fundamentals', topics: ['CAP Theorem', 'Load Balancing', 'Caching'] },
      { id: 2, name: 'Databases', topics: ['SQL vs NoSQL', 'Sharding', 'Replication'] },
      { id: 3, name: 'Communication', topics: ['REST', 'gRPC', 'Message Queues'] },
      { id: 4, name: 'Architecture Patterns', topics: ['Microservices', 'Event-Driven', 'CQRS'] },
      { id: 5, name: 'Case Studies', topics: ['URL Shortener', 'Twitter', 'Netflix'] },
    ]
  },
  aptitude: {
    title: 'Aptitude Roadmap',
    icon: Calculator,
    sections: [
      { id: 1, name: 'Quantitative', topics: ['Number Systems', 'Percentages', 'Time & Work'] },
      { id: 2, name: 'Logical Reasoning', topics: ['Puzzles', 'Seating', 'Blood Relations'] },
      { id: 3, name: 'Verbal', topics: ['Reading Comprehension', 'Grammar', 'Vocabulary'] },
    ]
  }
};

const INITIAL_DOMAIN_ROLES = [
  { id: 'frontend', name: 'Frontend Developer', skills: ['React', 'Vue', 'TypeScript', 'CSS', 'HTML', 'Redux', 'Webpack', 'Testing', 'Performance', 'Accessibility', 'Responsive Design', 'API Integration'] },
  { id: 'backend', name: 'Backend Developer', skills: ['Node.js', 'Python', 'Java', 'Databases', 'REST APIs', 'GraphQL', 'Authentication', 'Caching', 'Microservices', 'Docker', 'Security', 'Testing'] },
  { id: 'fullstack', name: 'Full Stack Developer', skills: ['React', 'Node.js', 'Databases', 'REST APIs', 'Git', 'Docker', 'CI/CD', 'Testing', 'Cloud Services', 'System Design', 'Agile', 'Security'] },
  { id: 'data-engineer', name: 'Data Engineer', skills: ['Python', 'SQL', 'ETL', 'Spark', 'Hadoop', 'Airflow', 'Data Modeling', 'Cloud Platforms', 'Streaming', 'Data Warehousing', 'NoSQL', 'Scripting'] },
  { id: 'ai-ml', name: 'AI/ML Engineer', skills: ['Python', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'Deep Learning', 'NLP', 'Computer Vision', 'MLOps', 'Data Preprocessing', 'Model Deployment', 'Statistics', 'Mathematics'] },
  { id: 'devops', name: 'DevOps Engineer', skills: ['Docker', 'Kubernetes', 'CI/CD', 'AWS/GCP/Azure', 'Terraform', 'Ansible', 'Linux', 'Monitoring', 'Scripting', 'Networking', 'Security', 'Git'] },
];

function RoadmapEditor({ roadmap, onSave }) {
  const [sections, setSections] = useState(roadmap.sections);
  const [newSectionName, setNewSectionName] = useState('');
  const [showAddSection, setShowAddSection] = useState(false);

  const handleAddSection = () => {
    if (!newSectionName.trim()) return;
    setSections([...sections, { 
      id: Date.now(), 
      name: newSectionName, 
      topics: [] 
    }]);
    setNewSectionName('');
    setShowAddSection(false);
    toast.success('Section added');
  };

  const handleDeleteSection = (sectionId) => {
    setSections(sections.filter(s => s.id !== sectionId));
    toast.success('Section deleted');
  };

  const handleAddTopic = (sectionId, topic) => {
    setSections(sections.map(s => 
      s.id === sectionId 
        ? { ...s, topics: [...s.topics, topic] }
        : s
    ));
  };

  const handleDeleteTopic = (sectionId, topicIndex) => {
    setSections(sections.map(s => 
      s.id === sectionId 
        ? { ...s, topics: s.topics.filter((_, i) => i !== topicIndex) }
        : s
    ));
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
                <Badge key={idx} variant="outline" className="gap-2">
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    handleAddTopic(section.id, e.target.value.trim());
                    e.target.value = '';
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Add Section */}
      {showAddSection ? (
        <Card className="glass-card border-dashed border-2 border-primary/30">
          <CardContent className="p-4">
            <div className="flex gap-2">
              <Input
                placeholder="Section name..."
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
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

      <Button className="w-full" onClick={() => onSave(sections)}>
        <Save className="w-4 h-4 mr-2" />
        Save Roadmap
      </Button>
    </div>
  );
}

function EditSkillsDialog({ role, isOpen, onClose, onSave }) {
  const [skills, setSkills] = useState(role?.skills || []);
  const [newSkill, setNewSkill] = useState('');

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    if (skills.includes(newSkill.trim())) {
      toast.error('Skill already exists');
      return;
    }
    setSkills([...skills, newSkill.trim()]);
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSave = () => {
    onSave(role.id, skills);
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
          {/* Add Skill Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Add new skill..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill();
                }
              }}
            />
            <Button onClick={handleAddSkill}>
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>

          {/* Skills List */}
          <div className="space-y-2">
            <Label>Current Skills ({skills.length})</Label>
            <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-muted/30 min-h-[100px]">
              {skills.length > 0 ? (
                skills.map((skill, idx) => (
                  <Badge key={idx} variant="secondary" className="gap-2">
                    {skill}
                    <button
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:text-destructive"
                    >
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
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminContentPage() {
  const [roadmaps, setRoadmaps] = useState(INITIAL_ROADMAPS);
  const [roles, setRoles] = useState(INITIAL_DOMAIN_ROLES);
  const [showAddRole, setShowAddRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [editingRole, setEditingRole] = useState(null);

  const handleSaveRoadmap = (key, sections) => {
    setRoadmaps({
      ...roadmaps,
      [key]: { ...roadmaps[key], sections }
    });
    toast.success('Roadmap saved successfully!');
  };

  const handleAddRole = () => {
    if (!newRoleName.trim()) return;
    setRoles([...roles, {
      id: newRoleName.toLowerCase().replace(/\s+/g, '-'),
      name: newRoleName,
      skills: []
    }]);
    setNewRoleName('');
    setShowAddRole(false);
    toast.success('Role added');
  };

  const handleDeleteRole = (roleId) => {
    setRoles(roles.filter(r => r.id !== roleId));
    toast.success('Role deleted');
  };

  const handleSaveSkills = (roleId, skills) => {
    setRoles(roles.map(r => 
      r.id === roleId ? { ...r, skills } : r
    ));
    toast.success('Skills updated successfully!');
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-primary" />
          Content Management
        </h1>
        <p className="text-muted-foreground">Manage roadmaps, skills, and learning content</p>
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
                onSave={(sections) => handleSaveRoadmap('dsa', sections)}
              />
            </TabsContent>

            <TabsContent value="coreCs" className="mt-4">
              <RoadmapEditor
                roadmap={roadmaps.coreCs}
                onSave={(sections) => handleSaveRoadmap('coreCs', sections)}
              />
            </TabsContent>

            <TabsContent value="systemDesign" className="mt-4">
              <RoadmapEditor
                roadmap={roadmaps.systemDesign}
                onSave={(sections) => handleSaveRoadmap('systemDesign', sections)}
              />
            </TabsContent>

            <TabsContent value="aptitude" className="mt-4">
              <RoadmapEditor
                roadmap={roadmaps.aptitude}
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

            {/* Add Role Card */}
            {showAddRole ? (
              <Card className="glass-card border-dashed border-2 border-primary/30">
                <CardContent className="p-4 space-y-3">
                  <Input
                    placeholder="Role name..."
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1" onClick={handleAddRole}>
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

      {/* Edit Skills Dialog */}
      <EditSkillsDialog
        role={editingRole}
        isOpen={!!editingRole}
        onClose={() => setEditingRole(null)}
        onSave={handleSaveSkills}
      />
    </motion.div>
  );
}