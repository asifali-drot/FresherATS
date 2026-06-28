import PricingTable from "@/components/PricingTable";
import { PLAN_INDEX } from "@/lib/pricing/plans";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-purple-50 to-white py-20">
      <div className="container mx-auto px-4">
        <PricingTable plans={PLAN_INDEX} />
      </div>
    </div>
  );
}
