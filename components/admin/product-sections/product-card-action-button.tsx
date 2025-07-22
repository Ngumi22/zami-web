"use client";

import { useState, useRef, useEffect } from "react";
import type React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProductCardActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isActive?: boolean;
  variant?: "default" | "outline" | "secondary";
  className?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}

export function ProductCardActionButton({
  icon,
  label,
  onClick,
  isActive = false,
  variant = "outline",
  className,
  disabled = false,
  size = "md",
}: ProductCardActionButtonProps) {
  const isMobile = useIsMobile();
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hoverDelayRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (isMobile) return;
    hoverDelayRef.current = setTimeout(() => {
      setIsHovered(true);
    }, 100);
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    if (hoverDelayRef.current) {
      clearTimeout(hoverDelayRef.current);
    }
    setIsHovered(false);
  };

  const handleMobileTouch = () => {
    if (!isMobile) return;
    setShowTooltip(true);
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
    tooltipTimeoutRef.current = setTimeout(() => {
      setShowTooltip(false);
    }, 1200);
  };

  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
      if (hoverDelayRef.current) clearTimeout(hoverDelayRef.current);
    };
  }, []);

  // Size configurations
  const sizeConfig = {
    sm: {
      mobile: "h-8 w-8 min-w-[2rem]",
      desktop: "h-8 min-w-[2rem]",
      icon: "w-3.5 h-3.5",
      text: "text-xs",
    },
    md: {
      mobile: "h-9 w-9 min-w-[2.25rem]",
      desktop: "h-9 min-w-[2.25rem]",
      icon: "w-4 h-4",
      text: "text-xs",
    },
    lg: {
      mobile: "h-10 w-10 min-w-[2.5rem]",
      desktop: "h-10 min-w-[2.5rem]",
      icon: "w-4 h-4",
      text: "text-sm",
    },
  };

  const config = sizeConfig[size];

  return (
    <div className="relative">
      <Button
        variant={isActive ? "default" : variant}
        className={cn(
          // Base styles
          "relative overflow-hidden group transition-all duration-200 ease-out",
          "flex items-center justify-center border",

          // Mobile vs Desktop sizing
          isMobile
            ? config.mobile
            : isHovered
            ? `${config.desktop} px-3`
            : config.mobile,

          // Desktop hover effects
          !isMobile && [
            "hover:shadow-md hover:border-primary/40 hover:-translate-y-0.5",
            "active:translate-y-0 active:shadow-sm",
            "focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2",
          ],

          // Mobile touch effects
          isMobile && [
            "active:scale-95 active:bg-muted/50",
            "touch-manipulation", // Improves touch responsiveness
          ],

          // Active state
          isActive && [
            "bg-primary text-primary-foreground border-primary",
            "shadow-md ring-1 ring-primary/20",
          ],

          // Disabled state
          disabled &&
            "opacity-50 cursor-not-allowed hover:translate-y-0 hover:shadow-none active:scale-100",

          className
        )}
        onClick={onClick}
        disabled={disabled}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleMobileTouch}
        aria-label={label}>
        {/* Icon container - always centered */}
        <div
          className={cn(
            "flex items-center justify-center flex-shrink-0",
            config.icon,
            "transition-all duration-200 ease-out",
            !isMobile && isHovered ? "mr-2" : "mr-0"
          )}>
          <div className="transition-transform duration-200 ease-out group-hover:scale-110 flex items-center justify-center">
            {icon}
          </div>
        </div>

        {/* Text label - desktop only */}
        {!isMobile && (
          <div
            className={cn(
              "overflow-hidden transition-all duration-200 ease-out",
              "flex items-center whitespace-nowrap",
              config.text,
              isHovered
                ? "opacity-100 max-w-[120px] w-auto"
                : "opacity-0 max-w-0 w-0"
            )}>
            <span className="font-medium leading-none select-none tracking-wide">
              {label}
            </span>
          </div>
        )}
      </Button>

      {/* Mobile tooltip */}
      {isMobile && (
        <div
          className={cn(
            "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50",
            "px-2 py-1 text-xs font-medium text-white bg-gray-900/90 rounded-md",
            "whitespace-nowrap pointer-events-none select-none shadow-lg backdrop-blur-sm",
            "transition-all duration-150 ease-out",
            showTooltip
              ? "opacity-100 visible translate-y-0"
              : "opacity-0 invisible translate-y-1"
          )}>
          {label}
          <div className="absolute top-full left-1/2 -translate-x-1/2">
            <div className="w-0 h-0 border-l-[3px] border-r-[3px] border-t-[3px] border-transparent border-t-gray-900/90" />
          </div>
        </div>
      )}
    </div>
  );
}
