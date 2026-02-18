
// Web Crypto API helpers for Load Log (Private Intimacy Tracker)

// Constants
const PBKDF2_ITERATIONS = 500000; // High iteration count for security
const SALT_SIZE = 16;
const IV_SIZE = 12; // Recommended for AES-GCM
const KEY_ALGO = 'AES-GCM';
const KEY_LENGTH = 256;

// Types
export interface EncryptedData {
    ciphertext: ArrayBuffer;
    iv: Uint8Array;
}

/**
 * Generates a random salt for key derivation
 */
export function generateSalt(): string {
    const salt = window.crypto.getRandomValues(new Uint8Array(SALT_SIZE));
    return Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Derives a CryptoKey from a user password and salt using PBKDF2
 */
export async function deriveKey(password: string, saltHex: string): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);

    // Convert hex salt back to Uint8Array
    const saltMatch = saltHex.match(/.{1,2}/g);
    if (!saltMatch) throw new Error('Invalid salt format');
    const saltBuffer = new Uint8Array(saltMatch.map(byte => parseInt(byte, 16)));

    const keyMaterial = await window.crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        'PBKDF2',
        false,
        ['deriveKey']
    );

    return window.crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: saltBuffer,
            iterations: PBKDF2_ITERATIONS,
            hash: 'SHA-256'
        },
        keyMaterial,
        { name: KEY_ALGO, length: KEY_LENGTH },
        false, // Key is non-extractable
        ['encrypt', 'decrypt']
    );
}

/**
 * Encrypts any JSON-serializable data
 */
export async function encryptData(key: CryptoKey, data: unknown): Promise<EncryptedData> {
    const encoder = new TextEncoder();
    const sortedData = JSON.stringify(data); // In a real app we might want deterministic stringify if order matters, but here it's just payload
    const dataBuffer = encoder.encode(sortedData);

    const iv = window.crypto.getRandomValues(new Uint8Array(IV_SIZE));

    const ciphertext = await window.crypto.subtle.encrypt(
        {
            name: KEY_ALGO,
            iv: iv
        },
        key,
        dataBuffer
    );

    return { ciphertext, iv };
}

/**
 * Decrypts data using the provided key and IV
 */
export async function decryptData(key: CryptoKey, ciphertext: ArrayBuffer, iv: Uint8Array): Promise<unknown> {
    try {
        const decryptedBuffer = await window.crypto.subtle.decrypt(
            {
                name: KEY_ALGO,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                iv: iv as any
            },
            key,
            ciphertext
        );

        const decoder = new TextDecoder();
        const jsonString = decoder.decode(decryptedBuffer);
        return JSON.parse(jsonString);
    } catch {
        throw new Error('Decryption failed');
    }
}

/**
 * Helper to convert ArrayBuffer to Base64 string for storage
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

/**
 * Helper to convert Base64 string to ArrayBuffer for decryption
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

/**
 * Helper to convert Uint8Array (IV) to hex string for storage
 */
export function ivToHex(iv: Uint8Array): string {
    return Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Helper to convert hex string to Uint8Array (IV)
 */
export function hexToIv(hex: string): Uint8Array {
    const match = hex.match(/.{1,2}/g);
    if (!match) throw new Error('Invalid IV format');
    return new Uint8Array(match.map(byte => parseInt(byte, 16)));
}
