import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Map,
  Code2,
  Database,
  Calculator,
  Layers,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  BookOpen,
  Server,
  Palette,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { RoadmapSkeleton } from '@/components/common/LoadingSkeletons';
import { containerVariants, itemVariants } from '@/utils/animations';
import useRoadmapStore from '@/store/roadmapStore';

const PHASES = [
  { id: 'foundations', name: 'Core Foundations', description: 'DSA, Core CS, Aptitude, System Design' },
  { id: 'skills', name: 'Role Skills', description: 'Domain-specific technical skills' },
  { id: 'readiness', name: 'Interview Readiness', description: 'Mock interviews and practice' },
  { id: 'feedback', name: 'Practice & Feedback', description: 'Refinement and improvement' },
];

const FOUNDATION_TABS = [
  { value: 'dsa', key: 'dsa', title: 'Data Structures & Algorithms', label: 'DSA', icon: Code2 },
  { value: 'corecs', key: 'coreCS', title: 'Core CS Fundamentals', label: 'Core CS', icon: Database },
  { value: 'aptitude', key: 'aptitude', title: 'Aptitude', label: 'Aptitude', icon: Calculator },
  { value: 'systemdesign', key: 'systemDesign', title: 'System Design', label: 'Sys Design', icon: Layers },
];

const ROLE_STYLE = {
  frontend: { icon: Palette, color: 'from-pink-500 to-rose-500' },
  backend: { icon: Server, color: 'from-blue-500 to-indigo-500' },
  fullstack: { icon: Layers, color: 'from-violet-500 to-purple-500' },
};

const FALLBACK_ROLE_STYLE = { icon: Layers, color: 'from-slate-500 to-slate-700' };

function calcSectionProgress(section) {
  const topics = section.topics || [];
  const total = topics.length;
  const completed = topics.filter((t) => t.completed).length;
  return total === 0 ? 0 : Math.round((completed / total) * 100);
}

function FoundationSection({ section, onToggleTopic, isMutating }) {
  const [isOpen, setIsOpen] = useState(false);
  const progress = calcSectionProgress(section);

  return (
    <motion.div variants={itemVariants} className="border border-border/50 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          <span className="font-medium">{section.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{progress}%</span>
          <Progress value={progress} className="w-24 h-2" />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-border/50"
          >
            <div className="p-4 space-y-3 bg-muted/10">
              {(section.topics || []).map((topic) => (
                <button
                  key={topic.name}
                  type="button"
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-all text-left ${topic.completed
                    ? 'bg-success/10 border border-success/20'
                    : 'bg-background/50 hover:bg-muted/40'}`}
                  onClick={() => onToggleTopic(section.name, topic.name)}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={topic.completed}
                      onCheckedChange={() => onToggleTopic(section.name, topic.name)}
                      onClick={(event) => event.stopPropagation()}
                      className="data-[state=checked]:bg-success data-[state=checked]:border-success"
                    />
                    <span className={topic.completed ? 'line-through text-muted-foreground' : ''}>{topic.name}</span>
                  </div>
                  {topic.completed ? <CheckCircle2 className="w-4 h-4 text-success" /> : null}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function FoundationCard({ title, icon: Icon, sections, progress, onToggleTopic, isMutating }) {
  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon className="w-6 h-6 text-primary" />
            </div>
            {title}
          </CardTitle>
          <Badge variant="outline" className="text-lg px-3 py-1">{progress || 0}%</Badge>
        </div>
        <Progress value={progress || 0} className="h-3 mt-3" />
      </CardHeader>
      <CardContent className="space-y-3">
        {sections.map((section) => (
          <FoundationSection
            key={section.name}
            section={section}
            onToggleTopic={onToggleTopic}
            isMutating={isMutating}
          />
        ))}
      </CardContent>
    </Card>
  );
}

function DomainRoleCard({ role, onOpen }) {
  const style = ROLE_STYLE[role.roleId] || FALLBACK_ROLE_STYLE;
  const Icon = style.icon;
  const completedCount = (role.skills || []).filter((s) => s.completed).length;
  const total = role.skills?.length || 0;

  return (
    <motion.div variants={itemVariants} whileHover={{ scale: 1.02, y: -4 }} whileTap={{ scale: 0.98 }} className="cursor-pointer">
      <Card onClick={() => onOpen(role.roleId)} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-primary/30">
        <div className={`h-2 bg-gradient-to-r ${style.color}`} />
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${style.color} shadow-lg`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <Badge variant={role.progress === 100 ? 'default' : 'secondary'} className="text-sm font-bold">{role.progress || 0}%</Badge>
          </div>
          <h3 className="font-semibold text-foreground mb-2">{role.roleName}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <span>{completedCount}/{total} skills</span>
          </div>
          <Progress value={role.progress || 0} className="h-2" />
        </CardContent>
      </Card>
    </motion.div>
  );
}

function DomainRoleDetail({ role, onClose, onToggleSkill, isMutating }) {
  const style = ROLE_STYLE[role.roleId] || FALLBACK_ROLE_STYLE;
  const Icon = style.icon;
  const completedCount = (role.skills || []).filter((s) => s.completed).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-2xl max-h-[85vh] overflow-hidden"
      >
        <Card className="overflow-hidden">
          <div className={`h-3 bg-gradient-to-r ${style.color}`} />
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${style.color} shadow-lg`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">{role.roleName}</CardTitle>
                  <p className="text-muted-foreground text-sm mt-1">{completedCount} of {role.skills?.length || 0} skills completed</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">{role.progress || 0}%</div>
                <p className="text-xs text-muted-foreground">Complete</p>
              </div>
            </div>
            <Progress value={role.progress || 0} className="h-3 mt-4" />
          </CardHeader>

          <CardContent className="max-h-[50vh] overflow-y-auto">
            <div className="space-y-2">
              {(role.skills || []).map((skill) => (
                <button
                  key={skill.name}
                  type="button"
                  onClick={() => onToggleSkill(role.roleId, skill.name)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${skill.completed
                    ? 'bg-success/10 border border-success/20'
                    : 'bg-muted/30 hover:bg-muted/50'}`}
                >
                  <Checkbox
                    checked={skill.completed}
                    onCheckedChange={() => onToggleSkill(role.roleId, skill.name)}
                    onClick={(event) => event.stopPropagation()}
                    className="data-[state=checked]:bg-success data-[state=checked]:border-success"
                  />
                  <span className={skill.completed ? 'line-through text-muted-foreground' : 'text-foreground'}>{skill.name}</span>
                  {skill.completed ? <CheckCircle2 className="w-4 h-4 text-success ml-auto" /> : null}
                </button>
              ))}
            </div>
          </CardContent>

          <div className="p-4 border-t bg-muted/30">
            <Button onClick={onClose} className="w-full">Close</Button>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}

export default function RoadmapPage() {
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const { roadmap, isLoading, isMutating, error, fetchRoadmap, toggleFoundationTopic, toggleDomainSkill } = useRoadmapStore();

  useEffect(() => {
    fetchRoadmap().catch(() => {});
  }, [fetchRoadmap]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (useRoadmapStore.getState().isMutating) return;
      fetchRoadmap({ silent: true }).catch(() => {});
    }, 60000);

    const onFocus = () => {
      if (useRoadmapStore.getState().isMutating) return;
      fetchRoadmap({ silent: true }).catch(() => {});
    };

    window.addEventListener('focus', onFocus);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', onFocus);
    };
  }, [fetchRoadmap]);

  const selectedRole = useMemo(
    () => (roadmap?.domainRoles || []).find((role) => role.roleId === selectedRoleId) || null,
    [roadmap, selectedRoleId]
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
            <Map className="w-7 h-7 md:w-8 md:h-8 text-primary shrink-0" />
            Preparation Roadmap
          </h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">Track your progress across all preparation areas</p>
        </div>
        <Badge variant="outline" className="text-base px-3 py-1">Overall: {roadmap?.totalProgress || 0}%</Badge>
      </div>

      {error ? (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      ) : null}

      <motion.div variants={itemVariants}>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {PHASES.map((phase, idx) => (
                <div key={phase.id} className="text-center p-3 rounded-lg bg-muted/30">
                  <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">{idx + 1}</div>
                  <h3 className="font-medium text-sm">{phase.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{phase.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs defaultValue="foundations" className="space-y-6">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="foundations" className="flex items-center gap-2"><BookOpen className="w-4 h-4" /> Foundations</TabsTrigger>
          <TabsTrigger value="domains" className="flex items-center gap-2"><Layers className="w-4 h-4" /> Domain Skills</TabsTrigger>
        </TabsList>

        <TabsContent value="foundations" className="space-y-6">
          <Tabs defaultValue="dsa" className="space-y-4">
            <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full max-w-xl">
              {FOUNDATION_TABS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
                  <tab.icon className="w-4 h-4" /> {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {FOUNDATION_TABS.map((tab) => (
              <TabsContent key={tab.value} value={tab.value}>
                {isLoading && !roadmap ? (
                  <RoadmapSkeleton count={6} />
                ) : (
                  <FoundationCard
                    title={tab.title}
                    icon={tab.icon}
                    sections={roadmap?.[tab.key]?.sections || []}
                    progress={roadmap?.[tab.key]?.overallProgress || 0}
                    isMutating={isMutating}
                    onToggleTopic={(sectionName, topicName) => toggleFoundationTopic(tab.key, sectionName, topicName)}
                  />
                )}
              </TabsContent>
            ))}
          </Tabs>
        </TabsContent>

        <TabsContent value="domains" className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Choose Your Domain</h2>
            <p className="text-muted-foreground text-sm">Select a role to view required skills and track your progress</p>
          </div>

          {isLoading && !roadmap ? (
            <RoadmapSkeleton count={6} />
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(roadmap?.domainRoles || []).map((role) => (
                <DomainRoleCard key={role.roleId} role={role} onOpen={setSelectedRoleId} />
              ))}
            </motion.div>
          )}
        </TabsContent>
      </Tabs>

      <AnimatePresence>
        {selectedRole ? (
          <DomainRoleDetail
            role={selectedRole}
            isMutating={isMutating}
            onToggleSkill={toggleDomainSkill}
            onClose={() => setSelectedRoleId(null)}
          />
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
