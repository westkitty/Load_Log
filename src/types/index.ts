export type EventType = 'solo' | 'partnered' | 'medical' | 'other';
export type ProtectionType = 'none' | 'condom' | 'dental_dam' | 'prep' | 'other';
export type Mood = 'great' | 'good' | 'neutral' | 'bad' | 'awful';

export interface EventData {
    type: EventType;
    partners?: string[];
    protection: ProtectionType[];
    notes?: string;
    mood?: Mood;
    rating?: number; // 1-10
    location?: string;
    tags?: string[];
    startTime?: number; // Timestamp
    endTime?: number; // Timestamp
    consent?: boolean;
    isSensitive?: boolean;
}

export interface PartnerProfile {
    id: string;
    name: string;
    color: string; // Hex code
    avatar?: string; // Emoji
}

export interface Template {
    id: string;
    name: string;
    data: Partial<EventData>;
    color: string;
}

// The shape of an event record in the database
export interface EncryptedEvent {
    id: string;
    date: number; // Timestamp for sorting
    data: string; // Base64 encoded ciphertext
    iv: string;   // Hex encoded IV
}

export interface AppSettings {
    autoLockMinutes: number;
    showPartnerInTimeline: boolean;
}

export interface ValidationResult {
    isValid: boolean;
    error?: string;
}
