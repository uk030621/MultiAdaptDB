"use client";

import { useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSwipeable } from "react-swipeable";

const pages = [
  "/",
  "/fields",
  "/customers",
  "/fields2",
  "/customers2",
  "/fields3",
  "/customers3",
];

const SwipeNavigationProvider = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();

  // Check if the swipe or keypress started inside an input/textarea/contentEditable
  const isInsideEditableField = (target) => {
    const tagName = target.tagName?.toLowerCase();
    const isEditableTag = tagName === "input" || tagName === "textarea";
    const isContentEditable = target.isContentEditable;
    return isEditableTag || isContentEditable;
  };

  const isInsideScrollable = (target) =>
    target.closest(".overflow-x-auto") !== null;

  const navigateTo = useCallback(
    (direction) => {
      const currentIndex = pages.indexOf(pathname);
      if (currentIndex === -1) return;

      if (direction === "left" && currentIndex < pages.length - 1) {
        router.push(pages[currentIndex + 1]);
      } else if (direction === "right" && currentIndex > 0) {
        router.push(pages[currentIndex - 1]);
      }
    },
    [pathname, router]
  );

  const handlers = useSwipeable({
    onSwipedLeft: (event) => {
      const target = event.event.target;
      if (!isInsideScrollable(target) && !isInsideEditableField(target)) {
        navigateTo("left");
      }
    },
    onSwipedRight: (event) => {
      const target = event.event.target;
      if (!isInsideScrollable(target) && !isInsideEditableField(target)) {
        navigateTo("right");
      }
    },
    preventScrollOnSwipe: false,
    trackMouse: true,
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Skip if focused inside editable fields
      if (isInsideEditableField(document.activeElement)) return;

      if (e.key === "ArrowRight") {
        navigateTo("left");
      } else if (e.key === "ArrowLeft") {
        navigateTo("right");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [navigateTo]);

  return (
    <div {...handlers} className="h-full w-full">
      {children}
    </div>
  );
};

export default SwipeNavigationProvider;
