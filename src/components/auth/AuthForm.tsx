'use client'

import { useState } from 'react'
import Link from 'next/link'

interface AuthFormProps {
    type: 'login' | 'signup' | 'forgot-password' | 'reset-password'
    onSubmit: (formData: FormData) => Promise<any>
}

export default function AuthForm({ type, onSubmit }: AuthFormProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        const formData = new FormData(e.currentTarget)
        try {
            const result = await onSubmit(formData)
            if (result?.error) {
                setError(result.error)
                setLoading(false)
            } else if (result?.success) {
                setSuccess(result.success)
                setLoading(false)
            }
        } catch (err: any) {
            // Next.js redirect throws an error that we shouldn't catch as a visible error
            if (err.message !== 'NEXT_REDIRECT' && !err.digest?.startsWith('NEXT_REDIRECT')) {
                setError(err.message || 'An error occurred')
                setLoading(false)
            }
        }
    }

    return (
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-all duration-300 hover:shadow-2xl">
            <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                    {type === 'login' ? 'Welcome Back' :
                        type === 'signup' ? 'Create Account' :
                            type === 'forgot-password' ? 'Forgot Password' : 'Reset Password'}
                </h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {type === 'login' && 'Enter your credentials to access your account'}
                    {type === 'signup' && 'Join us to start analyzing your resumes with AI'}
                    {type === 'forgot-password' && "Enter your email to receive a reset link"}
                    {type === 'reset-password' && "Enter your new password below"}
                </p>
            </div>

            {success ? (
                <div className="space-y-4">
                    <div className="p-3 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        {success}
                    </div>
                    <Link
                        href="/login"
                        className="flex w-full items-center justify-center rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                    >
                        Return to Login
                    </Link>
                </div>
            ) : (
                <>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {type === 'signup' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label
                                        htmlFor="first_name"
                                        className="text-sm font-medium leading-none text-zinc-700 dark:text-zinc-300"
                                    >
                                        First Name
                                    </label>
                                    <input
                                        id="first_name"
                                        name="first_name"
                                        type="text"
                                        placeholder="John"
                                        required
                                        className="flex h-11 w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:border-zinc-700 dark:focus-visible:ring-zinc-300 transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label
                                        htmlFor="last_name"
                                        className="text-sm font-medium leading-none text-zinc-700 dark:text-zinc-300"
                                    >
                                        Last Name
                                    </label>
                                    <input
                                        id="last_name"
                                        name="last_name"
                                        type="text"
                                        placeholder="Doe"
                                        required
                                        className="flex h-11 w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 dark:border-zinc-700 dark:focus-visible:ring-zinc-300 transition-colors"
                                    />
                                </div>
                            </div>
                        )}
                        {(type === 'login' || type === 'signup' || type === 'forgot-password') && (
                            <div className="space-y-2">
                                <label
                                    htmlFor="email"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-700 dark:text-zinc-300"
                                >
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    required
                                    className="flex h-11 w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300 transition-colors"
                                />
                            </div>
                        )}

                        {(type === 'login' || type === 'signup' || type === 'reset-password') && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label
                                        htmlFor="password"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-700 dark:text-zinc-300"
                                    >
                                        {type === 'reset-password' ? 'New Password' : 'Password'}
                                    </label>
                                    {type === 'login' && (
                                        <Link
                                            href="/forgot-password"
                                            className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 underline-offset-4 hover:underline"
                                        >
                                            Forgot password?
                                        </Link>
                                    )}
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    className="flex h-11 w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300 transition-colors"
                                />
                            </div>
                        )}

                        {error && (
                            <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 animate-in fade-in slide-in-from-top-1">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-zinc-900 text-zinc-50 hover:bg-zinc-900/90 h-11 px-4 py-2 w-full active:scale-[0.98] dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-50 border-t-transparent dark:border-zinc-900 dark:border-t-transparent" />
                                    <span>
                                        {type === 'login' ? 'Signing In...' :
                                            type === 'signup' ? 'Creating Account...' :
                                                type === 'forgot-password' ? 'Sending Link...' : 'Updating Password...'}
                                    </span>
                                </div>
                            ) : (
                                <span>
                                    {type === 'login' ? 'Sign In' :
                                        type === 'signup' ? 'Sign Up' :
                                            type === 'forgot-password' ? 'Send Reset Link' : 'Update Password'}
                                </span>
                            )}
                        </button>
                    </form>

                    {(type === 'login' || type === 'signup' || type === 'forgot-password') && (
                        <div className="text-center text-sm">
                            <p className="text-zinc-500 dark:text-zinc-400">
                                {type === 'login' ? "Don't have an account?" :
                                    type === 'signup' ? 'Already have an account?' :
                                        'Remembered your password?'}
                                {' '}
                                <Link
                                    href={type === 'login' ? '/signup' : '/login'}
                                    className="font-medium text-zinc-900 underline underline-offset-4 hover:text-zinc-700 dark:text-zinc-50 dark:hover:text-zinc-300 px-1"
                                >
                                    {type === 'login' ? 'Create one' : 'Sign in'}
                                </Link>
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
