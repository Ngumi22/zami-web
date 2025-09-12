import type { Metadata } from "next";
import { CompareContent } from "@/components/compare/compare-content";

export const metadata: Metadata = {
  title: "Compare Products",
  description: "Compare features and specifications of your selected products",
};

export default function ComparePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <CompareContent />
    </div>
  );
}
