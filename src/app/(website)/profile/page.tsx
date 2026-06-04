import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileForm from '@/components/profile/ProfileForm'

export default async function ProfilePage() {
    const supabase = await createClient()

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        redirect('/login')
    }

    return (
        <main className="min-h-screen bg-zinc-50/50 py-12 px-6">
            <div className="max-w-4xl mx-auto">
                <ProfileForm user={user} />
            </div>
        </main>
    )
}
