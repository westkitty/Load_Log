import React, { useState, useEffect } from 'react';
import { ChevronRight, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const TOUR_COMPLETED_KEY = 'load_log_tour_completed';

interface TourStep {
    targetId: string;
    title: string;
    content: string;
    path?: string; // Route to navigate to for this step
}

const TOUR_STEPS: TourStep[] = [
    {
        targetId: 'tour-start', // Generic center screen
        title: 'Welcome to Load Log',
        content: 'This guided tour will show you the primary functions of your personal tracking vault.',
        path: '/'
    },
    {
        targetId: 'nav-feed',
        title: 'Temporal Feed',
        content: 'View your chronological history of logs here.',
        path: '/'
    },
    {
        targetId: 'nav-insights',
        title: 'Analytics Edge',
        content: 'Analyze your performance and intensity trends over time.',
        path: '/insights'
    },
    {
        targetId: 'nav-settings',
        title: 'Configuration',
        content: 'Set your encryption key to lock your vault, tweak themes, or manage local data exports.',
        path: '/settings'
    },
    {
        targetId: 'nav-new',
        title: 'Log Entry',
        content: 'Ready to submit? Tap here to create a new encrypted log.',
        path: '/new'
    }
];

export const WalkthroughOverlay: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const [isDripping, setIsDripping] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Allow easy testing of the walkthrough flow
        if (window.location.search.includes('reset=true')) {
            localStorage.removeItem(TOUR_COMPLETED_KEY);
        }

        // Check if tour should run
        if (!localStorage.getItem(TOUR_COMPLETED_KEY)) {
            // Small delay to let Bate Bunker animation finish if it just ran
            setTimeout(() => setIsVisible(true), 1000);
        }
    }, []);

    // Effect to handle navigation and target measurement per step
    useEffect(() => {
        if (!isVisible) return;

        const step = TOUR_STEPS[currentStep];

        // Navigate if needed
        if (step.path && location.pathname !== step.path) {
            navigate(step.path);
        }

        // Wait for DOM/navigation to update, then measure target repeatedly for a short time
        let checkCount = 0;
        let measureTimer: ReturnType<typeof setTimeout>;

        const measureDynamicTarget = () => {
            if (step.targetId === 'tour-start') {
                setTargetRect(null); // Center modal
                return;
            }

            const el = document.getElementById(step.targetId);
            if (el) {
                setTargetRect(el.getBoundingClientRect());
            } else if (checkCount < 10) {
                // Element not found yet (maybe still rendering/navigating), try again in 100ms
                checkCount++;
                measureTimer = setTimeout(measureDynamicTarget, 100);
            } else {
                // Fallback if element still not found after 1 second
                setTargetRect(null);
            }
        };

        // Start measuring
        measureTimer = setTimeout(measureDynamicTarget, 100);

        // Re-measure on resize or scroll
        const handleChange = () => {
            const el = document.getElementById(step.targetId);
            if (el) setTargetRect(el.getBoundingClientRect());
        };

        window.addEventListener('resize', handleChange);
        window.addEventListener('scroll', handleChange, true); // Catch internal scrolling

        return () => {
            clearTimeout(measureTimer);
            window.removeEventListener('resize', handleChange);
            window.removeEventListener('scroll', handleChange, true);
        };
    }, [currentStep, isVisible, navigate, location.pathname]);

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(c => c - 1);
        }
    };

    const handleNext = () => {
        setIsDripping(true);
        setTimeout(() => {
            setIsDripping(false);
            if (currentStep < TOUR_STEPS.length - 1) {
                setCurrentStep(c => c + 1);
            } else {
                handleComplete();
            }
        }, 350);
    };

    const handleComplete = () => {
        localStorage.setItem(TOUR_COMPLETED_KEY, 'TRUE');
        setIsVisible(false);
        navigate('/'); // Return to feed when done
    };

    if (!isVisible) return null;

    const step = TOUR_STEPS[currentStep];

    return (
        <div className="fixed inset-0 z-[100] pointer-events-auto overflow-hidden">
            {/* Transparent background to block clicks, no darkness */}
            <div className="absolute inset-0 bg-transparent" />

            {/* Glowing Highlight Box over the target element */}
            {targetRect && (
                <div
                    className="absolute rounded-lg transition-all duration-300 pointer-events-none"
                    style={{
                        top: targetRect.top - 5,
                        left: targetRect.left - 5,
                        width: targetRect.width + 10,
                        height: targetRect.height + 10,
                        border: '2px solid var(--accent-primary)',
                        boxShadow: '0 0 15px rgba(var(--accent-primary-rgb, 100,100,255), 0.5), inset 0 0 10px rgba(var(--accent-primary-rgb, 100,100,255), 0.2)'
                    }}
                />
            )}

            {/* Modal Dialog */}
            <div
                className="absolute transition-all duration-300 border shadow-2xl p-5 rounded-md"
                style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--accent-primary)',
                    color: 'var(--text-primary)',
                    ...(targetRect ? {
                        // Position slightly above or below the target
                        top: targetRect.top > window.innerHeight / 2
                            ? `${targetRect.top - 200}px` // Above nav bar
                            : `${targetRect.bottom + 20}px`,
                        // Align horizontally with the target if possible, otherwise center
                        left: Math.min(
                            Math.max(20, targetRect.left + (targetRect.width / 2) - 140),
                            window.innerWidth - 300
                        ) + 'px',
                        width: '280px'
                    } : {
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '90%',
                        maxWidth: '280px'
                    })
                }}
            >
                {/* Directional Arrow (if target exists) */}
                {targetRect && (
                    <div
                        className="absolute w-4 h-4 border-t border-l pointer-events-none"
                        style={{
                            backgroundColor: 'var(--bg-secondary)',
                            borderColor: 'var(--accent-primary)',
                            // If modal is above the target, arrow points DOWN (bottom of modal)
                            ...(targetRect.top > window.innerHeight / 2 ? {
                                bottom: '-9px',
                                left: `${Math.min(
                                    Math.max(20, targetRect.left - Math.max(20, targetRect.left + (targetRect.width / 2) - 140) + (targetRect.width / 2) - 8),
                                    240
                                )}px`,
                                transform: 'rotate(225deg)',
                                borderLeftColor: 'transparent',
                                borderTopColor: 'transparent',
                                borderRight: '1px solid var(--accent-primary)',
                                borderBottom: '1px solid var(--accent-primary)'
                            } : {
                                // If modal is below the target, arrow points UP (top of modal)
                                top: '-9px',
                                left: `${Math.min(
                                    Math.max(20, targetRect.left - Math.max(20, targetRect.left + (targetRect.width / 2) - 140) + (targetRect.width / 2) - 8),
                                    240
                                )}px`,
                                transform: 'rotate(45deg)'
                            })
                        }}
                    />
                )}

                <div className="flex justify-between items-start mb-4 relative z-10">
                    <h2 className="text-xl font-bold uppercase italic tracking-tight" style={{ color: 'var(--accent-primary)' }}>
                        {step.title}
                    </h2>
                    <button onClick={handleComplete} className="opacity-50 hover:opacity-100 transition-opacity">
                        <X size={20} />
                    </button>
                </div>

                <p className="font-mono text-sm leading-relaxed opacity-90 mb-6 relative z-10">
                    {step.content}
                </p>

                <div className="flex items-center pt-4 border-t relative z-10" style={{ borderColor: 'var(--border-color)' }}>
                    <span className="text-xs font-mono opacity-50 flex-1">
                        {currentStep + 1} / {TOUR_STEPS.length}
                    </span>

                    <div className="flex space-x-2">
                        {currentStep > 0 && (
                            <button
                                onClick={handleBack}
                                className="flex items-center space-x-1 px-3 py-2 font-bold uppercase text-sm border hover:bg-white/10 transition-colors"
                                style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                            >
                                <span>Back</span>
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            className={`flex items-center space-x-2 px-4 py-2 font-bold uppercase text-sm border hover:bg-white/10 transition-colors ${isDripping ? 'animate-drip' : ''
                                }`}
                            style={{ color: 'var(--accent-primary)', borderColor: 'var(--accent-primary)' }}
                        >
                            <span>{currentStep === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}</span>
                            {currentStep < TOUR_STEPS.length - 1 && <ChevronRight size={16} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
