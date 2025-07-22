"use client";
import type React from "react";
import { useRef, useState, useEffect } from "react";
import type { EmblaOptionsType } from "embla-carousel";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";

type PropType = {
  slides: number[];
  options?: EmblaOptionsType;
};

const progressBarColors = [
  "#3B82F6", // blue-500
  "#EF4444", // red-500
  "#10B981", // green-500
  "#F59E0B", // yellow-500
];

const EmblaCarousel: React.FC<PropType> = (props) => {
  const { slides, options } = props;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const autoplayDelay = 5000; // 5 seconds per slide
  const [emblaRef, emblaApi] = useEmblaCarousel({ ...options }, [
    Autoplay({ playOnInit: true, delay: autoplayDelay }),
  ]);
  const progressRefs = useRef<(HTMLDivElement | null)[]>([]);
  const activeBarRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    activeBarRef.current = progressRefs.current[selectedIndex];
  }, [selectedIndex]);

  // Sync autoplay progress for each slide, triggered by embla's autoplay mechanism
  useEffect(() => {
    if (emblaApi) {
      const interval = setInterval(() => {
        // Update progress only for the active slide
        if (selectedIndex === emblaApi.selectedScrollSnap()) {
          setProgress((prev) => (prev + 0.02 > 1 ? 1 : prev + 0.02)); // increment progress over 5 seconds
        }
      }, 100); // Update every 100ms (10 updates per second)

      return () => clearInterval(interval);
    }
  }, [emblaApi, selectedIndex]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
      setProgress(0); // reset progress when slide changes
    };

    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi]);

  return (
    <div className="w-full md:h-[65vh] max-w-none mx-auto p-4 md:p-8">
      {/* Carousel */}
      <div className="overflow-hidden h-[85%]" ref={emblaRef}>
        <div className="flex touch-pan-y h-full">
          {slides.map((index) => (
            <div key={index} className="flex-[0_0_100%] min-w-0 h-full">
              <Image
                src={"/beats.jpg"}
                alt=""
                height={800}
                width={1200}
                className="h-full w-full object-contain"
              />
            </div>
          ))}
        </div>
      </div>
      {/* Progress Bars */}
      <div className="flex justify-end gap-2 mt-4">
        {slides.map((_, index) => (
          <div key={index} className="flex flex-col items-start gap-1">
            <span className="text-xs font-semibold">0{index + 1}</span>
            <div className="relative h-1 w-14 bg-gray-200 border border-black overflow-hidden">
              <div
                ref={(el) => {
                  progressRefs.current[index] = el;
                }}
                className={`absolute top-0 bottom-0 left-0 origin-left transition-all duration-&lsqb;5000ms&rsqb; ease-in-out`}
                style={{
                  width:
                    selectedIndex === index
                      ? `${progress * 100}%` // animate the active progress bar
                      : "0%", // inactive progress bars have no animation
                  backgroundColor:
                    selectedIndex === index
                      ? progressBarColors[index % progressBarColors.length] // apply color to active progress bar
                      : "#E5E7EB", // grey for inactive progress bars
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmblaCarousel;
