"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

type MediaItem =
  | { type: "image"; src: string; alt?: string }
  | { type: "video"; src: string; alt?: string };

interface SlideshowProps {
  items: MediaItem[];
  autoPlayMs?: number;
  className?: string;
}

export default function Slideshow({ items, autoPlayMs = 5000, className = "" }: SlideshowProps) {
  const [index, setIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const safeItems = useMemo(() => items ?? [], [items]);

  useEffect(() => {
    if (safeItems.length <= 1) return;

    const startTimer = () => {
      timerRef.current = setTimeout(() => {
        setIndex((prev) => (prev + 1) % safeItems.length);
      }, autoPlayMs);
    };

    startTimer();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [index, autoPlayMs, safeItems.length]);

  const goTo = (i: number) => {
    if (safeItems.length === 0) return;
    setIndex((i + safeItems.length) % safeItems.length);
  };

  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  const stopAutoplay = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const startAutoplay = () => {
    if (safeItems.length > 1) {
      timerRef.current = setTimeout(() => {
        setIndex((prev) => (prev + 1) % safeItems.length);
      }, autoPlayMs);
    }
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (safeItems.length === 0) {
    return <div className="text-center p-8">No media items to display</div>;
  }

  return (
    <div className={`relative w-full max-w-4xl mx-auto ${className}`}>
      <div
        ref={containerRef}
        className={`relative w-full bg-black ${isFullscreen ? '' : 'rounded-2xl'} overflow-hidden shadow-2xl ${isFullscreen ? 'fixed inset-0 z-50' : 'relative'}`}
        onMouseEnter={stopAutoplay}
        onMouseLeave={startAutoplay}
        style={{ 
          aspectRatio: isFullscreen ? "auto" : "16/9",
          minHeight: isFullscreen ? "auto" : "450px"
        }}
      >
        {/* Media Display */}
        <div className="absolute inset-0 overflow-hidden">
          {safeItems[index].type === "video" ? (
            <video
              key={safeItems[index].src}
              className="w-full h-full object-cover cursor-pointer"
              src={safeItems[index].src}
              muted
              playsInline
              controls
              autoPlay
              loop
              onClick={toggleFullscreen}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
                display: "block"
              }}
            />
          ) : (
            <Image
              key={safeItems[index].src}
              src={safeItems[index].src}
              alt={safeItems[index].alt ?? "Slide image"}
              width={800}
              height={450}
              className="w-full h-full object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 900px"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
                display: "block"
              }}
            />
          )}
        </div>

        {/* Fullscreen Button */}
        <button
          type="button"
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          onClick={toggleFullscreen}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '48px',
            height: '48px',
            borderRadius: '8px',
            background: 'linear-gradient(45deg, #16a34a, #22c55e)',
            color: '#fde047',
            border: '2px solid #fde047',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: isFullscreen ? 60 : 10,
            fontSize: '20px',
            fontWeight: '900',
            fontFamily: 'Courier New, monospace',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
            boxShadow: '0 0 15px rgba(34, 197, 94, 0.4), inset 0 0 10px rgba(255, 255, 0, 0.1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(45deg, #22c55e, #84cc16)';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(45deg, #16a34a, #22c55e)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {isFullscreen ? '⤢' : '⤡'}
        </button>

        {/* Navigation Controls */}
        {safeItems.length > 1 && (
          <>
            {/* Previous Button */}
            <button
              type="button"
              aria-label="Previous slide"
              onClick={prev}
              style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '64px',
                height: '64px',
                borderRadius: '8px',
                background: 'linear-gradient(45deg, #dc2626, #ea580c)',
                color: '#fde047',
                border: '3px solid #fde047',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: isFullscreen ? 50 : 5,
                fontSize: '32px',
                fontWeight: '900',
                fontFamily: 'Courier New, monospace',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                boxShadow: '0 0 20px rgba(255, 255, 0, 0.4), inset 0 0 10px rgba(255, 255, 0, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(45deg, #ea580c, #eab308)';
                e.currentTarget.style.color = '#000';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(45deg, #dc2626, #ea580c)';
                e.currentTarget.style.color = '#fde047';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
              }}
            >
              ‹
            </button>

            {/* Next Button */}
            <button
              type="button"
              aria-label="Next slide"
              onClick={next}
              style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '64px',
                height: '64px',
                borderRadius: '8px',
                background: 'linear-gradient(45deg, #dc2626, #ea580c)',
                color: '#fde047',
                border: '3px solid #fde047',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: isFullscreen ? 50 : 5,
                fontSize: '32px',
                fontWeight: '900',
                fontFamily: 'Courier New, monospace',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                boxShadow: '0 0 20px rgba(255, 255, 0, 0.4), inset 0 0 10px rgba(255, 255, 0, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(45deg, #ea580c, #eab308)';
                e.currentTarget.style.color = '#000';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(45deg, #dc2626, #ea580c)';
                e.currentTarget.style.color = '#fde047';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
              }}
            >
              ›
            </button>

            {/* Dots Navigation */}
            <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 ${isFullscreen ? 'z-10' : 'z-[5]'}`}>
              {safeItems.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`rounded-full border-2 transition-all duration-300 ${
                    i === index
                      ? "w-4 h-4 bg-yellow-300 border-yellow-300 shadow-lg shadow-yellow-300/50"
                      : "w-3 h-3 bg-transparent border-white/70 hover:border-yellow-300 hover:bg-yellow-300/20 hover:scale-125"
                  }`}
                  style={{
                    boxShadow: i === index ? '0 0 15px rgba(255, 255, 0, 0.6)' : '0 0 5px rgba(255, 255, 255, 0.3)'
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}