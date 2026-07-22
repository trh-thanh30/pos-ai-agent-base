"use client";

import type { PointerEvent, ReactNode, UIEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface ProductCarouselProps {
  children: ReactNode;
  label: string;
  headerAction?: ReactNode;
}

export function ProductCarousel({
  children,
  label,
  headerAction,
}: ProductCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({
    active: false,
    moved: false,
    startX: 0,
    scrollLeft: 0,
  });
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(true);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const update = () => {
      setCanGoBack(track.scrollLeft > 4);
      setCanGoForward(
        track.scrollLeft + track.clientWidth < track.scrollWidth - 4,
      );
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(track);
    return () => observer.disconnect();
  }, [children]);

  const syncControls = (element: HTMLDivElement) => {
    setCanGoBack(element.scrollLeft > 4);
    setCanGoForward(
      element.scrollLeft + element.clientWidth < element.scrollWidth - 4,
    );
  };

  const scroll = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({
      left: direction * Math.max(280, track.clientWidth * 0.82),
      behavior: "smooth",
    });
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    const track = event.currentTarget;
    dragRef.current = {
      active: true,
      moved: false,
      startX: event.clientX,
      scrollLeft: track.scrollLeft,
    };
    track.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active || event.pointerType !== "mouse") return;
    const distance = event.clientX - dragRef.current.startX;
    if (Math.abs(distance) > 5) dragRef.current.moved = true;
    event.currentTarget.scrollLeft = dragRef.current.scrollLeft - distance;
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <div className="relative">
      <div className="absolute right-0 top-[-4.25rem] flex items-center gap-2">
        {headerAction}
        <button
          type="button"
          onClick={() => scroll(-1)}
          disabled={!canGoBack}
          aria-label={`Xem sản phẩm trước trong ${label}`}
          className="grid size-10 place-items-center border border-[#d8d8d5] bg-white text-[var(--sf-text)] transition hover:border-[var(--sf-primary)] hover:text-[var(--sf-primary)] disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ArrowLeft className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => scroll(1)}
          disabled={!canGoForward}
          aria-label={`Xem sản phẩm tiếp theo trong ${label}`}
          className="grid size-10 place-items-center border border-[#d8d8d5] bg-white text-[var(--sf-text)] transition hover:border-[var(--sf-primary)] hover:text-[var(--sf-primary)] disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ArrowRight className="size-4" />
        </button>
      </div>

      <div
        ref={trackRef}
        role="region"
        aria-label={label}
        tabIndex={0}
        onScroll={(event: UIEvent<HTMLDivElement>) =>
          syncControls(event.currentTarget)
        }
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={(event) => {
          if (dragRef.current.moved) {
            event.preventDefault();
            event.stopPropagation();
            dragRef.current.moved = false;
          }
        }}
        className="flex cursor-grab snap-x snap-mandatory gap-4 overflow-x-auto pb-5 pr-5 scroll-smooth [scrollbar-width:none] active:cursor-grabbing sm:gap-6 lg:gap-8 [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
    </div>
  );
}

export function ProductCarouselItem({ children }: { children: ReactNode }) {
  return (
    <div className="min-w-0 flex-[0_0_78%] self-stretch snap-start sm:flex-[0_0_47%] md:flex-[0_0_31%] lg:flex-[0_0_23%] xl:flex-[0_0_22.5%]">
      {children}
    </div>
  );
}
