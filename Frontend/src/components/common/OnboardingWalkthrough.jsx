import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, ListTodo, Map, ChevronRight, ChevronLeft, X, Check, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const ONBOARDING_STEPS = [
  {
    id: 1,
    title: 'Complete Your Profile',
    description: 'Add your details, target companies, and skills to personalize your experience.',
    icon: User,
    action: 'Go to Profile',
    path: '/profile'
  },
  {
    id: 2,
    title: 'Create Your First Daily Plan',
    description: 'Set up your daily tasks to start tracking your preparation journey.',
    icon: ListTodo,
    action: 'Start Planning',
    path: '/planning'
  },
  {
    id: 3,
    title: 'Explore the Roadmap',
    description: 'Discover structured paths for DSA, Core CS, and domain-specific skills.',
    icon: Map,
    action: 'View Roadmap',
    path: '/roadmap'
  }
];

export default function OnboardingWalkthrough({ onComplete, onNavigate }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isVisible, setIsVisible] = useState(true);

  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;
  const currentStepData = ONBOARDING_STEPS[currentStep];
  const Icon = currentStepData.icon;

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleStepAction = () => {
    setCompletedSteps(prev => [...prev, currentStep]);
    if (onNavigate) {
      onNavigate(currentStepData.path);
    }
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      handleNext();
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem('prepbridge_onboarding_complete', 'true');
    setIsVisible(false);
    if (onComplete) {
      onComplete();
    }
  };

  const handleSkip = () => {
    localStorage.setItem('prepbridge_onboarding_complete', 'true');
    setIsVisible(false);
    if (onComplete) {
      onComplete();
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-lg"
        >
          <Card className="overflow-hidden border-primary/20 shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span className="font-medium">Getting Started</span>
                </div>
                <Button variant="ghost" size="icon" onClick={handleSkip}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                Step {currentStep + 1} of {ONBOARDING_STEPS.length}
              </p>
            </div>

            <CardContent className="p-6">
              {/* Step Indicator */}
              <div className="flex items-center justify-center gap-2 mb-6">
                {ONBOARDING_STEPS.map((step, idx) => (
                  <div
                    key={step.id}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      idx === currentStep
                        ? 'bg-primary'
                        : completedSteps.includes(idx)
                        ? 'bg-success'
                        : 'bg-muted'
                    }`}
                  />
                ))}
              </div>

              {/* Step Content */}
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <Icon className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-3">{currentStepData.title}</h2>
                <p className="text-muted-foreground mb-6">{currentStepData.description}</p>
                
                <Button onClick={handleStepAction} className="w-full mb-3">
                  {currentStepData.action}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <Button
                  variant="ghost"
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className="gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </Button>
                
                <Button variant="ghost" onClick={handleSkip} className="text-muted-foreground">
                  Skip for now
                </Button>

                {currentStep === ONBOARDING_STEPS.length - 1 ? (
                  <Button onClick={handleComplete} className="gap-2">
                    <Check className="w-4 h-4" />
                    Finish
                  </Button>
                ) : (
                  <Button variant="ghost" onClick={handleNext} className="gap-2">
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}