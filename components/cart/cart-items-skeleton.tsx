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
        <ShoppingBag className="h-20 w-20 text-slate-400 dark:text-slate-500" />
      </div>
    </div>
  );
}
