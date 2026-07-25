export default function LoginLoading() {
    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950">
            <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col items-center gap-6 py-16">
                <div className="relative h-16 w-16">
                    <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-zinc-100 dark:border-zinc-800" />
                    <div className="absolute inset-0 h-16 w-16 animate-spin rounded-full border-4 border-transparent border-t-zinc-900 dark:border-t-zinc-50" />
                </div>
                <div className="space-y-1.5 text-center">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Signing you in…</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Please wait a moment</p>
                </div>
            </div>
        </div>
    );
}
