"use client";

import Image from "next/image";

interface PageLoaderProps {
  message?: string;
  fullScreen?: boolean;
}

export default function PageLoader({
  message = "Loading...",
  fullScreen = true,
}: PageLoaderProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-6 ${
        fullScreen ? "min-h-screen" : "h-64"
      }`}
    >
      {/* Logo + Thin Spinner Ring */}
      <div className="relative flex items-center justify-center">
        {/* Thin outer spinner with gap */}
        <div className="absolute h-24 w-24 rounded-full border-2 border-primary/20 border-t-primary animate-spin"></div>

        {/* Inner gap wrapper */}
        <div className="p-3 bg-background rounded-full">
          <Image
            src="/Loading-logo.png"
            alt="Loading Logo"
            width={60}
            height={60}
            priority
            className="animate-pulse"
          />
        </div>
      </div>

      {/* Text + animated dots */}
      <div className="text-center">
        <p className="text-lg font-semibold text-foreground flex items-center gap-1">
          {message}
          <span className="flex">
            <span className="animate-bounce [animation-delay:0ms]">.</span>
            <span className="animate-bounce [animation-delay:150ms]">.</span>
            <span className="animate-bounce [animation-delay:300ms]">.</span>
          </span>
        </p>

        <p className="text-sm text-muted-foreground">
          Please wait a moment
        </p>
      </div>
    </div>
  );
}