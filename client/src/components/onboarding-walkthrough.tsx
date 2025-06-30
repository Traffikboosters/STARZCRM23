import { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, CheckCircle, Lightbulb, Users, Calendar, Phone, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to STARZ',
    description: 'Your comprehensive business management platform designed for Traffik Boosters. Let\'s explore the key features that will boost your sales and efficiency.',
    target: '.header-logo',
    position: 'bottom'
  },
  {
    id: 'sidebar',
    title: 'Navigation Center',
    description: 'Your command center for all platform features. Access CRM, Analytics, Phone System, Lead Generation, and advanced business tools.',
    target: '.sidebar',
    position: 'right'
  },
  {
    id: 'crm',
    title: 'Lead Card Management',
    description: 'Manage all customer relationships and leads. Use AI-powered tools, conversation starters, and quick replies to close more deals.',
    target: '[data-nav="crm"]',
    position: 'right',
    action: 'Click to view your lead cards'
  },
  {
    id: 'widget-recommendations',
    title: 'Widget Recommendations',
    description: 'Get personalized dashboard widget suggestions based on your role and activity patterns to optimize your workflow.',
    target: '[data-nav="widget-recommendations"]',
    position: 'right'
  },
  {
    id: 'analytics',
    title: 'Business Analytics',
    description: 'Track performance metrics, conversion rates, and business intelligence with comprehensive reporting dashboards.',
    target: '[data-nav="analytics"]',
    position: 'right'
  },
  {
    id: 'phone',
    title: 'MightyCall Integration',
    description: 'Make professional calls with click-to-call functionality, call logging, and advanced phone system features.',
    target: '[data-nav="phone"]',
    position: 'right'
  },
  {
    id: 'lead-extraction',
    title: 'Automated Lead Generation',
    description: 'Extract high-quality leads from Google Maps, Yellow Pages, and multiple data sources with real-time processing.',
    target: '[data-nav="real-leads"]',
    position: 'right'
  },
  {
    id: 'payments',
    title: 'Payment Processing',
    description: 'Handle payments, create invoices, and manage transactions with integrated Stripe payment processing.',
    target: '[data-nav="payments"]',
    position: 'right'
  },
  {
    id: 'complete',
    title: 'Ready to Boost Your Business!',
    description: 'You\'ve completed the STARZ tour. Start generating more traffic and closing more sales with your new business management platform.',
    target: '.main-content',
    position: 'top'
  }
];

interface OnboardingWalkthroughProps {
  isVisible: boolean;
  onComplete: () => void;
  onSkip: () => void;
  userId?: number;
}

export function OnboardingWalkthrough({ isVisible, onComplete, onSkip, userId = 1 }: OnboardingWalkthroughProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightTarget, setHighlightTarget] = useState<Element | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    if (!isVisible) return;

    const step = onboardingSteps[currentStep];
    const target = document.querySelector(step.target);
    setHighlightTarget(target);

    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentStep, isVisible]);

  const saveProgress = async (stepId: string) => {
    try {
      await apiRequest('POST', '/api/user-progress', {
        userId,
        stepId,
        completedAt: new Date().toISOString(),
        onboardingComplete: stepId === 'complete'
      });
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  };

  const nextStep = async () => {
    const currentStepData = onboardingSteps[currentStep];
    const newCompletedSteps = new Set(completedSteps);
    newCompletedSteps.add(currentStepData.id);
    setCompletedSteps(newCompletedSteps);
    
    await saveProgress(currentStepData.id);
    
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      
      if (currentStepData.id === 'complete') {
        toast({
          title: "Onboarding Complete!",
          description: "You've successfully completed the STARZ platform tour.",
        });
      }
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTour = () => {
    onSkip();
  };

  if (!isVisible) return null;

  const step = onboardingSteps[currentStep];
  const isLastStep = currentStep === onboardingSteps.length - 1;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />
      
      {/* Highlight */}
      {highlightTarget && (
        <div 
          className="fixed z-50 pointer-events-none"
          style={{
            top: highlightTarget.getBoundingClientRect().top - 8,
            left: highlightTarget.getBoundingClientRect().left - 8,
            width: highlightTarget.getBoundingClientRect().width + 16,
            height: highlightTarget.getBoundingClientRect().height + 16,
            border: '3px solid #f97316',
            borderRadius: '8px',
            boxShadow: '0 0 0 2px rgba(249, 115, 22, 0.3)',
            animation: 'pulse 2s infinite'
          }}
        />
      )}

      {/* Tooltip */}
      <Card className="fixed z-50 max-w-sm shadow-xl border-2 border-orange-200" 
            style={{
              top: highlightTarget ? 
                (step.position === 'bottom' ? highlightTarget.getBoundingClientRect().bottom + 16 :
                 step.position === 'top' ? highlightTarget.getBoundingClientRect().top - 200 :
                 highlightTarget.getBoundingClientRect().top) : '50%',
              left: highlightTarget ?
                (step.position === 'right' ? highlightTarget.getBoundingClientRect().right + 16 :
                 step.position === 'left' ? highlightTarget.getBoundingClientRect().left - 384 :
                 highlightTarget.getBoundingClientRect().left) : '50%',
              transform: !highlightTarget ? 'translate(-50%, -50%)' : 'none'
            }}>
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-orange-100 rounded-full p-2">
              <span className="text-orange-600 font-bold text-sm">
                {currentStep + 1} / {onboardingSteps.length}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={skipTour}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {step.title}
          </h3>
          
          <p className="text-gray-600 mb-6">
            {step.description}
          </p>

          {step.action && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-orange-800 font-medium">
                💡 {step.action}
              </p>
            </div>
          )}

          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>

            {isLastStep ? (
              <Button
                onClick={onComplete}
                className="bg-orange-600 hover:bg-orange-700 flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Complete Tour
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                className="bg-orange-600 hover:bg-orange-700 flex items-center gap-2"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Progress indicators */}
          <div className="flex justify-center mt-4 gap-2">
            {onboardingSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index <= currentStep ? 'bg-orange-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>


    </>
  );
}