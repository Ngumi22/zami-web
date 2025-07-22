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
  // Get raw specifications (key-value pairs)
  const rawSpecifications =
    (product.specifications as Record<string, any>) || {};

  const updateSpecification = (key: string, value: string) => {
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
    if (key && !rawSpecifications[key]) {
      updateSpecification(key, "");
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Specifications */}
      {category?.specifications && category.specifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Category Specifications ({category.name})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {category.specifications.map((spec) => {
              const value =
                rawSpecifications[spec.id] ??
                rawSpecifications[spec.name] ??
                "";
              return (
                <div key={spec.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={spec.id}>
                      {spec.name}
                      {spec.required && <span className="text-red-500">*</span>}
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
                          {spec.options?.map((option) => (
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
                    <div className="flex items-center space-x-2">
                      {isEditing ? (
                        <Checkbox
                          id={spec.id}
                          checked={value === "true"}
                          onCheckedChange={(checked) =>
                            updateSpecification(
                              spec.id,
                              checked ? "true" : "false"
                            )
                          }
                        />
                      ) : (
                        <div className="w-4 h-4 border rounded flex items-center justify-center">
                          {value === "true" && (
                            <div className="w-2 h-2 bg-primary rounded" />
                          )}
                        </div>
                      )}
                      <Label htmlFor={spec.id} className="text-sm">
                        {value === "true" ? "Yes" : "No"}
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
                className="text-sm text-blue-600 hover:text-blue-800">
                + Add Custom
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {Object.keys(rawSpecifications).filter(
            (key) =>
              !category?.specifications?.some(
                (spec) => spec.id === key || spec.name === key
              )
          ).length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No additional specifications
            </p>
          ) : (
            <div className="space-y-4">
              {Object.entries(rawSpecifications)
                .filter(
                  ([key]) =>
                    !category?.specifications?.some(
                      (spec) => spec.id === key || spec.name === key
                    )
                )
                .map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <Label className="font-medium capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </Label>
                      {isEditing ? (
                        <Input
                          value={value}
                          onChange={(e) =>
                            updateSpecification(key, e.target.value)
                          }
                          className="mt-1"
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground mt-1">
                          {value}
                        </p>
                      )}
                    </div>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => removeSpecification(key)}
                        className="ml-2 text-red-600 hover:text-red-800">
                        Remove
                      </button>
                    )}
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
