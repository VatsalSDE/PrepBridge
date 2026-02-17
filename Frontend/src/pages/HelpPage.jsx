import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  HelpCircle, BookOpen, Map, FileSearch, Users, BarChart3,
  ChevronDown, ChevronRight, ListTodo, Calendar, Trophy,
  MessageSquare, Lightbulb
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { containerVariants, itemVariants } from '@/utils/animations';

const FAQ_SECTIONS = [
  {
    id: 'daily-planning',
    title: 'Daily Planning',
    icon: ListTodo,
    questions: [
      {
        q: 'How do I create a daily plan?',
        a: 'Navigate to the Daily Planning page from the sidebar. Click "Add Task" to create new tasks. You can set task categories (DSA, Core CS, Development, etc.), priority levels, and estimated time for each task.'
      },
      {
        q: 'What are task categories?',
        a: 'Categories help organize your tasks by subject area: DSA (Data Structures & Algorithms), Core CS (Operating Systems, DBMS, Networks), Development (web/mobile projects), and Aptitude (quantitative/logical reasoning).'
      },
      {
        q: 'How does the productivity score work?',
        a: 'Your productivity score is calculated based on the percentage of tasks you complete each day. Completing all planned tasks gives you 100% productivity. The score helps track your consistency over time.'
      },
      {
        q: 'Can I add reflections?',
        a: 'Yes! At the end of each day, you can add a reflection about what went well, what challenges you faced, and what you learned. This helps build self-awareness and track your growth.'
      }
    ]
  },
  {
    id: 'roadmap',
    title: 'Roadmap',
    icon: Map,
    questions: [
      {
        q: 'What is the Roadmap?',
        a: 'The Roadmap is a structured learning path that guides you through all the skills needed for placement preparation. It\'s divided into two main sections: Foundations (DSA, Core CS, Aptitude, System Design) and Domain Skills (role-specific technologies).'
      },
      {
        q: 'How are the phases organized?',
        a: 'The roadmap follows four phases: Core Foundations (fundamental concepts), Role Skills (domain-specific skills), Interview Readiness (mock interviews), and Practice & Feedback (refinement and improvement).'
      },
      {
        q: 'How do I track my progress?',
        a: 'Each topic and skill has a progress indicator. Mark items as complete as you learn them. The overall progress bar shows your completion percentage for each section.'
      },
      {
        q: 'Can I choose a specific domain?',
        a: 'Yes! In the Domain Skills tab, you can select from various roles like Frontend Developer, Backend Developer, Data Engineer, AI/ML Engineer, and more. Each role has a customized skill checklist.'
      }
    ]
  },
  {
    id: 'jd-matching',
    title: 'JD Matching',
    icon: FileSearch,
    questions: [
      {
        q: 'What is JD Matching?',
        a: 'JD Matching helps you compare your skills with a company\'s job description. Select a company, upload your resume, and get a match score showing how well your profile aligns with their requirements.'
      },
      {
        q: 'How is the match score calculated?',
        a: 'The match score is based on comparing skills mentioned in your resume with skills required in the job description. Higher matches in key areas (DSA, Core CS, etc.) result in better scores.'
      },
      {
        q: 'What are Alumni Insights?',
        a: 'Alumni Insights are interview experiences and tips shared by students who previously interviewed at that company. They provide valuable insider information about the interview process, commonly asked questions, and preparation strategies.'
      },
      {
        q: 'How do I improve my match score?',
        a: 'Review the "Missing Skills" section to identify gaps. Use the Roadmap to learn these skills. Update your resume to better highlight relevant skills you already have.'
      }
    ]
  },
  {
    id: 'community',
    title: 'Community',
    icon: Users,
    questions: [
      {
        q: 'How does anonymous posting work?',
        a: 'All posts in the community are anonymous. You\'re assigned a random animal name and number (e.g., "Anonymous Panda #4521") so you can ask questions freely without revealing your identity.'
      },
      {
        q: 'What can I post about?',
        a: 'You can post about DSA problems, Core CS concepts, interview experiences, career guidance, motivation, and development topics. Choose the appropriate category when creating a post.'
      },
      {
        q: 'Is the community moderated?',
        a: 'Yes! All posts are reviewed by admins to ensure a safe and helpful environment. Posts that violate community guidelines (spam, sharing exam answers, disrespectful content) are removed.'
      },
      {
        q: 'How do upvotes and bookmarks work?',
        a: 'Upvote helpful posts and answers to show appreciation. Bookmark posts you want to refer back to later. Both features help highlight quality content for the community.'
      }
    ]
  },
  {
    id: 'reports',
    title: 'Reports & Analytics',
    icon: BarChart3,
    questions: [
      {
        q: 'What can I see in Reports?',
        a: 'Reports show your preparation statistics including tasks completed, productivity trends, streak history, time spent on each category, and weekly/monthly progress comparisons.'
      },
      {
        q: 'How are weekly reports generated?',
        a: 'Every week, the system aggregates your activity data to show tasks completed, average productivity, categories covered, and improvement suggestions based on your performance.'
      },
      {
        q: 'Can I add weekly reflections?',
        a: 'Yes! You can write weekly reflections to summarize what you learned, challenges faced, and goals for the upcoming week. This helps with long-term planning and self-assessment.'
      }
    ]
  },
  {
    id: 'achievements',
    title: 'Achievements',
    icon: Trophy,
    questions: [
      {
        q: 'How do I earn badges?',
        a: 'Badges are earned by reaching milestones: maintaining streaks (7-day, 30-day, 100-day), completing roadmap sections, getting community upvotes, and achieving high JD match scores.'
      },
      {
        q: 'What is a streak?',
        a: 'A streak is the number of consecutive days you complete at least one task. Maintaining long streaks shows consistency and dedication to your preparation.'
      },
      {
        q: 'Are achievements shared publicly?',
        a: 'Your achievements are private by default. Only you can see your badges, streaks, and milestones in your profile.'
      }
    ]
  }
];

function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-border/50 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 flex items-start justify-between text-left hover:bg-muted/30 px-4 -mx-4 rounded-lg transition-colors"
      >
        <span className="font-medium pr-4">{question}</span>
        {isOpen ? (
          <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="pb-4 px-4"
        >
          <p className="text-muted-foreground text-sm leading-relaxed">{answer}</p>
        </motion.div>
      )}
    </div>
  );
}

export default function HelpPage() {
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
          <HelpCircle className="w-8 h-8 text-primary" />
          Help & FAQ
        </h1>
        <p className="text-muted-foreground mt-1">
          Learn how to make the most of PrepBridge
        </p>
      </div>

      {/* Quick Tips */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-primary/20">
                <Lightbulb className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Quick Tips to Get Started</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>📅 Create a daily plan with 3-5 focused tasks</li>
                  <li>🗺️ Follow the Roadmap for structured learning</li>
                  <li>🎯 Use JD Matching to identify skill gaps</li>
                  <li>👥 Join the community to learn from peers</li>
                  <li>🔥 Maintain your streak for consistent progress</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* FAQ Sections */}
      <div className="grid gap-6">
        {FAQ_SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <motion.div key={section.id} variants={itemVariants}>
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {section.questions.map((item, idx) => (
                      <FAQItem key={idx} question={item.q} answer={item.a} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Contact Support */}
      <motion.div variants={itemVariants}>
        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">Still have questions?</h3>
            <p className="text-sm text-muted-foreground">
              Post in the community or reach out to the admin team for personalized help.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}