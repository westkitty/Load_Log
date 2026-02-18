const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Mock Data Generator for Power Rangers (S1)

const RANGERS = [
    {
        name: "Red_Ranger_Jason",
        traits: ["leadership", "combat", "responsibility"],
        kinks: ["Power Coin", "Megazord", "Command Center", "Tyrannosaurus"],
        voice: "It's morphin' time! Gotta stay focused for the team.",
        baseIntensity: 4
    },
    {
        name: "Black_Ranger_Zack",
        traits: ["dance", "energy", "fun"],
        kinks: ["Mastodon", "Hip Hop Kido", "Juice Bar", "Power Axe"],
        voice: "Man, that was intense! Smooth moves.",
        baseIntensity: 3
    },
    {
        name: "Blue_Ranger_Billy",
        traits: ["tech", "intellect", "shy"],
        kinks: ["Triceratops", "Communicator", "Alpha 5", "Radbug"],
        voice: "Affirmative. The data suggests high efficiency.",
        baseIntensity: 3
    },
    {
        name: "Green_Ranger_Tommy",
        traits: ["intense", "redemption", "power"],
        kinks: ["Dragonzord", "Dragon Dagger", "Rita's Spell", "Green Candle"],
        voice: "I can feel the power of the Dragonzord!",
        baseIntensity: 5
    }
];

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
const NOW = Date.now();

function generateEvents(ranger) {
    const events = [];
    let currentDate = NOW;

    // Iterate backwards for 730 days (2 years)
    for (let i = 0; i < 730; i++) {
        currentDate -= (24 * 60 * 60 * 1000); // Go back one day

        // Random chance to skip a day (they are busy saving the world)
        if (Math.random() > 0.4) continue;

        const isSolo = Math.random() > 0.3;
        const mood = Math.floor(Math.random() * 5) + 1;
        const intensity = Math.min(5, Math.max(1, ranger.baseIntensity + Math.floor(Math.random() * 3) - 1));

        const event = {
            id: uuidv4(), // We'll need uuid package or a mock
            date: currentDate,
            sourceType: isSolo ? (Math.random() > 0.5 ? 'fantasy' : 'media') : 'partner',
            sourceLabel: isSolo ? "Mental Focus" : "Ranger Teammate",
            soloOrPartner: isSolo ? 'solo' : 'partnered',
            intensity: intensity,
            moodBefore: Math.max(1, mood - 1),
            moodAfter: Math.min(5, mood + 1),
            tags: [
                ...ranger.traits.filter(() => Math.random() > 0.5),
                ranger.kinks[Math.floor(Math.random() * ranger.kinks.length)]
            ],
            notes: `${ranger.voice} (Day ${730 - i})`,
            cleanup: 'standard',
            privacyLevel: 'normal'
        };

        events.push(event);
    }
    return events;
}

if (!fs.existsSync('mock_data')) {
    fs.mkdirSync('mock_data');
}

RANGERS.forEach(ranger => {
    const data = generateEvents(ranger);
    const filename = path.join('mock_data', `${ranger.name}_S1.json`);
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    console.log(`Generated ${data.length} events for ${ranger.name} -> ${filename}`);
});
