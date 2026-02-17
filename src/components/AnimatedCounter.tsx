import React, { useEffect, useRef } from 'react';
import { animate, useInView } from 'framer-motion';

interface AnimatedCounterProps {
    value: number;
    duration?: number;
    className?: string; // To pass text styles
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ value, duration = 1, className }) => {
    const nodeRef = useRef<HTMLSpanElement>(null);
    const isInView = useInView(nodeRef, { once: true });

    useEffect(() => {
        if (!nodeRef.current || !isInView) return;

        const node = nodeRef.current;
        const controls = animate(0, value, {
            duration,
            ease: "easeOut",
            onUpdate(v) {
                node.textContent = Math.floor(v).toString(); // Integer display
            }
        });

        return () => controls.stop();
    }, [value, duration, isInView]);

    return <span ref={nodeRef} className={className} />;
};
