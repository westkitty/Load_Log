import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Unlock as UnlockIcon } from 'lucide-react';

export const Unlock: React.FC = () => {
    const { login } = useAuth();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        // Give UI a moment to update
        await new Promise(r => setTimeout(r, 100)); // micro-delay for UX feedback

        const success = await login(password);
        if (!success) {
            setError('Incorrect passphrase');
            setIsSubmitting(false);
        }
        // If success, global state changes will trigger re-render of App
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-900 text-gray-100">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-gray-700 rounded-full flex items-center justify-center mb-4">
                        <UnlockIcon className="h-8 w-8 text-blue-400" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-white">
                        Locked & Loaded
                    </h2>
                    <p className="mt-2 text-gray-400">
                        Enter your passphrase to unlock.
                    </p>
                </div>

                <div className="bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="pass" className="block text-sm font-medium text-gray-300">
                                Passphrase
                            </label>
                            <input
                                id="pass"
                                type="password"
                                required
                                autoFocus
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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
                            {isSubmitting ? 'Unlocking...' : 'Unlock'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
