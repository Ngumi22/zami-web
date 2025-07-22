"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";

interface ArrayInputProps {
  value: string[];
  onChange: (newValues: string[]) => void;
  maxItems?: number;
  placeholder?: string;
  label?: string;
  className?: string;
}

export default function ArrayInput({
  value,
  onChange,
  maxItems = 10,
  placeholder = "Enter item",
  label = "Items",
  className = "",
}: ArrayInputProps) {
  const [input, setInput] = useState("");

  const addItem = () => {
    const trimmed = input.trim();
    if (!trimmed || value.includes(trimmed) || value.length >= maxItems) return;

    onChange([...value, trimmed]);
    setInput("");
  };

  const removeItem = (index: number) => {
    const updated = [...value];
    updated.splice(index, 1);
    onChange(updated);
  };

  return (
    <div className={className}>
      {label && <p className="text-sm font-medium mb-1">{label}</p>}

      <div className="flex items-center gap-2 mb-2">
        <Input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addItem();
            }
          }}
          placeholder={placeholder}
        />
      </div>

      {value.length > 0 && (
        <ul className="space-y-1">
          {value.map((item, index) => (
            <li
              key={`${item}-${index}`}
              className="flex items-center justify-between border p-2 rounded-md bg-muted">
              <span className="text-sm break-all">{item}</span>
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="text-red-500 hover:text-red-700"
                aria-label="Remove">
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
