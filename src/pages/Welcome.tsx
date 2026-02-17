import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, AlertTriangle } from 'lucide-react';

export const Welcome: React.FC = () => {
    const { register } = useAuth();
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirm) {
            setError('Passphrases do not match');
            return;
        }
        if (password.length < 8) {
            setError('Passphrase must be at least 8 characters');
            return;
        }

        try {
            setIsSubmitting(true);
            await register(password);
        } catch (e) {
            setError('Failed to setup security. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-900 text-gray-100">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-gray-900 p-4 rounded-full border-4 border-gray-800 shadow-xl">
                        <Lock className="w-12 h-12 text-blue-500" />
                    </div>

                    <div className="text-center mb-8 mt-6">
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Welcome to Load Log
                        </h1>
                        <p className="text-gray-400">
                            Your private, encrypted intimacy journal.
                        </p>
                    </div>
                </div>

                <div className="bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700">
                    <div className="flex items-start mb-6 p-4 bg-yellow-900/30 border border-yellow-700/50 rounded-lg">
                        <AlertTriangle className="h-6 w-6 text-yellow-500 mr-3 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-yellow-200">
                            <strong>Your data stays on this device.</strong><br />
                            We use end-to-end encryption. If you lose your passphrase,
                            your data is lost forever. There is no reset option.
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="pass" className="block text-sm font-medium text-gray-300">
                                Create Passphrase
                            </label>
                            <input
                                id="pass"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="************"
                            />
                        </div>

                        <div>
                            <label htmlFor="confirm" className="block text-sm font-medium text-gray-300">
                                Confirm Passphrase
                            </label>
                            <input
                                id="confirm"
                                type="password"
                                required
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="************"
                            />
                        </div>

                        {error && (
                            <div className="text-red-400 text-sm text-center font-medium">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                        >
                            {isSubmitting ? 'Securing...' : 'Set Passphrase & Start'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
