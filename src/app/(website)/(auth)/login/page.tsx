'use client'

import { Suspense } from 'react'
import AuthForm from '@/components/auth/AuthForm'
import { loginAction } from '../actions'

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950">
            <Suspense fallback={<div className="text-zinc-500">Loading...</div>}>
                <AuthForm type="login" onSubmit={loginAction} />
            </Suspense>
        </div>
    )
}
