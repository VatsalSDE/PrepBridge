import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { 
  ArrowRight, 
  CheckCircle2, 
  Flame, 
  Target, 
  Calendar,
  BarChart3,
  Users,
  Zap,
  Star,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  {
    icon: Target,
    title: 'Structured Roadmaps',
    description: 'Role-specific preparation paths with curated resources and progress tracking.',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    icon: Calendar,
    title: 'Daily Accountability',
    description: 'Plan, execute, and track your preparation with strict time-bound rules.',
    color: 'text-success',
    bgColor: 'bg-success/10',
  },
  {
    icon: BarChart3,
    title: 'Visual Progress',
    description: 'LeetCode-style heatmaps and detailed reports to measure consistency.',
    color: 'text-accent',
    bgColor: 'bg-accent/10',
  },
  {
    icon: Users,
    title: 'Anonymous Community',
    description: 'Ask doubts freely without fear of judgment in a safe peer environment.',
    color: 'text-warning',
    bgColor: 'bg-warning/10',
  },
];

const stats = [
  { value: '10,000+', label: 'Active Students' },
  { value: '85%', label: 'Placement Rate' },
  { value: '500+', label: 'Companies' },
  { value: '50K+', label: 'Tasks Completed' },
];

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Software Engineer at TCS',
    college: 'Tier-3 Engineering College',
    image: 'PS',
    rating: 5,
    text: 'PrepBridge transformed my preparation journey. The daily accountability system kept me consistent, and I finally cracked my dream company!',
    color: 'bg-primary/10',
  },
  {
    name: 'Rahul Verma',
    role: 'SDE at Infosys',
    college: 'Government College',
    image: 'RV',
    rating: 5,
    text: 'The structured roadmaps and anonymous community were game-changers. I went from zero confidence to multiple offers in 6 months.',
    color: 'bg-success/10',
  },
  {
    name: 'Anjali Patel',
    role: 'Developer at Wipro',
    college: 'Regional Engineering College',
    image: 'AP',
    rating: 5,
    text: 'As a tier-3 student, I struggled with guidance. PrepBridge gave me the structure and community support I desperately needed.',
    color: 'bg-accent/10',
  },
  {
    name: 'Karan Singh',
    role: 'Full Stack Developer at Accenture',
    college: 'State University',
    image: 'KS',
    rating: 5,
    text: 'The progress tracking and heatmaps kept me motivated. Seeing my consistency grow was incredibly satisfying. Highly recommend!',
    color: 'bg-warning/10',
  },
  {
    name: 'Sneha Reddy',
    role: 'Frontend Developer at Cognizant',
    college: 'Private Engineering College',
    image: 'SR',
    rating: 5,
    text: 'PrepBridge is not just a platform, it\'s a complete preparation ecosystem. The JD matching feature helped me target the right roles.',
    color: 'bg-primary/10',
  },
  {
    name: 'Arjun Mehta',
    role: 'Backend Developer at Tech Mahindra',
    college: 'Engineering Institute',
    image: 'AM',
    rating: 5,
    text: 'I loved the pomodoro timer and goal tracking. It made my preparation so much more efficient. Got placed in my first choice!',
    color: 'bg-success/10',
  },
];
const faqs = [
  {
    q: 'How do I create a daily plan?',
    a: 'Navigate to the Daily Planning page from the sidebar. Click "Add Task" to create new tasks. You can set task categories (DSA, Core CS, Development, etc.), priority levels, and estimated time for each task.'
  },
  {
    q: 'What is the Roadmap?',
    a: 'The Roadmap is a structured learning path that guides you through all the skills needed for placement preparation. It\'s divided into Foundations (DSA, Core CS, Aptitude) and Domain Skills (role-specific technologies).'
  },
  {
    q: 'What is JD Matching?',
    a: 'JD Matching helps you compare your skills with a company\'s job description. Select a company, upload your resume, and get a match score showing how well your profile aligns with their requirements.'
  },
  {
    q: 'How does anonymous posting work?',
    a: 'All posts in the community are anonymous. You\'re assigned a random animal name and number (e.g., "Anonymous Panda #4521") so you can ask questions freely without revealing your identity.'
  },
  {
    q: 'How do I earn badges?',
    a: 'Badges are earned by reaching milestones: maintaining streaks (7-day, 30-day, 100-day), completing roadmap sections, getting community upvotes, and achieving high JD match scores.'
  },
  {
    q: 'What can I see in Reports?',
    a: 'Reports show your preparation statistics including tasks completed, productivity trends, streak history, time spent on each category, and weekly/monthly progress comparisons.'
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
const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border"
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="font-bold text-xl text-foreground">PrepBridge</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How it Works</a>
            <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Testimonials</a>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link to="/signup">
              <Button variant="hero" size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
          <div className="absolute top-40 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-success/10 rounded-full blur-[80px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
            >
              <Flame className="w-4 h-4 text-streak" />
              <span className="text-sm font-medium text-foreground">Join 10,000+ students preparing smarter</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
            >
              <span className="text-foreground">Stop Planning.</span>
              <br />
              <span className="text-gradient-hero">Start Executing.</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
            >
              The only placement preparation platform that focuses on{' '}
              <span className="text-foreground font-medium">execution discipline</span>, not just content. 
              Build consistent habits and ace your campus placements.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            >
              <Link to="/signup">
                <Button variant="hero" size="xl" className="w-full sm:w-auto group">
                  Start Free Today
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="heroOutline" size="xl" className="w-full sm:w-auto">
                  I have an account
                </Button>
              </Link>
            </motion.div>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap items-center justify-center gap-8 md:gap-12"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="text-center"
                >
                  <p className="text-3xl md:text-4xl font-bold text-gradient-primary">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need to <span className="text-gradient-primary">Succeed</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              PrepBridge combines planning, execution tracking, and community support 
              into one powerful platform designed for Tier-3 college students.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                >
                  <div className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              The <span className="text-gradient-primary">PrepBridge</span> Method
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A simple daily loop that transforms your preparation habits
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: '1', title: 'Plan', description: 'Set your daily goals with specific tasks, time estimates, and priorities every morning.' },
                { step: '2', title: 'Execute', description: 'Work through your tasks and mark them complete before midnight—no exceptions.' },
                { step: '3', title: 'Reflect', description: 'Track your consistency, analyze patterns, and improve your approach weekly.' },
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className="relative text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-primary text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                  
                  {index < 2 && (
                    <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 md:py-32 bg-secondary/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Loved by <span className="text-gradient-primary">10,000+ Students</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Don't just take our word for it. Here's what students from tier-3 colleges 
              say about their PrepBridge journey.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300"
              >
                {/* Rating Stars */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  "{testimonial.text}"
                </p>

                {/* User Info */}
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <div className={`w-12 h-12 rounded-full ${testimonial.color} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-sm font-bold text-foreground">{testimonial.image}</span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-foreground truncate">{testimonial.name}</h4>
                    <p className="text-xs text-muted-foreground truncate">{testimonial.role}</p>
                    <p className="text-xs text-muted-foreground/70 truncate">{testimonial.college}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Additional Stats or Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-success/10 border border-success/20">
              <CheckCircle2 className="w-5 h-5 text-success" />
              <span className="text-sm font-medium text-foreground">
                Trusted by students from 200+ colleges across India
              </span>
            </div>
          </motion.div>
        </div>
      </section>
      {/* FAQ Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-gradient-primary text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get answers to common questions about PrepBridge
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="space-y-1">
                  {faqs.map((faq, idx) => (
                    <FAQItem key={idx} question={faq.q} answer={faq.a} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Transform Your<br />Placement Preparation?
            </h2>
            <p className="text-lg text-white/80 max-w-xl mx-auto mb-10">
              Join thousands of students who are building consistent habits 
              and acing their campus placements with PrepBridge.
            </p>
            <Link to="/signup">
              <Button 
                variant="glass" 
                size="xl" 
                className="bg-white text-primary hover:bg-white/90 font-semibold"
              >
                Get Started for Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t border-border">
        <div className="container mx-auto px-4">
           <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <span className="text-white font-bold">P</span>
              </div>
              <span className="font-bold text-foreground">PrepBridge</span>
            </div>  */}
            
            <p className="text-sm text-muted-foreground ">
              © 2024 PrepBridge. Built for students, by students.
            </p>

            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Terms</a>
              <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
