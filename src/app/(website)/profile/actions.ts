'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfileAction(formData: FormData) {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return { error: 'Not authenticated' }
    }

    const first_name = formData.get('first_name') as string
    const last_name = formData.get('last_name') as string
    const profile_picture = formData.get('profile_picture') as File | null

    let avatar_url = user.user_metadata?.avatar_url || null

    if (profile_picture && profile_picture.size > 0) {
        const fileExt = profile_picture.name.split('.').pop()
        const fileName = `${user.id}_${Date.now()}.${fileExt}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, profile_picture, { upsert: true })

        if (!uploadError && uploadData) {
            const { data: publicUrlData } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName)
            avatar_url = publicUrlData.publicUrl
        } else {
            console.error('Avatar upload error:', uploadError)
            return { error: 'Failed to upload profile picture' }
        }
    }

    const full_name = `${first_name} ${last_name}`.trim()

    const { error: updateError } = await supabase.auth.updateUser({
        data: {
            first_name,
            last_name,
            full_name,
            avatar_url
        }
    })

    if (updateError) {
        console.error('Profile update error:', updateError.message)
        return { error: updateError.message }
    }

    revalidatePath('/', 'layout')
    return { success: 'Profile updated successfully' }
}
