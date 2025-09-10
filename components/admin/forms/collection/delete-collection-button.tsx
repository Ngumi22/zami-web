"use client";

import { useTransition } from "react";
import { deleteCollection } from "@/lib/collection-actions";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface DeleteCollectionButtonProps {
  id: string;
}

export function DeleteCollectionButton({ id }: DeleteCollectionButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this collection?")) {
      startTransition(async () => {
        const result = await deleteCollection(id);
        if (result.success) {
          toast({
            title: "Success",
            description: "Collection deleted successfully",
          });
          router.refresh();
        } else {
          toast({
            title: "Error",
            description: result.message || "Failed to delete collection",
            variant: "destructive",
          });
        }
      });
    }
  };

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      disabled={isPending}>
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
