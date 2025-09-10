"use client";

import { useQueryStates } from "nuqs";
import { useCallback, useState } from "react";
import type { CategorySpecificationType } from "@prisma/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";

interface SpecificationFilter {
  id: string;
  name: string;
  type: CategorySpecificationType;
  options: string[];
}

interface SpecificationFilterProps {
  specifications: SpecificationFilter[];
}

export default function SpecificationFilter({
  specifications,
}: SpecificationFilterProps) {
  const [showAll, setShowAll] = useState(false);
  const [openSpecs, setOpenSpecs] = useState<Record<string, boolean>>({});

  const specQueryConfig = specifications.reduce((acc, spec) => {
    acc[spec.name] = {
      defaultValue: "",
      shallow: false,
      parse: (value: string) =>
        value.split(",").filter(Boolean).map(decodeURIComponent),
      serialize: (value: string[]) => value.map(encodeURIComponent).join(","),
      clearOnDefault: true,
    };
    return acc;
  }, {} as Record<string, any>);

  const [specStates, setSpecStates] = useQueryStates(specQueryConfig);

  const handleSpecificationChange = useCallback(
    (specName: string, option: string, checked: boolean) => {
      const currentOptions = specStates[specName] || [];
      let newOptions: string[];

      if (checked) {
        newOptions = [...currentOptions, option];
      } else {
        newOptions = currentOptions.filter((opt: string) => opt !== option);
      }

      setSpecStates({ [specName]: newOptions });
    },
    [specStates, setSpecStates]
  );

  const clearSpecification = (specName: string) => {
    setSpecStates({ [specName]: null });
  };

  const clearAllFilters = useCallback(() => {
    const clearObj = specifications.reduce((acc, spec) => {
      acc[spec.name] = null;
      return acc;
    }, {} as Record<string, null>);

    setSpecStates(clearObj);
  }, [specifications, setSpecStates]);

  const toggleSpec = (specName: string) => {
    setOpenSpecs((prev) => ({
      ...prev,
      [specName]: !prev[specName],
    }));
  };

  const visibleSpecs = showAll ? specifications : specifications.slice(0, 5);
  const hasMoreSpecs = specifications.length > 5;

  if (specifications.length === 0) {
    return null;
  }

  const hasActiveFilters = Object.values(specStates).some(
    (options) => options && options.length > 0
  );

  return (
    <Card className="rounded-xs p-2 m-0">
      <div className="pb-3">
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-xs text-muted-foreground hover:text-foreground h-auto p-1">
            Clear All
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {visibleSpecs.map((spec) => {
          const currentOptions = specStates[spec.name] || [];
          const isOpen = openSpecs[spec.name] ?? false;

          return (
            <Collapsible
              key={spec.id}
              open={isOpen}
              onOpenChange={() => toggleSpec(spec.name)}>
              <div className="border-b border-border/40 last:border-b-0 pb-2 last:pb-0">
                <div className="flex justify-between items-center mb-2">
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center justify-between w-full h-auto p-1 font-medium text-xs transition-all duration-500 hover:bg-muted/50">
                      <span>{spec.name}</span>
                      <div className="transition-transform duration-700 ease-in-out">
                        {isOpen ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </div>
                    </Button>
                  </CollapsibleTrigger>

                  {currentOptions.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearSpecification(spec.name)}
                      className="text-xs text-muted-foreground hover:text-foreground h-auto p-1 ml-2 transition-colors duration-500">
                      Clear
                    </Button>
                  )}
                </div>

                <CollapsibleContent className="space-y-1.5 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-up-1 data-[state=open]:slide-down-1 transition-all duration-600 ease-in-out">
                  {spec.options.map((option: string) => (
                    <div
                      key={option}
                      className="flex items-center space-x-2 transition-opacity duration-400">
                      <Checkbox
                        id={`${spec.name}-${option}`}
                        checked={currentOptions.includes(option)}
                        onCheckedChange={(checked) =>
                          handleSpecificationChange(
                            spec.name,
                            option,
                            checked as boolean
                          )
                        }
                        className="h-3 w-3 transition-all duration-400 hover:scale-105"
                      />
                      <label
                        htmlFor={`${spec.name}-${option}`}
                        className="text-xs text-muted-foreground cursor-pointer transition-colors duration-400 hover:text-foreground">
                        {option}
                      </label>
                    </div>
                  ))}
                </CollapsibleContent>
              </div>
            </Collapsible>
          );
        })}

        {hasMoreSpecs && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="w-full text-xs text-muted-foreground hover:text-foreground mt-2 h-auto py-1 transition-all duration-500 hover:bg-muted/50">
            {showAll ? "Show less" : `Show ${specifications.length - 5} more`}
          </Button>
        )}
      </div>
    </Card>
  );
}
