import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function HistoryPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const { data: analyses, error } = await supabase
        .from("analyses")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching analyses:", error);
    }

    return (
        <div className="mx-auto max-w-4xl py-10 px-4 sm:px-6">
            <h1 className="mb-8 text-3xl font-bold text-gray-900 tracking-tight">
                Analysis History
            </h1>

            {!analyses || analyses.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center text-gray-500 shadow-sm">
                    <p className="mb-4 text-lg font-medium">No analyses found yet.</p>
                    <Link
                        href="/free-ats-resume-checker"
                        className="rounded-lg bg-black px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-gray-800"
                    >
                        Start Your First Analysis
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4">
                    {analyses.map((analysis) => (
                        <div
                            key={analysis.id}
                            className="group relative flex flex-col items-start justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-black hover:shadow-md sm:flex-row sm:items-center"
                        >
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-3">
                                    <span className="inline-flex items-center rounded-full bg-black px-2.5 py-0.5 text-xs font-semibold text-white">
                                        Score: {analysis.score || "N/A"}
                                    </span>
                                    <span className="text-sm font-medium text-gray-500">
                                        {new Date(analysis.created_at).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </span>
                                </div>
                                <h2 className="line-clamp-1 text-lg font-semibold text-gray-900 group-hover:text-black">
                                    {analysis.job_description
                                        ? `Analysis for: ${analysis.job_description.slice(0, 50)}...`
                                        : "Resume Analysis"}
                                </h2>
                                <p className="line-clamp-2 text-sm text-gray-600">
                                    {analysis.summary || "No summary available."}
                                </p>
                            </div>

                            <div className="mt-4 flex gap-2 sm:mt-0">
                                {/* Future: Link to a detailed view page or re-render results */}
                                <span className="text-xs font-medium text-gray-400">
                                    ID: {analysis.id.slice(0, 8)}...
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
