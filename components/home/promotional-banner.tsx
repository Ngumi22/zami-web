import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface PromotionalBannerProps {
  title: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  imageSrc: string;
  imageAlt: string;
  variant?: "primary" | "secondary" | "accent";
  size?: "small" | "medium" | "large" | "full";
  className?: string;
}

export function PromotionalBanner({
  title,
  description,
  ctaText = "Shop Now",
  ctaLink = "/products",
  imageSrc,
  imageAlt,
  variant = "primary",
  size = "medium",
  className,
}: PromotionalBannerProps) {
  const variantStyles = {
    primary: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    accent: "bg-accent text-accent-foreground",
  };

  const sizeStyles = {
    small: "h-32 md:h-40",
    medium: "h-40 md:h-52",
    large: "h-52 md:h-64",
    full: "h-[calc(100vh-4rem)]",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-sm h-auto",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}>
      <div className="absolute inset-0 z-0">
        <Image
          src={imageSrc || "/placeholder.svg"}
          alt={imageAlt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
          priority={size === "full"}
        />
        <div
          className={cn(
            "absolute inset-0",
            variant === "primary" && "bg-black/40",
            variant === "secondary" && "bg-black/20",
            variant === "accent" &&
              "bg-gradient-to-r from-primary/60 to-transparent"
          )}
        />
      </div>

      <div className="relative z-10 flex h-full flex-col justify-center p-2 md:p-4">
        <div className="max-w-md">
          <h2 className="mb-2 text-xl font-bold md:text-2xl lg:text-3xl">
            {title}
          </h2>
          {description && (
            <p className="mb-4 max-w-prose text-sm md:text-base">
              {description}
            </p>
          )}
          {ctaText && ctaLink && (
            <Link
              href={ctaLink}
              className={cn(
                "inline-flex items-center justify-center rounded-sm px-4 py-2 text-sm font-medium transition-colors",
                "bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
              )}>
              {ctaText}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
