import Dexie, { type Table } from 'dexie';
import type { EncryptedLoadEvent } from '../types';

export class LoadLogDatabase extends Dexie {
    events!: Table<EncryptedLoadEvent, string>;
    settings!: Table<{ key: string; value: any }, string>;

    constructor() {
        super('LoadLogDB');

        // v1 schema (original EventData model)
        this.version(1).stores({
            events: 'id, date',
            settings: 'key'
        });

        // v2 schema (LoadEvent model - data shape changed, schema unchanged)
        this.version(2).stores({
            events: 'id, date', // No index changes
            settings: 'key'
        }).upgrade(async (tx) => {
            // Migration happens at runtime in AuthContext when decrypting
            // We'll transform old EventData → LoadEvent during decryption
            console.log('[DB Migration] Schema v2: LoadEvent domain upgrade');

            // Add default settings for new features
            await tx.table('settings').put({ key: 'minimalLoggingMode', value: false });
            await tx.table('settings').put({ key: 'spiceLevel', value: 'medium' });
            await tx.table('settings').put({ key: 'showExtraPrivate', value: false });
        });
    }
}

export const db = new LoadLogDatabase();
