import Link from "next/link";
import type { EmblaOptionsType } from "embla-carousel";
import { Button } from "../ui/button";
import EmblaCarousel from "../Carousel/embla-carousel";
import { ArrowRight } from "lucide-react";

const OPTIONS: EmblaOptionsType = { loop: true };
const SLIDE_COUNT = 3;
const SLIDES = Array.from(Array(SLIDE_COUNT).keys());

export default function HeroSection() {
  return (
    <section className="flex flex-col md:flex-row justify-between items-stretch w-full bg-muted md:border border-black h-[15rem] md:h-[25rem]">
      <div className="flex flex-col justify-center space-y-3 py-2 px-8 md:border-r md:border-black h-full md:h-full w-full md:w-1/2">
        <div className="mb-1 md:mb-4">
          <h6 className="text-sm md:text-md text-start text-black font-semibold">
            20% OFF
          </h6>
          <h6 className="text-sm md:text-md text-black ">
            Laptops, Desktops & Phones{" "}
          </h6>
        </div>
        <p className="text-md md:text-4xl font-semibold text-black md:line-clamp-3 ">
          Digitize Your Life with Our Huge{" "}
          <span className="underline underline-offset-4">
            <Link href={"/products"}>Products</Link>
          </span>
          <br /> Collection
        </p>
        <p className="text-xs md:text-lg">
          We sell the best quality New, Ex Uk, Refurbished{" "}
          <br className="text-xs md:text-lg" /> laptops, phones, pc's, softwares
          in Kenya...
        </p>
        <div className="flex items-center gap-6">
          <Link href="/products">
            <Button
              size="lg"
              variant="outline"
              className="flex items-center gap-2 justify-between px-4 bg-transparent">
              Shop Now
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
      <div className="hidden md:flex items-center justify-center h-1/2 md:h-full w-full md:w-1/2">
        <EmblaCarousel slides={SLIDES} options={OPTIONS} />
      </div>
    </section>
  );
}
