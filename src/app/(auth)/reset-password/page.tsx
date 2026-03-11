'use client'

import AuthForm from '@/components/auth/AuthForm'
import { updatePasswordAction } from '../actions'

export default function ResetPasswordPage() {
    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950">
            <AuthForm type="reset-password" onSubmit={updatePasswordAction} />
        </div>
    )
}
