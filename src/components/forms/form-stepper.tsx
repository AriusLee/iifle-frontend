'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface Step {
  id: string;
  label: string;
  description: string;
}

interface FormStepperProps {
  steps: Step[];
  currentStep: number;
  completedSteps: Set<number>;
  onStepClick: (index: number) => void;
}

export function FormStepper({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
}: FormStepperProps) {
  return (
    <>
      {/* Desktop horizontal stepper */}
      <nav className="hidden md:block" aria-label="Form progress">
        <ol className="flex items-center">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.has(index);
            const isCurrent = index === currentStep;
            const isLast = index === steps.length - 1;

            return (
              <li key={step.id} className={cn('flex items-center', !isLast && 'flex-1')}>
                <button
                  type="button"
                  onClick={() => onStepClick(index)}
                  className={cn(
                    'group flex flex-col items-center gap-1.5 cursor-pointer focus:outline-none',
                    'transition-colors duration-150'
                  )}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  <div
                    className={cn(
                      'flex size-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-200',
                      isCompleted &&
                        'border-primary bg-primary text-primary-foreground',
                      isCurrent &&
                        !isCompleted &&
                        'border-primary bg-primary/10 text-primary',
                      !isCurrent &&
                        !isCompleted &&
                        'border-muted-foreground/30 bg-background text-muted-foreground group-hover:border-muted-foreground/60'
                    )}
                  >
                    {isCompleted ? (
                      <Check className="size-4" strokeWidth={3} />
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className="flex flex-col items-center">
                    <span
                      className={cn(
                        'text-xs font-medium leading-tight',
                        isCurrent ? 'text-primary' : 'text-muted-foreground'
                      )}
                    >
                      {step.label}
                    </span>
                  </div>
                </button>

                {!isLast && (
                  <div
                    className={cn(
                      'mx-2 h-0.5 flex-1 rounded-full transition-colors duration-200',
                      isCompleted ? 'bg-primary' : 'bg-muted-foreground/20'
                    )}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Mobile vertical stepper */}
      <nav className="md:hidden" aria-label="Form progress">
        <ol className="space-y-1">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.has(index);
            const isCurrent = index === currentStep;

            return (
              <li key={step.id}>
                <button
                  type="button"
                  onClick={() => onStepClick(index)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors cursor-pointer',
                    isCurrent && 'bg-primary/5',
                    !isCurrent && 'hover:bg-muted/50'
                  )}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  <div
                    className={cn(
                      'flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold',
                      isCompleted &&
                        'border-primary bg-primary text-primary-foreground',
                      isCurrent &&
                        !isCompleted &&
                        'border-primary bg-primary/10 text-primary',
                      !isCurrent &&
                        !isCompleted &&
                        'border-muted-foreground/30 text-muted-foreground'
                    )}
                  >
                    {isCompleted ? (
                      <Check className="size-3" strokeWidth={3} />
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span
                      className={cn(
                        'text-sm font-medium',
                        isCurrent ? 'text-foreground' : 'text-muted-foreground'
                      )}
                    >
                      {step.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {step.description}
                    </span>
                  </div>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
