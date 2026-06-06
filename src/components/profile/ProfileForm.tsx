'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { updateProfileAction } from '@/app/(website)/profile/actions'

interface ProfileFormProps {
    user: User
}

export default function ProfileForm({ user }: ProfileFormProps) {
    const metadata = user.user_metadata || {}
    const initialFirstName = metadata.first_name || ''
    const initialLastName = metadata.last_name || ''
    const initialAvatarUrl = metadata.avatar_url || ''

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [avatarPreview, setAvatarPreview] = useState<string>(initialAvatarUrl)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const MAX_FILE_SIZE = 1 * 1024 * 1024 // 1MB
            
            // Check file size
            if (file.size > MAX_FILE_SIZE) {
                setError(`Image size must be less than 1MB. Your image is ${(file.size / (1024 * 1024)).toFixed(2)}MB.`)
                setAvatarPreview('')
                // Reset file input
                e.target.value = ''
                return
            }
            
            setError(null)
            const reader = new FileReader()
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccess(null)

        const formData = new FormData(e.currentTarget)
        try {
            const result = await updateProfileAction(formData)
            if (result.error) {
                setError(result.error)
            } else if (result.duplicate) {
                setError(result.duplicate)
            } else if (result.success) {
                setSuccess(result.success)
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred while updating profile')
        } finally {
            setLoading(false)
        }
    }

    // Generate fallback gradient/initials like in ReviewCard
    const gradient = "from-blue-500 to-cyan-400"
    const initials = `${initialFirstName.charAt(0)}${initialLastName.charAt(0)}`.toUpperCase() || "U"

    return (
        <div className="w-full max-w-xl mx-auto p-8 space-y-8 bg-white rounded-3xl shadow-xl border border-zinc-200 transition-all duration-300">
            <div className="space-y-2 text-center">
                <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">
                    Your Profile
                </h1>
                <p className="text-sm text-zinc-500">
                    Update your personal details and public profile picture.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Avatar Section */}
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="relative group">
                        {avatarPreview ? (
                            <div className="h-24 w-24 overflow-hidden rounded-full shadow-md border-2 border-zinc-100">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={avatarPreview} alt="Profile" className="h-full w-full object-cover" />
                            </div>
                        ) : (
                            <div className={`flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-br ${gradient} text-white text-2xl font-bold shadow-md border-2 border-zinc-100`}>
                                {initials}
                            </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <label htmlFor="profile_picture" className="text-white text-xs font-medium cursor-pointer">
                                Change
                            </label>
                        </div>
                    </div>
                    
                    <div className="w-full text-center">
                        <label
                            htmlFor="profile_picture"
                            className="inline-block text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer transition-colors"
                        >
                            Upload new picture
                        </label>
                        <input
                            id="profile_picture"
                            name="profile_picture"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <p className="text-xs text-zinc-500 mt-2">
                            Maximum file size: 1MB. Supported formats: JPG, PNG, GIF, WebP
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label
                            htmlFor="first_name"
                            className="text-sm font-medium leading-none text-zinc-700"
                        >
                            First Name
                        </label>
                        <input
                            id="first_name"
                            name="first_name"
                            type="text"
                            defaultValue={initialFirstName}
                            required
                            className="flex h-11 w-full rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors"
                        />
                    </div>
                    <div className="space-y-2">
                        <label
                            htmlFor="last_name"
                            className="text-sm font-medium leading-none text-zinc-700"
                        >
                            Last Name
                        </label>
                        <input
                            id="last_name"
                            name="last_name"
                            type="text"
                            defaultValue={initialLastName}
                            required
                            className="flex h-11 w-full rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none text-zinc-700">
                        Email Address (Read Only)
                    </label>
                    <input
                        type="email"
                        defaultValue={user.email}
                        disabled
                        className="flex h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-500 cursor-not-allowed"
                    />
                </div>

                {error && (
                    <div className="p-4 text-sm text-red-600 bg-red-50 rounded-xl border border-red-200">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="p-4 text-sm text-emerald-700 bg-emerald-50 rounded-xl border border-emerald-200">
                        {success}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-zinc-900 text-zinc-50 hover:bg-zinc-800 h-12 px-8 w-full active:scale-[0.98]"
                >
                    {loading ? (
                        <div className="flex items-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-50 border-t-transparent" />
                            <span>Saving Changes...</span>
                        </div>
                    ) : (
                        <span>Save Profile</span>
                    )}
                </button>
            </form>
        </div>
    )
}
