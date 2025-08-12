import { ShoppingBag } from "lucide-react";
import { Card, CardContent } from "../ui/card";

export function CartItemSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardContent className="p-6">
        <div className="flex gap-4">
          <div className="w-20 h-20 bg-slate-200 rounded-lg dark:bg-slate-700" />
          <div className="flex-1 space-y-3">
            <div className="h-4 bg-slate-200 rounded w-3/4 dark:bg-slate-700" />
            <div className="h-3 bg-slate-200 rounded w-1/2 dark:bg-slate-700" />
            <div className="h-4 bg-slate-200 rounded w-1/4 dark:bg-slate-700" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function EmptyCartIllustration() {
  return (
    <div className="relative w-48 h-48 mx-auto mb-8">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-950/20 dark:to-purple-950/20 rounded-full opacity-50" />
      <div className="absolute inset-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-full" />
      <div className="absolute inset-0 flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          className="bi bi-cart h-24 w-24"
          viewBox="0 0 16 16">
          <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5M3.102 4l1.313 7h8.17l1.313-7zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4m7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4m-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2m7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2" />
        </svg>
      </div>
    </div>
  );
}
