import { ReactNode } from "react";
import { useSwipeable } from "react-swipeable";
import { useNavigate, useLocation } from "react-router-dom";
import { useSoundEffects } from "@/hooks/useSoundEffects";

interface SwipeablePagesProps {
  children: ReactNode;
}

// Define the order of main pages for swipe navigation
const MAIN_PAGES = ["/", "/pay", "/account"];

export const SwipeablePages = ({ children }: SwipeablePagesProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { play } = useSoundEffects();

  const currentIndex = MAIN_PAGES.indexOf(location.pathname);

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      // Navigate to next page
      if (currentIndex !== -1 && currentIndex < MAIN_PAGES.length - 1) {
        play('navigate');
        navigate(MAIN_PAGES[currentIndex + 1]);
      }
    },
    onSwipedRight: () => {
      // Navigate to previous page
      if (currentIndex !== -1 && currentIndex > 0) {
        play('navigate');
        navigate(MAIN_PAGES[currentIndex - 1]);
      }
    },
    preventScrollOnSwipe: false,
    trackMouse: false,
    trackTouch: true,
    delta: 50, // Minimum distance for a swipe
    swipeDuration: 500, // Max time for swipe
  });

  // Only enable swipe on main pages
  const isSwipeEnabled = currentIndex !== -1;

  if (!isSwipeEnabled) {
    return <>{children}</>;
  }

  return (
    <div {...handlers} className="min-h-screen touch-pan-y">
      {children}
    </div>
  );
};
