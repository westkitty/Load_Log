import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../db';
import { encryptData, decryptData, arrayBufferToBase64, base64ToArrayBuffer, hexToIv, ivToHex } from '../crypto/encryption';
import type { LoadEvent, EncryptedLoadEvent } from '../types';
import { v4 as uuidv4 } from 'uuid';

export interface DecryptedEvent extends LoadEvent {
    id: string;
    date: number; // The timestamp
}

interface EventsContextType {
    events: DecryptedEvent[];
    loading: boolean;
    addEvent: (data: LoadEvent) => Promise<void>;
    updateEvent: (id: string, data: LoadEvent) => Promise<void>;
    deleteEvent: (id: string) => Promise<void>;
    refresh: () => Promise<void>;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export const EventsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { key, isAuthenticated } = useAuth();
    const [events, setEvents] = useState<DecryptedEvent[]>([]);
    const [loading, setLoading] = useState(false);

    // Load and decrypt all events
    const loadEvents = useCallback(async () => {
        if (!isAuthenticated || !key) return;

        setLoading(true);
        try {
            const encryptedEvents = await db.events.toArray();
            const decrypted: DecryptedEvent[] = [];

            for (const ev of encryptedEvents) {
                try {
                    const data = await decryptData(
                        key,
                        base64ToArrayBuffer(ev.data),
                        hexToIv(ev.iv)
                    );
                    decrypted.push({ ...data, id: ev.id, date: ev.date });
                } catch (e) {
                    console.error(`Failed to decrypt event ${ev.id}`, e);
                    // In a real app, we might want to show a "Corrupted Data" indicator
                }
            }

            // Sort by date descending
            decrypted.sort((a, b) => b.date - a.date);
            setEvents(decrypted);
        } catch (e) {
            console.error("Failed to load events", e);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, key]);

    useEffect(() => {
        if (isAuthenticated && key) {
            loadEvents();
        } else {
            setEvents([]);
        }
    }, [isAuthenticated, key, loadEvents]);

    const addEvent = async (data: LoadEvent) => {
        if (!key) throw new Error("No encryption key");

        const timestamp = Date.now();
        const id = uuidv4();
        const { ciphertext, iv } = await encryptData(key, data);

        const record: EncryptedLoadEvent = {
            id,
            date: timestamp,
            data: arrayBufferToBase64(ciphertext),
            iv: ivToHex(iv)
        };

        await db.events.add(record);

        const newEvent: DecryptedEvent = { ...data, id, date: timestamp };
        setEvents(prev => [newEvent, ...prev].sort((a, b) => b.date - a.date));
    };

    const updateEvent = async (id: string, data: EventData) => {
        if (!key) throw new Error("No encryption key");

        // We need to preserve the original date usually, or allow updating it.
        // For now, let's assume we find the original to get the date, OR data includes it?
        // Let's look up the existing event to get its date if we want to preserve it,
        // or if we passed it.

        const existing = await db.events.get(id);
        const date = existing ? existing.date : Date.now();

        const { ciphertext, iv } = await encryptData(key, data);

        const record: EncryptedLoadEvent = {
            id,
            date,
            data: arrayBufferToBase64(ciphertext),
            iv: ivToHex(iv)
        };

        await db.events.put(record);

        setEvents(prev => prev.map(e => e.id === id ? { ...data, id, date } : e).sort((a, b) => b.date - a.date));
    };

    const deleteEvent = async (id: string) => {
        await db.events.delete(id);
        setEvents(prev => prev.filter(e => e.id !== id));
    };

    return (
        <EventsContext.Provider value={{ events, loading, addEvent, updateEvent, deleteEvent, refresh: loadEvents }}>
            {children}
        </EventsContext.Provider>
    );
};

export const useEvents = () => {
    const context = useContext(EventsContext);
    if (context === undefined) {
        throw new Error('useEvents must be used within an EventsProvider');
    }
    return context;
};
