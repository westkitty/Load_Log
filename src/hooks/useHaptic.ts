import { useCallback } from 'react';

export const useHaptic = () => {
    const trigger = useCallback((type: 'light' | 'medium' | 'heavy' | 'success' | 'warn') => {
        if (!navigator.vibrate) return;

        switch (type) {
            case 'light':
                navigator.vibrate(10);
                break;
            case 'medium':
                navigator.vibrate(20);
                break;
            case 'heavy':
                navigator.vibrate(40);
                break;
            case 'success':
                navigator.vibrate([10, 30, 10, 30]);
                break;
            case 'warn':
                navigator.vibrate([30, 50, 10]);
                break;
        }
    }, []);

    return { trigger };
};
