import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Map, Code2, Database, Calculator, Layers, ChevronDown, ChevronRight,
  CheckCircle2, Circle, BookOpen, Lightbulb, Server, Shield, Cloud,
  Brain, Smartphone, Globe, Terminal, BarChart3, Cpu, Palette, Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { containerVariants, itemVariants } from '@/utils/animations';

// ========== INITIAL FOUNDATIONS DATA ==========
const INITIAL_DSA = {
  title: 'Data Structures & Algorithms',
  icon: Code2,
  color: 'primary',
  sections: [
    {
      name: 'Arrays',
      patterns: [
        { name: 'Two Pointers', completed: false },
        { name: 'Sliding Window', completed: false },
        { name: "Kadane's Algorithm", completed: false },
        { name: 'Prefix Sum', completed: false }
      ]
    },
    {
      name: 'Linked Lists',
      patterns: [
        { name: 'Fast & Slow Pointers', completed: false },
        { name: 'Reversal', completed: false },
        { name: 'Merge Techniques', completed: false }
      ]
    },
    {
      name: 'Trees',
      patterns: [
        { name: 'DFS Traversal', completed: false },
        { name: 'BFS Traversal', completed: false },
        { name: 'Binary Search Tree', completed: false }
      ]
    },
    {
      name: 'Graphs',
      patterns: [
        { name: 'BFS/DFS', completed: false },
        { name: 'Shortest Path', completed: false },
        { name: 'Topological Sort', completed: false }
      ]
    },
    {
      name: 'Dynamic Programming',
      patterns: [
        { name: '1D DP', completed: false },
        { name: '2D DP', completed: false },
        { name: 'Knapsack Variants', completed: false }
      ]
    }
  ]
};

const INITIAL_CORE_CS = {
  title: 'Core CS Fundamentals',
  icon: Database,
  color: 'accent',
  sections: [
    {
      name: 'DBMS',
      topics: [
        { name: 'ER Model', completed: false },
        { name: 'Normalization', completed: false },
        { name: 'SQL Queries', completed: false },
        { name: 'Transactions & ACID', completed: false },
        { name: 'Indexing', completed: false },
        { name: 'NoSQL Basics', completed: false }
      ]
    },
    {
      name: 'Operating Systems',
      topics: [
        { name: 'Processes & Threads', completed: false },
        { name: 'CPU Scheduling', completed: false },
        { name: 'Deadlocks', completed: false },
        { name: 'Memory Management', completed: false },
        { name: 'File Systems', completed: false }
      ]
    },
    {
      name: 'Computer Networks',
      topics: [
        { name: 'OSI Model', completed: false },
        { name: 'TCP/IP', completed: false },
        { name: 'HTTP/HTTPS', completed: false },
        { name: 'DNS', completed: false },
        { name: 'Routing', completed: false }
      ]
    },
    {
      name: 'OOP Concepts',
      topics: [
        { name: 'Classes & Objects', completed: false },
        { name: 'Inheritance', completed: false },
        { name: 'Polymorphism', completed: false },
        { name: 'Encapsulation', completed: false },
        { name: 'SOLID Principles', completed: false }
      ]
    }
  ]
};

const INITIAL_APTITUDE = {
  title: 'Aptitude',
  icon: Calculator,
  color: 'warning',
  sections: [
    {
      name: 'Quantitative Aptitude',
      topics: [
        { name: 'Number Systems', completed: false },
        { name: 'Percentages', completed: false },
        { name: 'Profit & Loss', completed: false },
        { name: 'Time & Work', completed: false },
        { name: 'Speed & Distance', completed: false },
        { name: 'Probability', completed: false },
        { name: 'Permutation & Combination', completed: false }
      ]
    },
    {
      name: 'Logical Reasoning',
      topics: [
        { name: 'Puzzles', completed: false },
        { name: 'Seating Arrangement', completed: false },
        { name: 'Blood Relations', completed: false },
        { name: 'Syllogisms', completed: false },
        { name: 'Coding-Decoding', completed: false }
      ]
    },
    {
      name: 'Verbal Ability',
      topics: [
        { name: 'Reading Comprehension', completed: false },
        { name: 'Sentence Correction', completed: false },
        { name: 'Para Jumbles', completed: false },
        { name: 'Synonyms/Antonyms', completed: false },
        { name: 'Fill in the Blanks', completed: false }
      ]
    }
  ]
};

const INITIAL_SYSTEM_DESIGN = {
  title: 'System Design',
  icon: Layers,
  color: 'success',
  sections: [
    {
      name: 'Fundamentals',
      topics: [
        { name: 'Scalability', completed: false },
        { name: 'Load Balancing', completed: false },
        { name: 'Caching', completed: false },
        { name: 'Database Sharding', completed: false },
        { name: 'CAP Theorem', completed: false }
      ]
    },
    {
      name: 'Design Patterns',
      topics: [
        { name: 'URL Shortener', completed: false },
        { name: 'Rate Limiter', completed: false },
        { name: 'Chat System', completed: false },
        { name: 'Notification System', completed: false }
      ]
    }
  ]
};

// ========== DOMAIN ROLES DATA ==========
const DOMAIN_ROLES = [
  {
    id: 'frontend',
    title: 'Frontend Developer',
    icon: Palette,
    color: 'from-pink-500 to-rose-500',
    skills: [
      { name: 'HTML5 & Semantic Markup', completed: true },
      { name: 'CSS3 & Flexbox/Grid', completed: true },
      { name: 'JavaScript ES6+', completed: true },
      { name: 'React.js', completed: true },
      { name: 'TypeScript', completed: false },
      { name: 'State Management (Redux/Zustand)', completed: false },
      { name: 'CSS Frameworks (Tailwind)', completed: true },
      { name: 'Testing (Jest, RTL)', completed: false },
      { name: 'Build Tools (Vite/Webpack)', completed: false },
      { name: 'Performance Optimization', completed: false },
      { name: 'Responsive Design', completed: true },
      { name: 'Accessibility (a11y)', completed: false }
    ]
  },
  {
    id: 'backend',
    title: 'Backend Developer',
    icon: Server,
    color: 'from-blue-500 to-indigo-500',
    skills: [
      { name: 'Node.js / Python / Java', completed: true },
      { name: 'REST API Design', completed: true },
      { name: 'GraphQL', completed: false },
      { name: 'Database Design (SQL)', completed: true },
      { name: 'NoSQL Databases', completed: false },
      { name: 'Authentication & JWT', completed: false },
      { name: 'Caching (Redis)', completed: false },
      { name: 'Message Queues', completed: false },
      { name: 'Microservices Architecture', completed: false },
      { name: 'API Security', completed: false },
      { name: 'ORM (Prisma/Sequelize)', completed: true },
      { name: 'Testing & Documentation', completed: false }
    ]
  },
  {
    id: 'fullstack',
    title: 'Full Stack Developer',
    icon: Layers,
    color: 'from-purple-500 to-violet-500',
    skills: [
      { name: 'Frontend Technologies', completed: true },
      { name: 'Backend Technologies', completed: true },
      { name: 'Database Management', completed: true },
      { name: 'API Integration', completed: true },
      { name: 'DevOps Basics', completed: false },
      { name: 'Cloud Deployment', completed: false },
      { name: 'Version Control (Git)', completed: true },
      { name: 'CI/CD Pipelines', completed: false },
      { name: 'Containerization (Docker)', completed: false },
      { name: 'System Design', completed: false },
      { name: 'Performance Monitoring', completed: false },
      { name: 'Security Best Practices', completed: false }
    ]
  },
  {
    id: 'data-engineer',
    title: 'Data Engineer',
    icon: BarChart3,
    color: 'from-green-500 to-emerald-500',
    skills: [
      { name: 'Python/Scala', completed: true },
      { name: 'SQL & Database Design', completed: true },
      { name: 'ETL Pipelines', completed: false },
      { name: 'Apache Spark', completed: false },
      { name: 'Apache Kafka', completed: false },
      { name: 'Data Warehousing', completed: false },
      { name: 'Apache Airflow', completed: false },
      { name: 'Cloud Platforms (AWS/GCP)', completed: false },
      { name: 'Data Modeling', completed: true },
      { name: 'Big Data Technologies', completed: false },
      { name: 'Data Quality & Governance', completed: false },
      { name: 'Real-time Data Processing', completed: false }
    ]
  },
  {
    id: 'ai-ml',
    title: 'AI/ML Engineer',
    icon: Brain,
    color: 'from-orange-500 to-amber-500',
    skills: [
      { name: 'Python & NumPy/Pandas', completed: true },
      { name: 'Machine Learning Algorithms', completed: true },
      { name: 'Deep Learning (TensorFlow/PyTorch)', completed: false },
      { name: 'Natural Language Processing', completed: false },
      { name: 'Computer Vision', completed: false },
      { name: 'Model Training & Evaluation', completed: true },
      { name: 'Feature Engineering', completed: false },
      { name: 'MLOps & Model Deployment', completed: false },
      { name: 'Large Language Models', completed: false },
      { name: 'Reinforcement Learning', completed: false },
      { name: 'Statistical Analysis', completed: true },
      { name: 'Data Visualization', completed: true }
    ]
  },
  {
    id: 'devops',
    title: 'DevOps Engineer',
    icon: Terminal,
    color: 'from-cyan-500 to-teal-500',
    skills: [
      { name: 'Linux Administration', completed: true },
      { name: 'Shell Scripting', completed: true },
      { name: 'Docker & Containerization', completed: false },
      { name: 'Kubernetes', completed: false },
      { name: 'CI/CD (Jenkins/GitHub Actions)', completed: false },
      { name: 'Infrastructure as Code (Terraform)', completed: false },
      { name: 'Cloud Platforms (AWS/Azure/GCP)', completed: false },
      { name: 'Monitoring (Prometheus/Grafana)', completed: false },
      { name: 'Configuration Management', completed: false },
      { name: 'Networking & Security', completed: true },
      { name: 'Logging & Observability', completed: false },
      { name: 'Disaster Recovery', completed: false }
    ]
  },
  {
    id: 'cloud',
    title: 'Cloud Engineer',
    icon: Cloud,
    color: 'from-sky-500 to-blue-500',
    skills: [
      { name: 'AWS Core Services', completed: true },
      { name: 'Azure/GCP Basics', completed: false },
      { name: 'Cloud Architecture', completed: false },
      { name: 'Serverless Computing', completed: false },
      { name: 'Cloud Security', completed: false },
      { name: 'Cost Optimization', completed: false },
      { name: 'Load Balancing & Scaling', completed: true },
      { name: 'Cloud Networking (VPC)', completed: false },
      { name: 'Database Services', completed: true },
      { name: 'Storage Solutions', completed: false },
      { name: 'IAM & Access Control', completed: false },
      { name: 'Cloud Certifications Prep', completed: false }
    ]
  },
  {
    id: 'cybersecurity',
    title: 'Cyber Security',
    icon: Shield,
    color: 'from-red-500 to-rose-500',
    skills: [
      { name: 'Network Security', completed: true },
      { name: 'Cryptography Basics', completed: true },
      { name: 'Penetration Testing', completed: false },
      { name: 'Vulnerability Assessment', completed: false },
      { name: 'OWASP Top 10', completed: false },
      { name: 'Security Auditing', completed: false },
      { name: 'Incident Response', completed: false },
      { name: 'Security Tools (Burp/Nmap)', completed: false },
      { name: 'Identity Management', completed: false },
      { name: 'Compliance (GDPR/SOC2)', completed: false },
      { name: 'Malware Analysis', completed: false },
      { name: 'Ethical Hacking', completed: false }
    ]
  },
  {
    id: 'mobile',
    title: 'Mobile Developer',
    icon: Smartphone,
    color: 'from-fuchsia-500 to-pink-500',
    skills: [
      { name: 'React Native / Flutter', completed: true },
      { name: 'Mobile UI/UX Design', completed: true },
      { name: 'State Management', completed: false },
      { name: 'Native APIs', completed: false },
      { name: 'Push Notifications', completed: false },
      { name: 'Offline Storage', completed: false },
      { name: 'App Performance', completed: false },
      { name: 'App Store Deployment', completed: false },
      { name: 'Mobile Security', completed: false },
      { name: 'Testing (Detox/Appium)', completed: false },
      { name: 'Deep Linking', completed: false },
      { name: 'Analytics Integration', completed: false }
    ]
  },
  {
    id: 'blockchain',
    title: 'Blockchain Developer',
    icon: Cpu,
    color: 'from-yellow-500 to-orange-500',
    skills: [
      { name: 'Blockchain Fundamentals', completed: true },
      { name: 'Solidity/Smart Contracts', completed: false },
      { name: 'Ethereum Development', completed: false },
      { name: 'Web3.js/Ethers.js', completed: false },
      { name: 'DeFi Protocols', completed: false },
      { name: 'NFT Development', completed: false },
      { name: 'Consensus Mechanisms', completed: true },
      { name: 'Cryptographic Hashing', completed: true },
      { name: 'Token Standards (ERC)', completed: false },
      { name: 'Layer 2 Solutions', completed: false },
      { name: 'Smart Contract Security', completed: false },
      { name: 'Decentralized Storage', completed: false }
    ]
  },
  {
    id: 'sre',
    title: 'Site Reliability Engineer',
    icon: Globe,
    color: 'from-indigo-500 to-purple-500',
    skills: [
      { name: 'Linux Systems', completed: true },
      { name: 'Monitoring & Alerting', completed: true },
      { name: 'Incident Management', completed: false },
      { name: 'SLA/SLO/SLI', completed: false },
      { name: 'Capacity Planning', completed: false },
      { name: 'Chaos Engineering', completed: false },
      { name: 'Automation & Scripting', completed: true },
      { name: 'Performance Tuning', completed: false },
      { name: 'On-Call Practices', completed: false },
      { name: 'Postmortem Culture', completed: false },
      { name: 'Toil Reduction', completed: false },
      { name: 'Reliability Architecture', completed: false }
    ]
  },
  {
    id: 'qa',
    title: 'QA/Test Engineer',
    icon: CheckCircle2,
    color: 'from-lime-500 to-green-500',
    skills: [
      { name: 'Test Planning & Strategy', completed: true },
      { name: 'Manual Testing', completed: true },
      { name: 'Automation Testing', completed: false },
      { name: 'Selenium/Cypress', completed: false },
      { name: 'API Testing (Postman)', completed: true },
      { name: 'Performance Testing', completed: false },
      { name: 'Mobile Testing', completed: false },
      { name: 'CI/CD Integration', completed: false },
      { name: 'Bug Tracking (Jira)', completed: true },
      { name: 'Test Documentation', completed: true },
      { name: 'Security Testing', completed: false },
      { name: 'Load Testing (JMeter)', completed: false }
    ]
  }
];

// ========== PHASE DEFINITIONS ==========
const PHASES = [
  { id: 'foundations', name: 'Core Foundations', description: 'DSA, Core CS, Aptitude, System Design' },
  { id: 'skills', name: 'Role Skills', description: 'Domain-specific technical skills' },
  { id: 'readiness', name: 'Interview Readiness', description: 'Mock interviews and practice' },
  { id: 'feedback', name: 'Practice & Feedback', description: 'Refinement and improvement' }
];

// ========== HELPER: calculate progress for a section ==========
function calcSectionProgress(section, type) {
  if (type === 'dsa') {
    const total = section.patterns.length;
    const completed = section.patterns.filter(p => p.completed).length;
    return total === 0 ? 0 : Math.round((completed / total) * 100);
  }
  const total = section.topics.length;
  const completed = section.topics.filter(t => t.completed).length;
  return total === 0 ? 0 : Math.round((completed / total) * 100);
}

function calcOverallProgress(roadmap, type) {
  if (type === 'dsa') {
    let total = 0, completed = 0;
    roadmap.sections.forEach(s => {
      total += s.patterns.length;
      completed += s.patterns.filter(p => p.completed).length;
    });
    return total === 0 ? 0 : Math.round((completed / total) * 100);
  }
  let total = 0, completed = 0;
  roadmap.sections.forEach(s => {
    total += s.topics.length;
    completed += s.topics.filter(t => t.completed).length;
  });
  return total === 0 ? 0 : Math.round((completed / total) * 100);
}

// ========== COMPONENTS ==========

function RoadmapSection({ section, type, onToggle }) {
  const [isOpen, setIsOpen] = useState(false);
  const progress = calcSectionProgress(section, type);

  return (
    <motion.div 
      variants={itemVariants}
      className="border border-border/50 rounded-lg overflow-hidden"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
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
              {type === 'dsa' ? (
                section.patterns.map((pattern, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                      pattern.completed
                        ? 'bg-success/10 border border-success/20'
                        : 'bg-background/50 hover:bg-muted/40'
                    }`}
                    onClick={() => onToggle(idx)}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={pattern.completed}
                        onCheckedChange={() => onToggle(idx)}
                        onClick={(e) => e.stopPropagation()}
                        className="data-[state=checked]:bg-success data-[state=checked]:border-success"
                      />
                      <span className={pattern.completed ? 'line-through text-muted-foreground' : ''}>
                        {pattern.name}
                      </span>
                    </div>
                    {pattern.completed && (
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    )}
                  </div>
                ))
              ) : (
                section.topics.map((topic, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                      topic.completed
                        ? 'bg-success/10 border border-success/20'
                        : 'bg-background/50 hover:bg-muted/40'
                    }`}
                    onClick={() => onToggle(idx)}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={topic.completed}
                        onCheckedChange={() => onToggle(idx)}
                        onClick={(e) => e.stopPropagation()}
                        className="data-[state=checked]:bg-success data-[state=checked]:border-success"
                      />
                      <span className={topic.completed ? 'line-through text-muted-foreground' : ''}>
                        {topic.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {topic.completed && (
                        <CheckCircle2 className="w-4 h-4 text-success" />
                      )}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" disabled className="opacity-50">
                              <Lock className="w-3.5 h-3.5 mr-1" /> Learn
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Learning content will be available after backend integration</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function RoadmapCard({ roadmap, type, onToggleItem }) {
  const Icon = roadmap.icon;
  const progress = calcOverallProgress(roadmap, type);

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon className="w-6 h-6 text-primary" />
            </div>
            {roadmap.title}
          </CardTitle>
          <Badge variant="outline" className="text-lg px-3 py-1">
            {progress}%
          </Badge>
        </div>
        <Progress value={progress} className="h-3 mt-3" />
      </CardHeader>
      <CardContent className="space-y-3">
        {roadmap.sections.map((section, sIdx) => (
          <RoadmapSection 
            key={sIdx} 
            section={section} 
            type={type}
            onToggle={(itemIdx) => onToggleItem(sIdx, itemIdx)}
          />
        ))}
      </CardContent>
    </Card>
  );
}

// Domain Role Card Component
function DomainRoleCard({ role, onClick }) {
  const Icon = role.icon;
  const completedCount = role.skills.filter(s => s.completed).length;
  const progress = Math.round((completedCount / role.skills.length) * 100);

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-primary/30">
        <div className={`h-2 bg-gradient-to-r ${role.color}`} />
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${role.color} shadow-lg`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <Badge 
              variant={progress === 100 ? "default" : "secondary"} 
              className="text-sm font-bold"
            >
              {progress}%
            </Badge>
          </div>
          <h3 className="font-semibold text-foreground mb-2">{role.title}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <span>{completedCount}/{role.skills.length} skills</span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Domain Role Detail Modal
function DomainRoleDetail({ role, onClose }) {
  const [skills, setSkills] = useState(role.skills);
  const Icon = role.icon;
  const completedCount = skills.filter(s => s.completed).length;
  const progress = Math.round((completedCount / skills.length) * 100);

  const toggleSkill = (index) => {
    setSkills(prev => prev.map((skill, i) => 
      i === index ? { ...skill, completed: !skill.completed } : skill
    ));
  };

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
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[85vh] overflow-hidden"
      >
        <Card className="overflow-hidden">
          <div className={`h-3 bg-gradient-to-r ${role.color}`} />
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${role.color} shadow-lg`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">{role.title}</CardTitle>
                  <p className="text-muted-foreground text-sm mt-1">
                    {completedCount} of {skills.length} skills completed
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">{progress}%</div>
                <p className="text-xs text-muted-foreground">Complete</p>
              </div>
            </div>
            <Progress value={progress} className="h-3 mt-4" />
          </CardHeader>
          <CardContent className="max-h-[50vh] overflow-y-auto">
            <div className="space-y-2">
              {skills.map((skill, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    skill.completed 
                      ? 'bg-success/10 border border-success/20' 
                      : 'bg-muted/30 hover:bg-muted/50'
                  }`}
                >
                  <Checkbox
                    checked={skill.completed}
                    onCheckedChange={() => toggleSkill(idx)}
                    className="data-[state=checked]:bg-success data-[state=checked]:border-success"
                  />
                  <span className={skill.completed ? 'line-through text-muted-foreground' : 'text-foreground'}>
                    {skill.name}
                  </span>
                  {skill.completed && (
                    <CheckCircle2 className="w-4 h-4 text-success ml-auto" />
                  )}
                </motion.div>
              ))}
            </div>
          </CardContent>
          <div className="p-4 border-t bg-muted/30">
            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// Domains Grid Component
function DomainsGrid() {
  const [selectedRole, setSelectedRole] = useState(null);

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        {DOMAIN_ROLES.map((role) => (
          <DomainRoleCard
            key={role.id}
            role={role}
            onClick={() => setSelectedRole(role)}
          />
        ))}
      </motion.div>

      <AnimatePresence>
        {selectedRole && (
          <DomainRoleDetail
            role={selectedRole}
            onClose={() => setSelectedRole(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ========== MAIN PAGE ==========
export default function RoadmapPage() {
  const [dsaData, setDsaData] = useState(INITIAL_DSA);
  const [coreCsData, setCoreCsData] = useState(INITIAL_CORE_CS);
  const [aptitudeData, setAptitudeData] = useState(INITIAL_APTITUDE);
  const [sysDesignData, setSysDesignData] = useState(INITIAL_SYSTEM_DESIGN);

  const toggleDsa = useCallback((sectionIdx, patternIdx) => {
    setDsaData(prev => ({
      ...prev,
      sections: prev.sections.map((s, si) =>
        si === sectionIdx
          ? { ...s, patterns: s.patterns.map((p, pi) => pi === patternIdx ? { ...p, completed: !p.completed } : p) }
          : s
      )
    }));
  }, []);

  const makeTopicToggler = useCallback((setter) => (sectionIdx, topicIdx) => {
    setter(prev => ({
      ...prev,
      sections: prev.sections.map((s, si) =>
        si === sectionIdx
          ? { ...s, topics: s.topics.map((t, ti) => ti === topicIdx ? { ...t, completed: !t.completed } : t) }
          : s
      )
    }));
  }, []);

  const toggleCoreCs = useMemo(() => makeTopicToggler(setCoreCsData), [makeTopicToggler]);
  const toggleAptitude = useMemo(() => makeTopicToggler(setAptitudeData), [makeTopicToggler]);
  const toggleSysDesign = useMemo(() => makeTopicToggler(setSysDesignData), [makeTopicToggler]);

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
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Map className="w-8 h-8 text-primary" />
            Preparation Roadmap
          </h1>
          <p className="text-muted-foreground mt-1">Track your progress across all preparation areas</p>
        </div>
      </div>

      {/* Phase Indicators */}
      <motion.div variants={itemVariants}>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {PHASES.map((phase, idx) => (
                <div key={phase.id} className="text-center p-3 rounded-lg bg-muted/30">
                  <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    {idx + 1}
                  </div>
                  <h3 className="font-medium text-sm">{phase.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{phase.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Smart Nudge */}
      {/* <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/20">
              <Lightbulb className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-medium">💡 Smart Suggestion</p>
              <p className="text-sm text-muted-foreground">
                You've completed 80% of Arrays. Consider moving to Linked Lists or pick a Domain Role to specialize!
              </p>
            </div>
            <Button variant="outline" size="sm" className="ml-auto shrink-0">
              View Details
            </Button>
          </CardContent>
        </Card>
      </motion.div> */}

      {/* Roadmap Tabs */}
      <Tabs defaultValue="foundations" className="space-y-6">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="foundations" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" /> Foundations
          </TabsTrigger>
          <TabsTrigger value="domains" className="flex items-center gap-2">
            <Layers className="w-4 h-4" /> Domain Skills
          </TabsTrigger>
        </TabsList>

        <TabsContent value="foundations" className="space-y-6">
          <Tabs defaultValue="dsa" className="space-y-4">
            <TabsList className="grid grid-cols-4 w-full max-w-xl">
              <TabsTrigger value="dsa" className="flex items-center gap-2">
                <Code2 className="w-4 h-4" /> DSA
              </TabsTrigger>
              <TabsTrigger value="corecs" className="flex items-center gap-2">
                <Database className="w-4 h-4" /> Core CS
              </TabsTrigger>
              <TabsTrigger value="aptitude" className="flex items-center gap-2">
                <Calculator className="w-4 h-4" /> Aptitude
              </TabsTrigger>
              <TabsTrigger value="systemdesign" className="flex items-center gap-2">
                <Layers className="w-4 h-4" /> Sys Design
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dsa">
              <RoadmapCard roadmap={dsaData} type="dsa" onToggleItem={toggleDsa} />
            </TabsContent>

            <TabsContent value="corecs">
              <RoadmapCard roadmap={coreCsData} type="topics" onToggleItem={toggleCoreCs} />
            </TabsContent>

            <TabsContent value="aptitude">
              <RoadmapCard roadmap={aptitudeData} type="topics" onToggleItem={toggleAptitude} />
            </TabsContent>

            <TabsContent value="systemdesign">
              <RoadmapCard roadmap={sysDesignData} type="topics" onToggleItem={toggleSysDesign} />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="domains">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Choose Your Domain</h2>
                <p className="text-muted-foreground text-sm">Select a role to view required skills and track your progress</p>
              </div>
            </div>
            <DomainsGrid />
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
