"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Category, Product } from "@prisma/client";

interface ProductSpecificationsProps {
  product: Product;
  category?: Category;
  isEditing: boolean;
  onUpdate: (product: Product) => void;
}

export function ProductSpecifications({
  product,
  category,
  isEditing,
  onUpdate,
}: ProductSpecificationsProps) {
  // This function sanitizes the incoming product.specifications data.
  // It handles both the correct format (a key-value object) and an incorrect
  // format (an array of spec objects) to prevent rendering errors.
  const getSanitizedSpecifications = () => {
    const specs = product.specifications;

    // Case 1: Specs are already a valid key-value object (and not an array).
    if (specs && typeof specs === "object" && !Array.isArray(specs)) {
      return specs as Record<string, any>;
    }

    // Case 2: Specs are in a malformed array format. Convert to a key-value map.
    if (Array.isArray(specs)) {
      return specs.reduce((acc: Record<string, any>, item) => {
        // The item in the array is a spec object, e.g., { id, name, value, ... }
        if (
          item &&
          typeof item === "object" &&
          !Array.isArray(item) &&
          ("id" in item || "name" in item) &&
          "value" in item
        ) {
          const key = (item as any).id || (item as any).name;
          acc[String(key)] = (item as any).value;
        }
        return acc;
      }, {} as Record<string, any>);
    }

    // Fallback for any other case (null, undefined, etc.)
    return {};
  };

  const rawSpecifications = getSanitizedSpecifications();

  const updateSpecification = (key: string, value: any) => {
    const updatedSpecs = {
      ...rawSpecifications,
      [key]: value,
    };
    onUpdate({ ...product, specifications: updatedSpecs });
  };

  const removeSpecification = (key: string) => {
    const updatedSpecs = { ...rawSpecifications };
    delete updatedSpecs[key];
    onUpdate({ ...product, specifications: updatedSpecs });
  };

  const addCustomSpecification = () => {
    const key = prompt("Enter specification name:");
    if (key && !rawSpecifications.hasOwnProperty(key)) {
      updateSpecification(key, "");
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Specifications */}
      {category?.specifications &&
        Array.isArray(category.specifications) &&
        category.specifications.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Category Specifications ({category.name})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {category.specifications.map((spec: any) => {
                const value =
                  rawSpecifications[spec.id] ??
                  rawSpecifications[spec.name] ??
                  "";
                return (
                  <div key={spec.id} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={spec.id}>
                        {spec.name}
                        {spec.required && (
                          <span className="text-red-500">*</span>
                        )}
                      </Label>
                      {spec.unit && (
                        <Badge variant="outline" className="text-xs">
                          {spec.unit}
                        </Badge>
                      )}
                    </div>

                    {spec.type === "TEXT" &&
                      (isEditing ? (
                        <Input
                          id={spec.id}
                          value={value}
                          onChange={(e) =>
                            updateSpecification(spec.id, e.target.value)
                          }
                          placeholder={`Enter ${spec.name.toLowerCase()}`}
                          required={spec.required}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {value || "Not specified"}
                          {spec.unit && value && ` ${spec.unit}`}
                        </p>
                      ))}

                    {spec.type === "NUMBER" &&
                      (isEditing ? (
                        <Input
                          id={spec.id}
                          type="number"
                          value={value}
                          onChange={(e) =>
                            updateSpecification(spec.id, e.target.value)
                          }
                          placeholder={`Enter ${spec.name.toLowerCase()}`}
                          required={spec.required}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {value || "Not specified"}
                          {spec.unit && value && ` ${spec.unit}`}
                        </p>
                      ))}

                    {spec.type === "SELECT" &&
                      (isEditing ? (
                        <Select
                          value={value}
                          onValueChange={(val) =>
                            updateSpecification(spec.id, val)
                          }>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={`Select ${spec.name.toLowerCase()}`}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {spec.options?.map((option: string) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {value || "Not specified"}
                        </p>
                      ))}

                    {spec.type === "BOOLEAN" && (
                      <div className="flex items-center space-x-2 pt-2">
                        {isEditing ? (
                          <Checkbox
                            id={spec.id}
                            checked={value === true || value === "true"}
                            onCheckedChange={(checked) =>
                              updateSpecification(spec.id, !!checked)
                            }
                          />
                        ) : (
                          <div className="w-4 h-4 border rounded-sm flex items-center justify-center">
                            {(value === true || value === "true") && (
                              <div className="w-2 h-2 bg-primary rounded-sm" />
                            )}
                          </div>
                        )}
                        <Label
                          htmlFor={spec.id}
                          className="text-sm font-normal">
                          {spec.name}
                        </Label>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

      {/* Custom Specifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Additional Specifications</CardTitle>
            {isEditing && (
              <button
                type="button"
                onClick={addCustomSpecification}
                className="text-sm font-medium text-blue-600 hover:text-blue-800">
                + Add Custom
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {Object.keys(rawSpecifications).filter(
            (key) =>
              !category?.specifications?.some(
                (spec: any) => spec.id === key || spec.name === key
              )
          ).length === 0 ? (
            <p className="text-sm text-center text-muted-foreground py-4">
              No additional specifications
            </p>
          ) : (
            <div className="space-y-4">
              {Object.entries(rawSpecifications)
                .filter(
                  ([key]) =>
                    !category?.specifications?.some(
                      (spec: any) => spec.id === key || spec.name === key
                    )
                )
                .map(([key, value]) => (
                  <div
                    key={key}
                    className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                    <Label className="font-medium capitalize md:col-span-1">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </Label>
                    <div className="md:col-span-2">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={value}
                            onChange={(e) =>
                              updateSpecification(key, e.target.value)
                            }
                            className="flex-grow"
                          />
                          <button
                            type="button"
                            onClick={() => removeSpecification(key)}
                            className="text-sm font-medium text-red-600 hover:text-red-800">
                            Remove
                          </button>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {String(value)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
