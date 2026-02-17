import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '../context/EventsContext';
import { db } from '../db';
import type { SourceType, SoloOrPartner, LoadSize, Cleanup, PrivacyLevel, LoadEvent, Template } from '../types';
import { TAG_PRESETS, SOURCE_PRESETS, LOAD_SIZE_LABELS, CLEANUP_LABELS, INTENSITY_LABELS } from '../constants/presets';
import { ArrowLeft, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export const EventEditor: React.FC = () =& gt; {
    const navigate = useNavigate();
    const { addEvent } = useEvents();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [quickMode, setQuickMode] = useState(true);

    // Core fields
    const [sourceType, setSourceType] = useState<SourceType>('porn');
    const [sourceLabel, setSourceLabel] = useState('');
    const [soloOrPartner, setSoloOrPartner] = useState<SoloOrPartner>('solo');
    const [loadSize, setLoadSize] = useState<LoadSize>('medium');
    const [intensity, setIntensity] = useState(3);

    // Extended fields (shown when not in quick mode)
    const [moodBefore, setMoodBefore] = useState<number>();
    const [moodAfter, setMoodAfter] = useState<number>();
    const [refractoryNotes, setRefractoryNotes] = useState('');
    const [bodyNotes, setBodyNotes] = useState('');
    const [notes, setNotes] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [cleanup, setCleanup] = useState<Cleanup>();
    const [privacyLevel, setPrivacyLevel] = useState<PrivacyLevel>('normal');
    const [protectionUsed, setProtectionUsed] = useState<'none' | 'condom' | 'other'>('none');

    const handleSubmit = async (e: React.FormEvent) =& gt; {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const data: LoadEvent = {
                sourceType,
                sourceLabel: sourceLabel || undefined,
                soloOrPartner,
                loadSize,
                intensity,
                moodBefore,
                moodAfter,
                refractoryNotes: refractoryNotes || undefined,
                bodyNotes: bodyNotes || undefined,
                notes: notes || undefined,
                tags: tags.length & gt; 0? tags : undefined,
                cleanup,
                privacyLevel,
                protectionUsed: soloOrPartner === 'partnered' ? protectionUsed : undefined
            };

            await addEvent(data);
            navigate('/');
        } catch (error) {
            console.error('Failed to save event:', error);
            alert('Failed to save. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const addTag = (tag: string) =& gt; {
        if (tag && !tags.includes(tag)) {
            setTags([...tags, tag]);
            setTagInput('');
        }
    };

    const removeTag = (tag: string) =& gt; {
        setTags(tags.filter(t =& gt; t !== tag));
    };

    return (
        & lt;div className = "pb-20 p-4" & gt;
            & lt;div className = "max-w-2xl mx-auto" & gt;
    {/* Header */ }
                & lt;div className = "flex items-center justify-between mb-6" & gt;
                    & lt; button
    onClick = {() =& gt; navigate('/')
}
className = "flex items-center text-gray-400 hover:text-white transition-colors"
    & gt;
                        & lt;ArrowLeft className = "w-5 h-5 mr-2" /& gt;
Back
    & lt;/button&gt;
                    & lt;h1 className = "text-2xl font-bold text-white" & gt;New Load & lt;/h1&gt;
                    & lt;div className = "w-20" & gt;& lt; /div&gt; {/ * Spacer */}
                & lt;/div&gt;

                & lt;form onSubmit = { handleSubmit } className = "space-y-6" & gt;
{/* Quick Mode Toggle */ }
                    & lt; button
type = "button"
onClick = {() =& gt; setQuickMode(!quickMode)}
className = "w-full flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700 text-gray-300 hover:border-blue-500 transition-colors"
    & gt;
                        & lt;span className = "flex items-center" & gt;
                            & lt;Zap className = "w-4 h-4 mr-2" /& gt;
{ quickMode ? 'Quick Log Mode' : 'Detailed Mode' }
                        & lt;/span&gt;
{ quickMode ? & lt;ChevronDown className = "w-4 h-4" /& gt; : & lt;ChevronUp className = "w-4 h-4" /& gt; }
                    & lt;/button&gt;

{/* Source Type */ }
                    & lt;div className = "bg-gray-800 p-4 rounded-lg border border-gray-700" & gt;
                        & lt;label className = "block text-sm font-medium text-gray-300 mb-3" & gt;What'd you nut to?&lt;/label&gt;
    & lt;div className = "grid grid-cols-3 gap-2" & gt;
{
    (['porn', 'fantasy', 'partner', 'memory', 'media', 'other'] as SourceType[]).map(type =& gt; (
                                & lt; button
    key = { type }
    type = "button"
    onClick = {() =& gt; setSourceType(type)
}
className = {`p-3 rounded-lg capitalize transition-colors ${sourceType === type
        ? 'bg-blue-600 text-white'
        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
    }`}
                                & gt;
{ type }
                                & lt;/button&gt;
                            ))}
                        & lt;/div&gt;
                    & lt;/div&gt;

{/* Source Label */ }
                    & lt;div className = "bg-gray-800 p-4 rounded-lg border border-gray-700" & gt;
                        & lt;label className = "block text-sm font-medium text-gray-300 mb-2" & gt; Details(optional) & lt;/label&gt;
                        & lt; input
type = "text"
value = { sourceLabel }
onChange = {(e) =& gt; setSourceLabel(e.target.value)}
placeholder = "e.g., 'that gym crush', 'scene 3', 'favorite creator'"
className = "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
    /& gt;
                        & lt;div className = "flex flex-wrap gap-2 mt-2" & gt;
{
    SOURCE_PRESETS.slice(0, 5).map(preset =& gt; (
                                & lt; button
    key = { preset }
    type = "button"
    onClick = {() =& gt; setSourceLabel(preset)
}
className = "text-xs px-2 py-1 bg-gray-700 text-gray-400 rounded hover:bg-gray-600"
    & gt;
{ preset }
                                & lt;/button&gt;
                            ))}
                        & lt;/div&gt;
                    & lt;/div&gt;

{/* Solo/Partner */ }
                    & lt;div className = "bg-gray-800 p-4 rounded-lg border border-gray-700" & gt;
                        & lt;label className = "block text-sm font-medium text-gray-300 mb-3" & gt;Solo or partnered ?& lt;/label&gt;
                        & lt;div className = "grid grid-cols-2 gap-2" & gt;
                            & lt; button
type = "button"
onClick = {() =& gt; setSoloOrPartner('solo')}
className = {`p-3 rounded-lg transition-colors ${soloOrPartner === 'solo'
        ? 'bg-blue-600 text-white'
        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
    }`}
                            & gt;
Solo
    & lt;/button&gt;
                            & lt; button
type = "button"
onClick = {() =& gt; setSoloOrPartner('partnered')}
className = {`p-3 rounded-lg transition-colors ${soloOrPartner === 'partnered'
        ? 'bg-blue-600 text-white'
        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
    }`}
                            & gt;
Partnered
    & lt;/button&gt;
                        & lt;/div&gt;
                    & lt;/div&gt;

{/* Load Size */ }
                    & lt;div className = "bg-gray-800 p-4 rounded-lg border border-gray-700" & gt;
                        & lt;label className = "block text-sm font-medium text-gray-300 mb-3" & gt;Load Size & lt;/label&gt;
                        & lt;div className = "grid grid-cols-4 gap-2" & gt;
{
    (['small', 'medium', 'big', 'mythic'] as LoadSize[]).map(size =& gt; (
                                & lt; button
    key = { size }
    type = "button"
    onClick = {() =& gt; setLoadSize(size)
}
className = {`p-3 rounded-lg transition-colors ${loadSize === size
        ? 'bg-blue-600 text-white'
        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
    }`}
                                & gt;
{ LOAD_SIZE_LABELS[size] }
                                & lt;/button&gt;
                            ))}
                        & lt;/div&gt;
                    & lt;/div&gt;

{/* Intensity */ }
                    & lt;div className = "bg-gray-800 p-4 rounded-lg border border-gray-700" & gt;
                        & lt;label className = "block text-sm font-medium text-gray-300 mb-2" & gt;
Intensity: { INTENSITY_LABELS[intensity as keyof typeof INTENSITY_LABELS] }
                        & lt;/label&gt;
                        & lt; input
type = "range"
min = "1"
max = "5"
value = { intensity }
onChange = {(e) =& gt; setIntensity(parseInt(e.target.value))}
className = "w-full"
    /& gt;
                    & lt;/div&gt;

{/* Extended Fields */ }
{
    !quickMode && (
                        & lt;& gt;
    {/* Privacy Level */ }
                            & lt;div className = "bg-gray-800 p-4 rounded-lg border border-gray-700" & gt;
                                & lt;label className = "block text-sm font-medium text-gray-300 mb-3" & gt;Privacy Level & lt;/label&gt;
                                & lt;div className = "grid grid-cols-2 gap-2" & gt;
                                    & lt; button
    type = "button"
    onClick = {() =& gt; setPrivacyLevel('normal')
}
className = {`p-3 rounded-lg transition-colors ${privacyLevel === 'normal'
        ? 'bg-blue-600 text-white'
        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
    }`}
                                    & gt;
Normal
    & lt;/button&gt;
                                    & lt; button
type = "button"
onClick = {() =& gt; setPrivacyLevel('extra_private')}
className = {`p-3 rounded-lg transition-colors ${privacyLevel === 'extra_private'
        ? 'bg-red-600 text-white'
        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
    }`}
                                    & gt;
                                        Extra Private
    & lt;/button&gt;
                                & lt;/div&gt;
                            & lt;/div&gt;

{/* Tags */ }
                            & lt;div className = "bg-gray-800 p-4 rounded-lg border border-gray-700" & gt;
                                & lt;label className = "block text-sm font-medium text-gray-300 mb-2" & gt; Tags & lt;/label&gt;
                                & lt;div className = "flex flex-wrap gap-2 mb-2" & gt;
{
    tags.map(tag =& gt; (
                                        & lt; span
    key = { tag }
    onClick = {() =& gt; removeTag(tag)
}
className = "px-2 py-1 bg-blue-600 text-white text-xs rounded cursor-pointer hover:bg-blue-700"
    & gt;
{ tag } ×
                                        & lt;/span&gt;
                                    ))}
                                & lt;/div&gt;
                                & lt;div className = "flex flex-wrap gap-2 mb-2" & gt;
{
    TAG_PRESETS.slice(0, 8).map(preset =& gt; (
                                        & lt; button
    key = { preset }
    type = "button"
    onClick = {() =& gt; addTag(preset)
}
className = "text-xs px-2 py-1 bg-gray-700 text-gray-400 rounded hover:bg-gray-600"
    & gt;
+ { preset }
    & lt;/button&gt;
                                    ))}
                                & lt;/div&gt;
                            & lt;/div&gt;

{/* Notes */ }
                            & lt;div className = "bg-gray-800 p-4 rounded-lg border border-gray-700" & gt;
                                & lt;label className = "block text-sm font-medium text-gray-300 mb-2" & gt; Notes & lt;/label&gt;
                                & lt; textarea
value = { notes }
onChange = {(e) =& gt; setNotes(e.target.value)}
rows = { 3}
placeholder = "Any thoughts?"
className = "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
    /& gt;
                            & lt;/div&gt;
                        & lt;/&gt;
                    )}

{/* Submit */ }
                    & lt; button
type = "submit"
disabled = { isSubmitting }
className = "w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-lg rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 transition-all"
    & gt;
{ isSubmitting ? 'Logging...' : '🚀 Log It' }
                    & lt;/button&gt;
                & lt;/form&gt;
            & lt;/div&gt;
        & lt;/div&gt;
    );
};
