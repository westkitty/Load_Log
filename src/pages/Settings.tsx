import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { useAuth } from '../context/AuthContext';
import { db } from '../db';
import { Download, Upload, Trash2, AlertTriangle, Users, Plus, X, FileText, Shield, LogOut } from 'lucide-react';
import type { PartnerProfile, LoadEvent } from '../types';
import { v4 as uuidv4 } from 'uuid';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { decryptData, base64ToArrayBuffer, hexToIv } from '../crypto/encryption';
import { format } from 'date-fns';

const PartnerManagement: React.FC = () => {
    const [partners, setPartners] = useState<PartnerProfile[]>([]);
    const [newName, setNewName] = useState('');
    const [newColor, setNewColor] = useState('#ec4899'); // Default pink-500
    const [isLoading, setIsLoading] = useState(true);

    const loadPartners = async () => {
        const record = await db.settings.get('partner_profiles');
        if (record && record.value) {
            setPartners(record.value);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadPartners();
    }, []);

    const handleAdd = async () => {
        if (!newName.trim()) return;
        const newPartner: PartnerProfile = {
            id: uuidv4(),
            name: newName.trim(),
            color: newColor
        };
        const updated = [...partners, newPartner];
        setPartners(updated);
        await db.settings.put({ key: 'partner_profiles', value: updated });
        setNewName('');
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Remove this partner?')) return;
        const updated = partners.filter(p => p.id !== id);
        setPartners(updated);
        await db.settings.put({ key: 'partner_profiles', value: updated });
    };

    if (isLoading) return null;

    return (
        <section className="space-y-4">
            <h3 className="text-lg font-medium text-gray-300 border-b border-gray-700 pb-2 flex items-center">
                <Users className="w-5 h-5 mr-2" /> Partner Profiles
            </h3>

            <div className="space-y-3">
                {partners.map(p => (
                    <div key={p.id} className="flex items-center justify-between bg-gray-800 p-3 rounded-lg border border-gray-700">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs" style={{ backgroundColor: p.color }}>
                                {p.name.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="text-gray-200">{p.name}</span>
                        </div>
                        <button onClick={() => handleDelete(p.id)} className="text-gray-500 hover:text-red-400">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                ))}
            </div>

            <div className="flex gap-2 bg-gray-800 p-3 rounded-lg border border-gray-700">
                <input
                    type="color"
                    value={newColor}
                    onChange={e => setNewColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer bg-transparent border-none"
                    title="Choose color"
                />
                <input
                    type="text"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="New partner name..."
                    className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-gray-500"
                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                />
                <button
                    onClick={handleAdd}
                    disabled={!newName.trim()}
                    className="p-2 bg-blue-600 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </div>
        </section>
    );
};

export const Settings: React.FC = () => {
    const { key, logout, resetAll, hasAccount, register } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isExportingPDF, setIsExportingPDF] = useState(false);

    // Account Creation State
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [accountError, setAccountError] = useState('');

    const handleCreateAccount = async () => {
        if (password.length < 4) {
            setAccountError('Password must be at least 4 characters');
            return;
        }
        if (password !== confirmPassword) {
            setAccountError('Passwords do not match');
            return;
        }

        try {
            await register(password);
            setPassword('');
            setConfirmPassword('');
            setAccountError('');
            setMessage({ type: 'success', text: 'Account created and encryption enabled!' });
        } catch (e) {
            setAccountError('Failed to create account');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleExport = async () => {
        try {
            const events = await db.events.toArray();
            const salt = localStorage.getItem('load_log_auth_salt');
            const verifier = localStorage.getItem('load_log_auth_verifier');
            const verifierIv = localStorage.getItem('load_log_auth_verifier_iv');

            const exportData = {
                version: 1,
                timestamp: Date.now(),
                salt,
                verifier,
                verifierIv,
                events
            };

            const blob = new Blob([JSON.stringify(exportData)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `load-log-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            setMessage({ type: 'success', text: 'Backup exported successfully.' });
        } catch (e) {
            console.error(e);
            setMessage({ type: 'error', text: 'Failed to export data.' });
        }
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);

                if (!json.version || !json.events || !json.salt) {
                    throw new Error('Invalid backup format');
                }

                if (!window.confirm("This will OVERWRITE all current data. You will need to use the passphrase associated with this backup to login. Continue?")) {
                    return;
                }

                await db.events.clear();
                await db.events.bulkAdd(json.events);

                localStorage.setItem('load_log_auth_salt', json.salt);
                if (json.verifier) localStorage.setItem('load_log_auth_verifier', json.verifier);
                if (json.verifierIv) localStorage.setItem('load_log_auth_verifier_iv', json.verifierIv);

                alert('Import successful. Please log in again.');
                logout();
                window.location.reload();
            } catch (err) {
                console.error(err);
                setMessage({ type: 'error', text: 'Import failed: Invalid file or corrupted data.' });
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const handleExportPDF = async () => {
        if (!key) {
            setMessage({ type: 'error', text: 'Decryption key not found. Please relogin.' });
            return;
        }
        setIsExportingPDF(true);
        try {
            const events = await db.events.toArray();
            const decryptedEvents = await Promise.all(events.map(async (e) => {
                try {
                    if (!e.iv) return null; // Should not happen for encrypted events
                    const decrypted = await decryptData(
                        key,
                        base64ToArrayBuffer(e.data),
                        hexToIv(e.iv)
                    );
                    const data: LoadEvent = JSON.parse(decrypted);
                    return { ...data, date: e.date };
                } catch (err) {
                    console.error("Failed to decrypt event", e.id);
                    return null;
                }
            }));

            const validEvents = decryptedEvents.filter(e => e !== null);
            validEvents.sort((a, b) => b!.date - a!.date);

            const doc = new jsPDF();
            doc.text("Load Log - Event History", 14, 20);
            doc.setFontSize(10);
            doc.text(`Generated on ${format(new Date(), 'PPpp')}`, 14, 26);

            const tableData = validEvents.map(e => [
                format(e!.date, 'yyyy-MM-dd HH:mm'),
                e!.sourceType,
                e!.sourceLabel || '-',
                e!.loadSize || '-',
                e!.intensity || '-',
                e!.notes || '-'
            ]);

            autoTable(doc, {
                head: [['Date', 'Source', 'Label', 'Size', 'Intensity', 'Notes']],
                body: tableData as any[][],
                startY: 30,
                styles: { fontSize: 8 },
                columnStyles: {
                    5: { cellWidth: 60 }
                }
            });

            doc.save(`load-log-history-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
            setMessage({ type: 'success', text: 'PDF Exported successfully.' });

        } catch (e) {
            console.error(e);
            setMessage({ type: 'error', text: 'Failed to generate PDF.' });
        } finally {
            setIsExportingPDF(false);
        }
    };

    const handleDeleteAll = async () => {
        try {
            await db.delete();
            resetAll();
            window.location.reload();
        } catch (e) {
            console.error(e);
            setMessage({ type: 'error', text: 'Failed to delete data.' });
        }
    };

    return (
        <div className="space-y-8 pb-20">
            <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>

            {!hasAccount && (
                <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Shield className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">Secure Your Data</h2>
                            <p className="text-sm text-gray-400">Create a password to encrypt your logs</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                                placeholder="Set a password"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Confirm Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                                placeholder="Confirm password"
                            />
                        </div>

                        {accountError && <p className="text-red-400 text-sm">{accountError}</p>}

                        <button
                            onClick={handleCreateAccount}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                        >
                            Enable Encryption
                        </button>
                    </div>
                </div>
            )}

            {message && (
                <div className={`p-4 rounded-lg mb-4 ${message.type === 'success' ? 'bg-green-900/50 text-green-200' : 'bg-red-900/50 text-red-200'}`}>
                    {message.text}
                </div>
            )}

            {/* Data Management */}
            <section className="space-y-4">
                <h3 className="text-lg font-medium text-gray-300 border-b border-gray-700 pb-2">Data Management</h3>

                <div className="grid grid-cols-1 gap-4">
                    <button
                        onClick={handleExport}
                        className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700 hover:bg-gray-750 transition-colors"
                    >
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-900/30 rounded-full text-blue-400">
                                <Download className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <div className="font-medium text-white">Export Backup</div>
                                <div className="text-xs text-gray-400">Save encrypted backup file</div>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700 hover:bg-gray-750 transition-colors"
                    >
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-purple-900/30 rounded-full text-purple-400">
                                <Upload className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <div className="font-medium text-white">Import Backup</div>
                                <div className="text-xs text-gray-400">Restore from file (overwrites current data)</div>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={handleExportPDF}
                        disabled={isExportingPDF}
                        className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700 hover:bg-gray-750 transition-colors disabled:opacity-50"
                    >
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-red-900/30 rounded-full text-red-400">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <div className="font-medium text-white">{isExportingPDF ? 'Generating...' : 'Export PDF'}</div>
                                <div className="text-xs text-gray-400">Printable report</div>
                            </div>
                        </div>
                    </button>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImport}
                        accept=".json"
                        className="hidden"
                    />
                </div>
            </section>

            {/* Appearance Settings */}
            <section className="bg-gray-800 p-6 rounded-xl border border-gray-700 space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">Privacy & Display</h3>

                {/* Dark Mode */}
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex items-center justify-between">
                    <span className="text-white font-medium">Dark Mode</span>
                    <button
                        onClick={() => {
                            const isDark = document.documentElement.classList.toggle('dark');
                            localStorage.setItem('theme', isDark ? 'dark' : 'light');
                            // Force re-render not needed as class toggles, but could use state
                        }}
                        className="w-12 h-6 bg-gray-600 rounded-full relative transition-colors focus:outline-none data-[checked=true]:bg-blue-600"
                        data-checked={document.documentElement.classList.contains('dark')}
                    >
                        <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1 transition-transform data-[checked=true]:translate-x-6"
                            data-checked={document.documentElement.classList.contains('dark')} />
                    </button>
                </div>

                {/* Show Extra Private Content */}
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex items-center justify-between">
                    <div>
                        <span className="text-white font-medium">Show Extra Private Content</span>
                        <p className="text-xs text-gray-400 mt-1">Reveal events marked as extra private</p>
                    </div>
                    <button
                        onClick={() => {
                            const current = localStorage.getItem('showExtraPrivate') === 'true';
                            localStorage.setItem('showExtraPrivate', (!current).toString());
                            window.location.reload();
                        }}
                        className={clsx(
                            "w-12 h-6 rounded-full relative transition-colors focus:outline-none",
                            localStorage.getItem('showExtraPrivate') === 'true' ? "bg-red-600" : "bg-gray-600"
                        )}
                    >
                        <div className={clsx(
                            "w-4 h-4 bg-white rounded-full absolute top-1 left-1 transition-transform",
                            localStorage.getItem('showExtraPrivate') === 'true' ? "translate-x-6" : ""
                        )} />
                    </button>
                </div>

                {/* Minimal Logging Mode */}
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex items-center justify-between">
                    <div>
                        <span className="text-white font-medium">Minimal Logging Mode</span>
                        <p className="text-xs text-gray-400 mt-1">Hide optional fields in editor (coming soon)</p>
                    </div>
                    <button
                        onClick={() => {
                            const current = localStorage.getItem('minimalLoggingMode') === 'true';
                            localStorage.setItem('minimalLoggingMode', (!current).toString());
                            window.location.reload();
                        }}
                        className={clsx(
                            "w-12 h-6 rounded-full relative transition-colors focus:outline-none",
                            localStorage.getItem('minimalLoggingMode') === 'true' ? "bg-blue-600" : "bg-gray-600"
                        )}
                    >
                        <div className={clsx(
                            "w-4 h-4 bg-white rounded-full absolute top-1 left-1 transition-transform",
                            localStorage.getItem('minimalLoggingMode') === 'true' ? "translate-x-6" : ""
                        )} />
                    </button>
                </div>

                {/* Spice Level */}
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                    <div className="mb-3">
                        <span className="text-white font-medium">Spice Level</span>
                        <p className="text-xs text-gray-400 mt-1">Control how cheeky the copy is (coming soon)</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {(['mild', 'medium', 'spicy'] as const).map(level => (
                            <button
                                key={level}
                                onClick={() => {
                                    localStorage.setItem('spiceLevel', level);
                                    window.location.reload();
                                }}
                                className={clsx(
                                    "px-3 py-2 rounded-lg capitalize transition-colors text-sm font-medium",
                                    (localStorage.getItem('spiceLevel') === level || (!localStorage.getItem('spiceLevel') && level === 'medium'))
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                )}
                            >
                                {level}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Partner Management */}
            <PartnerManagement />

            {/* Danger Zone */}
            <section className="bg-red-950/30 p-6 rounded-xl border border-red-900/50 space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <h3 className="text-lg font-semibold text-red-300">Danger Zone</h3>
                </div>

                {!showDeleteConfirm ? (
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-full bg-red-900/50 text-red-200 px-4 py-3 rounded-lg hover:bg-red-900 transition-colors font-medium flex items-center justify-center space-x-2"
                    >
                        <Trash2 className="w-5 h-5" />
                        <span>Delete All Data</span>
                    </button>
                ) : (
                    <div className="bg-gray-800 rounded-xl p-6 w-full border border-red-900/50">
                        <div className="flex items-center space-x-2 mb-4">
                            <AlertTriangle className="w-6 h-6 text-red-400" />
                            <h3 className="text-xl font-bold text-white">Delete All Data?</h3>
                        </div>
                        <p className="text-gray-300 mb-4">
                            This will permanently delete:
                        </p>
                        <ul className="text-gray-400 text-sm list-disc list-inside mb-6 space-y-1">
                            <li>All logged loads and events</li>
                            <li>All partners and profiles</li>
                            <li>All settings and preferences</li>
                            <li>Your encryption keys</li>
                        </ul>
                        <div className="bg-red-950/50 p-4 rounded-lg border border-red-900/50 mb-6">
                            <p className="text-red-200 text-sm font-medium mb-2">
                                To confirm, type: <span className="font-mono bg-red-900/50 px-2 py-0.5 rounded">DELETE MY DATA</span>
                            </p>
                            <input
                                type="text"
                                id="deleteConfirmInput"
                                placeholder="Type here..."
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    const input = document.getElementById('deleteConfirmInput') as HTMLInputElement;
                                    if (input?.value === 'DELETE MY DATA') {
                                        handleDeleteAll();
                                    } else {
                                        alert('Please type DELETE MY DATA exactly to confirm.');
                                    }
                                }}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                            >
                                Delete Everything
                            </button>
                        </div>
                    </div>
                )}
            </section>

            {hasAccount && (
                <button
                    onClick={handleLogout}
                    className="w-full bg-gray-800 text-gray-300 px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center justify-center space-x-2 border border-gray-700"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Log Out</span>
                </button>
            )}

            <div className="text-center text-xs text-gray-600 pt-8">
                Load Log v1.0.0
            </div>
        </div>
    );
};
