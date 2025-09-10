"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { slides } from "@/data/sliders";
import { AUTO_SLIDE_INTERVAL } from "@/lib/constants";

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const nextSlide = useCallback(() => {
    resetTimeout();
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [resetTimeout]);

  const prevSlide = useCallback(() => {
    resetTimeout();
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [resetTimeout]);

  const goToSlide = useCallback(
    (index: number) => {
      resetTimeout();
      setCurrentSlide(index);
    },
    [resetTimeout]
  );

  useEffect(() => {
    resetTimeout();
    timeoutRef.current = setTimeout(() => {
      nextSlide();
    }, AUTO_SLIDE_INTERVAL);

    return () => resetTimeout();
  }, [currentSlide, nextSlide, resetTimeout]);

  return (
    <section className="relative w-full h-[18rem] md:h-[27rem] overflow-hidden bg-gray-50 flex items-center justify-center">
      <div className="absolute inset-0 w-full h-full lg:hidden">
        {slides.map((slide, index) => (
          <Image
            height={100}
            width={100}
            key={slide.id}
            src={slide.imageUrl}
            alt={slide.title}
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-out",
              index === currentSlide
                ? "opacity-100 scale-100"
                : "opacity-0 scale-50"
            )}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto h-full flex items-center px-4 lg:px-8">
        <div className="relative hidden w-full h-full lg:flex items-center">
          <div className="relative w-1/2 p-4 flex items-center">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={cn(
                  "absolute transition-all duration-1000 ease-out",
                  "text-left text-black",
                  index === currentSlide
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                )}
                style={{
                  transitionDelay: index === currentSlide ? "200ms" : "0ms",
                }}>
                <div className="space-y-6">
                  <p className="text-sm tracking-[0.2em] uppercase font-bold">
                    {slide.subtitle}
                  </p>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal leading-tight text-balance">
                    {slide.title}
                  </h1>
                </div>
                <p className="text-lg md:text-xl leading-relaxed max-w-lg text-pretty">
                  {slide.description}
                </p>
                <div className="pt-4 cursor-pointer">
                  <Link href={"/products"} passHref>
                    <Button
                      size="lg"
                      className="text-white text-sm font-bold px-8 py-3 bg-black hover:bg-gray-800 tracking-wide">
                      {slide.buttonText}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="relative w-1/2 h-full flex justify-center items-center overflow-hidden">
            {slides.map((slide, index) => (
              <Image
                key={slide.id}
                height={1000}
                width={1000}
                src={slide.imageUrl}
                alt={slide.title}
                className={cn(
                  "absolute object-contain transition-all duration-1000 ease-out",
                  "w-full h-full",
                  index === currentSlide
                    ? "opacity-100 translate-y-0 scale-[1.7] -translate-x-1/3"
                    : "opacity-0 -translate-y-10 scale-[0.5] -translate-x-1/3"
                )}
                style={{
                  transitionTimingFunction:
                    "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                }}
              />
            ))}
          </div>
        </div>

        <div className="relative w-full h-full flex items-center justify-center lg:hidden">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={cn(
                "absolute z-20 w-full p-4",
                "text-start",
                "transition-all duration-1000 ease-out",
                index === currentSlide
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              )}
              style={{
                transitionDelay: index === currentSlide ? "200ms" : "0ms",
              }}>
              <div className="space-y-4">
                <p className="text-sm tracking-[0.2em] uppercase font-bold">
                  {slide.subtitle}
                </p>
                <h1 className="text-4xl md:text-5xl font-normal leading-tight text-balance">
                  {slide.title}
                </h1>
              </div>
              <p className="text-lg md:text-xl leading-relaxed max-w-lg text-pretty">
                {slide.description}
              </p>
              <div className="pt-4">
                <Link href={"/products"} passHref>
                  <Button
                    size="lg"
                    className="text-white text-sm font-bold px-8 py-3 bg-black hover:bg-gray-800 tracking-wide">
                    {slide.buttonText}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30">
        <div className="flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-300",
                index === currentSlide
                  ? "bg-black scale-125"
                  : "bg-gray-400 hover:bg-gray-600"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="absolute inset-y-0 w-full flex items-center justify-between px-4 z-30">
        <button
          onClick={prevSlide}
          className="p-2 rounded-full bg-white/80 hover:bg-white transition-colors duration-200 backdrop-blur-sm shadow-lg focus:outline-none"
          aria-label="Previous slide">
          <ChevronLeft className="w-6 h-6 text-black" />
        </button>
        <button
          onClick={nextSlide}
          className="p-2 rounded-full bg-white/80 hover:bg-white transition-colors duration-200 backdrop-blur-sm shadow-lg focus:outline-none"
          aria-label="Next slide">
          <ChevronRight className="w-6 h-6 text-black" />
        </button>
      </div>
    </section>
  );
}
