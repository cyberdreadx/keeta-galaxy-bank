import { ReactNode, useState, useRef } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useSoundEffects } from "@/hooks/useSoundEffects";

interface SwipeablePagesProps {
  children: ReactNode;
}

const MAIN_PAGES = ["/", "/pay", "/account"];
const PAGE_LABELS = ["HOME", "PAY", "ACCOUNT"];

export const SwipeablePages = ({ children }: SwipeablePagesProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { play } = useSoundEffects();
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentIndex = MAIN_PAGES.indexOf(location.pathname);
  const isSwipeEnabled = currentIndex !== -1;

  const x = useMotionValue(0);
  
  // Simpler transforms - just opacity hints at edges
  const leftOpacity = useTransform(x, [0, 100], [0, 0.8]);
  const rightOpacity = useTransform(x, [-100, 0], [0.8, 0]);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    setIsDragging(false);
    const threshold = 80;
    const velocity = Math.abs(info.velocity.x);
    const offset = info.offset.x;

    // Fast swipe or far enough drag
    if (offset < -threshold || (velocity > 300 && info.velocity.x < 0)) {
      if (currentIndex < MAIN_PAGES.length - 1) {
        play('navigate');
        navigate(MAIN_PAGES[currentIndex + 1]);
      }
    } else if (offset > threshold || (velocity > 300 && info.velocity.x > 0)) {
      if (currentIndex > 0) {
        play('navigate');
        navigate(MAIN_PAGES[currentIndex - 1]);
      }
    }
  };

  if (!isSwipeEnabled) {
    return <>{children}</>;
  }

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < MAIN_PAGES.length - 1;

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-x-hidden">
      {/* Left edge indicator */}
      {hasPrev && (
        <motion.div
          className="fixed left-0 top-0 bottom-0 w-16 flex items-center justify-center pointer-events-none z-40"
          style={{ opacity: leftOpacity }}
        >
          <div className="flex flex-col items-center gap-1 text-sw-blue">
            <span className="text-2xl">‹</span>
            <span className="font-mono text-[10px] tracking-wider -rotate-90 whitespace-nowrap">
              {PAGE_LABELS[currentIndex - 1]}
            </span>
          </div>
        </motion.div>
      )}

      {/* Right edge indicator */}
      {hasNext && (
        <motion.div
          className="fixed right-0 top-0 bottom-0 w-16 flex items-center justify-center pointer-events-none z-40"
          style={{ opacity: rightOpacity }}
        >
          <div className="flex flex-col items-center gap-1 text-sw-blue">
            <span className="text-2xl">›</span>
            <span className="font-mono text-[10px] tracking-wider rotate-90 whitespace-nowrap">
              {PAGE_LABELS[currentIndex + 1]}
            </span>
          </div>
        </motion.div>
      )}

      {/* Main content - simple horizontal drag */}
      <motion.div
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.15}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className="min-h-screen will-change-transform"
      >
        {children}
      </motion.div>
    </div>
  );
};
