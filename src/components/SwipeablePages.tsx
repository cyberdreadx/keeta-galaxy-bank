import { ReactNode, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { BottomNav } from "@/components/BottomNav";

interface SwipeablePagesProps {
  children: ReactNode;
}

const MAIN_PAGES = ["/", "/pay", "/account"];
const PAGE_LABELS = ["HOME", "PAY", "ACCOUNT"];

export const SwipeablePages = ({ children }: SwipeablePagesProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { play } = useSoundEffects();
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [swiping, setSwiping] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [swipeProgress, setSwipeProgress] = useState(0);

  const currentIndex = MAIN_PAGES.indexOf(location.pathname);
  const isSwipeEnabled = currentIndex !== -1;

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    if (!isSwipeEnabled) return;
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setSwiping(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart || !isSwipeEnabled) return;
    const currentTouch = e.targetTouches[0].clientX;
    setTouchEnd(currentTouch);
    
    const distance = touchStart - currentTouch;
    const progress = Math.min(Math.abs(distance) / 150, 1);
    setSwipeProgress(progress);
    
    if (distance > 20) {
      setSwipeDirection('left');
    } else if (distance < -20) {
      setSwipeDirection('right');
    } else {
      setSwipeDirection(null);
    }
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || !isSwipeEnabled) {
      setSwiping(false);
      setSwipeDirection(null);
      setSwipeProgress(0);
      return;
    }

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentIndex < MAIN_PAGES.length - 1) {
      play('navigate');
      navigate(MAIN_PAGES[currentIndex + 1]);
    } else if (isRightSwipe && currentIndex > 0) {
      play('navigate');
      navigate(MAIN_PAGES[currentIndex - 1]);
    }

    setSwiping(false);
    setSwipeDirection(null);
    setSwipeProgress(0);
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Reset on route change
  useEffect(() => {
    setSwiping(false);
    setSwipeDirection(null);
    setSwipeProgress(0);
  }, [location.pathname]);

  if (!isSwipeEnabled) {
    return (
      <>
        {children}
        <BottomNav />
      </>
    );
  }

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < MAIN_PAGES.length - 1;

  return (
    <>
      <div 
        className="relative min-h-screen overflow-x-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Edge indicators */}
        <AnimatePresence>
          {swiping && swipeDirection === 'right' && hasPrev && (
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: swipeProgress, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="fixed left-2 top-1/2 -translate-y-1/2 z-50 pointer-events-none"
            >
              <div className="flex items-center gap-2 px-3 py-2 bg-sw-blue/20 border border-sw-blue/40 rounded backdrop-blur-sm">
                <span className="text-sw-blue text-xl">‹</span>
                <span className="font-mono text-xs text-sw-blue tracking-wider">
                  {PAGE_LABELS[currentIndex - 1]}
                </span>
              </div>
            </motion.div>
          )}
          
          {swiping && swipeDirection === 'left' && hasNext && (
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: swipeProgress, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              className="fixed right-2 top-1/2 -translate-y-1/2 z-50 pointer-events-none"
            >
              <div className="flex items-center gap-2 px-3 py-2 bg-sw-blue/20 border border-sw-blue/40 rounded backdrop-blur-sm">
                <span className="font-mono text-xs text-sw-blue tracking-wider">
                  {PAGE_LABELS[currentIndex + 1]}
                </span>
                <span className="text-sw-blue text-xl">›</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Page content with enter animation */}
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="min-h-screen"
        >
          {children}
        </motion.div>
      </div>
      
      {/* BottomNav outside motion wrapper to preserve fixed positioning */}
      <BottomNav />
    </>
  );
};
