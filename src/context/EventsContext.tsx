import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../db';
import { encryptData, decryptData, arrayBufferToBase64, base64ToArrayBuffer, hexToIv, ivToHex } from '../crypto/encryption';
import type { LoadEvent, StoredLoadEvent, DecryptedEvent } from '../types';
import { v4 as uuidv4 } from 'uuid';

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
    const { key } = useAuth();
    const [events, setEvents] = useState<DecryptedEvent[]>([]);
    const [loading, setLoading] = useState(false);

    // Load and decrypt all events
    const loadEvents = useCallback(async () => {
        setLoading(true);
        try {
            const storedEvents = await db.events.toArray();
            const decrypted: DecryptedEvent[] = [];
            const eventsToMigrate: StoredLoadEvent[] = [];

            for (const ev of storedEvents) {
                try {
                    let data: string;

                    if (ev.isEncrypted) {
                        if (!key) continue; // Cannot decrypt without key
                        // iv is mandatory for encrypted events, but optional in type
                        if (!ev.iv) throw new Error("Missing IV for encrypted event");

                        data = await decryptData(
                            key,
                            base64ToArrayBuffer(ev.data),
                            hexToIv(ev.iv)
                        );
                    } else {
                        // If we have a key but event is unencrypted, we should migrate it
                        if (key) {
                            const parsed = JSON.parse(ev.data);
                            const { ciphertext, iv } = await encryptData(key, parsed);

                            const migratedRecord: StoredLoadEvent = {
                                ...ev,
                                data: arrayBufferToBase64(ciphertext),
                                iv: ivToHex(iv),
                                isEncrypted: true
                            };

                            eventsToMigrate.push(migratedRecord);
                            data = ev.data; // Use original data for this render
                        } else {
                            data = ev.data;
                        }
                    }

                    const parsedData = JSON.parse(data);
                    decrypted.push({ ...parsedData, id: ev.id, date: ev.date });
                } catch (e) {
                    console.error(`Failed to load event ${ev.id}`, e);
                }
            }

            if (eventsToMigrate.length > 0) {
                console.log(`Migrating ${eventsToMigrate.length} events to encrypted storage...`);
                await db.events.bulkPut(eventsToMigrate);
            }

            decrypted.sort((a, b) => b.date - a.date);
            setEvents(decrypted);
        } catch (e) {
            console.error("Failed to load events", e);
        } finally {
            setLoading(false);
        }
    }, [key]);

    useEffect(() => {
        loadEvents();
    }, [key, loadEvents]);

    const addEvent = async (data: LoadEvent) => {
        const timestamp = Date.now();
        const id = uuidv4();

        let storedData: string;
        let iv: Uint8Array | undefined;
        let isEncrypted = false;

        if (key) {
            // Encrypt
            const result = await encryptData(key, data);
            storedData = arrayBufferToBase64(result.ciphertext);
            iv = result.iv;
            isEncrypted = true;
        } else {
            // Plain text
            storedData = JSON.stringify(data);
        }

        const record: StoredLoadEvent = {
            id,
            date: timestamp,
            data: storedData,
            iv: iv ? ivToHex(iv) : undefined,
            isEncrypted
        };

        await db.events.add(record);

        // Update local state
        const newEvent: DecryptedEvent = { ...data, id, date: timestamp };
        setEvents(prev => [newEvent, ...prev].sort((a, b) => b.date - a.date));
    };

    const updateEvent = async (id: string, data: LoadEvent) => {
        // Get existing to preserve date if possible
        const existing = await db.events.get(id);
        const date = existing ? existing.date : Date.now();

        let storedData: string;
        let iv: Uint8Array | undefined;
        let isEncrypted = false;

        if (key) {
            const result = await encryptData(key, data);
            storedData = arrayBufferToBase64(result.ciphertext);
            iv = result.iv;
            isEncrypted = true;
        } else {
            storedData = JSON.stringify(data);
        }

        const record: StoredLoadEvent = {
            id,
            date,
            data: storedData,
            iv: iv ? ivToHex(iv) : undefined,
            isEncrypted
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

// eslint-disable-next-line react-refresh/only-export-components
export const useEvents = () => {
    const context = useContext(EventsContext);
    if (context === undefined) {
        throw new Error('useEvents must be used within an EventsProvider');
    }
    return context;
};
