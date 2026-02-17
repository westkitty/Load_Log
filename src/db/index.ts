import Dexie, { type Table } from 'dexie';
import type { EncryptedEvent } from '../types';

export class LoadLogDatabase extends Dexie {
    events!: Table<EncryptedEvent, string>;
    settings!: Table<{ key: string; value: any }, string>;

    constructor() {
        super('LoadLogDB');
        this.version(1).stores({
            events: 'id, date', // Primary key: id, Index: date
            settings: 'key'     // Primary key: key
        });
    }
}

export const db = new LoadLogDatabase();
