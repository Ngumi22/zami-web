"use client";

import { useState, useEffect } from "react";

/**
 * A custom React hook that tracks the state of a CSS media query.
 * @param query The media query string to watch (e.g., "(min-width: 768px)").
 * @returns A boolean indicating whether the media query currently matches.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    // Ensure window is defined (for server-side rendering)
    if (typeof window === "undefined") {
      return;
    }

    const media = window.matchMedia(query);
    // Update state immediately with the initial match
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);

    // Add event listener
    media.addEventListener("change", listener);

    // Cleanup listener on component unmount
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
}
