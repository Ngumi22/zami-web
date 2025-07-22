import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "active" | "inactive";
  size?: "sm" | "md" | "lg";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const variants = {
    active: "bg-green-100 text-green-800 border-green-200",
    inactive: "bg-gray-100 text-gray-800 border-gray-200",
    suspended: "bg-red-100 text-red-800 border-red-200",
  };

  const sizes = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-2 text-base",
  };

  const icons = {
    active: "🟢",
    inactive: "⚪",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium border",
        variants[status],
        sizes[size]
      )}>
      <span className="text-xs">{icons[status]}</span>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
