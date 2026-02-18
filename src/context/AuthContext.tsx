import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { deriveKey, generateSalt, encryptData, decryptData, arrayBufferToBase64, base64ToArrayBuffer, ivToHex, hexToIv } from '../crypto/encryption';

interface AuthState {
    isAuthenticated: boolean;
    isLoading: boolean;
    hasAccount: boolean;
    key: CryptoKey | null;
}

interface AuthContextType extends AuthState {
    login: (password: string) => Promise<boolean>;
    register: (password: string) => Promise<void>;
    logout: () => void;
    resetAll: () => void;
}

const DEFAULT_AUTO_LOCK_TIME = 5 * 60 * 1000; // 5 minutes

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SALT_KEY = 'load_log_auth_salt';
const VERIFIER_KEY = 'load_log_auth_verifier';
const VERIFIER_IV_KEY = 'load_log_auth_verifier_iv';
// A known string we encrypt to verify the password.
// If we can successfully decrypt this string with the derived key, the password is correct.
const VERIFIER_VALUE = 'load-log-verifier-token';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, setState] = useState<AuthState>(() => {
        const salt = localStorage.getItem(SALT_KEY);
        const verifier = localStorage.getItem(VERIFIER_KEY);

        if (salt && verifier) {
            return {
                isAuthenticated: false,
                isLoading: false,
                hasAccount: true,
                key: null,
            };
        } else {
            return {
                isAuthenticated: false,
                isLoading: false,
                hasAccount: false,
                key: null,
            };
        }
    });



    const logout = () => {
        setState(s => ({ ...s, isAuthenticated: false, key: null }));
    };

    // Auto-lock logic
    useEffect(() => {
        if (!state.isAuthenticated) return;

        let lastActivity = Date.now();


        const updateActivity = () => {
            lastActivity = Date.now();
        };

        const checkInactivity = () => {
            if (Date.now() - lastActivity > DEFAULT_AUTO_LOCK_TIME) {
                logout();
            }
        };

        // Throttle activity updates to avoid too many writes/perf hit


        // Instead of attaching listener to every event that calls state update,
        // strictly we just need to reset the timer or check timestamp.
        // Set an interval to check periodically.

        const intervalId = setInterval(checkInactivity, 15000); // Check every 15s

        const handleUserActivity = () => {
            updateActivity();
        }

        window.addEventListener('mousemove', handleUserActivity);
        window.addEventListener('keydown', handleUserActivity);
        window.addEventListener('click', handleUserActivity);
        window.addEventListener('touchstart', handleUserActivity);

        return () => {
            clearInterval(intervalId);
            window.removeEventListener('mousemove', handleUserActivity);
            window.removeEventListener('keydown', handleUserActivity);
            window.removeEventListener('click', handleUserActivity);
            window.removeEventListener('touchstart', handleUserActivity);
        };
    }, [state.isAuthenticated]);

    const register = async (password: string) => {
        try {
            const salt = generateSalt();
            const key = await deriveKey(password, salt);

            const { ciphertext, iv } = await encryptData(key, VERIFIER_VALUE);

            localStorage.setItem(SALT_KEY, salt);
            localStorage.setItem(VERIFIER_KEY, arrayBufferToBase64(ciphertext));
            localStorage.setItem(VERIFIER_IV_KEY, ivToHex(iv));

            setState({
                isAuthenticated: true,
                isLoading: false,
                hasAccount: true,
                key
            });
        } catch (error) {
            console.error("Registration failed", error);
            throw error;
        }
    };

    const login = async (password: string): Promise<boolean> => {
        try {
            const salt = localStorage.getItem(SALT_KEY);
            const storedVerifier = localStorage.getItem(VERIFIER_KEY);
            const storedIv = localStorage.getItem(VERIFIER_IV_KEY);

            if (!salt || !storedVerifier || !storedIv) return false;

            const key = await deriveKey(password, salt);

            try {
                const decrypted = await decryptData(
                    key,
                    base64ToArrayBuffer(storedVerifier),
                    hexToIv(storedIv)
                );

                if (decrypted === VERIFIER_VALUE) {
                    setState({
                        isAuthenticated: true,
                        isLoading: false,
                        hasAccount: true,
                        key
                    });
                    return true;
                }
            } catch {
                // Decryption failed means wrong password
                return false;
            }
            return false;
        } catch (error) {
            console.error("Login failed", error);
            return false;
        }
    };



    const resetAll = () => {
        localStorage.clear();
        // In a real app we'd also delete the DB here, but that's a side effect.
        // The UI calling this should handle DB deletion.
        setState({
            isAuthenticated: false,
            isLoading: false,
            hasAccount: false,
            key: null
        });
    };

    return (
        <AuthContext.Provider value={{ ...state, login, register, logout, resetAll }}>
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
