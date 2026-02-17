import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '../context/EventsContext';
import type { LoadEvent, SourceType, SoloOrPartner, LoadSize, PrivacyLevel } from '../types';
import { SOURCE_PRESETS, TAG_PRESETS, LOAD_SIZE_LABELS, SPICE_VARIATIONS } from '../constants/presets';
import { ArrowLeft, Save, Globe, Lock, Droplet } from 'lucide-react';
import { clsx } from 'clsx';
import confetti from 'canvas-confetti';
import { useHaptic } from '../hooks/useHaptic';

export const EventEditor: React.FC = () => {
    const navigate = useNavigate();
    const { addEvent } = useEvents();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { trigger: haptic } = useHaptic();

    // Form State
    const [soloOrPartner, setSoloOrPartner] = useState<SoloOrPartner>('solo');
    const [sourceType, setSourceType] = useState<SourceType>('porn');
    const [sourceLabel, setSourceLabel] = useState('');
    const [loadSize, setLoadSize] = useState<LoadSize>('medium');
    const [intensity, setIntensity] = useState<number>(3);
    const [privacyLevel, setPrivacyLevel] = useState<PrivacyLevel>('normal');
    const [notes, setNotes] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [newTag, setNewTag] = useState('');

    // Settings state
    const [spiceLevel, setSpiceLevel] = useState<'mild' | 'medium' | 'spicy'>('medium');
    const [minimalMode, setMinimalMode] = useState(false);

    useEffect(() => {
        const storedSpice = localStorage.getItem('spiceLevel') as any;
        if (storedSpice) setSpiceLevel(storedSpice);

        const storedMinimal = localStorage.getItem('minimalLoggingMode') === 'true';
        setMinimalMode(storedMinimal);
    }, []);

    const copy = SPICE_VARIATIONS[spiceLevel] || SPICE_VARIATIONS.medium;

    const toggleTag = (tag: string) => {
        haptic('light');
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const handleAddTag = () => {
        if (newTag.trim() && !selectedTags.includes(newTag.trim())) {
            haptic('success');
            setSelectedTags([...selectedTags, newTag.trim()]);
            setNewTag('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        haptic('medium');

        if (loadSize === 'mythic') {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#3b82f6', '#8b5cf6', '#ec4899']
            });
            haptic('success');
            // Small delay to let confetti show
            await new Promise(r => setTimeout(r, 500));
        }

        try {
            const eventData: LoadEvent = {
                soloOrPartner,
                sourceType,
                sourceLabel: sourceLabel.trim() || undefined,
                loadSize,
                intensity,
                privacyLevel,
                notes: notes.trim() || undefined,
                tags: selectedTags.length > 0 ? selectedTags : undefined,
            };

            await addEvent(eventData);
            navigate('/');
        } catch (error) {
            console.error(error);
            alert('Failed to log load. Check console.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="pb-24">
            <header className="flex items-center justify-between mb-6">
                <button onClick={() => navigate(-1)} className="p-2 text-gray-400 hover:text-white">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                    {copy.log}
                </h2>
                <div className="w-10" /> {/* Spacer */}
            </header>

            <form onSubmit={handleSubmit} className="space-y-8">

                {/* 1. Solo vs Partner Switch */}
                <div className="bg-gray-800 p-1 rounded-xl flex">
                    <button
                        type="button"
                        onClick={() => { haptic('light'); setSoloOrPartner('solo'); }}
                        className={clsx(
                            "flex-1 py-3 rounded-lg text-sm font-bold transition-all",
                            soloOrPartner === 'solo' ? "bg-blue-600 text-white shadow-lg" : "text-gray-400 hover:text-white"
                        )}
                    >
                        Solo
                    </button>
                    <button
                        type="button"
                        onClick={() => { haptic('light'); setSoloOrPartner('partnered'); }}
                        className={clsx(
                            "flex-1 py-3 rounded-lg text-sm font-bold transition-all",
                            soloOrPartner === 'partnered' ? "bg-pink-600 text-white shadow-lg" : "text-gray-400 hover:text-white"
                        )}
                    >
                        Partner
                    </button>
                </div>

                {/* 2. Source Selector */}
                <section>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">
                        Stimulation Source
                    </label>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                        {(['porn', 'fantasy', 'memory', 'media', 'partner', 'other'] as SourceType[]).map(type => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => { haptic('light'); setSourceType(type); }}
                                className={clsx(
                                    "py-2 px-1 rounded-lg text-xs font-medium capitalize border transition-all",
                                    sourceType === type
                                        ? "bg-blue-900/40 border-blue-500 text-blue-200"
                                        : "bg-gray-800 border-gray-700 text-gray-400"
                                )}
                            >
                                {type}
                            </button>
                        ))}
                    </div>

                    {/* Source Detail Input */}
                    <input
                        type="text"
                        value={sourceLabel}
                        onChange={e => setSourceLabel(e.target.value)}
                        placeholder="Details (e.g. 'Pornhub', 'That one ex')..."
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                    />

                    {/* Source Presets */}
                    {!minimalMode && (
                        <div className="flex gap-2 mt-2 overflow-x-auto pb-2 scrollbar-hide">
                            {SOURCE_PRESETS.map(preset => (
                                <button
                                    key={preset}
                                    type="button"
                                    onClick={() => { haptic('light'); setSourceLabel(preset); }}
                                    className="whitespace-nowrap px-3 py-1 bg-gray-800 border border-gray-700 rounded-full text-xs text-gray-400 hover:bg-gray-700 hover:text-white flex-shrink-0"
                                >
                                    {preset}
                                </button>
                            ))}
                        </div>
                    )}
                </section>

                {/* 3. Load Size */}
                <section>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">
                        {copy.loadSize}
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                        {(['small', 'medium', 'big', 'mythic'] as LoadSize[]).map(size => (
                            <button
                                key={size}
                                type="button"
                                onClick={() => { haptic(size === 'mythic' ? 'heavy' : 'medium'); setLoadSize(size); }}
                                className={clsx(
                                    "flex flex-col items-center justify-center py-3 rounded-xl border transition-all",
                                    loadSize === size
                                        ? "bg-blue-600 border-blue-500 text-white shadow-xl scale-105"
                                        : "bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-750"
                                )}
                            >
                                <Droplet className={clsx(
                                    "mb-1",
                                    size === 'small' && "w-3 h-3",
                                    size === 'medium' && "w-4 h-4",
                                    size === 'big' && "w-5 h-5",
                                    size === 'mythic' && "w-6 h-6"
                                )} />
                                <span className="text-[10px] font-medium">{LOAD_SIZE_LABELS[size]}</span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* 4. Intensity Slider */}
                <section>
                    <div className="flex justify-between mb-3">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            {copy.intensity}
                        </label>
                        <span className="text-blue-400 font-bold">{intensity} / 5</span>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="5"
                        step="1"
                        value={intensity}
                        onChange={e => setIntensity(parseInt(e.target.value))}
                        onTouchEnd={() => haptic('light')}
                        onMouseUp={() => haptic('light')}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                        <span>Weak</span>
                        <span>Mind-Blowing</span>
                    </div>
                </section>

                {/* 5. Privacy Toggle */}
                <section className="flex items-center justify-between bg-gray-800 p-3 rounded-xl border border-gray-700">
                    <div className="flex items-center space-x-3">
                        {privacyLevel === 'extra_private' ? (
                            <div className="p-2 bg-red-900/30 rounded-full text-red-500">
                                <Lock className="w-5 h-5" />
                            </div>
                        ) : (
                            <div className="p-2 bg-blue-900/30 rounded-full text-blue-500">
                                <Globe className="w-5 h-5" />
                            </div>
                        )}
                        <div>
                            <div className="text-sm font-medium text-white">
                                {privacyLevel === 'extra_private' ? 'Extra Private' : 'Normal Log'}
                            </div>
                            <div className="text-[10px] text-gray-400">
                                {privacyLevel === 'extra_private' ? 'Hidden from timeline by default' : 'Visible in timeline'}
                            </div>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => { haptic('medium'); setPrivacyLevel(prev => prev === 'normal' ? 'extra_private' : 'normal'); }}
                        className={clsx(
                            "w-12 h-6 rounded-full relative transition-colors focus:outline-none",
                            privacyLevel === 'extra_private' ? "bg-red-600" : "bg-gray-600"
                        )}
                    >
                        <div className={clsx(
                            "w-4 h-4 bg-white rounded-full absolute top-1 left-1 transition-transform",
                            privacyLevel === 'extra_private' ? "translate-x-6" : ""
                        )} />
                    </button>
                </section>

                {/* 6. Tags & Notes (Collapsible or just bottom) */}
                <section className="space-y-3">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Tags & Notes
                    </label>

                    <div className="flex flex-wrap gap-2 mb-2">
                        {/* Selected Tags */}
                        {selectedTags.map(tag => (
                            <button
                                key={tag}
                                type="button"
                                onClick={() => toggleTag(tag)}
                                className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-medium flex items-center"
                            >
                                #{tag}
                            </button>
                        ))}

                        {/* Presets */}
                        {TAG_PRESETS.filter(t => !selectedTags.includes(t)).slice(0, 5).map(tag => (
                            <button
                                key={tag}
                                type="button"
                                onClick={() => toggleTag(tag)}
                                className="px-3 py-1 bg-gray-800 border border-gray-700 text-gray-400 rounded-full text-xs hover:bg-gray-700 hover:text-white"
                            >
                                #{tag}
                            </button>
                        ))}

                        <input
                            type="text"
                            value={newTag}
                            onChange={e => setNewTag(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                            placeholder="+ Add tag..."
                            className="bg-transparent border-none text-xs text-blue-400 focus:ring-0 placeholder-blue-500/50 w-24"
                        />
                    </div>

                    <textarea
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="Journal entry..."
                        rows={3}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                    />
                </section>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-blue-600 rounded-xl text-white font-bold text-lg shadow-lg hover:bg-blue-500 active:scale-[0.99] transition-all flex items-center justify-center space-x-2"
                >
                    <Save className="w-5 h-5" />
                    <span>{isSubmitting ? 'Saving...' : copy.log}</span>
                </button>
            </form>
        </div>
    );
};
