'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import sharp from 'sharp'
import crypto from 'crypto'

function generateImageHash(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex')
}

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
        const buffer = Buffer.from(await profile_picture.arrayBuffer())
        const currentImageHash = generateImageHash(buffer)
        const previousImageHash = user.user_metadata?.avatar_image_hash || null

        // Check if the image is the same as the previously saved one
        if (previousImageHash && currentImageHash === previousImageHash) {
            return { duplicate: 'Image already saved. Please upload a different image.' }
        }

        const fileName = `${user.id}_${Date.now()}.webp`
        
        // Compress and convert to WebP
        const compressedBuffer = await sharp(buffer)
            .resize(500, 500, {
                fit: 'cover',
                withoutEnlargement: true
            })
            .webp({ quality: 80 })
            .toBuffer()
        
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, compressedBuffer, { 
                upsert: true,
                contentType: 'image/webp'
            })

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

    // Prepare metadata - only add avatar_image_hash if an image was uploaded
    const updateData: any = {
        first_name,
        last_name,
        full_name,
        avatar_url
    }

    // Store the image hash if a new image was uploaded
    if (profile_picture && profile_picture.size > 0) {
        const buffer = Buffer.from(await profile_picture.arrayBuffer())
        updateData.avatar_image_hash = generateImageHash(buffer)
    }

    const { error: updateError } = await supabase.auth.updateUser({
        data: updateData
    })

    if (updateError) {
        console.error('Profile update error:', updateError.message)
        return { error: updateError.message }
    }

    revalidatePath('/', 'layout')
    return { success: 'Profile updated successfully' }
}
