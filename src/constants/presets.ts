// Masculine presets and labels for Load Log

export const TAG_PRESETS = [
    'morning wood',
    'edge session',
    'quick relief',
    'marathon',
    'new PR',
    'stress relief',
    'post-workout',
    'late night',
    'sober streak',
    'relapse',
    'revenge session',
    'celebration',
    'boredom',
    'insomnia cure',
    'focus break'
];

export const SOURCE_PRESETS = [
    'favorite creator',
    'gym crush',
    'that scene',
    'memory',
    'partner',
    'random scroll',
    'imagination',
    'audio',
    'photo',
    'text/story'
];

export const LOAD_SIZE_LABELS = {
    small: '💧 Small',
    medium: '💦 Medium',
    big: '🌊 Big',
    mythic: '🚀 Mythic'
} as const;

export const CLEANUP_LABELS = {
    quick: 'Quick wipe',
    standard: 'Normal cleanup',
    full_reset: 'Full shower'
} as const;

export const INTENSITY_LABELS = {
    1: 'Meh',
    2: 'Decent',
    3: 'Good',
    4: 'Great',
    5: 'Legendary'
} as const;

export const MOOD_LABELS = {
    1: '😫',
    2: '😕',
    3: '😐',
    4: '😊',
    5: '🔥'
} as const;

// Spice level variations for copy
export const SPICE_VARIATIONS = {
    mild: {
        loadSize: 'Output',
        event: 'Session',
        log: 'Record',
        intensity: 'Quality'
    },
    medium: {
        loadSize: 'Load Size',
        event: 'Load',
        log: 'Log It',
        intensity: 'Intensity'
    },
    spicy: {
        loadSize: 'Payload',
        event: 'Nut',
        log: 'Bust Recorded',
        intensity: 'Power'
    }
} as const;
