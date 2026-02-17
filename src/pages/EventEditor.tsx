import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '../context/EventsContext';
import { db } from '../db';
import type { EventType, ProtectionType, Mood, EventData, PartnerProfile, Template } from '../types';
import { ArrowLeft, Save, Shield, Heart, Smile, Frown, Meh, ThumbsUp, Plus, Bookmark, Lightbulb } from 'lucide-react';
// ... imports

const CHALLENGE_PROMPTS = [
    "Try a new location in your home.",
    "Focus entirely on sensation, no visuals.",
    "Incorporate a temperature difference.",
    "Use a blindfold.",
    "Roleplay a first encounter.",
    "Silent session.",
    "Slow down: take twice as long as usual.",
    "Focus on aftercare first, then the event.",
    "Try a new toy or accessory.",
    "Explore a fantasy you haven't shared."
];

export const EventEditor: React.FC = () => {
    // ...
    const [challenge, setChallenge] = useState<string | null>(null);

    const showChallenge = () => {
        const random = CHALLENGE_PROMPTS[Math.floor(Math.random() * CHALLENGE_PROMPTS.length)];
        setChallenge(random);
    };
    const navigate = useNavigate();
    const { addEvent } = useEvents();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [templates, setTemplates] = useState<Template[]>([]);

    const [type, setType] = useState<EventType>('partnered');
    const [partners, setPartners] = useState<string[]>([]);
    const [availablePartners, setAvailablePartners] = useState<PartnerProfile[]>([]);
    const [protection, setProtection] = useState<ProtectionType[]>([]);
    const [notes, setNotes] = useState('');
    const [mood, setMood] = useState<Mood | undefined>(undefined);
    const [rating, setRating] = useState<number>(3);
    const [location, setLocation] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [isSensitive, setIsSensitive] = useState(false);

    // Load partners and templates
    useEffect(() => {
        const load = async () => {
            const pRecord = await db.settings.get('partner_profiles');
            if (pRecord && pRecord.value) setAvailablePartners(pRecord.value);

            const tRecord = await db.settings.get('event_templates');
            if (tRecord && tRecord.value) setTemplates(tRecord.value);
        };
        load();
    }, []);

    const saveTemplate = async () => {
        const name = prompt("Name this template (e.g., 'Regular Solo'):");
        if (!name) return;

        const template: Template = {
            id: uuidv4(),
            name,
            color: '#3b82f6', // Default blue
            data: {
                type,
                partners: partners.length > 0 ? partners : undefined,
                protection,
                notes,
                mood,
                rating,
                consent,
                location,
                tags
            }
        };

        const updated = [...templates, template];
        setTemplates(updated);
        await db.settings.put({ key: 'event_templates', value: updated });
    };

    const applyTemplate = (t: Template) => {
        if (t.data.type) setType(t.data.type);
        if (t.data.partners) setPartners(t.data.partners || []);
        if (t.data.protection) setProtection(t.data.protection || []);
        if (t.data.notes) setNotes(t.data.notes || '');
        if (t.data.mood) setMood(t.data.mood);
        if (t.data.rating) setRating(t.data.rating || 3);
        if (t.data.consent !== undefined) setConsent(t.data.consent);
        if (t.data.location) setLocation(t.data.location || '');
        if (t.data.tags) setTags(t.data.tags || []);
    };

    const deleteTemplate = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Delete this template?')) return;
        const updated = templates.filter(t => t.id !== id);
        setTemplates(updated);
        await db.settings.put({ key: 'event_templates', value: updated });
    };


    const handleAddTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()]);
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(t => t !== tagToRemove));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // const splitPartners = partners.split(',').map(p => p.trim()).filter(Boolean); // No longer needed

            const eventData: EventData = {
                type,
                partners: partners.length > 0 ? partners : undefined,
                protection,
                notes: notes || undefined,
                mood,
                rating,
                consent,
                location: location || undefined,
                tags: tags.length > 0 ? tags : undefined,
                startTime: startTime ? new Date(startTime).getTime() : undefined,
                startTime: startTime ? new Date(startTime).getTime() : undefined,
                endTime: endTime ? new Date(endTime).getTime() : undefined,
                isSensitive
            };

            await addEvent(eventData);
            navigate('/');
        } catch (e) {
            console.error(e);
            alert('Failed to save event');
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleProtection = (p: ProtectionType) => {
        setProtection(prev =>
            prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
        );
    };

    return (
        <div className="pb-20">
            <header className="flex items-center justify-between mb-6">
                <button onClick={() => navigate(-1)} className="p-2 text-gray-400 hover:text-white">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold text-white">New Entry</h2>
                <button onClick={saveTemplate} className="text-blue-400 hover:text-blue-300">
                    <Bookmark className="w-6 h-6" />
                </button>
                <button onClick={showChallenge} className="text-yellow-400 hover:text-yellow-300 ml-2">
                    <Lightbulb className="w-6 h-6" />
                </button>
            </header>

            {challenge && (
                <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg flex items-start justify-between">
                    <p className="text-yellow-200 text-sm italic">"{challenge}"</p>
                    <button onClick={() => setChallenge(null)} className="text-yellow-500 hover:text-yellow-300">×</button>
                </div>
            )}

            {templates.length > 0 && (
                <section className="mb-6 overflow-x-auto pb-2">
                    <div className="flex space-x-3">
                        {templates.map(t => (
                            <button
                                key={t.id}
                                onClick={() => applyTemplate(t)}
                                className="flex-shrink-0 px-4 py-2 bg-gray-800 border border-gray-700 rounded-full text-xs font-medium text-gray-300 whitespace-nowrap hover:bg-gray-700 flex items-center space-x-2"
                            >
                                <span>{t.name}</span>
                                <span
                                    onClick={(e) => deleteTemplate(t.id, e)}
                                    className="text-gray-500 hover:text-red-400 ml-1"
                                >×</span>
                            </button>
                        ))}
                    </div>
                </section>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Type Selection */}
                <section className="space-y-3">
                    <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">Type</label>
                    <div className="grid grid-cols-2 gap-3">
                        {(['partnered', 'solo', 'medical', 'wellness', 'other'] as EventType[]).map(t => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setType(t)}
                                className={clsx(
                                    "p-3 rounded-lg border text-sm font-medium capitalize transition-colors",
                                    type === t
                                        ? "bg-blue-600/20 border-blue-500 text-blue-200"
                                        : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600"
                                )}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Partners (if partnered) */}
                {type === 'partnered' && (
                    <section className="space-y-3">
                        <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">Partners</label>
                        <div className="flex flex-wrap gap-2">
                            {availablePartners.map(p => (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => {
                                        setPartners(prev =>
                                            prev.includes(p.name) ? prev.filter(n => n !== p.name) : [...prev, p.name]
                                        );
                                    }}
                                    className={clsx(
                                        "px-3 py-2 rounded-lg text-sm font-medium border transition-colors flex items-center space-x-2",
                                        partners.includes(p.name)
                                            ? "bg-gray-700 border-white text-white"
                                            : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600"
                                    )}
                                    style={partners.includes(p.name) ? { borderColor: p.color } : {}}
                                >
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                                    <span>{p.name}</span>
                                </button>
                            ))}
                        </div>
                        {/* Fallback / Ad-hoc input could go here, but keeping it simple for now */}
                        {availablePartners.length === 0 && (
                            <p className="text-xs text-gray-500">No partners defined. Go to Settings to add partners.</p>
                        )}
                    </section>
                )}

                {/* Location & Time */}
                <section className="grid grid-cols-1 gap-4">
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">Location</label>
                        <input
                            type="text"
                            value={location}
                            onChange={e => setLocation(e.target.value)}
                            placeholder="Where? (optional)"
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-400 uppercase">Start Time</label>
                            <input
                                type="datetime-local"
                                value={startTime}
                                onChange={e => setStartTime(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-400 uppercase">End Time</label>
                            <input
                                type="datetime-local"
                                value={endTime}
                                onChange={e => setEndTime(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>
                </section>

                {/* Tags */}
                <section className="space-y-3">
                    <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">Tags</label>
                    <div className="flex gap-2 mb-2 flex-wrap">
                        {tags.map(tag => (
                            <span key={tag} className="bg-blue-900/40 text-blue-200 text-xs px-2 py-1 rounded-full flex items-center">
                                #{tag}
                                <button onClick={() => removeTag(tag)} className="ml-1 hover:text-white">×</button>
                            </span>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={tagInput}
                            onChange={e => setTagInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                            placeholder="Add tags..."
                            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                        <button type="button" onClick={handleAddTag} className="px-4 bg-gray-700 rounded-lg text-white hover:bg-gray-600">
                            +
                        </button>
                    </div>
                </section>

                {/* Protection - Hide for wellness/solo? Solo might use toys/lube but 'protection' usually triggers STI/Pregnancy context. Let's hide for wellness. */}
                {type !== 'wellness' && (
                    <section className="space-y-3">
                        <label className="text-sm font-medium text-gray-400 uppercase tracking-wider flex items-center">
                            <Shield className="w-4 h-4 mr-1" /> Protection
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {(['none', 'condom', 'dental_dam', 'prep', 'other'] as ProtectionType[]).map(p => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => toggleProtection(p)}
                                    className={clsx(
                                        "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors capitalize",
                                        protection.includes(p)
                                            ? "bg-green-900/30 border-green-500 text-green-300"
                                            : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600"
                                    )}
                                >
                                    {p.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </section>
                )}

                {/* Mood & Rating */}
                <section className="space-y-8">
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-400 uppercase tracking-wider flex items-center">
                            <Heart className="w-4 h-4 mr-1" /> Experience
                        </label>
                        <div className="flex justify-between bg-gray-800 p-4 rounded-lg border border-gray-700">
                            {(['awful', 'bad', 'neutral', 'good', 'great'] as Mood[]).map((m, idx) => (
                                <button
                                    key={m}
                                    type="button"
                                    onClick={() => setMood(m)}
                                    className={clsx(
                                        "flex flex-col items-center space-y-1 transition-all",
                                        mood === m ? "text-pink-400 scale-110" : "text-gray-500 hover:text-gray-300"
                                    )}
                                >
                                    {idx === 0 && <Frown className="w-6 h-6" />}
                                    {idx === 1 && <Frown className="w-6 h-6" />}
                                    {idx === 2 && <Meh className="w-6 h-6" />}
                                    {idx === 3 && <Smile className="w-6 h-6" />}
                                    {idx === 4 && <Heart className="w-6 h-6" />}
                                    <span className="text-[10px] capitalize">{m}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">Rating (1-10)</label>
                        <div className="grid grid-cols-10 gap-1 bg-gray-800 rounded-lg p-2 border border-gray-700">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(r => (
                                <button
                                    key={r}
                                    type="button"
                                    onClick={() => setRating(r)}
                                    className={clsx(
                                        "w-full aspect-square rounded-md flex items-center justify-center font-bold text-xs transition-colors",
                                        rating === r ? "bg-yellow-500 text-black" : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                                    )}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Consent */}
                {type !== 'wellness' && (
                    <section className="space-y-3">
                        <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">Consent</label>
                        <button
                            type="button"
                            onClick={() => setConsent(!consent)}
                            className={clsx(
                                "w-full h-[58px] rounded-lg border flex items-center justify-center space-x-2 transition-colors",
                                consent
                                    ? "bg-green-900/30 border-green-500 text-green-300"
                                    : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600"
                            )}
                        >
                            <ThumbsUp className="w-5 h-5" />
                            <span className="text-sm font-medium">{consent ? 'Affirmed' : 'Not setup'}</span>
                        </button>
                    </section>
                )}

                {/* Notes */}
                <section className="space-y-3">
                    <label className="text-sm font-medium text-gray-400 uppercase tracking-wider">Notes</label>
                    <textarea
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        rows={4}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Any private details..."
                    />
                </section>

                {/* Sensitive / Hidden */}
                <section className="pt-2">
                    <button
                        type="button"
                        onClick={() => setIsSensitive(!isSensitive)}
                        className="flex items-center space-x-2 text-gray-500 hover:text-gray-300 transition-colors"
                    >
                        {isSensitive ? <EyeOff className="w-5 h-5 text-red-400" /> : <Eye className="w-5 h-5" />}
                        <span className="text-sm">{isSensitive ? 'Hidden / Sensitive Event' : 'Visible Event'}</span>
                    </button>
                </section>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white font-bold shadow-lg hover:shadow-blue-900/30 active:scale-[0.99] transition-all flex items-center justify-center space-x-2"
                >
                    <Save className="w-5 h-5" />
                    <span>{isSubmitting ? 'Encrypted Saving...' : 'Save Encrypted Entry'}</span>
                </button>
            </form>
        </div>
    );
};
