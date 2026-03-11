'use client'

import AuthForm from '@/components/auth/AuthForm'
import { signupAction } from '../actions'

export default function SignupPage() {
    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950">
            <AuthForm type="signup" onSubmit={signupAction} />
        </div>
    )
}
