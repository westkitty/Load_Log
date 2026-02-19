import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Configuration ---
const DAYS_TO_GENERATE = 365;
const OUTPUT_DIR = __dirname; // Current directory (mock_data)

// --- Profiles ---
const RANGERS = {
    // Heroes
    Jason: {
        type: 'ranger',
        color: 'Red',
        filename: 'Red_Ranger_Jason_S1.json',
        traits: ['Leadership', 'Martial Arts', 'Strength'],
        sources: ['Gym', 'Dojo', 'Command Center', 'Angel Grove Park'],
        partners: ['Zack', 'Tommy', 'Billy', 'Goldar']
    },
    Tommy: {
        type: 'ranger',
        color: 'Green',
        filename: 'Green_Ranger_Tommy_S1.json',
        traits: ['Solo Training', 'Flute', 'Dragonzord'],
        sources: ['Park', 'Beach', 'Base', 'Dragonzord Cockpit'],
        partners: ['Jason', 'Zack', 'Lord Zedd']
    },
    Billy: {
        type: 'ranger',
        color: 'Blue',
        filename: 'Blue_Ranger_Billy_S1.json',
        traits: ['Invention', 'Strategy', 'Tech'],
        sources: ['Garage', 'Lab', 'Command Center', 'School'],
        partners: ['Jason', 'Alpha 5', 'Goldar']
    },
    Zack: {
        type: 'ranger',
        color: 'Black',
        filename: 'Black_Ranger_Zack_S1.json',
        traits: ['Dance', 'Hip Hop Kido', 'Pranks'],
        sources: ['Juice Bar', 'Park', 'Command Center', 'Gym'],
        partners: ['Jason', 'Tommy']
    },
    // Villains
    Goldar: {
        type: 'villain',
        color: 'Gold',
        filename: 'Villain_Goldar_S1.json',
        traits: ['Swordplay', 'Wings', 'Intimidation'],
        sources: ['Moon Palace', 'Dark Dimension', 'Angel Grove Park'],
        partners: ['Lord Zedd', 'Jason', 'Tommy']
    },
    LordZedd: {
        type: 'villain',
        color: 'Silver',
        filename: 'Villain_Lord_Zedd_S1.json',
        traits: ['Evil Magic', 'Staff', 'Serpentera'],
        sources: ['Moon Palace', 'Throne Room'],
        partners: ['Goldar', 'Tommy']
    }
};

// --- Activities & Interactions ---
// Shared activities have a chance to pull in multiple participants
const ACTIVITIES = [
    { label: 'Sparring Session', type: 'training', intensity: [3, 5], groupSize: 2, category: 'heroic' },
    { label: 'Zord Maintenance', type: 'duty', intensity: [2, 4], groupSize: 1, category: 'heroic' },
    { label: 'Putty Patrol Skirmish', type: 'combat', intensity: [4, 5], groupSize: 2, category: 'combat' },
    { label: 'Monster Attack Defense', type: 'combat', intensity: [5, 5], groupSize: 3, category: 'combat' },
    { label: 'Meditation', type: 'recovery', intensity: [1, 2], groupSize: 1, category: 'neutral' },
    { label: 'Tactical Study', type: 'study', intensity: [1, 3], groupSize: 1, category: 'neutral' },
    { label: 'Juice Bar Hangout', type: 'social', intensity: [1, 2], groupSize: 3, category: 'social' },
    { label: 'Morphin Grid Sync', type: 'fantasy', intensity: [3, 4], groupSize: 1, category: 'heroic' },
    // Villain / Mixed Activities
    { label: 'Evil Scheming', type: 'study', intensity: [1, 3], groupSize: 2, category: 'villainous' },
    { label: 'Dark Dimension Duel', type: 'combat', intensity: [5, 5], groupSize: 2, category: 'combat' },
    { label: 'Moon Palace Throne Room', type: 'social', intensity: [1, 2], groupSize: 2, category: 'villainous' },
    // "Spicy" / Weird Interactions
    { label: 'Truce Negotiation', type: 'social', intensity: [2, 3], groupSize: 2, category: 'mixed' },
    { label: 'Unlikely Alliance', type: 'combat', intensity: [4, 5], groupSize: 2, category: 'mixed' },
    { label: 'Secret Meeting', type: 'social', intensity: [1, 2], groupSize: 2, category: 'mixed' }
];

// --- Helpers ---
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

const generateNote = (activity, participants) => {
    const names = participants.map(p => p.name).join(', ');
    const templates = [
        `${activity.label} involving ${names}.`,
        `Intense ${activity.label.toLowerCase()} with ${names}.`,
        `Logged entry for ${activity.label}. Participants: ${names}.`,
        `The intersection of fates: ${activity.label} with ${names}.`
    ];
    return getRandomElement(templates);
};

// --- Main Generation ---
const generateData = () => {
    const allEvents = {}; // map ranger name to array of events
    Object.keys(RANGERS).forEach(name => allEvents[name] = []);

    const today = new Date();

    // Iterate day by day in reverse
    for (let i = 0; i < DAYS_TO_GENERATE; i++) {
        const currentDate = new Date(today);
        currentDate.setDate(today.getDate() - i);

        // 1. Determine Daily Global "Shared" Events
        // We'll generate 0-2 shared events per day that involve multiple people
        const numSharedEvents = getRandomInt(0, 2);

        for (let s = 0; s < numSharedEvents; s++) {
            const activity = getRandomElement(ACTIVITIES);
            const candidates = Object.keys(RANGERS);

            // Filter candidates based on category if needed (e.g. villains only do villain stuff unless it's mixed/combat)
            let validCandidates = candidates;
            if (activity.category === 'heroic') validCandidates = candidates.filter(c => RANGERS[c].type === 'ranger');
            if (activity.category === 'villainous') validCandidates = candidates.filter(c => RANGERS[c].type === 'villain');

            if (validCandidates.length < activity.groupSize) continue;

            // Pick participants
            const shuffled = shuffleArray([...validCandidates]);
            const participants = shuffled.slice(0, activity.groupSize);

            // Shared Data
            const eventId = uuidv4();
            const eventTime = currentDate.getTime() + getRandomInt(36000000, 72000000); // Same time for everyone
            const sharedNote = generateNote(activity, participants.map(p => ({ name: p })));

            // Distribute to all participants
            participants.forEach(pName => {
                const profile = RANGERS[pName];
                allEvents[pName].push({
                    id: eventId, // KEY: Same ID
                    date: eventTime, // KEY: Same Time
                    sourceType: activity.type === 'fantasy' ? 'fantasy' : 'partner',
                    sourceLabel: getRandomElement(profile.sources), // Personal location context? Or shared? Let's use personal for "perspective"
                    intensity: getRandomInt(activity.intensity[0], activity.intensity[1]),
                    moodBefore: getRandomInt(1, 5),
                    moodAfter: getRandomInt(1, 5),
                    tags: ['Shared', ...profile.traits, activity.type],
                    soloOrPartner: 'partner',
                    notes: sharedNote,
                    cleanup: 'standard',
                    privacyLevel: 'normal'
                });
            });
        }

        // 2. Fill in gaps with Solo Events
        Object.keys(RANGERS).forEach(name => {
            // Chance to add a solo event
            if (Math.random() < 0.5) {
                const profile = RANGERS[name];
                const activity = getRandomElement(ACTIVITIES.filter(a => a.groupSize === 1)); // Solo activities
                const eventTime = currentDate.getTime() + getRandomInt(28800000, 36000000); // Morning solo?

                allEvents[name].push({
                    id: uuidv4(),
                    date: eventTime,
                    sourceType: 'fantasy',
                    sourceLabel: getRandomElement(profile.sources),
                    intensity: getRandomInt(activity.intensity[0], activity.intensity[1]),
                    moodBefore: getRandomInt(1, 5),
                    moodAfter: getRandomInt(1, 5),
                    tags: ['Solo', ...profile.traits, activity.type],
                    soloOrPartner: 'solo',
                    notes: `${activity.label} session. Focused on self-improvement.`,
                    cleanup: 'standard',
                    privacyLevel: 'normal'
                });
            }
        });
    }

    // Write Files
    Object.keys(allEvents).forEach(name => {
        const profile = RANGERS[name];
        const filePath = path.join(OUTPUT_DIR, profile.filename);
        // Sort by date desc
        allEvents[name].sort((a, b) => b.date - a.date);

        fs.writeFileSync(filePath, JSON.stringify(allEvents[name], null, 2));
        console.log(`Generated ${allEvents[name].length} events for ${name}`);
    });
};

generateData();
