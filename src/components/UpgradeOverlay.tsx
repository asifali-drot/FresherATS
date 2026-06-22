import Link from "next/link";
import { Lock } from "lucide-react";

interface UpgradeOverlayProps {
  title?: string;
  description?: string;
  requiredTier?: string;
}

export default function UpgradeOverlay({
  title = "Unlock Feature",
  description = "Upgrade your plan to access this feature.",
}: UpgradeOverlayProps) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-white/60 backdrop-blur-sm">
      <div className="flex flex-col items-center p-6 text-center shadow-lg bg-white rounded-2xl border border-gray-100 max-w-sm">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
          <Lock className="h-6 w-6 text-purple-600" />
        </div>
        <h3 className="mb-2 text-lg font-bold text-gray-900">{title}</h3>
        <p className="mb-6 text-sm text-gray-500">{description}</p>
        <Link
          href="/pricing"
          className="rounded-full bg-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700"
        >
          View Pricing Plans
        </Link>
      </div>
    </div>
  );
}
