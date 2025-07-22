import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {trend && (
              <p
                className={`text-xs flex items-center gap-1 ${
                  trend.isPositive ? "text-green-600" : "text-red-600"
                }`}>
                <span>{trend.isPositive ? "↗" : "↘"}</span>
                {Math.abs(trend.value)}%
              </p>
            )}
          </div>
          <div className="p-2 bg-muted rounded-lg">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
