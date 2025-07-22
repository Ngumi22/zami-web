import Image from "next/image";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

// Image Zoom Modal Component
export // Image Zoom Modal Component
function ImageZoomModal({
  src,
  alt,
  isOpen,
  onClose,
}: {
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}>
      <div className="relative max-w-4xl max-h-full w-full">
        <div className="relative bg-white rounded-lg overflow-hidden shadow-2xl">
          <Image
            src={src || "/placeholder.svg"}
            alt={alt}
            width={800}
            height={800}
            className="object-contain max-h-[85vh] w-full"
            onClick={(e) => e.stopPropagation()}
            priority
          />
        </div>

        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -top-12 right-0 text-white hover:bg-white/20 h-10 w-10"
          onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
