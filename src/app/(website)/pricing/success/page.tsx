"use client";

import { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { useSubscription } from "@/hooks/useSubscription";

export default function PricingSuccessPage() {
  const { refresh } = useSubscription();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Refresh the user's entitlements locally so they immediately see Pro access
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-20 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
        <p className="text-gray-600 mb-8">
          Thank you for your purchase. Your account has been upgraded and you now have access to premium features.
        </p>
        <Link 
          href="/dashboard" 
          className="block w-full bg-purple-600 text-white rounded-full py-3 font-semibold hover:bg-purple-700 transition"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
