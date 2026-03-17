'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { SupabaseClient } from '@supabase/supabase-js'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { data: authData, error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        console.error('Login error:', error.message)
        return error.message
    }

    console.log('Login successful:', authData.user?.email)

    revalidatePath('/', 'layout')
    return null
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const first_name = formData.get('first_name') as string
    const last_name = formData.get('last_name') as string

    console.log('Attempting signup for:', email, { first_name, last_name })

    const { data: authData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                first_name,
                last_name,
                full_name: `${first_name} ${last_name}`.trim(),
            }
        }
    })

    if (error) {
        console.error('Signup error:', error.message)
        return error.message
    }

    // Check if user already exists
    if (authData.user && (!authData.user.identities || authData.user.identities.length === 0)) {
        return "Email already exists. Try signing in instead."
    }

    console.log('Signup successful result:', {
        userId: authData.user?.id,
        email: authData.user?.email,
        metadata: authData.user?.user_metadata,
        identities: authData.user?.identities,
    })

    revalidatePath('/', 'layout')
    return null
}

export async function forgotPasswordAction(formData: FormData) {
    const supabase = await createClient()
    const email = formData.get('email') as string

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password`,
    })

    if (error) {
        return { error: error.message }
    }

    return { success: "Password reset link sent to your email." }
}

export async function updatePasswordAction(formData: FormData) {
    const supabase = await createClient()
    const password = formData.get('password') as string

    const { error } = await supabase.auth.updateUser({
        password: password
    })

    if (error) {
        return { error: error.message }
    }

    return null
}

async function claimAnalysis(supabase: SupabaseClient, userId: string, claimId: string) {
    if (!claimId) return
    console.log(`Claiming analysis ${claimId} for user ${userId}`)
    const { error } = await supabase
        .from('analyses')
        .update({ user_id: userId })
        .eq('id', claimId)
        .is('user_id', null)
    
    if (error) {
        console.error('Error claiming analysis:', error.message)
    }
}

export async function loginAction(formData: FormData) {
    const claimId = formData.get('claim_id') as string
    const redirectPath = formData.get('redirect') as string
    
    const error = await login(formData)
    if (error) return { error }

    // If login was successful, claim the analysis if needed
    if (claimId) {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            await claimAnalysis(supabase, user.id, claimId)
        }
    }

    let target = redirectPath || '/'
    if (claimId && target.includes('/analyze/result')) {
        const separator = target.includes('?') ? '&' : '?'
        target = `${target}${separator}download=auto`
    }

    redirect(target)
}

export async function signupAction(formData: FormData) {
    const claimId = formData.get('claim_id') as string
    const redirectPath = formData.get('redirect') as string

    const error = await signup(formData)
    if (error) return { error }
    
    // For signup, if we are redirecting to login anyway, we should pass the claim_id along
    const params = new URLSearchParams()
    if (claimId) params.set('claim_id', claimId)
    if (redirectPath) params.set('redirect', redirectPath)
    params.set('message', 'Check your email to confirm your account')
    
    redirect(`/login?${params.toString()}`)
}

export async function logoutAction() {
    console.log('Logging out user...')
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
        console.error('Logout error:', error.message)
    } else {
        console.log('Logout successful')
    }

    revalidatePath('/', 'layout')
    redirect('/login')
}
