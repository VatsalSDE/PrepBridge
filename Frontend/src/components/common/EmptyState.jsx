import { motion } from 'framer-motion';
import { 
  ClipboardList, 
  MessageSquare, 
  FileText, 
  Calendar, 
  Target,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const ICONS = {
  tasks: ClipboardList,
  posts: MessageSquare,
  jd: FileText,
  calendar: Calendar,
  roadmap: Target,
  community: Users,
};

const MESSAGES = {
  tasks: {
    title: 'No tasks today',
    description: 'Start planning your day by adding your first task',
    action: 'Add Task',
  },
  posts: {
    title: 'No community posts',
    description: 'Be the first to start a discussion',
    action: 'Create Post',
  },
  jd: {
    title: 'No JD pasted yet',
    description: 'Paste a job description to see how your skills match',
    action: 'Paste JD',
  },
  calendar: {
    title: 'No activity yet',
    description: 'Start completing tasks to see your activity here',
    action: null,
  },
  roadmap: {
    title: 'Select a roadmap',
    description: 'Choose a learning path to track your progress',
    action: null,
  },
  community: {
    title: 'No discussions yet',
    description: 'Join the community and start sharing',
    action: 'New Post',
  },
};

export function EmptyState({ type = 'tasks', onAction }) {
  const Icon = ICONS[type] || ClipboardList;
  const content = MESSAGES[type] || MESSAGES.tasks;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
    >
      <motion.div
        initial={{ y: 10 }}
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4"
      >
        <Icon className="h-8 w-8 text-muted-foreground" />
      </motion.div>
      
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {content.title}
      </h3>
      
      <p className="text-sm text-muted-foreground max-w-xs mb-4">
        {content.description}
      </p>
      
      {content.action && onAction && (
        <Button onClick={onAction} variant="outline" size="sm">
          {content.action}
        </Button>
      )}
    </motion.div>
  );
}

export default EmptyState;
