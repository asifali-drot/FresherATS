import { useSubscription } from "@/hooks/useSubscription";
import Script from "next/script";
import { Lock } from "lucide-react";

import { isAcademicEmail } from "@/lib/pricing/student";

interface UpgradeOverlayProps {
  title?: string;
  description?: string;
  requiredTier?: string;
}

export default function UpgradeOverlay({
  title = "Unlock Feature",
  description = "Upgrade your plan to access this feature.",
}: UpgradeOverlayProps) {
  const { user } = useSubscription();
  const isEdu = isAcademicEmail(user?.email);

  // We append the user_id to the custom data so webhooks know who purchased
  // Must URL encode brackets [] for Lemon Squeezy to accept them
  const customDataUserId = user?.id ? `&checkout%5Bcustom%5D%5Buser_id%5D=${encodeURIComponent(user.id)}` : "";
  const emailParam = user?.email ? `&checkout%5Bemail%5D=${encodeURIComponent(user.email)}` : "";
  const discountParam = isEdu ? "&checkout%5Bdiscount_code%5D=I5NJU2MA" : "";

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-white/60 backdrop-blur-sm">
      <Script src="https://assets.lemonsqueezy.com/lemon.js" strategy="lazyOnload" />
      <div className="flex flex-col items-center p-6 text-center shadow-lg bg-white rounded-2xl border border-gray-100 max-w-sm">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
          <Lock className="h-6 w-6 text-purple-600" />
        </div>
        <h3 className="mb-2 text-lg font-bold text-gray-900">{title}</h3>
        <p className="mb-6 text-sm text-gray-500">{description}</p>
        
        {isEdu && (
          <div className="mb-4 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl w-full">
            🎉 Student email detected! Your student discount will be automatically applied.
          </div>
        )}

        <div className="flex flex-col w-full gap-3">
          <a
            href={`https://fresherats.lemonsqueezy.com/checkout/buy/6d1923db-5c3b-4551-a3d6-2cb374a8891a?embed=1${customDataUserId}${emailParam}${discountParam}`}
            className="lemonsqueezy-button rounded-full bg-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700 w-full"
          >
            Buy Pro
          </a>
          <a
            href={`https://fresherats.lemonsqueezy.com/checkout/buy/0042cfdd-e34d-4a12-9938-97274d150ea3?embed=1${customDataUserId}${emailParam}`}
            className="lemonsqueezy-button rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 w-full"
          >
            Buy Single Resume Pack
          </a>
        </div>
      </div>
    </div>
  );
}
