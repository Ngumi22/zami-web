"use client";

import { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import { clsx } from "clsx";
import { Card } from "@/components/ui/card";
import { Trash2, Upload, GripVertical } from "lucide-react";
import { UploadButton } from "@/utils/uploadthing";
import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { DndContext } from "@dnd-kit/core";
import { toast, useToast } from "@/hooks/use-toast";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/svg+xml"];
const MAX_SIZE_MB = 4;

export type UploadedFileData = {
  name?: string;
  size?: number;
  key?: string;
  url?: string;
  ufsUrl?: string;
};

export interface UseUploaderProps {
  initialValue?: string[];
  maxFiles?: number;
}

export function useUploader({
  initialValue = [],
  maxFiles = 4,
}: UseUploaderProps) {
  const [imageUrls, setImageUrls] = useState<string[]>(initialValue);
  const [isUploading, setIsUploading] = useState(false);

  const canUploadMore = useMemo(
    () => imageUrls.length < maxFiles,
    [imageUrls.length, maxFiles]
  );

  const onUploadComplete = useCallback(
    (res: UploadedFileData[]) => {
      const newUrls = res
        .map((file) => file?.ufsUrl || file?.url)
        .filter((url): url is string => typeof url === "string");
      if (!newUrls.length) return;
      setImageUrls((prev) => [...prev, ...newUrls].slice(0, maxFiles));
      setIsUploading(false);
      toast({
        title: "Upload successful",
        description: `${newUrls.length} image(s) uploaded.`,
      });
    },
    [maxFiles]
  );

  const onRemove = useCallback((url: string) => {
    setImageUrls((prev) => prev.filter((img) => img !== url));
    toast({ title: "Image removed", description: "Removed from list." });
  }, []);

  const onUploadBegin = useCallback((files: File[]) => {
    for (const file of files) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast({
          title: "Invalid type",
          description: `Only JPG, PNG, SVG are allowed.`,
          variant: "destructive",
        });
        return false;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        toast({
          title: "Too large",
          description: `${file.name} exceeds ${MAX_SIZE_MB}MB.`,
          variant: "destructive",
        });
        return false;
      }
    }
    setIsUploading(true);
    return true;
  }, []);

  const reorder = useCallback((oldIndex: number, newIndex: number) => {
    setImageUrls((items) => arrayMove(items, oldIndex, newIndex));
  }, []);

  return {
    imageUrls,
    isUploading,
    canUploadMore,
    onUploadComplete,
    onUploadBegin,
    onRemove,
    reorder,
  };
}

interface UploaderProps {
  imageUrls: string[];
  isUploading: boolean;
  canUploadMore: boolean;
  onUploadComplete: (res: UploadedFileData[]) => void;
  onUploadBegin: (files: File[]) => boolean | void;
  onRemove: (url: string) => void;
  reorder: (oldIndex: number, newIndex: number) => void;
  className?: string;
  endpoint: "imageUploader";
  disabled?: boolean;
}

function SortableImage({
  url,
  index,
  onRemove,
  uniqueKey,
}: {
  url: string;
  index: number;
  onRemove: (url: string) => void;
  uniqueKey: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: uniqueKey });
  const style = { transform: `translateY(${transform?.y ?? 0}px)`, transition };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="relative overflow-hidden p-1 bg-muted/30">
      <div className="relative aspect-square w-full rounded-md overflow-hidden">
        <Image
          src={url || "/placeholder.svg?height=200&width=200"}
          alt={`Image ${index + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 500px) 50vw, 200px"
        />
        <button
          type="button"
          onClick={() => onRemove(url)}
          className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors z-10"
          aria-label="Remove image">
          <Trash2 className="h-4 w-4" />
        </button>
        <span
          {...attributes}
          {...listeners}
          className="absolute top-2 left-2 text-muted-foreground cursor-move">
          <GripVertical className="h-4 w-4" />
        </span>
      </div>
    </Card>
  );
}

export default function Uploader({
  imageUrls,
  isUploading,
  canUploadMore,
  onUploadComplete,
  onUploadBegin,
  onRemove,
  reorder,
  endpoint,
  className = "",
}: UploaderProps) {
  const { toast } = useToast();

  return (
    <div className={clsx("space-y-4", className)}>
      {imageUrls.length > 0 && (
        <DndContext
          onDragEnd={({ active, over }) => {
            if (active.id !== over?.id) {
              const oldIndex = imageUrls.findIndex(
                (url, idx) => `${url}-${idx}` === active.id
              );
              const newIndex = imageUrls.findIndex(
                (url, idx) => `${url}-${idx}` === over?.id
              );
              if (oldIndex !== -1 && newIndex !== -1) {
                reorder(oldIndex, newIndex);
              }
            }
          }}>
          <SortableContext
            items={imageUrls.map((url, idx) => `${url}-${idx}`)}
            strategy={verticalListSortingStrategy}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {imageUrls.map((url, idx) => (
                <SortableImage
                  key={`${url}-${idx}`}
                  uniqueKey={`${url}-${idx}`}
                  url={url}
                  index={idx}
                  onRemove={onRemove}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {canUploadMore && (
        <Card className="border-dashed flex flex-col items-center justify-center p-6 text-center">
          {isUploading ? (
            <div className="animate-pulse space-y-2">
              <div className="bg-muted h-6 w-32 rounded-md" />
              <div className="bg-muted h-6 w-24 rounded-md" />
            </div>
          ) : (
            <>
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium mb-1">
                Drag or click to upload
              </p>
              <p className="text-xs text-muted-foreground">
                JPG, PNG, SVG (max. {MAX_SIZE_MB}MB each)
              </p>
            </>
          )}

          <div className={clsx(isUploading && "opacity-0", "mt-2 w-full")}>
            <UploadButton
              endpoint={endpoint}
              onClientUploadComplete={onUploadComplete}
              onUploadError={(err) => {
                toast({
                  title: "Upload failed",
                  description: err.message,
                  variant: "destructive",
                });
              }}
              className="ut-button:bg-primary ut-button:rounded-md ut-button:text-white"
            />
          </div>
        </Card>
      )}
    </div>
  );
}
