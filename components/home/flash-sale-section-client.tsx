"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import type { Product } from "@prisma/client";
import { ProductCard } from "../admin/product-sections/product-card";
import Link from "next/link";

interface FlashSaleClientProps {
  products?: Product[];
  saleEndDate: Date;
  collectionName?: string;
  maxVisibleProducts?: number;
  collectionId?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  hasEnded: boolean;
}

const TimeUnit = ({ value, label }: { value: number; label: string }) => (
  <div className="bg-red-500 text-white rounded-sm p-2 md:p-3 text-center min-w-[2rem] md:min-w-[4rem]">
    <div className="text-lg font-semibold md:text-2xl md:font-bold">
      {String(value).padStart(2, "0")}
    </div>
    <div className="text-xs font-medium">{label}</div>
  </div>
);

export function FlashSaleClient({
  products = [],
  saleEndDate,
  collectionName = "Flash Sale",
  maxVisibleProducts = 6,
}: FlashSaleClientProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    hasEnded: true,
  });

  const endDate = useMemo(() => new Date(saleEndDate), [saleEndDate]);

  const productsToShow = useMemo(
    () => (products || []).slice(0, maxVisibleProducts),
    [products, maxVisibleProducts]
  );

  const calculateTimeLeft = useCallback((): TimeLeft => {
    const now = Date.now();
    const difference = endDate.getTime() - now;

    if (difference <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        hasEnded: true,
      };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      hasEnded: false,
    };
  }, [endDate]);

  useEffect(() => {
    const initialTimeLeft = calculateTimeLeft();
    setTimeLeft(initialTimeLeft);

    if (!initialTimeLeft.hasEnded) {
      const timer = setInterval(() => {
        setTimeLeft(calculateTimeLeft());
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [calculateTimeLeft]);

  if (!productsToShow.length || timeLeft.hasEnded) {
    return null;
  }

  return (
    <section className="w-full md:py-4">
      <div className="md:container mx-auto md:px-4">
        <div className="text-center md:mb-2">
          <h2 className="text-3xl font-bold text-gray-900 md:mb-2">
            {collectionName}
          </h2>

          <p className="text-gray-600">Exclusive deals ending soon</p>
        </div>

        <div className="flex justify-center mb-4">
          <div className="bg-gray-50 rounded-sm p-4">
            <p className="text-center text-red-600 font-medium md:mb-2 text-sm">
              Sale ends in:
            </p>
            <div className="flex gap-3">
              <TimeUnit value={timeLeft.days} label="Days" />
              <TimeUnit value={timeLeft.hours} label="Hours" />
              <TimeUnit value={timeLeft.minutes} label="Mins" />
              <TimeUnit value={timeLeft.seconds} label="Secs" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
          {productsToShow.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <Link href={"/products"}>
          <div className="text-center mt-4">
            <div className="bg-red-500 text-white rounded-sm p-2 inline-block">
              <p className="font-semibold">Don't miss out - shop now!</p>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}
