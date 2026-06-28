import React from "react";
import UpgradeOverlay from "./UpgradeOverlay";
import { getEntitlement } from "@/lib/entitlements/entitlements";

interface ProGateProps {
  userId?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  overlayTitle?: string;
  overlayDescription?: string;
}

export default async function ProGate({ 
  userId, 
  children, 
  fallback, 
  overlayTitle = "Pro Feature", 
  overlayDescription = "Upgrade your plan to access this feature." 
}: ProGateProps) {
  
  if (!userId) {
    return (
      <div className="relative">
        <div className="blur-sm select-none pointer-events-none">
          {fallback || children}
        </div>
        <UpgradeOverlay 
          title="Sign in required" 
          description="Please sign in and upgrade to access this feature." 
        />
      </div>
    );
  }

  const entitlement = await getEntitlement(userId);

  if (entitlement.isPro) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="blur-sm select-none pointer-events-none">
        {fallback || children}
      </div>
      <UpgradeOverlay 
        title={overlayTitle} 
        description={overlayDescription} 
      />
    </div>
  );
}
