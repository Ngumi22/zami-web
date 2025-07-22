import { Badge } from "@/components/ui/badge";
import { Type, Hash, List, ToggleLeft } from "lucide-react";
import type { CategorySpecification } from "@/lib/types";

interface SpecificationSummaryProps {
  specifications: CategorySpecification[];
  className?: string;
}

export function SpecificationSummary({
  specifications,
  className = "",
}: SpecificationSummaryProps) {
  if (!specifications || specifications.length === 0) {
    return (
      <div className={`text-sm text-gray-500 ${className}`}>
        No specifications defined
      </div>
    );
  }

  const typeCount = specifications.reduce((acc, spec) => {
    acc[spec.type] = (acc[spec.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const requiredCount = specifications.filter((spec) => spec.required).length;
  const optionalCount = specifications.length - requiredCount;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "text":
        return <Type className="w-3 h-3" />;
      case "number":
        return <Hash className="w-3 h-3" />;
      case "select":
        return <List className="w-3 h-3" />;
      case "boolean":
        return <ToggleLeft className="w-3 h-3" />;
      default:
        return <Type className="w-3 h-3" />;
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2 text-sm">
        <span className="font-medium text-gray-700">Total:</span>
        <Badge variant="secondary" className="text-xs">
          {specifications.length} specs
        </Badge>
      </div>

      <div className="flex flex-wrap gap-1">
        {Object.entries(typeCount).map(([type, count]) => (
          <Badge
            key={type}
            variant="outline"
            className="text-xs flex items-center gap-1">
            {getTypeIcon(type)}
            {type}: {count}
          </Badge>
        ))}
      </div>

      <div className="flex gap-1">
        {requiredCount > 0 && (
          <Badge variant="destructive" className="text-xs">
            {requiredCount} required
          </Badge>
        )}
        {optionalCount > 0 && (
          <Badge variant="secondary" className="text-xs">
            {optionalCount} optional
          </Badge>
        )}
      </div>
    </div>
  );
}
