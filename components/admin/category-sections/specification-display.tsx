import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategorySpecification } from "@prisma/client";
import {
  CheckCircle,
  Circle,
  Type,
  Hash,
  List,
  ToggleLeft,
} from "lucide-react";

interface SpecificationDisplayProps {
  specifications: CategorySpecification[];
  title?: string;
  className?: string;
}

export function SpecificationDisplay({
  specifications,
  title = "Specifications",
  className = "",
}: SpecificationDisplayProps) {
  const getTypeIcon = (type: CategorySpecification["type"]) => {
    switch (type) {
      case "TEXT":
        return <Type className="w-4 h-4" />;
      case "NUMBER":
        return <Hash className="w-4 h-4" />;
      case "SELECT":
        return <List className="w-4 h-4" />;
      case "BOOLEAN":
        return <ToggleLeft className="w-4 h-4" />;
      default:
        return <Type className="w-4 h-4" />;
    }
  };

  const getTypeBadgeVariant = (type: CategorySpecification["type"]) => {
    switch (type) {
      case "TEXT":
        return "default";
      case "NUMBER":
        return "secondary";
      case "SELECT":
        return "outline";
      case "BOOLEAN":
        return "destructive";
      default:
        return "default";
    }
  };

  if (!specifications || specifications.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-8 text-center text-gray-500">
          No specifications defined for this category.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <List className="w-5 h-5" />
          {title}
          <Badge variant="secondary" className="ml-auto">
            {specifications.length} specs
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {specifications.map((spec) => (
            <div
              key={spec.id}
              className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  {getTypeIcon(spec.type)}
                  <h4 className="font-medium text-gray-900">{spec.name}</h4>
                  {spec.required ? (
                    <span title="Required">
                      <CheckCircle className="w-4 h-4 text-red-500" />
                    </span>
                  ) : (
                    <span title="Optional">
                      <Circle className="w-4 h-4 text-gray-400" />
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Badge
                    variant={getTypeBadgeVariant(spec.type)}
                    className="text-xs">
                    {spec.type}
                  </Badge>

                  {spec.unit && (
                    <Badge variant="outline" className="text-xs">
                      Unit: {spec.unit}
                    </Badge>
                  )}

                  <Badge
                    variant={spec.required ? "destructive" : "secondary"}
                    className="text-xs">
                    {spec.required ? "Required" : "Optional"}
                  </Badge>
                </div>

                {spec.options && spec.options.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">
                      Available options:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {spec.options.map((option) => (
                        <Badge
                          key={option}
                          variant="outline"
                          className="text-xs">
                          {option}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
