/**
 * Haptic Feedback Utility
 * Wraps navigator.vibrate() to provide consistent tactile feedback across the app.
 */

const isSupported = () => typeof navigator !== 'undefined' && 'vibrate' in navigator;

export const haptics = {
    /** Subtle tap for standard interactions (e.g., button clicks, toggles) */
    light: () => {
        if (isSupported()) navigator.vibrate(10);
    },

    /** Medium pulse for significant actions (e.g., creating a log) */
    medium: () => {
        if (isSupported()) navigator.vibrate(40);
    },

    /** Harsh double-tap for destructive actions or errors */
    error: () => {
        if (isSupported()) navigator.vibrate([50, 50, 50]);
    },

    /** Long vibration for high-security events (e.g., locking vault) */
    heavy: () => {
        if (isSupported()) navigator.vibrate(100);
    }
};
