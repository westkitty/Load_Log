// Load Log - Men-Only Domain Model

export type SourceType = 'porn' | 'fantasy' | 'partner' | 'memory' | 'media' | 'other';
export type SoloOrPartner = 'solo' | 'partnered';
export type LoadSize = 'small' | 'medium' | 'big' | 'mythic';
export type Cleanup = 'quick' | 'standard' | 'full_reset';
export type PrivacyLevel = 'normal' | 'extra_private';

export interface LoadEvent {
    // Core fields
    sourceType: SourceType;
    sourceLabel?: string; // "that gym guy", "scene 3", "favorite creator", etc.
    soloOrPartner: SoloOrPartner;

    // Intensity & mood
    intensity?: number; // 1-5
    moodBefore?: number; // 1-5
    moodAfter?: number; // 1-5
    loadSize?: LoadSize;

    // Details
    refractoryNotes?: string;
    bodyNotes?: string;
    tags?: string[];
    notes?: string;

    // Optional metadata
    protectionUsed?: 'none' | 'condom' | 'other'; // If partnered
    cleanup?: Cleanup;
    privacyLevel?: PrivacyLevel;

    // Deprecated fields (for backward compatibility during migration)
    _deprecated_type?: 'solo' | 'partnered' | 'medical' | 'other';
    _deprecated_partners?: string[];
    _deprecated_protection?: string[];
    _deprecated_mood?: 'great' | 'good' | 'neutral' | 'bad' | 'awful';
    _deprecated_rating?: number;
    _deprecated_location?: string;
    _deprecated_startTime?: number;
    _deprecated_endTime?: number;
    _deprecated_consent?: boolean;
    isSensitive?: boolean; // Legacy field, use privacyLevel instead
}

// Partner profile (kept for potential future use)
export interface PartnerProfile {
    id: string;
    name: string;
    color: string;
    avatar?: string;
}

// Template system
export interface Template {
    id: string;
    name: string;
    data: Partial<LoadEvent>;
    color: string;
}

// Database schema (storage)
export interface StoredLoadEvent {
    id: string;
    date: number; // Timestamp for sorting
    data: string; // Base64 encoded ciphertext OR JSON string
    iv?: string;   // Hex encoded IV (optional if unencrypted)
    isEncrypted: boolean;
}

export interface DecryptedEvent extends LoadEvent {
    id: string;
    date: number; // The timestamp
}

// App settings
export interface AppSettings {
    autoLockMinutes: number;
    minimalLoggingMode: boolean;
    spiceLevel: 'mild' | 'medium' | 'spicy';
    showExtraPrivate: boolean;
    showPartnerInTimeline?: boolean; // Legacy
}

// Validation
export interface ValidationResult {
    isValid: boolean;
    error?: string;
}
