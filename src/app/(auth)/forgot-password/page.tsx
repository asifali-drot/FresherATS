'use client'

import AuthForm from '@/components/auth/AuthForm'
import { forgotPasswordAction } from '../actions'

export default function ForgotPasswordPage() {
    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950">
            <AuthForm type="forgot-password" onSubmit={forgotPasswordAction} />
        </div>
    )
}
